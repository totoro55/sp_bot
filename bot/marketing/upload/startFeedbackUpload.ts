import {MyContext} from "../../../types/global/myContext";
import {enqueueUpload} from "./queue";

type FeedbackDraft = {
    userId: string;
    feedbackType: "problem" | "offer";
    description: string;
    fileName: string;
    telegramFileId: string;
};

const startFeedbackUpload = async (ctx: MyContext, draft: FeedbackDraft): Promise<void> => {
    const chatId = ctx.chatId;
    if (!chatId) return;
    const progress = await ctx.reply("Обращение принято. Подготавливаю отправку вложения.", {
        reply_markup: {remove_keyboard: true},
    });
    ctx.session.outboundBusy = "feedback";
    enqueueUpload({
        kind: "feedback",
        job: {
            chatId,
            progressMessageId: progress.message_id,
            ...draft,
        },
    });
};

export {startFeedbackUpload};
