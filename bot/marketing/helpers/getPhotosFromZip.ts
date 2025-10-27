const yauzl = require('yauzl-promise')
import {stream2buffer} from "./stream2buffer"

type File = {
    filename: string,
    content: Buffer<ArrayBufferLike>
}

const getFilesFromZip = async (archive: { [p: string]: string }): Promise<File[] | null> => {
    let res: File[] = []
    const regex = /\.(zip)$/i

    if (!archive["content"]) return null

    if (!regex.test(archive["filename"]) && archive["content"]) {
        let buffer = Buffer.from(archive["content"], 'base64')
        res.push({filename: archive["filename"], content: buffer})
        return res
    }

    let buffer = Buffer.from(archive["content"], 'base64')

    const zip = await yauzl.fromBuffer(buffer);

    try {
        for await (const entry of zip) {
            const readStream = await entry.openReadStream();
            const buffer = await stream2buffer(readStream)
            res.push({filename: entry.filename, content: buffer})
        }
    } finally {
        await zip.close();
    }
    return res
}

export {getFilesFromZip}