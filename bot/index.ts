import {Bot, Context} from "grammy";
import 'dotenv/config';
import isAuth from "./global/handlers/isAuth";
import emailQuestion from "./global/middlewares/register";
import confirmCodeQuestion from "./global/middlewares/confirmCode";
import confirmCode from "./global/middlewares/confirmCode";

require('dotenv').config();

// Create a bot object
const bot = new Bot(process.env.BOT_TOKEN!); // <-- place your bot token in this string

bot.use(emailQuestion.middleware())
bot.use(confirmCodeQuestion.middleware())

// Register listeners to handle messages
bot.on("message:text", async (ctx: Context) => {
    const text = ctx.message?.text || ""

    const user = await isAuth(ctx)
    if (!user) return


});

bot.callbackQuery("register", async (ctx: Context) => {
    return emailQuestion.replyWithMarkdown(ctx, "Введите ваш логин. Только логин, без @dns-shop.ru:");
})

bot.callbackQuery("confirm_code", async (ctx: Context) => {
    return confirmCode.replyWithMarkdown(ctx, "Введите код подтверждения, отправленный на ваш почтовый ящик:");
})
export default bot