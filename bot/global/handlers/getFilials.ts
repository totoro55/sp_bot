import {createCrm} from "../../../api/crm";

export default async function getFilials(): Promise<{
    [key:string]: any
}[]> {
    const crm = createCrm()

    try {
        return await crm.getGlobalListChoices(49)
    } catch (e) {
        throw new Error(JSON.stringify(e))
    }
}