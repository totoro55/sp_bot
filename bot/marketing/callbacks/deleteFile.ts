import {MyContext} from "../../../types/global/myContext";

const deleteFile = async (ctx: MyContext) => {
    await ctx.answerCallbackQuery();
    const match = ctx.callbackQuery?.data?.match(/delete_file_(\d+)/);
    const id = match ? match[1] : null;
    if (!id) {
        await ctx.reply("Файл не найден.");
        return;
    }

    const currentFiles = ctx.session.marketing_report_curren_files;
    const removedCurrent = currentFiles.some((file) => file.fileId === id);
    if (removedCurrent) {
        ctx.session.marketing_report_curren_files = currentFiles.filter((file) => file.fileId !== id);
    }

    const report = ctx.session.marketing_report;
    const newFile = report?.newFiles?.find((file) => file.fileId === id);
    if (report && newFile) {
        ctx.session.marketing_report = {
            ...report,
            newFiles: report.newFiles?.filter((file) => file.fileId !== id),
        };
    }

    if (!removedCurrent && !newFile) {
        await ctx.reply("Файл не найден.");
        return;
    }

    try {
        await ctx.deleteMessage();
    } catch (error) {
        console.log(error);
        await ctx.reply("Файл убран из отчета.");
    }
};

export {deleteFile};
