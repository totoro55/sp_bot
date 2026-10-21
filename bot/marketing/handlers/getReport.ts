import {createCrm} from "../../../api/crm";

export default async function getReport(id: string, period_id: string) {
    const crm = createCrm()

    const params = {
        entity_id: 213,
        select_fields: "3723, 3727, 3726, 3724, 3725, 4247",
        filters: {
            "parent_item_id": id,
            "3835" : period_id
        }
    }

    try {
        return await crm.getData(params)
    } catch (e) {
        throw new Error(JSON.stringify(e))
    }
}