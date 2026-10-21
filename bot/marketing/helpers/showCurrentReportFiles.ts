import {InlineKeyboard, InputFile} from "grammy";
import {MyContext} from "../../../types/global/myContext";
import getReportCurrentPhotosByReportId from "../handlers/getReportCurrentPhotosByReportId";
import {createFileId} from "./fileIds";
import {getFilesFromZip} from "./getPhotosFromZip";
import {readableError} from "../../global/helpers/readableError";
import {attachmentDisplayName, pairStorageNames} from "../upload/attachmentNames";
import {readReportAttachmentNames} from "../upload/crmReport";

const showCurrentReportFiles = async (ctx: MyContext): Promise<void> => {
    const reportId = ctx.session.marketing_report?.reportId;
    if (!reportId) return;

    ctx.session.reportFilesSynced = false;
    try {
        await ctx.reply("Пожалуйста подождите, загружается список ранее добавленных файлов");
        const files = await (async () => {
            const archive = await getReportCurrentPhotosByReportId(Number(reportId));
            return getFilesFromZip(archive);
        })();

        if (!files) {
            ctx.session.marketing_report_curren_files = [];
            await ctx.reply("Не удалось загрузить файлы, которые уже есть в отчете.");
            return;
        }

        const storedNames = await readReportAttachmentNames(reportId);
        if (files.length === 0) {
            if (storedNames.length > 0) {
                await ctx.reply("Не удалось показать файлы отчета. Отправка остановлена, чтобы не удалить их.");
                return;
            }
            ctx.session.marketing_report_curren_files = [];
            ctx.session.reportFilesSynced = true;
            await ctx.reply("Файлы к указанному отчету отсутствуют.");
            return;
        }

        const storageNames = pairStorageNames(files.map((file) => file.filename), storedNames);
        if (!storageNames) {
            await ctx.reply("Не удалось сопоставить файлы отчета. Отправка остановлена, чтобы не удалить их.");
            return;
        }

        const loaded: {fileId: string; fileName: string}[] = [];
        for (const [index, file] of files.entries()) {
            const fileId = createFileId();
            const shownName = attachmentDisplayName(storageNames[index] || file.filename || "file");
            const content = file.content;
            file.content = Buffer.alloc(0);
            const msg = await ctx.replyWithDocument(new InputFile(content, shownName), {
                caption: shownName,
                reply_markup: new InlineKeyboard().text("Удалить файл", `delete_file_${fileId}`),
            });
            if (!msg.document) {
                await ctx.reply("Не удалось показать все файлы отчета. Отправка будет остановлена, чтобы не удалить их.");
                return;
            }
            loaded.push({fileId, fileName: storageNames[index] || file.filename || "file"});
        }

        ctx.session.marketing_report_curren_files = loaded;
        ctx.session.reportFilesSynced = true;
        await ctx.reply("Загружены файлы. Вы можете удалить файл нажав на соответствующую кнопку расположенную под ним.");
    } catch (error) {
        ctx.session.reportFilesSynced = false;
        await ctx.reply(`Не удалось загрузить список имеющихся файлов. ${readableError(error)}`);
    }
};

export {showCurrentReportFiles};
