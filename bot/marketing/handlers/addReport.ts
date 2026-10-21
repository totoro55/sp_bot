import {createCrm} from "../../../api/crm";
import {crmResult} from "../../../api/crm/result";
import {MarketingReport} from "../../../types/marketing/MarketingReport";
import {TUser} from "../../../types/global/TUser";

const addReport = async (report: MarketingReport, periodId: string, user: TUser) => {
    const crm = createCrm();
    return crmResult(
        () => crm.insertData({
            entity_id: 213,
            items: {
                parent_item_id: report.advStructureId,
                field_3835: periodId,
                created_by: user.id,
                field_3724: report.reportData.status == "Все ок" ? 4316 : 4317,
                field_3725: report.reportData.comment,
                field_3726: report.reportData.photos.join(","),
                field_3727: 1665,
                field_4134: 1,
            },
        }),
        "Отчет успешно добавлен.",
        "Отчет не был добавлен.",
    );
};

export default addReport;
