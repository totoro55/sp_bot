import {GetGlobalListsChoicesParams} from "../../../types/crm/GetGlobalListsChoicesParams";
import {crmPostSuccess} from "../request";

export default async function getGlobalListChoicesData(params: GetGlobalListsChoicesParams): Promise<{[key:string]: any}[]> {
    return crmPostSuccess(params);
}
