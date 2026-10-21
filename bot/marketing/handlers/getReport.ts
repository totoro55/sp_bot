import {createCrm} from "../../../api/crm";
import {crmQuery} from "../../../api/crm/result";

export default async function getReport(id: string, periodId: string) {
    const crm = createCrm();
    return crmQuery(() => crm.getData({
        entity_id: 213,
        select_fields: "3723, 3727, 3726, 3724, 3725, 4247",
        filters: {
            parent_item_id: id,
            "3835": periodId,
        },
    }));
}
