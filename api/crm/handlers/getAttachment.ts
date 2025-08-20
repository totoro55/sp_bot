import {DownloadAttachmentParams} from "../../../types/crm/DownloadAttachmentParams";

export default async function getAttachment(params: DownloadAttachmentParams): Promise<{[p:string]:string}> {
    const res = await fetch("http://southproject.partner.ru/api/rest.php", {
        method: "POST",
        body: JSON.stringify(params),
        keepalive:false
    })

    const body = await res.json()
    if (res.status !== 200) {
        throw new Error("Ошибка сервера")
    }

    if (body.status == "success") {
        return body.data
    }

    if (body.status == "error") {
        throw new Error(body.error_message)
    }
    throw new Error("Ошибка сервера")

}