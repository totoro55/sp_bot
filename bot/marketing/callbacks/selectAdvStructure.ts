import {MyContext} from "../../../types/global/myContext";
import {backKeyboard} from "../../global/keyboards/back";
import getAdvertisingStructuresById from "../handlers/getAdvertisingStructureById";
import getReport from "../handlers/getReport";
import {InputFile, Keyboard} from "grammy";
import getAdvStructurePhotoById from "../handlers/getAdvStructurePhotoById";

const selectAdvStructure = async (ctx:MyContext) => {
    await ctx.answerCallbackQuery()
    await ctx.editMessageText("Подождите, информация загружается...", {reply_markup: undefined})
    const match = ctx.callbackQuery?.data?.match(/adv_structure_(\d+)/);
    const id = match ? match[1] : null;
    if (!id) {
        await ctx.reply("Рекламная конструкция не найдена.", {reply_markup: backKeyboard})
        return
    }

    const advStructure = await getAdvertisingStructuresById(id)
    const reportData = await getReport(id, ctx.session.marketing_report_period?.id || "")
    if (!advStructure || advStructure.length === 0) {
        await ctx.reply("Рекламная конструкция не найдена.", {reply_markup: backKeyboard})
        ctx.session.marketing_report = null
        return
    }

    const report = reportData.length>0 ? reportData[0] : null

    if (report && report["3727"] == "Проверен") {
        await ctx.reply(`Рекламная конструкция ${advStructure[0]["3710"]}\nПоследнее состояние: ${advStructure[0]["3715"]}\nПоследний комментарий: ${advStructure[0]["3716"]} 
            ${report && `\n\nПо рекламной конструкции уже создан отчет за указанный период:\n${report["3723"]}\nСтатус отчета:\n${report["3727"]}\n\nПо данной рекламной конструкции отчет за период ${ctx.session.marketing_report_period?.name} уже заполнен и проверен. Выберите другую РК или укажите другой период.`}`
            , {reply_markup: new Keyboard()
                    .text("Выбрать рекламную конструкцию").row()
                    .text("Выбрать другой период").row()
                    .text("Назад в меню").row()
            })
        ctx.session.marketing_report = null
        return
    }

    const photo = await getAdvStructurePhotoById(Number(id))
    if(!photo["content"]){
        await ctx.reply(`Рекламная конструкция ${advStructure[0]["3710"]}\nПоследнее состояние: ${advStructure[0]["3715"]}\nПоследний комментарий: ${advStructure[0]["3716"]} 
            ${report ? `\n\nПо рекламной конструкции уже создан отчет за указанный период:\n${report["3723"]}\nСтатус отчета:\n${report["3727"]}\n\nВы можете предоставить отчет заново, предыдущие внесенные данные будут очищены.` : ""}`
            , {reply_markup: new Keyboard()
                    .text(report ? "Редактировать отчет" : "Заполнить отчет").row()
                    .text("Выбрать рекламную конструкцию").row()
                    .text("Выбрать другой период").row()
                    .text("Назад в меню").row()
            })
        ctx.session.marketing_report = {advStructureId: advStructure[0]["id"], reportId: report ? report[0]["id"] : null, reportData: {status: "", comment: "", photos: []}}
        return
    }
    const decoded = Buffer.from(photo["content"], 'base64')
    await ctx.replyWithPhoto(
        new InputFile(decoded), {
            caption:`Рекламная конструкция ${advStructure[0]["3710"]}\nПоследнее состояние: ${advStructure[0]["3715"]}\nПоследний комментарий: ${advStructure[0]["3716"]}
            ${report ? `\n\nПо рекламной конструкции уже создан отчет за указанный период:\n${report["3723"]}\nСтатус отчета:\n${report["3727"]}\n\nВы можете предоставить отчет заново, предыдущие внесенные данные будут очищены.`: ""}`,
            reply_markup: new Keyboard()
                .text(report ? "Редактировать отчет" : "Заполнить отчет").row()
                .text("Выбрать рекламную конструкцию").row()
                .text("Выбрать другой период").row()
                .text("Назад в меню").row()
        })
    ctx.session.marketing_report = {advStructureId: advStructure[0]["id"], reportId: report ? report["id"] : null, reportData: {status: "", comment: "", photos: []}}
    return
}

export default selectAdvStructure