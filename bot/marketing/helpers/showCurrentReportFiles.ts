import {InlineKeyboard, InputFile} from "grammy";
import {MyContext} from "../../../types/global/myContext";
import getReportCurrentPhotosByReportId from "../handlers/getReportCurrentPhotosByReportId";
import {createFileId} from "./fileIds";
import {getFilesFromZip} from "./getPhotosFromZip";
import {readableError} from "../../global/helpers/readableError";

const showCurrentReportFiles = async (ctx: MyContext): Promise<void> => {
    const reportId = ctx.session.marketing_report?.reportId;
    if (!reportId) return;

    ctx.session.reportFilesSynced = false;
    try {
        await ctx.reply("Пожалуйста подождите, загружается список ранее добавленных файлов");
        const archive = await getReportCurrentPhotosByReportId(Number(reportId));
        const files = await getFilesFromZip(archive);

        if (!files) {
            ctx.session.marketing_report_curren_files = [];
            await ctx.reply("Не удалось загрузить файлы, которые уже есть в отчете.");
            return;
        }

        if (files.length === 0) {
            ctx.session.marketing_report_curren_files = [];
            ctx.session.reportFilesSynced = true;
            await ctx.reply("Файлы к указанному отчету отсутствуют.");
            return;
        }

        const loaded: {fileId: string; fileName: string}[] = [];
        for (const file of files) {
            const fileId = createFileId();
            const msg = await ctx.replyWithDocument(new InputFile(file.content, file.filename), {
                caption: file.filename,
                reply_markup: new InlineKeyboard().text("Удалить файл", `delete_file_${fileId}`),
            });
            if (!msg.document) {
                await ctx.reply("Не удалось показать все файлы отчета. Отправка будет остановлена, чтобы не удалить их.");
                return;
            }
            loaded.push({fileId, fileName: file.filename || "file"});
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
