import {Crm} from "../../../api/crm";

export default async function getAdvStructurePhotoById(id: number) {
    const crm = new Crm(
        process.env.CRM_API_KEY!,
        process.env.CRM_PASSWORD!,
        process.env.CRM_USER!,
    )

    const params = {
        entity_id: 212,
        item_id: id,
        field_id: 3711
    }

    try {
        return await crm.downloadAttachments(params)
    } catch (e) {
        throw new Error(JSON.stringify(e))
    }
}