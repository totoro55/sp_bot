import {execFile} from "child_process";
import fs from "fs";
import os from "os";
import path from "path";
import sharp from "sharp";
import {Worker} from "worker_threads";
import {MAX_PHOTO_FILE_BYTES} from "../../../config/filesConfig";

const IMAGE_BRANDS = new Set(["heic", "heix", "heim", "heis", "heif", "mif1", "msf1"]);
const CONVERT_TIMEOUT_MS = 120_000;
const HEIF_CONVERT_TIMEOUT_MS = 60_000;

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

const convertWithWorker = (content: Buffer): Promise<Buffer> => {
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

const runHeifConvert = (input: string, output: string): Promise<void> => new Promise((resolve, reject) => {
    execFile("heif-convert", ["--quiet", "-q", "85", input, output], {timeout: HEIF_CONVERT_TIMEOUT_MS}, (error) => {
        if (error) reject(error);
        else resolve();
    });
});

const convertWithHeifConvert = async (content: Buffer): Promise<Buffer> => {
    const dir = await fs.promises.mkdtemp(path.join(os.tmpdir(), "heic-"));
    try {
        const input = path.join(dir, "in.heic");
        const output = path.join(dir, "out.jpg");
        await fs.promises.writeFile(input, content);
        await runHeifConvert(input, output);
        const names = (await fs.promises.readdir(dir)).filter((name) => name.endsWith(".jpg"));
        let best: {jpeg: Buffer; pixels: number} | null = null;
        for (const name of names) {
            const jpeg = await fs.promises.readFile(path.join(dir, name));
            const meta = await sharp(jpeg).metadata();
            const pixels = (meta.width || 0) * (meta.height || 0);
            if (!best || pixels > best.pixels) best = {jpeg, pixels};
        }
        if (!best || best.jpeg.length < 1000 || best.pixels < 1) {
            throw new Error("heif-convert не вернул изображение");
        }
        return best.jpeg;
    } finally {
        await fs.promises.rm(dir, {recursive: true, force: true});
    }
};

const fitJpeg = async (jpeg: Buffer): Promise<Buffer> => {
    if (jpeg.length <= MAX_PHOTO_FILE_BYTES) return jpeg;
    const meta = await sharp(jpeg).metadata();
    let quality = 70;
    let width = meta.width || 0;
    for (let attempt = 0; attempt < 6; attempt += 1) {
        let pipeline = sharp(jpeg);
        if (width > 0 && meta.width && width < meta.width) {
            pipeline = pipeline.resize({width, withoutEnlargement: true});
        }
        const fitted = await pipeline.jpeg({quality}).toBuffer();
        if (fitted.length <= MAX_PHOTO_FILE_BYTES) return fitted;
        if (quality > 50) {
            quality -= 10;
        } else if (width > 1600) {
            width = Math.round(width * 0.75);
        } else {
            break;
        }
    }
    throw new Error("После преобразования в JPG файл больше 20 МБ");
};

const convertHeic = async (content: Buffer): Promise<Buffer> => {
    try {
        return await fitJpeg(await convertWithHeifConvert(content));
    } catch (error) {
        if (error instanceof Error && /20 МБ|Снимок слишком/.test(error.message)) throw error;
        console.error("heif-convert не смог преобразовать файл, используется запасной путь");
        return convertWithWorker(content);
    }
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
