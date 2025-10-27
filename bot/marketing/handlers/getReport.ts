import {Crm} from "../../../api/crm";

export default async function getReport(id: string, period_id: string) {
    const crm = new Crm(
        process.env.CRM_API_KEY!,
        process.env.CRM_PASSWORD!,
        process.env.CRM_USER!,
    )

    const params = {
        entity_id: 213,
        select_fields: "3723, 3727, 3726, 3724, 3725",
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