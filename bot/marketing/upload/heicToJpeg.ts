import convert from "heic-convert";
import sharp from "sharp";
import {MAX_REPORT_FILE_BYTES} from "../../../config/filesConfig";

const IMAGE_BRANDS = new Set(["heic", "heix", "heim", "heis", "heif", "mif1", "msf1"]);

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

const conversionError = (error: unknown): Error => {
    const message = error instanceof Error ? error.message : "";
    if (/pixel limit|exceeds pixel/i.test(message)) {
        return new Error("Снимок слишком большой для преобразования в JPG");
    }
    return new Error("Не удалось преобразовать фото HEIF в JPG");
};

const decodeHeic = async (content: Buffer): Promise<Buffer> => {
    try {
        const converted = await convert({
            buffer: content,
            format: "JPEG",
            quality: 0.9,
        });
        return Buffer.from(converted);
    } catch (error) {
        throw conversionError(error);
    }
};

const heicToJpeg = async (content: Buffer): Promise<Buffer> => {
    const decoded = await decodeHeic(content);
    let originalWidth: number | undefined;
    try {
        originalWidth = (await sharp(decoded).metadata()).width;
    } catch (error) {
        throw conversionError(error);
    }

    let quality = 85;
    let width = originalWidth;
    for (let attempt = 0; attempt < 6; attempt += 1) {
        try {
            let image = sharp(decoded).rotate();
            if (originalWidth && width && width < originalWidth) {
                image = image.resize({width, withoutEnlargement: true});
            }
            const jpeg = await image.jpeg({quality}).toBuffer();
            if (jpeg.length <= MAX_REPORT_FILE_BYTES) return jpeg;
        } catch (error) {
            throw conversionError(error);
        }
        if (quality > 55) {
            quality -= 15;
        } else if (width && width > 1600) {
            width = Math.round(width * 0.75);
        } else {
            break;
        }
    }
    throw new Error("После преобразования в JPG файл больше 20 МБ");
};

const prepareCrmFile = async (
    content: Buffer,
    fileName: string,
    force = false,
): Promise<{content: Buffer; fileName: string}> => {
    if (!force && !isHeic(content) && !/\.hei[cf]$/i.test(fileName)) {
        return {content, fileName};
    }
    const jpeg = await heicToJpeg(content);
    return {content: jpeg, fileName: jpegFileName(fileName)};
};

export {jpegFileName, prepareCrmFile};
