import {ReportPeriod} from "../../../types/marketing/ReportPeriod";

const createReportPeriodFromData = (data:{[p:string]: any}): ReportPeriod => {
    return {
        id: data.id,
        name: data["3822"],
        period_from: data["3826"],
        period_to: data["3827"],
    }
}

export default createReportPeriodFromData;