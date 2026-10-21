import {InlineKeyboard, InputFile} from "grammy";
import {MyContext} from "../../../types/global/myContext";
import getReportCurrentPhotosByReportId from "../handlers/getReportCurrentPhotosByReportId";
import {createFileId} from "./fileIds";
import {getFilesFromZip} from "./getPhotosFromZip";
import {readableError} from "../../global/helpers/readableError";

const showCurrentReportFiles = async (ctx: MyContext): Promise<void> => {
    const reportId = ctx.session.marketing_report?.reportId;
    if (!reportId) return;

    try {
        await ctx.reply("Пожалуйста подождите, загружается список ранее добавленных файлов");
        const archive = await getReportCurrentPhotosByReportId(Number(reportId));
        const files = await getFilesFromZip(archive);

        if (!files || files.length === 0) {
            ctx.session.marketing_report_curren_files = [];
            await ctx.reply("Не удалось загрузить файлы или файлы к указанному отчету отсутствуют.");
            return;
        }

        ctx.session.marketing_report_curren_files = [];
        for (const file of files) {
            const fileId = createFileId();
            const msg = await ctx.replyWithDocument(new InputFile(file.content, file.filename), {
                caption: file.filename,
                reply_markup: new InlineKeyboard().text("Удалить файл", `delete_file_${fileId}`),
            });
            if (!msg.document) continue;

            const stored = await ctx.api.getFile(msg.document.file_id);
            ctx.session.marketing_report_curren_files = [
                ...ctx.session.marketing_report_curren_files,
                {fileId, fileUrl: stored.getUrl()},
            ];
        }

        await ctx.reply("Загружены файлы. Вы можете удалить файл нажав на соответствующую кнопку расположенную под ним.");
    } catch (error) {
        await ctx.reply(`Не удалось загрузить список имеющихся файлов. ${readableError(error)}`);
    }
};

export {showCurrentReportFiles};
