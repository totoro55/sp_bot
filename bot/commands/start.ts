import {MyContext} from "../../types/global/myContext";
import getUser from "../global/handlers/getUser";
import {startKeyboard} from "../global/keyboards/start";
import {resetMarketingSession} from "../marketing/helpers/reportSession";

const startCommand = async (ctx: MyContext): Promise<void> => {
    const user = await getUser(ctx);
    if (!user) return;
    resetMarketingSession(ctx);
    await ctx.reply(`Добро пожаловать, ${user.name}! Выберите интересующий вас пункт меню`, {reply_markup: startKeyboard});
};

export {startCommand};
