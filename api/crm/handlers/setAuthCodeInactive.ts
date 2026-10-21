import {CrmApiParams} from "../../../types/crm/CrmApiParams";
import {AuthKeyItem} from "../../../types/global/AuthKeyItem";
import {UpdateDataParams} from "../../../types/crm/UpdateDataParams";
import {crmPost} from "../request";

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

    const res = await crmPost(params);
    if (res.status !== 200) throw new Error("Ошибка сервера")

    return
}