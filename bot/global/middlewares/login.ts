import {StatelessQuestion} from "@grammyjs/stateless-question";
import {InlineKeyboard} from "grammy";
import register from "../handlers/register";
import {MyContext} from "../../../types/global/myContext";

const loginQuestion = new StatelessQuestion("email", async (ctx:MyContext) => {
    if (ctx.message?.text) {
        try {
            const answer = await register(ctx, ctx.message?.text)
            await ctx.reply(answer, {reply_markup:
                    new InlineKeyboard()
                    .text("Ввести код", "confirm_code")})
            return
        } catch (error) {
            if (error instanceof Error) {
                await ctx.reply(error.message, {reply_markup:
                        new InlineKeyboard()
                        .text("Ввести логин", "register")})
                return
            }
            await ctx.reply("Произошла неизвестная ошибка.")
            return
        }
    }
});

export default loginQuestion;