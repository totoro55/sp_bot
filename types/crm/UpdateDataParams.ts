import {CrmApiParams} from "./CrmApiParams";

export interface UpdateDataParams extends CrmApiParams{
    action: "update"
    entity_id:number
    data:UpdateData | UpdateData[]
    update_by_field: UpdateByFieldParams
}

export interface UpdateData {
    [key:string]: any
}

export interface UpdateByFieldParams {
    [key:string] : string | string[] | number | number[]
}