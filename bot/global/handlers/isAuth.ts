import {TUser} from "../../../types/global/TUser";
import {Context, InlineKeyboard} from "grammy";
import {Crm} from "../../../api/crm";

const inlineKeyboard = new InlineKeyboard()
    .text("Регистрация", "register")

export default async function isAuth(ctx: Context): Promise<TUser | null> {

    const crm = new Crm(
        process.env.CRM_API_KEY!,
        process.env.CRM_PASSWORD!,
        process.env.CRM_USER!,
    )

    if (!ctx.chatId) return null

    try {
        const user = await crm.auth(ctx.chatId)
        if (!user) {
            await ctx.reply("Для продолжения работы с ботом необходимо зарегистрироваться.", {reply_markup: inlineKeyboard})
            return null
        }
        return user
    } catch (e) {
        await ctx.reply(`Возникла ошибка: ${JSON.stringify(e)}`)
        return null
    }

}