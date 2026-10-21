import {Bot, InputFile} from "grammy";
import {readableError} from "./helpers/readableError";
import {MyApi, MyContext} from "../../types/global/myContext";
import getUser from "./handlers/getUser";
import {startKeyboard} from "./keyboards/start";
import {findFilialByCode} from "./middlewares";
import {findFilialKeyboard} from "./keyboards/findFilial";
import {resetMarketingSession} from "../marketing/helpers/reportSession";
import {backToMenuKeyboard, marketingMenuKeyboard} from "../marketing/keyboards/report";

const addMenuHears = (bot: Bot<MyContext, MyApi>): void => {
    bot.hears("Обратная связь", async (ctx) => {
        const user = await getUser(ctx);
        if (!user) return;
        await ctx.conversation.enter("feedback", user);
    });

    bot.hears("Назад в меню", async (ctx) => {
        resetMarketingSession(ctx);
        await ctx.reply("Выберите интересующий вас пункт меню", {reply_markup: startKeyboard});
    });

    bot.hears("Отдел рекламы", async (ctx) => {
        await ctx.reply("Выберите необходимую операцию", {reply_markup: marketingMenuKeyboard});
    });

    bot.hears("Видеоинструкция", async (ctx) => {
        await ctx.reply("Подождите, загружается файл с инструкцией", {reply_markup: backToMenuKeyboard});
        try {
            await ctx.replyWithDocument(new InputFile("files/marketing_video_instruction.mp4", "Инструкция.mp4"), {
                reply_markup: marketingMenuKeyboard,
            });
        } catch (err) {
            await ctx.reply(`Не удалось загрузить видео. ${readableError(err)}`, {
                reply_markup: marketingMenuKeyboard,
            });
        }
    });

    bot.hears("Выбор филиала", async (ctx) => {
        const user = await getUser(ctx);
        if (!user) return;
        const filial = ctx.session.selected_filial;
        if (!filial) {
            return findFilialByCode.replyWithMarkdown(ctx, "Отправьте код филиала, без пробелов:");
        }
        await ctx.reply(`Выбран филиал ${filial.name}. Вы можете выбрать другой филиал осуществив поиск:`, {
            reply_markup: findFilialKeyboard,
        });
    });

    bot.hears("По коду филиала", async (ctx) => {
        const user = await getUser(ctx);
        if (!user) return;
        return findFilialByCode.replyWithMarkdown(ctx, "Отправьте код филиала, без пробелов:");
    });
};

export {addMenuHears};
