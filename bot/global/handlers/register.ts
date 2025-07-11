import {Context} from "grammy";
import {Crm} from "../../../api/crm";

export default async function register(ctx: Context, login:string):Promise<string> {
    const crm = new Crm(
        process.env.CRM_API_KEY!,
        process.env.CRM_PASSWORD!,
        process.env.CRM_USER!,
    )

    const expiresIn = (ctx.message?.date || 0)*1000
    const chatId = ctx.chatId

    if (!chatId) return "Нет chat id. Регистрация невозможна."

    return await crm.sendAuthCode(chatId, login, expiresIn)
}