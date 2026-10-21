import {InputFile} from "grammy";
import {MyContext} from "../../../types/global/myContext";
import {backKeyboard} from "../../global/keyboards/back";
import getAdvStructurePhotoById from "../handlers/getAdvStructurePhotoById";
import getAdvertisingStructuresById from "../handlers/getAdvertisingStructureById";
import getReport from "../handlers/getReport";
import {resizePhoto} from "../helpers/resizePhoto";
import {clearMarketingReport} from "../helpers/reportSession";
import {changeStructureOrPeriodKeyboard, structureReportKeyboard} from "../keyboards/report";

type ReportRow = {[key: string]: string};

const supportHint = "обратитесь к ответственным сотрудникам - Admins.Southproject@dns-shop.ru";

const structureTitle = (advStructure: {[key: string]: string}): string => {
    if (advStructure["3710"] == "Другое (наименование РК указано в карточке)") {
        return `Рекламная конструкция Другое:\n${advStructure["3714"] || ""}`;
    }
    return `Рекламная конструкция ${advStructure["3710"]}`;
};

const existingReportText = (report: ReportRow): string => {
    return `\n\nПо рекламной конструкции уже создан отчет за указанный период:
${report["3723"]}
Статус отчета:
${report["3727"]}
Комментарий сотрудника отдела рекламы:
${report["4247"] || ""}`;
};

const selectAdvStructure = async (ctx: MyContext) => {
    await ctx.answerCallbackQuery();
    await ctx.editMessageText("Подождите, информация загружается...", {reply_markup: undefined});

    const match = ctx.callbackQuery?.data?.match(/adv_structure_(\d+)/);
    const id = match ? match[1] : null;
    if (!id) {
        await ctx.reply(`Рекламная конструкция не найдена или произошла ошибка при получении информации о РК, ${supportHint}`, {reply_markup: backKeyboard});
        clearMarketingReport(ctx);
        return;
    }

    const advStructures = await getAdvertisingStructuresById(id);
    const reportRows = await getReport(id, ctx.session.marketing_report_period?.id || "");
    if (!advStructures || advStructures.length === 0) {
        await ctx.reply(`Рекламная конструкция не найдена либо произошла ошибка при получении информации о РК. Для уточнения ${supportHint}`, {reply_markup: backKeyboard});
        clearMarketingReport(ctx);
        return;
    }

    const advStructure = advStructures[0];
    const report = reportRows.length > 0 ? reportRows[0] as ReportRow : null;
    const title = structureTitle(advStructure);
    const periodName = ctx.session.marketing_report_period?.name;

    if (report && report["3727"] == "Проверен") {
        await ctx.reply(
            `${title}${existingReportText(report)}\n\nПо данной рекламной конструкции отчет за период ${periodName} уже заполнен и проверен. Выберите другую РК или укажите другой период.`,
            {reply_markup: changeStructureOrPeriodKeyboard},
        );
        clearMarketingReport(ctx);
        return;
    }

    const keyboard = structureReportKeyboard(Boolean(report));
    const caption = `${title}${report ? `${existingReportText(report)}\n\nВы можете отредактировать отчет или добавить фото/видео к уже имеющимся.` : ""}`;
    clearMarketingReport(ctx);
    ctx.session.marketing_report = {
        advStructureId: advStructure["id"],
        advStructureType: advStructure["3710"],
        reportId: report ? report["id"] : null,
        reportData: {status: "", comment: "", photos: []},
    };

    const photo = await getAdvStructurePhotoById(Number(id));
    if (!photo["content"]) {
        await ctx.reply(caption, {reply_markup: keyboard});
        return;
    }

    try {
        const decoded = await resizePhoto(photo["content"]);
        await ctx.replyWithPhoto(new InputFile(decoded), {
            caption,
            reply_markup: keyboard,
        });
    } catch (error) {
        console.log(error);
        await ctx.reply(`Не удалось загрузить фото конструкции.\n\n${caption}`, {reply_markup: keyboard});
    }
};

export default selectAdvStructure;
