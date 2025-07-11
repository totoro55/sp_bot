import {Bot, Context} from "grammy";
import emailQuestion from "../middlewares/register";
import confirmCode from "../middlewares/confirmCode";
import confirmCodeQuestion from "../middlewares/confirmCode";



const addMainCallbacks = (bot:Bot) => {

    bot.use(emailQuestion.middleware())
    bot.use(confirmCodeQuestion.middleware())

    bot.callbackQuery("register", async (ctx: Context) => {
        return emailQuestion.replyWithMarkdown(ctx, "Введите ваш логин. Только логин, без @dns-shop.ru:");
    })

    bot.callbackQuery("confirm_code", async (ctx: Context) => {
        return confirmCode.replyWithMarkdown(ctx, "Введите код подтверждения, отправленный на ваш почтовый ящик:");
    })
}

export default addMainCallbacks
