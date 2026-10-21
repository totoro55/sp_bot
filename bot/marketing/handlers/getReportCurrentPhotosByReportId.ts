import {createCrm} from "../../../api/crm";

export default async function getReportCurrentPhotosByReportId(id: number) {
    const crm = createCrm()

    const params = {
        entity_id: 213,
        item_id: id,
        field_id: 3726
    }

    try {
        return await crm.downloadAttachments(params)
    } catch (e) {
        throw new Error(JSON.stringify(e))
    }
}