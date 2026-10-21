import {InlineKeyboard} from "grammy";
import {MyContext} from "../../../types/global/myContext";
import {backToMenuKeyboard} from "../keyboards/report";

const replyInlineChoice = async (ctx: MyContext, prompt: string, keyboard: InlineKeyboard): Promise<void> => {
    await ctx.reply(prompt, {reply_markup: backToMenuKeyboard});
    await ctx.reply("Нажмите на нужный пункт:", {reply_markup: keyboard});
};

export {replyInlineChoice};
