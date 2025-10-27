import {CrmApiParams} from "../../types/crm/CrmApiParams";
import getUserByChatId from "./handlers/getUserByChatId";
import getUserByLogin from "./handlers/getUserByLogin";
import sendAuthCode from "./handlers/sendAuthCode";
import getUserAuthCode from "./handlers/getUserAuthCodes";
import setUserChatId from "./handlers/setUserChatId";
import setAuthCodeInactive from "./handlers/setAuthCodeInactive";
import addDataToEntity from "./handlers/addDataToEntity";
import {ParamsFilters} from "../../types/crm/GetDataParams";
import getGlobalListChoicesData from "./handlers/getGlobalListChoicesData";
import getData from "./handlers/getData";
import getAttachment from "./handlers/getAttachment";
import {UpdateByFieldParams, UpdateData} from "../../types/crm/UpdateDataParams";
import updateData from "./handlers/updateData";

export class Crm {

    config: CrmApiParams

    constructor(key: string, password: string, username: string) {
        this.config = {key: key, password: password, username: username}
    }


    async auth(chatId: number) {
        return await getUserByChatId(JSON.stringify(chatId), this.config)
    }

    async sendAuthCode(chatId: number, login: string, expiresIn: number) {
        const user = await getUserByLogin(login, this.config)
        if (!user) return `Пользователь не найден. Пожалуйста, введите ваш логин. Только логин, без @dns-shop.ru:`
        const authCode = await getUserAuthCode(chatId, expiresIn, this.config)
        if (authCode) {
            return `Вам уже был отправлен код подтверждения. Введите код, отправленный на почтовый ящик. Новый код можно будет отправить после ${new Date(authCode.expiresIn).toLocaleTimeString()}`
        } else {
            await sendAuthCode(user, chatId, this.config)
            return "Код успешно отправлен на ваш рабочий почтовый ящик. Введите код, полученный по email:"
        }
    }

    async confirmCode(chatId: number, code: string, expiresIn: number): Promise<{
        status: "error" | "success",
        message: string,
        needNewCode: boolean
    }> {
        const authCode = await getUserAuthCode(chatId, expiresIn, this.config)

        if (!authCode) return {
            status: "error",
            message: "Не найден код авторизации, либо истек срок действия кода авторизации. Необходимо запросить новый код.",
            needNewCode: true
        }

        if (authCode.activated) return {
            status: "error",
            message: "Код авторизации уже использован. Необходимо запросить новый код.",
            needNewCode: true
        }

        if (authCode.authCode !== code) return {
            status: "error",
            message: "Введен некорректный код авторизации. Проверьте правильность введонного вами кода.",
            needNewCode: false
        }

        if (authCode.authCode == code) {
            await setUserChatId(authCode, this.config)
            await setAuthCodeInactive(authCode, this.config)
            return {
                status: "success",
                message: "Поздравляем с регистрацией. Теперь вы можете перейти в меню бота.",
                needNewCode: false
            }
        }


        return {
            status: "error",
            message: "Произошла неизвестная ошибка.",
            needNewCode: false
        }
    }

    async insertData({entity_id, items}: {
        entity_id: number,
        items: { [p: string]: any } | { [p: string]: any }[]
    }) {
        return await addDataToEntity({action: "insert", entity_id, items, ...this.config})
    }

    async getData({entity_id, select_fields, limit, filters, reports_id, rows_per_page}: {
        entity_id: number
        limit?: number
        select_fields?: string
        reports_id?: number
        rows_per_page?: number
        filters?: ParamsFilters
    }) {
        return await getData({
            action: "select",
            entity_id: entity_id,
            select_fields: select_fields,
            reports_id: reports_id,
            limit: limit,
            filters: filters,
            rows_per_page: rows_per_page,
            ...this.config,
        })
    }

    async getGlobalListChoices(listId: number) {
        return await getGlobalListChoicesData({action: "get_global_list_choices", list_id: listId, ...this.config})
    }

    async downloadAttachments(
        {entity_id, field_id, item_id}:
            { entity_id: number, item_id: number, field_id: number }
    ) {
        return await getAttachment({
            action: "download_attachment",
            entity_id: entity_id,
            item_id: item_id,
            field_id: field_id, ...this.config
        })
    }

    async updateData({entity_id, data, update_by_field}: {
        entity_id: number,
        data: UpdateData | UpdateData[],
        update_by_field: UpdateByFieldParams
    }) {
        return await updateData({
            action: "update",
            entity_id: entity_id,
            data: data,
            update_by_field: update_by_field, ...this.config
        })
    }

}