import {InlineKeyboard} from "grammy";
import {MyContext} from "../../../types/global/myContext";
import getUser from "../../global/handlers/getUser";
import {TUser} from "../../../types/global/TUser";
import {TFilial} from "../../../types/global/TFilial";
import getActiveReportPeriods from "../handlers/getActiveReportPeriods";
import {backToMenuKeyboard, chooseFilialKeyboard} from "../keyboards/report";

const FILIAL_REQUIRED = "Не выбран филиал. Для заполнения отчета о рекламных конструкциях необходимо выбрать филиал.";

type FilialAccess = {user: TUser; filial: TFilial};

const requireFilial = async (ctx: MyContext): Promise<FilialAccess | null> => {
    const user = await getUser(ctx);
    if (!user) return null;

    const filial = ctx.session.selected_filial;
    if (!filial) {
        await ctx.reply(FILIAL_REQUIRED, {reply_markup: chooseFilialKeyboard});
        return null;
    }

    return {user, filial};
};

const askReportPeriod = async (ctx: MyContext, emptyMessage: string): Promise<void> => {
    const access = await requireFilial(ctx);
    if (!access) return;

    const reportPeriods = await getActiveReportPeriods();
    if (!reportPeriods || reportPeriods.length === 0) {
        await ctx.reply(emptyMessage, {reply_markup: backToMenuKeyboard});
        return;
    }

    const keyboard = new InlineKeyboard();
    reportPeriods.forEach((period) => keyboard.text(period.name, `marketing_report_period_${period.id}`).row());
    await ctx.reply("Выберите период отчета", {reply_markup: keyboard});
};

export {askReportPeriod, requireFilial};
