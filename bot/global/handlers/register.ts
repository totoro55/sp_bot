import {createCrm} from "../../../api/crm";
import {MyContext} from "../../../types/global/myContext";

export default async function register(ctx: MyContext, login:string):Promise<string> {
    const crm = createCrm()

    const expiresIn = (ctx.message?.date || 0)*1000
    const chatId = ctx.chatId

    if (!chatId) return "Нет chat id. Регистрация невозможна."

    return await crm.sendAuthCode(chatId, login, expiresIn)
}