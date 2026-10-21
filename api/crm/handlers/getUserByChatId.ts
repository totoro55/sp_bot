import {CrmApiParams} from "../../../types/crm/CrmApiParams";
import {TUser} from "../../../types/global/TUser";
import {selectActiveUser} from "../helpers/portalUser";

export default async function getUserByChatId(
    chatId: string, crmConfig: CrmApiParams
): Promise<TUser | null> {
    return selectActiveUser({"3733": chatId, "5": "1"}, crmConfig);
}
