import {TUser} from "../../../types/global/TUser";
import {CrmApiParams} from "../../../types/crm/CrmApiParams";
import {AuthKeyItem} from "../../../types/global/AuthKeyItem";
import {UpdateDataParams} from "../../../types/crm/UpdateDataParams";

export default async function setAuthCodeInactive(authCodeItem:AuthKeyItem, crmConfig:CrmApiParams):Promise<void> {
    const data = {
        field_3766: 1
    }

    const params:UpdateDataParams = {
        action: "update",
        entity_id: 215,
        data: data,
        update_by_field: {
            id:authCodeItem.id
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