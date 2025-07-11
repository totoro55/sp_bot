import {TUser} from "../../../types/global/TUser";
import {CrmApiParams} from "../../../types/crm/CrmApiParams";
import {SendDataParams} from "../../../types/crm/SendDataParams";
import {EXPIRES_IN} from "../../../config/crmConfig";

export default async function sendAuthCode(user: TUser, chatId:number, crmConfig:CrmApiParams):Promise<void> {
    const data = {
        field_3761: chatId, //chat_id
        field_3762: user.id, //user_id
        field_3763: Date.now()+EXPIRES_IN,//expires_in
        field_3764: Math.floor(Math.random()*1000000),//auth_code
        field_3765: user.mail,//mail
        field_3766: 0,//activated
    }


    const params: SendDataParams = {
        action: "insert",
        entity_id: 215,
        items : data,
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