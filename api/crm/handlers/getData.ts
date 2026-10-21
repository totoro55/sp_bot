import {GetDataParams} from "../../../types/crm/GetDataParams";
import {crmPostSuccess} from "../request";

export default async function getData(params: GetDataParams): Promise<{[p:string]:any}[]> {
    return crmPostSuccess(params);
}
