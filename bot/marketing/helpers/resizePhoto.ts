import {MAX_PHOTO_SIZE_IN_BYTES} from "../../../config/filesConfig";
const sharp = require('sharp');


const resizePhoto = async (base64String: string) => {
    let decoded = Buffer.from(base64String, 'base64')
    while (decoded.length > MAX_PHOTO_SIZE_IN_BYTES) {
        const image = await sharp(decoded)
        await image
            .metadata()
            //@ts-ignore
            .then(function(metadata) {
                return image
                    .resize(Math.round(metadata.width / 2))
                    .toBuffer();
            })
        decoded = image
    }
    return decoded
}

export { resizePhoto }