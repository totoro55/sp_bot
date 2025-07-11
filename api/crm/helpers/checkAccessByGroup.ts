import {RESTRICTED_CRM_ACCESS_GROUPS} from "../../../config/crmConfig";

export default function checkAccessByGroup (accessGroup: string): boolean {
    return !RESTRICTED_CRM_ACCESS_GROUPS.includes(accessGroup)
}