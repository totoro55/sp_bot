import {Bot, GrammyError, HttpError, InlineKeyboard, InputFile, Keyboard, session} from "grammy";
import 'dotenv/config';
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
import getReportCurrentPhotosByReportId from "./marketing/handlers/getReportCurrentPhotosByReportId";
import {getFilesFromZip} from "./marketing/helpers/getPhotosFromZip";


require('dotenv').config();

// Create a bot object
const bot = new Bot<MyContext, MyApi>(process.env.BOT_TOKEN!); // <-- place your bot token in this string

function initial(): SessionData {
    return {
        user: null,
        auth_expires_in: 0,
        selected_filial: null,
        marketing_report_period: null,
        marketing_report_files: [],
        marketing_report: null,
        marketing_report_curren_files: []
    };
}

bot.use(session({initial}));

bot.api.config.use(hydrateFiles(process.env.BOT_TOKEN!));
bot.use(hydrate())
bot.use(conversations({
    async onExit(id, ctx) {
        if (id === "report") {

            if (ctx.session.marketing_report && ctx.session.marketing_report.reportId) {
                try {
                    await ctx.reply("Пожалуйста подождите, загружается список ранее добавленных файлов")
                    const filesBase64 = await getReportCurrentPhotosByReportId(Number(ctx.session.marketing_report.reportId))
                    const files = await getFilesFromZip(filesBase64)

                    if (files && files.length > 0) {
                        for (const file of files) {
                            const fileId = Date.now().toString()
                            const msg = await ctx.replyWithDocument(new InputFile(file.content, file.filename), {
                                caption: file.filename,
                                reply_markup: new InlineKeyboard().text("Удалить файл", "delete_file_"+fileId)
                            })
                            const fileUrl = await bot.api.getFile(msg.document.file_id).then(res => res.getUrl())
                            ctx.session.marketing_report_curren_files = [...ctx.session.marketing_report_curren_files, {fileId: fileId, fileUrl: fileUrl}]
                        }
                    } else {
                        await ctx.reply("Не удалось загрузить файлы или файлы к указанному отчету отсутствуют.")
                    }
                    await ctx.reply("Загружены файлы. Вы можете удалить файл нажав на соответствующую кнопку расположенную под ним.")
                } catch (e) {
                    await ctx.reply(`Не удалось загрузить список имеющихся файлов ошибка ${JSON.stringify(e)}`)
                }
            }

            await ctx.reply("Добавьте фото/видео, отображающие состояние конструкции.\nМинимальный размер файла - 1Мб\nМаксимальный размер файла - 20Мб.\n\n" +
                "Для корректной отправки необходимо отправлять фото без сжатия, как файлы. Видео можно отправлять со сжатием.", {
                reply_markup: new Keyboard()
                    .text("Завершить добавление файлов").row()
                    .text("Отменить создание отчета").row()
            })
        }
    }
}))
bot.use(createConversation(feedback));
bot.use(createConversation(report))
addMiddlewares(bot)
addCallbacks(bot)
addHears(bot)

bot.on(":file", async (ctx) => {
    if (!ctx.session.marketing_report) return
    if (!ctx.message) return

    if (ctx.message?.photo) {
        await ctx.reply(`Файл отправлен неправильно. Фото должны быть отправлены как файл, без сжатия.
Видео можно отправить со сжатием.\n\nПосле загрузки всех файлов нажмите "Завершить добавление файлов"`)
        return
    }
    const regex = /video|image/i;

    if (ctx.message.document) {
        if (!regex.test(ctx.message.document.mime_type || "")) {
            await ctx.reply(`Файл ${ctx.message.document.file_name} не принят, так как не является изображением или видео.\nФото должны быть отправлены как файл, без сжатия.
Видео можно отправить со сжатием.\n\nПосле загрузки всех файлов нажмите "Завершить добавление файлов".`)
            return
        }
    }

    if (ctx.message.video) {
        if (!regex.test(ctx.message.video.mime_type || "")) {
            await ctx.reply(`Файл ${ctx.message.video.file_name} не принят, так как не является изображением или видео.\nФото должны быть отправлены как файл, без сжатия.\nВидео можно отправить со сжатием.\n\nПосле загрузки всех файлов нажмите "Завершить добавление файлов".`)
            return
        }
    }

    const file = await ctx.getFile()
    if (file.file_size && file.file_size * 0.000001 < 1) {
        await ctx.reply("Размер файла не должен быть меньше 1MB.\n\nПосле загрузки всех файлов нажмите 'Завершить добавление файлов'.", {
            reply_parameters: {message_id: ctx.msg.message_id}
        })
        return
    }
    if (file.file_size && file.file_size * 0.000001 > 20) {
        await ctx.reply("Размер файла не должен превышать 20MB. Если вы отправляете видео - можете отправить его со сжатием или отредактировать перед отправкой.\n\nПосле загрузки всех файлов нажмите 'Завершить добавление файлов'.", {
            reply_parameters: {message_id: ctx.msg.message_id}
        })
        return
    }

    const fileUrl = await bot.api.getFile(file.file_id).then(res => res.getUrl())
    const regex2 = /\.(heic|heiv)$/i
    if (regex2.test(file.file_path || "")) {
        await ctx.replyWithPhoto(new InputFile("files/instruction.png"), {
            caption: "Вы отправили файл, формат которого не поддерживается ботом (HEIC/HEIV). Для изменения формата на IPhone необходимо открыть настройки телефона и изменить формат сохраняемых фотографий на 'Наиболее совместимый', как указано на скриншоте.",
            reply_parameters: {message_id: ctx.msg.message_id}
        })
        return
    } else {
        await ctx.react("👍")
        ctx.session.marketing_report = {
            ...ctx.session.marketing_report,
            reportData: {
                ...ctx.session.marketing_report.reportData,
                photos: [...ctx.session.marketing_report.reportData.photos, fileUrl]
            }
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
    ctx.session.marketing_report_period = null
    ctx.session.marketing_report_files = []
    ctx.session.marketing_report = null
    ctx.session.marketing_report_curren_files = []
    await ctx.reply(`Добро пожаловать, ${user.name}! Выберите интересующий вас пункт меню`, {reply_markup: startKeyboard})
});

export default bot