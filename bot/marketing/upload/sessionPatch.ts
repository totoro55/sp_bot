import {SessionData} from "../../../types/global/myContext";
import {withChatLock} from "../../runtime/chatLock";
import {sessionStorage} from "../../runtime/sessionStorage";

const patchBusySession = async (
    chatId: number,
    patch: (session: SessionData) => void,
): Promise<void> => {
    await withChatLock(chatId, async () => {
        const current = await sessionStorage.read(String(chatId));
        if (!current?.outboundBusy) return;
        patch(current);
        await sessionStorage.write(String(chatId), current);
    });
};

export {patchBusySession};
