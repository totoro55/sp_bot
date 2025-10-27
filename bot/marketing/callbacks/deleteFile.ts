import {MyContext} from "../../../types/global/myContext";
import {backKeyboard} from "../../global/keyboards/back";

const deleteFile = async (ctx:MyContext) => {
    await ctx.answerCallbackQuery()
    await ctx.editMessageCaption({caption:"Удаление...", reply_markup: undefined})
    const match = ctx.callbackQuery?.data?.match(/delete_file_(\d+)/);
    const id = match ? match[1] : null;
    if (!id) {
        await ctx.reply("Рекламная конструкция не найдена.", {reply_markup: backKeyboard})
        return
    }
    const files= [...ctx.session.marketing_report_curren_files].filter(f=> f.fileId !== id )
    ctx.session.marketing_report_curren_files = [...files]
    await ctx.deleteMessage()
}

export {deleteFile}