import https from "https";
import {HttpsProxyAgent} from "https-proxy-agent";
import {telegramProxyUrl} from "../../../config/env";
import {MAX_VIDEO_FILE_BYTES} from "../../../config/filesConfig";
import {MyApi} from "../../../types/global/myContext";

const DOWNLOAD_TIMEOUT_MS = 180_000;

const limitText = (maxBytes: number): string => maxBytes >= MAX_VIDEO_FILE_BYTES ? "50 МБ" : "20 МБ";

const downloadTelegramFile = async (api: MyApi, telegramFileId: string, maxBytes: number): Promise<Buffer> => {
    let remote;
    try {
        remote = await api.getFile(telegramFileId);
    } catch (error) {
        const message = error instanceof Error ? error.message : "";
        if (/too big/i.test(message)) {
            throw new Error("Telegram не отдает боту файл больше 20 МБ. Сожмите видео и отправьте его снова.");
        }
        throw error;
    }
    if (remote.file_size && remote.file_size > maxBytes) {
        throw new Error(`Файл больше ${limitText(maxBytes)}`);
    }
    const url = remote.getUrl();
    const proxy = telegramProxyUrl();
    const agent = proxy ? new HttpsProxyAgent(proxy) : undefined;

    return new Promise<Buffer>((resolve, reject) => {
        let settled = false;
        const fail = (error: Error) => {
            if (settled) return;
            settled = true;
            reject(error);
        };
        const succeed = (buffer: Buffer) => {
            if (settled) return;
            settled = true;
            resolve(buffer);
        };
        const request = https.get(url, {agent}, (response) => {
            if (!response.statusCode || response.statusCode >= 400) {
                response.resume();
                fail(new Error("Не удалось скачать файл из Telegram"));
                return;
            }
            const chunks: Buffer[] = [];
            let size = 0;
            response.on("data", (chunk: Buffer) => {
                if (settled) return;
                size += chunk.length;
                if (size > maxBytes) {
                    request.destroy();
                    fail(new Error(`Файл больше ${limitText(maxBytes)}`));
                    return;
                }
                chunks.push(chunk);
            });
            response.on("end", () => succeed(Buffer.concat(chunks)));
            response.on("error", fail);
        });
        request.setTimeout(DOWNLOAD_TIMEOUT_MS, () => {
            request.destroy(new Error("Превышено время ожидания скачивания файла"));
        });
        request.on("error", fail);
    });
};

export {downloadTelegramFile};
