import {readableError} from "../../global/helpers/readableError";
import {MyApi} from "../../../types/global/myContext";
import {backKeyboard} from "../../global/keyboards/back";
import sendFeedback from "../../global/handlers/sendFeedback";
import {downloadTelegramFile} from "./downloadTelegramFile";
import {prepareCrmFile} from "./heicToJpeg";
import {deleteServiceMessage, editProgress, sendKeyboard} from "./progress";
import {patchBusySession} from "./sessionPatch";

type FeedbackUploadJob = {
    chatId: number;
    progressMessageId: number;
    hiddenMessageId: number;
    userId: string;
    feedbackType: "problem" | "offer";
    description: string;
    fileName: string;
    telegramFileId: string;
};

const runFeedbackUpload = async (api: MyApi, job: FeedbackUploadJob): Promise<void> => {
    let message = "Обращение принято. Отправляю вложение.";
    try {
        await editProgress(api, job.chatId, job.progressMessageId, message);
        const content = await downloadTelegramFile(api, job.telegramFileId);
        const prepared = await prepareCrmFile(content, job.fileName);
        message = await sendFeedback({
            feedbackType: job.feedbackType,
            userId: job.userId,
            description: job.description,
            attachment: {name: prepared.fileName, content: prepared.content.toString("base64")},
        });
    } catch (error) {
        message = `Не удалось отправить обращение. ${readableError(error)}\n\nЗаполните его еще раз.`;
    } finally {
        try {
            await editProgress(api, job.chatId, job.progressMessageId, message);
            await sendKeyboard(api, job.chatId, "Выберите следующее действие", backKeyboard);
        } catch (error) {
            console.error(error);
        }
        await deleteServiceMessage(api, job.chatId, job.hiddenMessageId);
        await patchBusySession(job.chatId, (session) => {
            session.outboundBusy = null;
        });
    }
};

export {runFeedbackUpload};
export type {FeedbackUploadJob};
