import {TUser} from "../../../types/global/TUser";
import {InlineKeyboard} from "grammy";
import {Crm} from "../../../api/crm";
import {MyContext} from "../../../types/global/myContext";
import {USER_AUTH_EXPIRES_IN} from "../../../config/crmConfig";

export default async function getUser(ctx: MyContext): Promise<TUser | null> {

    const now = Date.now();

    if (now < ctx.session.auth_expires_in && ctx.session.user) {
        return ctx.session.user;
    }

    const crm = new Crm(
        process.env.CRM_API_KEY!,
        process.env.CRM_PASSWORD!,
        process.env.CRM_USER!,
    )

    if (!ctx.chatId) return null

    try {
        const user = await crm.auth(ctx.chatId)
        if (!user) {
            await ctx.reply("Для продолжения работы с ботом необходимо зарегистрироваться.",
                {
                    reply_markup: new InlineKeyboard()
                        .text("Регистрация", "register")
                })
            return null
        }
        ctx.session.user = user
        ctx.session.auth_expires_in = Date.now() + USER_AUTH_EXPIRES_IN
        return user
    } catch (e) {
        await ctx.reply(`Возникла ошибка: ${JSON.stringify(e)}`)
        return null
    }

}