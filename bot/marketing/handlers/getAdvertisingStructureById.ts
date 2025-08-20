import {Crm} from "../../../api/crm";

export default async function getAdvertisingStructuresById(id: string) {
    const crm = new Crm(
        process.env.CRM_API_KEY!,
        process.env.CRM_PASSWORD!,
        process.env.CRM_USER!,
    )

    const params = {
        entity_id: 212,
        select_fields: "3713, 3711, 3710, 3715, 3716",
        filters: {
            "id": id
        }
    }

    try {
        return await crm.getData(params)
    } catch (e) {
        throw new Error(JSON.stringify(e))
    }
}