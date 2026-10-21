import decode from "heic-decode";
import sharp from "sharp";
import {MAX_PHOTO_FILE_BYTES} from "../../../config/filesConfig";

const IMAGE_BRANDS = new Set(["heic", "heix", "heim", "heis", "heif", "mif1", "msf1"]);
const MAX_INPUT_PIXELS = 80_000_000;

type DecodedHeif = {width: number; height: number; data: Uint8ClampedArray};

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

const opaquePixels = (data: Uint8ClampedArray): Buffer => {
    const pixels = Buffer.from(data);
    for (let index = 3; index < pixels.length; index += 4) {
        pixels[index] = 255;
    }
    return pixels;
};

const encodeJpeg = async (image: DecodedHeif): Promise<Buffer> => {
    if (image.width * image.height > MAX_INPUT_PIXELS) {
        throw new Error("Снимок слишком большой для преобразования в JPG");
    }
    const pixels = opaquePixels(image.data);
    let quality = 85;
    let width = image.width;
    for (let attempt = 0; attempt < 6; attempt += 1) {
        try {
            let pipeline = sharp(pixels, {
                raw: {width: image.width, height: image.height, channels: 4},
                limitInputPixels: MAX_INPUT_PIXELS,
            });
            if (width < image.width) {
                pipeline = pipeline.resize({width, withoutEnlargement: true});
            }
            const jpeg = await pipeline.jpeg({quality}).toBuffer();
            if (jpeg.length <= MAX_PHOTO_FILE_BYTES) return jpeg;
        } catch (error) {
            throw conversionError(error);
        }
        if (quality > 55) {
            quality -= 15;
        } else if (width > 1600) {
            width = Math.round(width * 0.75);
        } else {
            break;
        }
    }
    throw new Error("После преобразования в JPG файл больше 20 МБ");
};

const decodeLargest = async (content: Buffer): Promise<DecodedHeif> => {
    const images = await decode.all({buffer: content});
    try {
        const best = images.reduce((current, image) => {
            return image.width * image.height > current.width * current.height ? image : current;
        });
        return await best.decode();
    } finally {
        images.dispose();
    }
};

const heicToJpeg = async (content: Buffer): Promise<Buffer> => {
    try {
        return await encodeJpeg(await decodeLargest(content));
    } catch (error) {
        if (error instanceof Error && /JPG/.test(error.message)) throw error;
        throw conversionError(error);
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
    const jpeg = await heicToJpeg(content);
    return {content: jpeg, fileName: jpegFileName(fileName)};
};

export {jpegFileName, prepareCrmFile};
