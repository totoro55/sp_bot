import {StatelessQuestion} from "@grammyjs/stateless-question";
import {InlineKeyboard} from "grammy";
import {MyContext} from "../../../types/global/myContext";
import confirmAuthCode from "../handlers/confirmAuthCode";

const confirmCodeQuestion = new StatelessQuestion("confirm_code", async (ctx:MyContext) => {
    if (ctx.message?.text) {
        try {
            const answer = await confirmAuthCode(ctx, ctx.message?.text)
            if (answer.status == "error" && answer.needNewCode){
                await ctx.reply(answer.message, {reply_markup:
                        new InlineKeyboard()
                        .text("Ввести логин", "register")})
                return
            }

            if (answer.status == "error" && !answer.needNewCode) {
                await ctx.reply(answer.message, {reply_markup:
                        new InlineKeyboard()
                        .text("Ввести код", "confirm_code")})
                return
            }

            await ctx.reply(answer.message)
            return

        } catch (error) {
            await ctx.reply(JSON.stringify(error))
            return
        }

    }
});

export default confirmCodeQuestion;