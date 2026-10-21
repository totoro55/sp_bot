import "dotenv/config";
import {Bot, GrammyError, HttpError, InlineKeyboard, session} from "grammy";
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
    isVideoUpload,
    maxUploadBytes,
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
import {addFilesKeyboard, filialActionsKeyboard, structureReportKeyboard} from "./marketing/keyboards/report";
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
    const draft = ctx.session.marketing_report
    if (!draft) {
        await ctx.reply("Сейчас отчет не заполняется. Выберите конструкцию и начните отчет, затем отправьте фото как файл.", {
            reply_markup: ctx.session.selected_filial ? filialActionsKeyboard : startKeyboard,
        })
        return
    }
    if (!draft.acceptFiles) {
        await ctx.reply(draft.reportId
            ? "Сначала отредактируйте отчет или нажмите «Добавить фото/видео к отчету». Фото и видео можно отправить после этого."
            : "Сначала заполните отчет. Фото и видео можно отправить после этого шага.", {
            reply_markup: structureReportKeyboard(Boolean(draft.reportId)),
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
    const namedHeif = /\.hei[cf]$/i.test(fileName || "") || /heic|heif/i.test(mimeType || "");

    if ((ctx.message.document || ctx.message.video) && !mediaType.test(mimeType || "") && !namedHeif) {
        await ctx.reply(`Файл ${fileName} не принят, так как не является изображением или видео.\n${SEND_FILE_HINT}`)
        return
    }

    const file = await ctx.getFile()
    const video = isVideoUpload(fileName, mimeType, Boolean(ctx.message.video));
    const maxBytes = maxUploadBytes(video);
    if (file.file_size && file.file_size < MIN_REPORT_FILE_BYTES) {
        await ctx.reply(`Размер файла не должен быть меньше 1 МБ.\n\n${SEND_FILE_HINT}`, {
            reply_parameters: {message_id: ctx.msg.message_id}
        })
        return
    }
    if (file.file_size && file.file_size > maxBytes) {
        const hint = video
            ? "Можно отправить видео со сжатием или отредактировать его перед отправкой."
            : "Отправьте фото как файл, без сжатия.";
        await ctx.reply(`Размер ${video ? "видео" : "фото"} не должен превышать 20 МБ. ${hint}\n\n${SEND_FILE_HINT}`, {
            reply_parameters: {message_id: ctx.msg.message_id}
        })
        return
    }

    const fileId = createFileId()
    ctx.session.marketing_report = {
        ...draft,
        newFiles: [...(draft.newFiles ?? []), {
            fileId,
            telegramFileId: file.file_id,
            fileName: telegramFileName(fileName, mimeType),
            sourceMessageId: ctx.message.message_id,
            video,
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