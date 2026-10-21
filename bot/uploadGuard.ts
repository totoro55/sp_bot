import {Middleware} from "grammy";
import {MyContext} from "../types/global/myContext";

const uploadGuard = (): Middleware<MyContext> => async (ctx, next) => {
    if (!ctx.session.outboundBusy) return next();
    if (ctx.callbackQuery) {
        await ctx.answerCallbackQuery({text: "Дождитесь окончания отправки"});
        return;
    }
    await ctx.reply("Отправка уже идет. Дождитесь сообщения о результате.");
};

export {uploadGuard};
