import {SendDataParams} from "../../../types/crm/SendDataParams";

export default async function addDataToEntity(params: SendDataParams): Promise<number> {
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
        return body.data.id
    }

    if (body.status == "error") {
        throw new Error(body.error_message)
    }
    throw new Error("Ошибка сервера")

}