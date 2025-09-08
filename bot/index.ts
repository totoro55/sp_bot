import {Bot, GrammyError, HttpError, Keyboard, session} from "grammy";
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
    };
}

bot.use(session({initial}));

bot.api.config.use(hydrateFiles(process.env.BOT_TOKEN!));
bot.use(hydrate())
bot.use(conversations({
    async onExit (id, ctx){
        if (id === "report") {
            await ctx.reply("Добавьте фото/видео отображающие состояние конструкции.\nМинимальный рахмер файла - 2Мб\nМаксимальный размер файла - 20Мб.\n\n" +
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
    if (file.file_size && file.file_size * 0.000001 < 1.9 ) {
        await ctx.reply("Размер файла не должен быть меньше 2MB.\n\nПосле загрузки всех файлов нажмите 'Завершить добавление файлов'.")
        return
    }
    if (file.file_size && file.file_size * 0.000001 > 20 ) {
        await ctx.reply("Размер файла не должен превышать 20MB. Если вы отправляете видео - можете отправить его со сжатием или отредактировать перед отправкой.\n\nПосле загрузки всех файлов нажмите 'Завершить добавление файлов'.")
        return
    }
    const fileUrl = await bot.api.getFile(file.file_id).then(res => res.getUrl())
    ctx.session.marketing_report = {...ctx.session.marketing_report, reportData: {...ctx.session.marketing_report.reportData ,photos:[...ctx.session.marketing_report.reportData.photos, fileUrl]}}
    return
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
    await ctx.reply(`Добро пожаловать, ${user.name}! Выберите интересующий вас пункт меню`, {reply_markup: startKeyboard})
});

export default bot