import {createCrm} from "../../../api/crm";
import {crmQuery} from "../../../api/crm/result";

export default async function getAdvertisingStructuresById(id: string) {
    const crm = createCrm();
    return crmQuery(() => crm.getData({
        entity_id: 212,
        select_fields: "3713, 3711, 3710, 3714, 3715, 3716",
        filters: {id},
    }));
}
