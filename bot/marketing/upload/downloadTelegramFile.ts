import https from "https";
import {HttpsProxyAgent} from "https-proxy-agent";
import {telegramProxyUrl} from "../../../config/env";
import {MAX_REPORT_FILE_BYTES} from "../../../config/filesConfig";
import {MyApi} from "../../../types/global/myContext";

const DOWNLOAD_TIMEOUT_MS = 120_000;

const downloadTelegramFile = async (api: MyApi, telegramFileId: string): Promise<Buffer> => {
    const remote = await api.getFile(telegramFileId);
    if (remote.file_size && remote.file_size > MAX_REPORT_FILE_BYTES) {
        throw new Error("Файл больше 20 МБ");
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
                if (size > MAX_REPORT_FILE_BYTES) {
                    request.destroy();
                    fail(new Error("Файл больше 20 МБ"));
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
