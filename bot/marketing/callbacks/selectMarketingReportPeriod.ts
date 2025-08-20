import {MyContext} from "../../../types/global/myContext";
import {backKeyboard} from "../../global/keyboards/back";
import getActiveReportPeriods from "../handlers/getActiveReportPeriods";
import {Keyboard} from "grammy";

const selectMarketingReportPeriod = async (ctx:MyContext) => {
    await ctx.answerCallbackQuery()
    const match = ctx.callbackQuery?.data?.match(/marketing_report_period_(\d+)/);
    const id = match ? match[1] : null;
    if (!id) {
        await ctx.reply("Период не найден.", {reply_markup: backKeyboard})
        return
    }

    const reportPeriods = await getActiveReportPeriods()
    if (!reportPeriods || reportPeriods.length === 0) {
        await ctx.reply("Нет активных отчетов. Попробуйте позже или обратитесь к ответственным.", {reply_markup: backKeyboard})
        return
    }
    const reportPeriod = reportPeriods.find(r=>r.id===id)
    if (!reportPeriod) {
        await ctx.reply("Период не найден или закрыт. Попробуйте позже или обратитесь к ответственным.", {reply_markup: backKeyboard})
        return
    }

    ctx.session.marketing_report_period = reportPeriod
    await ctx.reply(`Выбран период ${reportPeriod.name}:`, {
        reply_markup: new Keyboard()
            .text("Выбрать рекламную конструкцию").row()
            .text("Выбрать другой период").row()
            .text("Назад в меню").row()
    })
}

export default selectMarketingReportPeriod;