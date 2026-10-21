import {MyContext} from "../../../types/global/myContext";
import {hideReplyKeyboard} from "./progress";
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
    const progress = await ctx.reply("Обращение принято. Подготавливаю отправку вложения.");
    ctx.session.outboundBusy = "feedback";
    let hiddenMessageId = 0;
    try {
        hiddenMessageId = await hideReplyKeyboard(ctx.api, chatId);
    } catch (error) {
        console.log(error);
    }
    enqueueUpload({
        kind: "feedback",
        job: {
            chatId,
            progressMessageId: progress.message_id,
            hiddenMessageId,
            ...draft,
        },
    });
};

export {startFeedbackUpload};
