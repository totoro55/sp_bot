import {DownloadAttachmentParams} from "../../../types/crm/DownloadAttachmentParams";
import {crmPostSuccess} from "../request";

export default async function getAttachment(params: DownloadAttachmentParams): Promise<{[p:string]:string}> {
    return crmPostSuccess(params);
}
