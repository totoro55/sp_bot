import {Crm} from "../../../api/crm";
import {TUser} from "../../../types/global/TUser";

const addFilesToReport = async (
    report: {reportId:string, photos: Array<string | {[p:string]: string}>}, user: TUser
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
            field_3726: report.photos.join(","),
            field_3727: 1798,
            field_4134: 1
        },
        update_by_field: {id: report.reportId!},
    }

    try {
        const res = await crm.updateData(payload)
        if (res) {
            return {status: "success", message: "Отчет успешно обновлен."}
        }
        return {status: "error", message: "Не удалось обновить данные отчета."}
    } catch (error) {
        if (error instanceof Error) {
            return {status: "error", message: error.message}
        } else {
            return {status: "error", message: "Произошла неизвестная ошибка."}
        }

    }

}

export default addFilesToReport