import {createCrm} from "../../../api/crm";

type FeedbackAttachment = {name: string; content: string};

const feedbackLink = (id: number | string): string => {
    return "Обращение успешно зарегистрировано. Благодарим за предоставленную информацию.\n" +
        `Ссылка на обращение:\nhttp://southproject.partner.ru/index.php?module=items/info&path=219-${id}`;
};

const sendFeedback = async (params: {
    feedbackType: "problem" | "offer";
    userId: string;
    description: string;
    attachment?: FeedbackAttachment;
}): Promise<string> => {
    const crm = createCrm();
    const id = await crm.insertData({
        entity_id: 219,
        items: {
            field_3808: params.feedbackType === "problem" ? 1679 : 1680,
            created_by: params.userId,
            field_3809: params.description,
            field_3810: params.attachment ? [params.attachment] : "",
        },
    });
    return feedbackLink(id);
};

export default sendFeedback;
