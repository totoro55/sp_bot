import {Crm} from "../../../api/crm";
import {MarketingReport} from "../../../types/marketing/MarketingReport";
import {TUser} from "../../../types/global/TUser";

const updateReport = async (
    report: MarketingReport, periodId: string, user: TUser
) => {

    const crm = new Crm(
        process.env.CRM_API_KEY!,
        process.env.CRM_PASSWORD!,
        process.env.CRM_USER!,
    )

    const payload = {
        entity_id: 213,
        data: {
            created_by: user.id,
            field_3724: report.reportData.status == "Проблем нет" ? 4316 : 4317,
            field_3725: report.reportData.comment,
            field_3726: report.reportData.photos.join(","),
            field_3727: 1798,
        },
        update_by_field: {id: report.reportId!},
    }
    try {
        const res = await crm.updateData(payload)
        if (res) {
            return {status: "success", message: "Отчет успешно обновлен."}
        }
        return {status: "error", message: "Отчет не был добавлен."}
    } catch (error) {
        if (error instanceof Error) {
            return {status: "error", message: error.message}
        } else {
            return {status: "error", message: "Произошла неизвестная ошибка."}
        }

    }

}

export default updateReport