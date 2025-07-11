import {GetDataParams} from "../../../types/crm/GetDataParams";
import {CrmApiParams} from "../../../types/crm/CrmApiParams";
import {EXPIRES_IN} from "../../../config/crmConfig";
import createAuthCodeItemFomData from "../helpers/createAuthCodeItemFomData";
import {AuthKeyItem} from "../../../types/global/AuthKeyItem";

export default async function getUserAuthCode(
    chatId: number,
    expiresIn:number,
    crmConfig: CrmApiParams
):Promise<AuthKeyItem | null> {

    const params: GetDataParams = {
        action: "select",
        select_fields: "3761, 3762, 3763, 3764, 3766",
        entity_id: 215,
        limit: 1,
        filters: {
            "3761": chatId,
            "3763": `>${expiresIn}`,
            "3766": 0,
        }, ...crmConfig
    }

    const res = await fetch("http://southproject.partner.ru/api/rest.php", {
        method: "POST",
        body: JSON.stringify(params),
    })

    if (res.status !== 200) throw new Error("Ошибка сервера")

    const data =await res.json().then(res => {
            return res.data
    }).catch(err => {
        throw new Error(JSON.stringify(err))
    })

    if (data.length) {
        return createAuthCodeItemFomData(data[0])
    } else {
        return null
    }
}