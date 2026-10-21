import {createCrm} from "../../../api/crm";
import {crmResult} from "../../../api/crm/result";
import {TUser} from "../../../types/global/TUser";

const addFilesToReport = async (
    report: {reportId: string; photos: Array<string | {[key: string]: string}>},
    user: TUser,
) => {
    const crm = createCrm();
    return crmResult(
        () => crm.updateData({
            entity_id: 213,
            data: {
                created_by: user.id,
                field_3726: report.photos.join(","),
                field_3727: 1798,
                field_4134: 1,
            },
            update_by_field: {id: report.reportId},
        }),
        "Отчет успешно обновлен.",
        "Не удалось обновить данные отчета.",
    );
};

export default addFilesToReport;
