import {createCrm} from "../../../api/crm";
import {crmQuery} from "../../../api/crm/result";

export default async function getAdvStructurePhotoById(id: number) {
    const crm = createCrm();
    return crmQuery(() => crm.downloadAttachments({
        entity_id: 212,
        item_id: id,
        field_id: 3711,
    }));
}
