import {Api, Keyboard} from "grammy";

const textWithPlace = (place: string, body: string): string => {
    return place ? `${place}\n\n${body}` : body;
};

const fileProgressText = (place: string, index: number, total: number, fileName: string): string => {
    return textWithPlace(place, `Отчет принят. Отправляю файл ${index} из ${total}.\n${fileName}`);
};

const editProgress = async (api: Api, chatId: number, messageId: number, text: string): Promise<void> => {
    try {
        await api.editMessageText(chatId, messageId, text);
    } catch (error) {
        console.log(error);
    }
};

const sendKeyboard = async (api: Api, chatId: number, text: string, keyboard: Keyboard): Promise<void> => {
    await api.sendMessage(chatId, text, {reply_markup: keyboard});
};

export {editProgress, fileProgressText, sendKeyboard, textWithPlace};
