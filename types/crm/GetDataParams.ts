import {CrmApiParams} from "./CrmApiParams";

export interface GetDataParams extends CrmApiParams{
    action: "select"
    entity_id:number
    limit?:number
    select_fields?:string
    reports_id?:number
    rows_per_page?:number
    filters?: ParamsFilters
}

export interface ParamsFilters {
    [key: string]:  string | boolean | number | ParamsFilterCondition
}

interface ParamsFilterCondition {
    value?: string | number
    condition: string
    //"not_empty_value" | "empty_value" | "include" | "exclude" | "search"
}