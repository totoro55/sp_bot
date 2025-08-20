import {CrmApiParams} from "./CrmApiParams";

export interface GetGlobalListsChoicesParams extends CrmApiParams{
    action: "get_global_list_choices",
    list_id: number
}
