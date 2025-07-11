import {TUser} from "../../../types/global/TUser";
import {CrmApiParams} from "../../../types/crm/CrmApiParams";
import {AuthKeyItem} from "../../../types/global/AuthKeyItem";
import {UpdateDataParams} from "../../../types/crm/UpdateDataParams";

export default async function setUserChatId(authCodeItem:AuthKeyItem, crmConfig:CrmApiParams):Promise<void> {
    const data = {
        field_3733: authCodeItem.chatId
    }

    const params:UpdateDataParams = {
        action: "update",
        entity_id: 1,
        data: data,
        update_by_field: {
            id:authCodeItem.userId
        },
        ...crmConfig
    }

    const res = await fetch("http://southproject.partner.ru/api/rest.php", {
        method: "POST",
        body: JSON.stringify(params),
        keepalive:false
    })

    if (res.status !== 200) throw new Error("Ошибка сервера")

    return
}