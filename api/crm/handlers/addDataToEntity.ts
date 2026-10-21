import {SendDataParams} from "../../../types/crm/SendDataParams";
import {crmPostSuccess} from "../request";

export default async function addDataToEntity(params: SendDataParams): Promise<number> {
    const data = await crmPostSuccess<{id: number}>(params);
    return data.id;
}
