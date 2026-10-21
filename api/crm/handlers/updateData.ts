import {UpdateDataParams} from "../../../types/crm/UpdateDataParams";
import {crmPostSuccess} from "../request";

export default async function updateData(params: UpdateDataParams): Promise<number> {
    const data = await crmPostSuccess<{id: number}>(params);
    return data.id;
}