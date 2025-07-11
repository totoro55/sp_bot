import {CrmApiParams} from "./CrmApiParams";

export interface UpdateDataParams extends CrmApiParams{
    action: "update"
    entity_id:number
    data:Data | Data[]
    update_by_field: UpdateByFieldParams
}

interface Data {
    [key:string]: any
}

interface UpdateByFieldParams {
    [key:string] : string | string[] | number | number[]
}