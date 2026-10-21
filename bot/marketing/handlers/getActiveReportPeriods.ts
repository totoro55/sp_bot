import {createCrm} from "../../../api/crm";
import {crmQuery} from "../../../api/crm/result";
import {ReportPeriod} from "../../../types/marketing/ReportPeriod";
import createReportPeriodFromData from "../helpers/createReportPeriodFromData";

export default async function getActiveReportPeriods(): Promise<ReportPeriod[] | null> {
    const crm = createCrm();
    const data = await crmQuery(() => crm.getData({
        entity_id: 220,
        select_fields: "3822, 3826, 3827, 3823",
        filters: {"3823": "true"},
    }));
    if (!data || data.length == 0) return null;
    return data.map((item) => createReportPeriodFromData(item));
}
