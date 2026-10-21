import {createCrm} from "../../../api/crm";
import {MyContext} from "../../../types/global/myContext";

export default async function confirmAuthCode(ctx: MyContext, code:string):Promise<{
    status: "error" | "success"
    message: string
    needNewCode: boolean
}> {
    const crm = createCrm()

    const expiresIn = (ctx.message?.date || 0)*1000
    const chatId = ctx.chatId

    if (!chatId) return {status: "error", message:"Нет chat id. Подтверждение невозможно.", needNewCode:false}

    if (!code) return {status: "error", message:"Код не может быть пустым. Введите код подтверждения.", needNewCode:false}

    return await crm.confirmCode(chatId, code, expiresIn)
}