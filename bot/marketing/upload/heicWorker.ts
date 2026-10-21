import {parentPort} from "worker_threads";
import {limitImageMemory} from "../../runtime/limitImageMemory";
import {heicToJpeg} from "./heicConvert";

limitImageMemory();

if (!parentPort) {
    throw new Error("HEIC worker запущен без родительского потока");
}

const port = parentPort;

port.on("message", async (content: Buffer | Uint8Array) => {
    try {
        const bytes = Buffer.isBuffer(content) ? content : Buffer.from(content);
        const jpeg = await heicToJpeg(bytes);
        port.postMessage({ok: true, jpeg});
    } catch (error) {
        const message = error instanceof Error ? error.message : "Не удалось преобразовать фото HEIF в JPG";
        port.postMessage({ok: false, error: message});
    }
});
