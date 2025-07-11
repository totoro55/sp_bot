import {CrmApiParams} from "./CrmApiParams";

export interface SendDataParams extends CrmApiParams{
    action: "insert"
    entity_id:number
    items:Item | Item[]
}

interface Item {
    [key:string]: any
}