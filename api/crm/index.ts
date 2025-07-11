import {CrmApiParams} from "../../types/crm/CrmApiParams";
import getUserByChatId from "./handlers/getUserByChatId";
import getUserByLogin from "./handlers/getUserByLogin";
import sendAuthCode from "./handlers/sendAuthCode";
import getUserAuthCode from "./handlers/getUserAuthCodes";
import setUserChatId from "./handlers/setUserChatId";
import setAuthCodeInactive from "./handlers/setAuthCodeInactive";

export class Crm {

    config: CrmApiParams

    constructor(key : string, password : string, username : string) {
        this.config = {key : key, password : password , username : username}
    }



    async auth (chatId:number) {
        return await getUserByChatId(JSON.stringify(chatId), this.config)
    }

    async sendAuthCode (chatId:number, login:string, expiresIn:number) {
        const user = await getUserByLogin(login, this.config)
        if (!user) return `Пользователь не найден. Пожалуйста, введите ваш логин. Только логин, без @dns-shop.ru:`
        const authCode = await getUserAuthCode(chatId, expiresIn, this.config )
        if (authCode) {
            return `Вам уже был отправлен код подтверждения. Введите код, отправленный на почтовый ящик. Новый код можно будет отправить после ${new Date(authCode.expiresIn).toLocaleTimeString()}`
        } else {
            await sendAuthCode(user, chatId, this.config)
            return "Код успешно отправлен на ваш рабочий почтовый ящик. Введите код полученный по email:"
        }
    }

    async confirmCode (chatId:number, code:string, expiresIn:number) : Promise<{
        status:"error" | "success",
        message:string,
        needNewCode:boolean
    }> {
        const authCode = await getUserAuthCode(chatId, expiresIn, this.config )

        if (!authCode) return {
            status: "error",
            message: "Не найден код авторизации, либо истек срок действия кода авторизации. Необходимо запросить новый код.",
            needNewCode: true
        }

        if (authCode.activated) return {status: "error", message: "Код авторизации уже использован. Необходимо запросить новый код.", needNewCode: true}

        if (authCode.authCode !== code) return {
            status: "error",
            message: "Введен некорректный код авторизации. Проверьте правильность введонного вами кода.",
            needNewCode: false
        }

        if (authCode.authCode == code) {
            await setUserChatId(authCode, this.config)
            await setAuthCodeInactive(authCode, this.config)
            return {status: "success", message: "Поздарвляем с регистрацией. Теперь вы можете перейти к использованию функционала бота.", needNewCode:false}
        }


        return {
            status: "error",
            message: "Произошла неизвестная ошибка.",
            needNewCode: false
        }
    }
}