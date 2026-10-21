import {createCrm} from "../../../api/crm";
import {crmQuery} from "../../../api/crm/result";

export default async function getFilials(): Promise<{[key: string]: any}[]> {
    const crm = createCrm();
    return crmQuery(() => crm.getGlobalListChoices(49));
}
