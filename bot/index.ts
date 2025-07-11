import {Bot, Context} from "grammy";
import 'dotenv/config';
import isAuth from "./global/handlers/isAuth";

import {startKeyboard} from "./global/keyboards/start";
import {helpKeyboard} from "./global/keyboards/help";
import addCallbacks from "./callbacks";

require('dotenv').config();

// Create a bot object
const bot = new Bot(process.env.BOT_TOKEN!); // <-- place your bot token in this string

addCallbacks(bot)


bot.command("start", async (ctx: Context) => {
    const user = await isAuth(ctx)
    if (!user) return

    await ctx.reply("Добро пожаловать! Выберите интересующий вас пункт меню", {reply_markup: startKeyboard})
});

bot.command("help", async (ctx: Context) => {
    const user = await isAuth(ctx)
    if (!user) return

    await ctx.reply("Выберите интересующий вас пункт меню", {reply_markup: helpKeyboard})
});

// Register listeners to handle messages
bot.on("message:text", async (ctx: Context) => {
    const user = await isAuth(ctx)
    if (!user) return

    const text = ctx.message?.text
    if (!text) return
    //await ctx.reply("Привет")
});


export default bot