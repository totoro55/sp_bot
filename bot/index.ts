import {Bot, Context} from "grammy";
import 'dotenv/config';


// Create a bot object
const bot = new Bot(process.env.BOT_TOKEN!); // <-- place your bot token in this string

// Register listeners to handle messages
bot.on("message:text", async (ctx:Context) => await ctx.reply("Echo: " + ctx.message?.text));

export default bot