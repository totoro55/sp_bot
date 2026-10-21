import {MyContext} from "../../../types/global/myContext";
import {TUser} from "../../../types/global/TUser";
import {reportPlace} from "../helpers/reportContext";
import {showCurrentReportFiles} from "../helpers/showCurrentReportFiles";
import {addFilesKeyboard} from "../keyboards/report";
import {uniqueFileName} from "./fileName";
import {hideReplyKeyboard, textWithPlace} from "./progress";
import {enqueueUpload} from "./queue";

type FinishMode = "form" | "files";

const startReportUpload = async (ctx: MyContext, user: TUser, mode: FinishMode): Promise<void> => {
    const report = ctx.session.marketing_report;
    const chatId = ctx.chatId;
    if (!report || !chatId) return;

    const retryLabel = mode === "files" ? "Завершить добавление файлов к отчету" : "Завершить добавление файлов";
    if (report.reportId && !ctx.session.reportFilesSynced) {
        await showCurrentReportFiles(ctx);
    }
    if (report.reportId && !ctx.session.reportFilesSynced) {
        await ctx.reply("Не удалось получить файлы, которые уже есть в отчете. Отправка остановлена, чтобы не удалить их. Попробуйте еще раз.", {
            reply_markup: addFilesKeyboard(retryLabel),
        });
        return;
    }

    const keptNames = ctx.session.marketing_report_curren_files.map((file) => file.fileName);
    const usedNames = new Set(keptNames);
    const newFiles = (report.newFiles ?? []).map((file) => ({
        telegramFileId: file.telegramFileId,
        fileName: uniqueFileName(file.fileName, usedNames),
    }));
    const uploadMode = mode === "files" ? "files" : report.reportId ? "update" : "create";
    const place = reportPlace(ctx);
    const successLead = uploadMode === "create"
        ? "Отчет успешно добавлен."
        : uploadMode === "files"
            ? "Файлы успешно добавлены к отчету."
            : "Отчет успешно обновлен.";

    const progress = await ctx.reply(textWithPlace(place, "Отчет принят. Подготавливаю отправку."));
    ctx.session.outboundBusy = "report";
    let hiddenMessageId = 0;
    try {
        hiddenMessageId = await hideReplyKeyboard(ctx.api, chatId);
    } catch (error) {
        console.log(error);
    }

    enqueueUpload({
        kind: "report",
        job: {
            chatId,
            progressMessageId: progress.message_id,
            hiddenMessageId,
            place,
            userId: user.id,
            mode: uploadMode,
            reportId: report.reportId,
            advStructureId: report.advStructureId,
            periodId: ctx.session.marketing_report_period?.id || "",
            status: report.reportData.status,
            comment: report.reportData.comment,
            keptNames,
            newFiles,
            retryLabel,
            successLead,
        },
    });
};

export {startReportUpload};
