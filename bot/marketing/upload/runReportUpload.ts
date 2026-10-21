import {readableError} from "../../global/helpers/readableError";
import {MyApi} from "../../../types/global/myContext";
import {createFileId} from "../helpers/fileIds";
import {addFilesKeyboard, reportActionsKeyboard} from "../keyboards/report";
import {maxUploadBytes} from "../../../config/filesConfig";
import {downloadTelegramFile} from "./downloadTelegramFile";
import {prepareCrmFile} from "./heicToJpeg";
import {insertReport, readReportAttachmentNames, updateReportAttachments, updateReportMeta} from "./crmReport";
import {deleteServiceMessage, editProgress, fileProgressText, sendKeyboard, textWithPlace} from "./progress";
import {patchBusySession} from "./sessionPatch";

type PendingFile = {telegramFileId: string; fileName: string; heic: boolean; video: boolean};

type ReportUploadJob = {
    chatId: number;
    progressMessageId: number;
    hiddenMessageId: number;
    place: string;
    userId: string;
    mode: "create" | "update" | "files";
    reportId: string | null;
    advStructureId: string;
    periodId: string;
    status: string;
    comment: string;
    keptNames: string[];
    newFiles: PendingFile[];
    retryLabel: string;
    successLead: string;
};

const namesOnly = (names: string[]) => names.map((name) => ({name}));

const runReportUpload = async (api: MyApi, job: ReportUploadJob): Promise<void> => {
    let reportId = job.reportId;
    const kept = [...job.keptNames];
    const uploadedIds: string[] = [];
    const total = job.newFiles.length;
    let succeeded = false;
    let failureText = "Не удалось сохранить отчет. Можно отправить отчет еще раз.";

    const show = (text: string) => editProgress(api, job.chatId, job.progressMessageId, text);

    const adoptStoredNames = async (id: string, previousCount: number): Promise<void> => {
        const stored = await readReportAttachmentNames(id);
        if (stored.length < previousCount + 1) {
            throw new Error("CRM не подтвердила сохранение файла. Отправка остановлена, чтобы не удалить уже загруженные.");
        }
        kept.splice(0, kept.length, ...stored);
    };

    const loadPrepared = async (file: PendingFile, index: number) => {
        await show(fileProgressText(job.place, index, total, file.fileName));
        const content = await downloadTelegramFile(api, file.telegramFileId, maxUploadBytes(file.video));
        return prepareCrmFile(content, file.fileName, file.heic);
    };

    try {
        if (!reportId) {
            const first = job.newFiles[0];
            if (!first) throw new Error("В отчете нет файлов для отправки");
            const prepared = await loadPrepared(first, 1);
            reportId = await insertReport(job.advStructureId, job.periodId, {
                userId: job.userId,
                status: job.status,
                comment: job.comment,
                includeStatus: true,
            }, [{name: prepared.fileName, content: prepared.content.toString("base64")}]);
            await adoptStoredNames(reportId, kept.length);
            uploadedIds.push(first.telegramFileId);
        } else {
            await show(textWithPlace(job.place, "Отчет принят. Сохраняю данные."));
            await updateReportMeta(reportId, {
                userId: job.userId,
                status: job.status,
                comment: job.comment,
                includeStatus: job.mode === "update",
            });
            if (total === 0) {
                await updateReportAttachments(reportId, namesOnly(kept));
            }
        }

        const start = job.reportId ? 0 : 1;
        for (let index = start; index < job.newFiles.length; index += 1) {
            const file = job.newFiles[index];
            const prepared = await loadPrepared(file, index + 1);
            const previousCount = kept.length;
            await updateReportAttachments(reportId!, [
                ...namesOnly(kept),
                {name: prepared.fileName, content: prepared.content.toString("base64")},
            ]);
            await adoptStoredNames(reportId!, previousCount);
            uploadedIds.push(file.telegramFileId);
        }

        succeeded = true;
        await show(textWithPlace(
            job.place,
            `${job.successLead}\n\nВы можете заполнить отчет по другой РК или вернуться в главное меню.`,
        ));
    } catch (error) {
        const failedFile = job.newFiles.find((file) => !uploadedIds.includes(file.telegramFileId));
        const reason = readableError(error);
        failureText = failedFile
            ? `Не удалось отправить файл «${failedFile.fileName}». ${reason}\n\nМожно отправить отчет еще раз.`
            : `Не удалось сохранить отчет. ${reason}\n\nМожно отправить отчет еще раз.`;
        await show(textWithPlace(job.place, failureText));
    } finally {
        try {
            if (succeeded) {
                await sendKeyboard(api, job.chatId, "Выберите следующее действие", reportActionsKeyboard);
            } else {
                await sendKeyboard(api, job.chatId, "Кнопки возвращены.", addFilesKeyboard(job.retryLabel));
            }
        } catch (error) {
            console.error(error);
        }
        await deleteServiceMessage(api, job.chatId, job.hiddenMessageId);
        await patchBusySession(job.chatId, (session) => {
            session.outboundBusy = null;
            if (!succeeded) {
                const report = session.marketing_report;
                if (!report) {
                    session.reportFilesSynced = false;
                    return;
                }
                if (reportId) report.reportId = reportId;
                const uploaded = new Set(uploadedIds);
                report.newFiles = (report.newFiles ?? []).filter((file) => !uploaded.has(file.telegramFileId));
                session.marketing_report_curren_files = kept.map((fileName) => ({
                    fileId: createFileId(),
                    fileName,
                }));
                session.reportFilesSynced = true;
                return;
            }
            session.marketing_report = null;
            session.marketing_report_curren_files = [];
            session.marketing_report_files = [];
            session.reportFilesSynced = false;
        });
    }
};

export {runReportUpload};
export type {ReportUploadJob};
