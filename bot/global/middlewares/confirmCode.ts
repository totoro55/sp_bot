import {StatelessQuestion} from "@grammyjs/stateless-question";
import {Context, InlineKeyboard} from "grammy";
import confirmAuthCode from "../handlers/confirmAuthCode";

const confirmInlineKeyboard = new InlineKeyboard()
    .text("Ввести код", "confirm_code")

const registerInlineKeyboard = new InlineKeyboard()
    .text("Ввести логин", "register")

const confirmCodeQuestion = new StatelessQuestion("confirm_code", async (ctx:Context) => {
    if (ctx.message?.text) {
        try {
            const answer = await confirmAuthCode(ctx, ctx.message?.text)
            if (answer.status == "error" && answer.needNewCode){
                await ctx.reply(answer.message, {reply_markup: registerInlineKeyboard})
                return
            }

            if (answer.status == "error" && !answer.needNewCode) {
                await ctx.reply(answer.message, {reply_markup: confirmInlineKeyboard})
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