import {CrmApiParams} from "../../../types/crm/CrmApiParams";
import {ParamsFilters} from "../../../types/crm/GetDataParams";
import {TUser} from "../../../types/global/TUser";
import {crmPostSuccess} from "../request";
import checkAccessByGroup from "./checkAccessByGroup";
import createUserFromData, {CrmUserRow} from "./createUserFromData";

const USER_SELECT_FIELDS = "5, 6, 7, 8, 9, 3732, 3733, 3734";

const allowedPortalUser = (user: TUser): TUser => {
    if (checkAccessByGroup(user.access_group)) return user;
    throw new Error("Доступ запрещен. Обратитесь к администраторам портала South Project.");
};

const selectActiveUser = async (filters: ParamsFilters, crmConfig: CrmApiParams): Promise<TUser | null> => {
    const rows = await crmPostSuccess<CrmUserRow[]>({
        action: "select",
        select_fields: USER_SELECT_FIELDS,
        entity_id: 1,
        limit: 1,
        filters,
        ...crmConfig,
    });
    if (!rows.length) return null;
    return allowedPortalUser(createUserFromData(rows[0]));
};

export {selectActiveUser};
