import {createCrm} from "../../../api/crm";
import {parseAttachmentField} from "./attachmentNames";

type CrmAttachment = {name: string; content?: string};

type ReportMeta = {
    userId: string;
    status: string;
    comment: string;
    includeStatus: boolean;
};

const statusChoiceId = (status: string): number => status == "Все ок" ? 4316 : 4317;

const insertReport = async (
    advStructureId: string,
    periodId: string,
    meta: ReportMeta,
    attachments: CrmAttachment[],
): Promise<string> => {
    const crm = createCrm();
    const id = await crm.insertData({
        entity_id: 213,
        items: {
            parent_item_id: advStructureId,
            field_3835: periodId,
            created_by: meta.userId,
            field_3724: statusChoiceId(meta.status),
            field_3725: meta.comment,
            field_3726: attachments,
            field_3727: 1665,
            field_4134: 1,
        },
    });
    return String(id);
};

const updateReportMeta = async (reportId: string, meta: ReportMeta): Promise<void> => {
    const crm = createCrm();
    const data: {[key: string]: string | number} = {
        created_by: meta.userId,
        field_3727: 1798,
        field_4134: 1,
    };
    if (meta.includeStatus) {
        data.field_3724 = statusChoiceId(meta.status);
        data.field_3725 = meta.comment;
    }
    await crm.updateData({
        entity_id: 213,
        data,
        update_by_field: {id: reportId},
    });
};

const readReportAttachmentNames = async (reportId: string): Promise<string[]> => {
    const crm = createCrm();
    const rows = await crm.getData({
        entity_id: 213,
        select_fields: "3726",
        limit: 1,
        filters: {id: reportId},
    });
    const row = rows[0] as {[key: string]: unknown} | undefined;
    return parseAttachmentField(row?.["3726"]);
};

const updateReportAttachments = async (reportId: string, attachments: CrmAttachment[]): Promise<void> => {
    const crm = createCrm();
    await crm.updateData({
        entity_id: 213,
        data: {field_3726: attachments},
        update_by_field: {id: reportId},
    });
};

export {insertReport, readReportAttachmentNames, updateReportAttachments, updateReportMeta};
export type {CrmAttachment, ReportMeta};
