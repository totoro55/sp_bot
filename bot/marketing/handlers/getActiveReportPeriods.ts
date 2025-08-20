import {Crm} from "../../../api/crm";
import {ReportPeriod} from "../../../types/marketing/ReportPeriod";
import createReportPeriodFromData from "../helpers/createReportPeriodFromData";

export default async function getActiveReportPeriods(): Promise<ReportPeriod[] | null> {
    const crm = new Crm(
        process.env.CRM_API_KEY!,
        process.env.CRM_PASSWORD!,
        process.env.CRM_USER!,
    )

    const params = {
        entity_id: 220,
        select_fields:"3822, 3826, 3827, 3823",
        filters: {"3823" : "true"}
    }

    try {
        const data = await crm.getData(params)
        if (!data || data.length == 0) return null
        return data.map(item=> createReportPeriodFromData(item))
    } catch (e) {
        throw new Error(JSON.stringify(e))
    }
}