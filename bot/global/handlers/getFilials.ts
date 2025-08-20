import {Crm} from "../../../api/crm";

export default async function getFilials(): Promise<{
    [key:string]: any
}[]> {
    const crm = new Crm(
        process.env.CRM_API_KEY!,
        process.env.CRM_PASSWORD!,
        process.env.CRM_USER!,
    )

    try {
        return await crm.getGlobalListChoices(49)
    } catch (e) {
        throw new Error(JSON.stringify(e))
    }
}