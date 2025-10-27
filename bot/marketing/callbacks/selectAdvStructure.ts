import {MyContext} from "../../../types/global/myContext";
import {backKeyboard} from "../../global/keyboards/back";
import getAdvertisingStructuresById from "../handlers/getAdvertisingStructureById";
import getReport from "../handlers/getReport";
import {InputFile, Keyboard} from "grammy";
import getAdvStructurePhotoById from "../handlers/getAdvStructurePhotoById";
import {resizePhoto} from "../helpers/resizePhoto";


const selectAdvStructure = async (ctx: MyContext) => {
    await ctx.answerCallbackQuery()
    await ctx.editMessageText("Подождите, информация загружается...", {reply_markup: undefined})
    const match = ctx.callbackQuery?.data?.match(/adv_structure_(\d+)/);
    const id = match ? match[1] : null;
    if (!id) {
        await ctx.reply("Рекламная конструкция не найдена или произошла ошибка при получении информации о рк, обратитесь к ответственным - Admins.Southproject@dns-shop.ru", {reply_markup: backKeyboard})
        return
    }

    const advStructure = await getAdvertisingStructuresById(id)
    const reportData = await getReport(id, ctx.session.marketing_report_period?.id || "")
    if (!advStructure || advStructure.length === 0) {
        await ctx.reply("Рекламная конструкция не найдена или произошла ошибка при получении информации о рк, обратитесь к ответственным - Admins.Southproject@dns-shop.ru", {reply_markup: backKeyboard})
        ctx.session.marketing_report = null
        return
    }

    const report = reportData.length > 0 ? reportData[0] : null

    const advStructureDescription = advStructure[0]["3710"] == "Другое (наименование РК указано в карточке)"
        ? `Рекламная конструкция Другое:\n${advStructure[0]["3714"] && advStructure[0]["3714"]}`
        : `Рекламная конструкция ${advStructure[0]["3710"]}`

    if (report && report["3727"] == "Проверен") {
        await ctx.reply(`${advStructureDescription} 
            ${report && `\n\nПо рекламной конструкции уже создан отчет за указанный период:\n${report["3723"]}\nСтатус отчета:\n${report["3727"]}\n\nПо данной рекламной конструкции отчет за период ${ctx.session.marketing_report_period?.name} уже заполнен и проверен. Выберите другую РК или укажите другой период.`}`
            , {
                reply_markup: new Keyboard()
                    .text("Выбрать рекламную конструкцию").row()
                    .text("Выбрать другой период").row()
                    .text("Назад в меню").row()
            })
        ctx.session.marketing_report = null
        return
    }

    const photo = await getAdvStructurePhotoById(Number(id))
    const decoded = await resizePhoto(photo["content"]).then(res => {
        return res
    }).catch(e => {
        console.log(e)
        return null
    })

    const reportKeyboard = report
        ? new Keyboard()
            .text("Редактировать отчет").row()
            .text("Добавить фото/видео к имеющемуся отчету").row()
            .text("Выбрать рекламную конструкцию").row()
            .text("Выбрать другой период").row()
            .text("Назад в меню").row()
        : new Keyboard()
            .text("Заполнить отчет").row()
            .text("Выбрать рекламную конструкцию").row()
            .text("Выбрать другой период").row()
            .text("Назад в меню").row()

    if (!photo["content"] || !decoded) {
        await ctx.reply(`${advStructureDescription} 
            ${report ? `\n\nПо рекламной конструкции уже создан отчет за указанный период:\n${report["3723"]}\nСтатус отчета:\n${report["3727"]}\n\nВы можете отредактировать отчет или добавить фото/видео к уже имеющимся.` : ""}`
            , {
                reply_markup: reportKeyboard
            })
        ctx.session.marketing_report = {
            advStructureId: advStructure[0]["id"],
            advStructureType: advStructure[0]["3710"],
            reportId: report ? report[0]["id"] : null,
            reportData: {status: "", comment: "", photos: []}
        }
        return
    }

    try {
        await ctx.replyWithPhoto(
            new InputFile(decoded), {
                caption: `${advStructureDescription}  
            ${report ? `\n\nПо рекламной конструкции уже создан отчет за указанный период:\n${report["3723"]}\nСтатус отчета:\n${report["3727"]}\n\nВы можете отредактировать отчет или добавить фото/видео к уже имеющимся` : ""}`,
                reply_markup: reportKeyboard
            })
    } catch (e) {
        await ctx.reply(`Не удалось загрузть фото конструкции.\n\n${advStructureDescription} 
        ${report ? `\n\nПо рекламной конструкции уже создан отчет за указанный период:\n${report["3723"]}\nСтатус отчета:\n${report["3727"]}\n\nВы можете отредактировать отчет или добавить фото/видео к уже имеющимся.` : ""}`
            , {
                reply_markup: reportKeyboard
            })
    }

    ctx.session.marketing_report = {
        advStructureId: advStructure[0]["id"],
        advStructureType: advStructure[0]["3710"],
        reportId: report ? report["id"] : null,
        reportData: {status: "", comment: "", photos: []}
    }

    return
}

export default selectAdvStructure