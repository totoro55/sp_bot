import "dotenv/config";
import {Bot, GrammyError, HttpError, InlineKeyboard, InputFile, session} from "grammy";
import getUser from "./global/handlers/getUser";
import {startKeyboard} from "./global/keyboards/start";
import addCallbacks from "./callbacks";
import {MyApi, MyContext, SessionData} from "../types/global/myContext";
import addMiddlewares from "./middlewares";
import {hydrate} from "@grammyjs/hydrate";
import {conversations, createConversation} from "@grammyjs/conversations";
import {hydrateFiles} from "@grammyjs/files";
import feedback from "./global/conversations/feedback";
import addHears from "./hears";
import report from "./marketing/conversations/report";
import {HttpsProxyAgent} from "https-proxy-agent";
import {assertRuntimeEnv, telegramProxyUrl} from "../config/env";
import {
    ADD_REPORT_FILES_PROMPT,
    MAX_REPORT_FILE_BYTES,
    MIN_REPORT_FILE_BYTES,
    SEND_FILE_HINT,
} from "../config/filesConfig";
import {showCurrentReportFiles} from "./marketing/helpers/showCurrentReportFiles";
import {resetMarketingSession} from "./marketing/helpers/reportSession";
import {acceptedFileText, reportPlace} from "./marketing/helpers/reportContext";
import {reportFileCount} from "./marketing/helpers/reportPhotoUrls";
import {createFileId} from "./marketing/helpers/fileIds";
import {telegramFileName} from "./marketing/upload/fileName";
import {bindUploadApi} from "./marketing/upload/queue";
import {addFilesKeyboard, filialActionsKeyboard} from "./marketing/keyboards/report";
import {chatLock} from "./runtime/chatLock";
import {sessionStorage} from "./runtime/sessionStorage";
import {uploadGuard} from "./uploadGuard";

assertRuntimeEnv();

const proxyUrl = telegramProxyUrl();
const bot = new Bot<MyContext, MyApi>(process.env.BOT_TOKEN!, proxyUrl ? {
    client: {
        baseFetchConfig: {
            agent: new HttpsProxyAgent(proxyUrl),
            compress: true,
        },
    },
} : {});



function initial(): SessionData {
    return {
        user: null,
        auth_expires_in: 0,
        selected_filial: null,
        marketing_report_period: null,
        marketing_report_files: [],
        marketing_report: null,
        marketing_report_curren_files: [],
        reportFilesSynced: false,
        outboundBusy: null,
    };
}

bot.use(chatLock());
bot.use(session({initial, storage: sessionStorage}));
bot.use(uploadGuard());

bot.api.config.use(hydrateFiles(process.env.BOT_TOKEN!));
bindUploadApi(bot.api);
bot.use(hydrate())
bot.use(conversations({
    async onExit(id, ctx) {
        if (id === "report" && ctx.session.marketing_report) {
            const reportCtx = ctx as MyContext;
            const place = reportPlace(reportCtx);
            if (place) await reportCtx.reply(place);
            await showCurrentReportFiles(reportCtx);
            await reportCtx.reply(ADD_REPORT_FILES_PROMPT, {
                reply_markup: addFilesKeyboard("Завершить добавление файлов"),
            });
        }
    }
}))
bot.use(createConversation(feedback));
bot.use(createConversation(report))
addMiddlewares(bot)
addCallbacks(bot)
addHears(bot)

bot.on(":file", async (ctx) => {
    if (!ctx.session.marketing_report) {
        await ctx.reply("Сейчас отчет не заполняется. Выберите конструкцию и начните отчет, затем отправьте фото как файл.", {
            reply_markup: ctx.session.selected_filial ? filialActionsKeyboard : startKeyboard,
        })
        return
    }
    if (!ctx.message) return

    if (ctx.message?.photo) {
        await ctx.reply(`Файл отправлен неправильно. ${SEND_FILE_HINT}`)
        return
    }
    const mediaType = /video|image/i;
    const fileName = ctx.message.document?.file_name || ctx.message.video?.file_name;
    const mimeType = ctx.message.document?.mime_type || ctx.message.video?.mime_type;

    if ((ctx.message.document || ctx.message.video) && !mediaType.test(mimeType || "")) {
        await ctx.reply(`Файл ${fileName} не принят, так как не является изображением или видео.\n${SEND_FILE_HINT}`)
        return
    }

    const file = await ctx.getFile()
    if (file.file_size && file.file_size < MIN_REPORT_FILE_BYTES) {
        await ctx.reply(`Размер файла не должен быть меньше 1 МБ.\n\n${SEND_FILE_HINT}`, {
            reply_parameters: {message_id: ctx.msg.message_id}
        })
        return
    }
    if (file.file_size && file.file_size > MAX_REPORT_FILE_BYTES) {
        await ctx.reply(`Размер файла не должен превышать 20 МБ. Если вы отправляете видео - можете отправить его со сжатием или отредактировать перед отправкой.\n\n${SEND_FILE_HINT}`, {
            reply_parameters: {message_id: ctx.msg.message_id}
        })
        return
    }

    const regex2 = /\.(heic|heiv)$/i
    if (regex2.test(file.file_path || "")) {
        await ctx.replyWithPhoto(new InputFile("files/instruction.png"), {
            caption: "Вы отправили файл, формат которого не поддерживается ботом (HEIC/HEIV). Для изменения формата на iPhone необходимо открыть настройки телефона и изменить формат сохраняемых фотографий на 'Наиболее совместимый', как указано на скриншоте.",
            reply_parameters: {message_id: ctx.msg.message_id}
        })
        return
    } else {
        const fileId = createFileId()
        const report = ctx.session.marketing_report
        ctx.session.marketing_report = {
            ...report,
            newFiles: [...(report.newFiles ?? []), {
                fileId,
                telegramFileId: file.file_id,
                fileName: telegramFileName(fileName, mimeType),
            }],
        }
        await ctx.reply(acceptedFileText(reportFileCount(ctx)), {
            reply_parameters: {message_id: ctx.msg.message_id},
            reply_markup: new InlineKeyboard().text("Удалить этот файл", `delete_file_${fileId}`),
        })
        try {
            await ctx.react("👍")
        } catch (error) {
            console.log(error)
        }
        return
    }
})


bot.catch(err => {
    const ctx = err.ctx;
    console.error(`Ошибка при обработке обновления ${ctx.update.update_id}:`);
    const e = err.error;
    if (e instanceof GrammyError) {
        console.error("Ошибка в запросе:", e.description);
    } else if (e instanceof HttpError) {
        console.error("Не удалось связаться с Telegram:", e);
    } else {
        console.error("Неизвестная ошибка:", e);
    }
})


bot.command("start", async (ctx: MyContext) => {
    const user = await getUser(ctx)
    if (!user) return
    resetMarketingSession(ctx)
    await ctx.reply(`Добро пожаловать, ${user.name}! Выберите интересующий вас пункт меню`, {reply_markup: startKeyboard})
});

export default bot