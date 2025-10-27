import {Crm} from "../../../api/crm";

const updateAdvStructures = async (
    updateBy: {[key:string] : string | string[] | number | number[]},
    data: {[p:string]:string}[] | {[p:string]:string | {[p:string]:string} | {[p:string]:string}[]}
) => {

    const crm = new Crm(
        process.env.CRM_API_KEY!,
        process.env.CRM_PASSWORD!,
        process.env.CRM_USER!,
    )

    const payload = {
        entity_id: 212,
        update_by_field: updateBy,
        data: data
    }

    try {
        const res = await crm.updateData(payload)
        if (res) {
            //console.log(res)
            return {status: "success", message: "Данные успешно обновлены."}
        }
        //console.log(res)
        return {status: "error", message: "Ошибка при обновлении."}
    } catch (error) {
        console.log(error)
        if (error instanceof Error) {
            return {status: "error", message: error.message}
        } else {
            return {status: "error", message: "Произошла неизвестная ошибка."}
        }

    }

}

export default updateAdvStructures