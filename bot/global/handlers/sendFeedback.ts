import {createCrm} from "../../../api/crm";

const sendFeedback = async (
    feedbackType: "problem" | "offer",
    user_id: string,
    description: string,
    file_url?:string | string[]
    ) => {

    const crm = createCrm()

    const payload = {
        entity_id:219,
        items: {
            field_3808: feedbackType === "problem" ? 1679 : 1680,
            created_by: user_id,
            field_3809: description,
            field_3810: file_url ?? "",
        }
    }
    try {
        const id = await crm.insertData(payload)
        return "Обращение успешно зарегистрировано. Благодарим за предоставленную информацию.\n" +
            `Ссылка на обращение:\n http://southproject.partner.ru/index.php?module=items/info&path=219-${id}`
    } catch (error) {
        if (error instanceof Error) {
            return error.message
        } else {
            return "Произошла неизвестная ошибка"
        }

    }

}

export default sendFeedback