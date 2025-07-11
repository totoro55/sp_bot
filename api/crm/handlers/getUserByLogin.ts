import {GetDataParams} from "../../../types/crm/GetDataParams";
import {TUser} from "../../../types/global/TUser";
import {CrmApiParams} from "../../../types/crm/CrmApiParams";
import createUserFromData from "../helpers/createUserFromData";
import checkAccessByGroup from "../helpers/checkAccessByGroup";

export default async function getUserByLogin(
    login:string, crmConfig:CrmApiParams
): Promise<TUser> {
    const params: GetDataParams = {
        action : "select",
        select_fields:"5, 6, 7, 8, 9, 3732, 3733, 3734",
        entity_id : 1,
        limit : 1,
        filters: {
            "12": login,
            "5": "1",
        }, ...crmConfig}


    const res = await fetch("http://southproject.partner.ru/api/rest.php", {
        method: "POST",
        body: JSON.stringify(params),
    })

    if (res.status !== 200) throw new Error("Ошибка сервера")
    const body = await res.json()
    if (body.status === "error") throw new Error(body.error_message)

    if (body.status === "success" && body.data.length < 1) {
        throw new Error("Пользователь не найден. Проверьте правильность введенных данных")
    }

    const user = createUserFromData(body.data[0])
    if (checkAccessByGroup(user.access_group)) {
        return user
    } else {
        throw new Error("Доступ запрещен. Обратитесь к администраторам портала South Project.")
    }
}



