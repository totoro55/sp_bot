import {createCrm} from "../../../api/crm";
import {crmQuery} from "../../../api/crm/result";

export default async function getReportCurrentPhotosByReportId(id: number) {
    const crm = createCrm();
    return crmQuery(() => crm.downloadAttachments({
        entity_id: 213,
        item_id: id,
        field_id: 3726,
    }));
}
