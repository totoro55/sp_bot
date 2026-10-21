import sharp from "sharp";
import {MAX_PHOTO_SIZE_IN_BYTES} from "../../../config/filesConfig";

const resizePhoto = async (base64String: string): Promise<Buffer> => {
    let decoded = Buffer.from(base64String, "base64");
    let attempts = 0;

    while (decoded.length > MAX_PHOTO_SIZE_IN_BYTES && attempts < 8) {
        attempts += 1;
        const image = sharp(decoded);
        const metadata = await image.metadata();
        if (!metadata.width || metadata.width < 2) {
            break;
        }

        const resized = await image.resize(Math.round(metadata.width / 2)).toBuffer();
        if (resized.length >= decoded.length) {
            break;
        }
        decoded = resized;
    }

    return decoded;
};

export {resizePhoto};
