import {createCrm} from "../../../api/crm";
import {crmResult} from "../../../api/crm/result";
import {MarketingReport} from "../../../types/marketing/MarketingReport";
import {TUser} from "../../../types/global/TUser";

const updateReport = async (report: MarketingReport, _periodId: string, user: TUser) => {
    const crm = createCrm();
    return crmResult(
        () => crm.updateData({
            entity_id: 213,
            data: {
                created_by: user.id,
                field_3724: report.reportData.status == "Все ок" ? 4316 : 4317,
                field_3725: report.reportData.comment,
                field_3726: report.reportData.photos.join(","),
                field_3727: 1798,
                field_4134: 1,
            },
            update_by_field: {id: report.reportId!},
        }),
        "Отчет успешно обновлен.",
        "Отчет не был добавлен.",
    );
};

export default updateReport;
