import {MyContext} from "../../../types/global/myContext";
import {ADD_REPORT_FILES_PROMPT} from "../../../config/filesConfig";
import {showCurrentReportFiles} from "../helpers/showCurrentReportFiles";
import {reportPlace} from "../helpers/reportContext";
import {addFilesKeyboard} from "../keyboards/report";

const onReportConversationExit = async (id: string, ctx: MyContext): Promise<void> => {
    if (id !== "report" || !ctx.session.marketing_report) return;
    const place = reportPlace(ctx);
    if (place) await ctx.reply(place);
    await showCurrentReportFiles(ctx);
    await ctx.reply(ADD_REPORT_FILES_PROMPT, {
        reply_markup: addFilesKeyboard("Завершить добавление файлов"),
    });
};

export {onReportConversationExit};
