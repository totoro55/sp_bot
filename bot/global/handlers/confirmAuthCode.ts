import {Context} from "grammy";
import {Crm} from "../../../api/crm";

export default async function confirmAuthCode(ctx: Context, code:string):Promise<{
    status: "error" | "success"
    message: string
    needNewCode: boolean
}> {
    const crm = new Crm(
        process.env.CRM_API_KEY!,
        process.env.CRM_PASSWORD!,
        process.env.CRM_USER!,
    )

    const expiresIn = (ctx.message?.date || 0)*1000
    const chatId = ctx.chatId

    if (!chatId) return {status: "error", message:"Нет chat id. Подтверждение невозможно.", needNewCode:false}

    if (!code) return {status: "error", message:"Код не может быть пустым введите код подтверждения.", needNewCode:false}

    return await crm.confirmCode(chatId, code, expiresIn)
}