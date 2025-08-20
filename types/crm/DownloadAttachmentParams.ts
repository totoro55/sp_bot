import {CrmApiParams} from "./CrmApiParams";

export interface DownloadAttachmentParams extends CrmApiParams{
    action: "download_attachment",
    entity_id: number,
    item_id: number,
    field_id: number
}