import {TUser} from "../../../types/global/TUser";
import {CrmApiParams} from "../../../types/crm/CrmApiParams";
import {selectActiveUser} from "../helpers/portalUser";

export default async function getUserByLogin(
    login: string, crmConfig: CrmApiParams
): Promise<TUser> {
    const user = await selectActiveUser({"12": login, "5": "1"}, crmConfig);
    if (!user) {
        throw new Error("Пользователь не найден. Проверьте правильность введенных данных");
    }
    return user;
}
