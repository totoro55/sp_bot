import fs from "fs";
import path from "path";
import {Worker} from "worker_threads";

const IMAGE_BRANDS = new Set(["heic", "heix", "heim", "heis", "heif", "mif1", "msf1"]);
const CONVERT_TIMEOUT_MS = 120_000;

type WorkerSuccess = {ok: true; jpeg: Buffer | Uint8Array};
type WorkerFailure = {ok: false; error?: string};
type WorkerMessage = WorkerSuccess | WorkerFailure;

const isHeic = (content: Buffer): boolean => {
    if (content.length < 12) return false;
    if (content.toString("ascii", 4, 8) !== "ftyp") return false;
    return IMAGE_BRANDS.has(content.toString("ascii", 8, 12).toLowerCase());
};

const jpegFileName = (fileName: string): string => {
    if (/\.jpe?g$/i.test(fileName)) return fileName;
    const dot = fileName.lastIndexOf(".");
    const base = (dot > 0 ? fileName.slice(0, dot) : fileName).trim();
    return `${base || "photo"}.jpg`;
};

const resolveHeicWorker = (): {filename: string; execArgv?: string[]} => {
    const compiled = path.join(__dirname, "heicWorker.js");
    if (fs.existsSync(compiled)) return {filename: compiled};
    return {
        filename: path.join(__dirname, "heicWorker.ts"),
        execArgv: ["-r", "ts-node/register/transpile-only"],
    };
};

const convertHeic = (content: Buffer): Promise<Buffer> => {
    const workerFile = resolveHeicWorker();
    const worker = new Worker(workerFile.filename, workerFile.execArgv ? {execArgv: workerFile.execArgv} : {});
    return new Promise((resolve, reject) => {
        let settled = false;
        const finish = (error: Error | null, jpeg?: Buffer) => {
            if (settled) return;
            settled = true;
            clearTimeout(timer);
            worker.terminate().catch(() => undefined).finally(() => {
                if (error) reject(error);
                else resolve(jpeg as Buffer);
            });
        };
        const timer = setTimeout(() => {
            finish(new Error("Не удалось преобразовать фото HEIF в JPG"));
        }, CONVERT_TIMEOUT_MS);
        worker.once("message", (message: WorkerMessage) => {
            if (message?.ok && message.jpeg) {
                const jpeg = Buffer.isBuffer(message.jpeg) ? message.jpeg : Buffer.from(message.jpeg);
                finish(null, jpeg);
                return;
            }
            finish(new Error(message && !message.ok && message.error
                ? message.error
                : "Не удалось преобразовать фото HEIF в JPG"));
        });
        worker.once("error", () => finish(new Error("Не удалось преобразовать фото HEIF в JPG")));
        worker.once("exit", () => {
            if (!settled) finish(new Error("Не удалось преобразовать фото HEIF в JPG"));
        });
        try {
            worker.postMessage(content);
        } catch {
            finish(new Error("Не удалось преобразовать фото HEIF в JPG"));
        }
    });
};

const prepareCrmFile = async (
    content: Buffer,
    fileName: string,
    force = false,
): Promise<{content: Buffer; fileName: string}> => {
    if (!force && !isHeic(content) && !/\.hei[cf]$/i.test(fileName)) {
        return {content, fileName};
    }
    const jpeg = await convertHeic(content);
    return {content: jpeg, fileName: jpegFileName(fileName)};
};

export {jpegFileName, prepareCrmFile};
