import {StatelessQuestion} from "@grammyjs/stateless-question";
import {Context, InlineKeyboard} from "grammy";
import register from "../handlers/register";

const confirmInlineKeyboard = new InlineKeyboard()
    .text("Ввести код", "confirm_code")

const registerInlineKeyboard = new InlineKeyboard()
    .text("Ввести логин", "register")


const loginQuestion = new StatelessQuestion("email", async (ctx:Context) => {
    if (ctx.message?.text) {
        try {
            const answer = await register(ctx, ctx.message?.text)
            await ctx.reply(answer, {reply_markup: confirmInlineKeyboard})
            return
        } catch (error) {
            if (error instanceof Error) {
                await ctx.reply(error.message, {reply_markup: registerInlineKeyboard})
                return
            }
            await ctx.reply("Произошла неизвестная ошибка.")
            return
        }
    }
});

export default loginQuestion;