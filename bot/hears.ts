import {Bot, InlineKeyboard, InputFile} from "grammy";
import {readableError} from "./global/helpers/readableError";
import {MyApi, MyContext} from "../types/global/myContext";
import {MarketingReport} from "../types/marketing/MarketingReport";
import getUser from "./global/handlers/getUser";
import {startKeyboard} from "./global/keyboards/start";
import {findFilialByCode} from "./global/middlewares";
import {findFilialKeyboard} from "./global/keyboards/findFilial";
import getAdvertisingStructuresByFilial from "./marketing/handlers/getAdvertisingStructuresByFilial";
import updateReport from "./marketing/handlers/updateReport";
import addReport from "./marketing/handlers/addReport";
import addFilesToReport from "./marketing/handlers/addFilesToReport";
import {ADD_REPORT_FILES_PROMPT, NEED_REPORT_FILE_PROMPT} from "../config/filesConfig";
import {showCurrentReportFiles} from "./marketing/helpers/showCurrentReportFiles";
import {reportPhotoUrls} from "./marketing/helpers/reportPhotoUrls";
import {askReportPeriod, requireFilial} from "./marketing/helpers/askReportPeriod";
import {clearMarketingReport, resetMarketingSession} from "./marketing/helpers/reportSession";
import {reportPlace, savedReportText} from "./marketing/helpers/reportContext";
import {replyInlineChoice} from "./marketing/helpers/replyInlineChoice";
import {structureListButtons} from "./marketing/helpers/structureLabel";
import {
    addFilesKeyboard,
    backToMenuKeyboard,
    changeStructureOrPeriodKeyboard,
    chooseFilialKeyboard,
    choosePeriodKeyboard,
    continueReportKeyboard,
    filialActionsKeyboard,
    marketingMenuKeyboard,
    reportActionsKeyboard,
} from "./marketing/keyboards/report";

const NO_PERIODS_FOR_FILL = "На текущий момент не происходит сбор отчетов. Если уверены, что вам необходимо отправить отчет о состоянии РК - обратитесь к ответственным сотрудникам Отдела Рекламы.";
const NO_PERIODS_FOR_CHANGE = "В настоящее время сбор отчётов не производится. В случае необходимости отправки отчёта о состоянии РК просим обратиться к ответственным сотрудникам отдела рекламы.";

const reportWithPhotos = (ctx: MyContext): MarketingReport | null => {
    const report = ctx.session.marketing_report;
    if (!report) return null;
    return {
        ...report,
        reportData: {
            ...report.reportData,
            photos: reportPhotoUrls(ctx),
        },
    };
};

const replyReportSaved = async (ctx: MyContext, lead: string) => {
    const message = savedReportText(ctx, lead);
    clearMarketingReport(ctx);
    await ctx.reply(message, {reply_markup: reportActionsKeyboard});
};

const replyReportFailed = async (ctx: MyContext, message: string) => {
    clearMarketingReport(ctx);
    await ctx.reply(message, {reply_markup: backToMenuKeyboard});
};

const addHears = (bot: Bot<MyContext, MyApi>) => {
    bot.hears("Обратная связь", async (ctx) => {
        const user = await getUser(ctx);
        if (!user) return;
        await ctx.conversation.enter("feedback", user);
    });

    bot.hears("Назад в меню", async (ctx) => {
        resetMarketingSession(ctx);
        await ctx.reply("Выберите интересующий вас пункт меню", {reply_markup: startKeyboard});
    });

    bot.hears("Отдел рекламы", async (ctx) => {
        await ctx.reply("Выберите необходимую операцию", {reply_markup: marketingMenuKeyboard});
    });

    bot.hears("Видеоинструкция", async (ctx) => {
        await ctx.reply("Подождите, загружается файл с инструкцией", {reply_markup: backToMenuKeyboard});
        try {
            await ctx.replyWithDocument(new InputFile("files/marketing_video_instruction.mp4", "Инструкция.mp4"), {
                reply_markup: marketingMenuKeyboard,
            });
        } catch (err) {
            await ctx.reply(`Не удалось загрузить видео. ${readableError(err)}`, {
                reply_markup: marketingMenuKeyboard,
            });
        }
    });

    bot.hears("Отчеты о рекламных конструкциях", async (ctx) => {
        const access = await requireFilial(ctx);
        if (!access) return;
        await ctx.reply(
            `Выбран филиал ${access.filial.name}. Вы можете выбрать другой филиал или перейти к заполнению отчета о рекламных конструкциях.`,
            {reply_markup: filialActionsKeyboard},
        );
    });

    bot.hears("Выбор филиала", async (ctx) => {
        const user = await getUser(ctx);
        if (!user) return;
        const filial = ctx.session.selected_filial;
        if (!filial) {
            return findFilialByCode.replyWithMarkdown(ctx, "Отправьте код филиала, без пробелов:");
        }
        await ctx.reply(`Выбран филиал ${filial.name}. Вы можете выбрать другой филиал осуществив поиск:`, {
            reply_markup: findFilialKeyboard,
        });
    });

    bot.hears("По коду филиала", async (ctx) => {
        const user = await getUser(ctx);
        if (!user) return;
        return findFilialByCode.replyWithMarkdown(ctx, "Отправьте код филиала, без пробелов:");
    });

    bot.hears("Заполнение отчета о РК", async (ctx) => {
        await askReportPeriod(ctx, NO_PERIODS_FOR_FILL);
    });

    bot.hears("Выбрать другой период", async (ctx) => {
        await askReportPeriod(ctx, NO_PERIODS_FOR_CHANGE);
    });

    bot.hears("Выбрать рекламную конструкцию", async (ctx) => {
        const access = await requireFilial(ctx);
        if (!access) return;

        if (!ctx.session.marketing_report_period) {
            await ctx.reply("Не выбран период отчета", {reply_markup: choosePeriodKeyboard});
            return;
        }

        const advStructures = await getAdvertisingStructuresByFilial(access.filial);
        if (!advStructures || advStructures.length === 0) {
            await ctx.reply("Рекламные конструкции по указанному филиалу не найдены. Обратитесь к ответственным сотрудникам отдела рекламы.", {
                reply_markup: chooseFilialKeyboard,
            });
            return;
        }

        const keyboard = new InlineKeyboard();
        structureListButtons(advStructures).forEach((item) => {
            keyboard.text(item.text, `adv_structure_${item.id}`).row();
        });
        await replyInlineChoice(ctx, "Выберите рекламную конструкцию:", keyboard);
    });

    bot.hears(["Редактировать отчет", "Заполнить отчет"], async (ctx) => {
        const user = await getUser(ctx);
        if (!user) return;

        if (!ctx.session.marketing_report) {
            await ctx.reply("Не указаны данные необходимые для заполнения отчета", {reply_markup: continueReportKeyboard});
            return;
        }
        await ctx.conversation.enter("report", ctx.session.marketing_report);
    });

    bot.hears("Завершить добавление файлов", async (ctx) => {
        const user = await getUser(ctx);
        if (!user) return;

        const report = reportWithPhotos(ctx);
        const period = ctx.session.marketing_report_period;
        if (!report || !period) {
            await ctx.reply("Не выбран отчет или период. Начните заполнение заново.", {
                reply_markup: filialActionsKeyboard,
            });
            return;
        }

        if (report.reportData.photos.length === 0) {
            await ctx.reply(NEED_REPORT_FILE_PROMPT, {
                reply_markup: addFilesKeyboard("Завершить добавление файлов"),
            });
            return;
        }

        const res = report.reportId
            ? await updateReport(report, period.id, user)
            : await addReport(report, period.id, user);

        if (res.status == "success") {
            await replyReportSaved(ctx, report.reportId ? "Отчет успешно обновлен." : "Отчет успешно добавлен.");
            return;
        }

        const message = report.reportId
            ? res.message
            : `Произошла ошибка: ${res.message}. Обратитесь к ответственным.`;
        await replyReportFailed(ctx, message);
    });

    bot.hears("Добавить фото/видео к отчету", async (ctx) => {
        const user = await getUser(ctx);
        if (!user) return;
        if (!ctx.session.marketing_report?.reportId) {
            await ctx.reply("Сначала выберите конструкцию, по которой уже есть отчет.", {
                reply_markup: changeStructureOrPeriodKeyboard,
            });
            return;
        }

        const place = reportPlace(ctx);
        if (place) await ctx.reply(place);
        await showCurrentReportFiles(ctx);
        await ctx.reply(ADD_REPORT_FILES_PROMPT, {
            reply_markup: addFilesKeyboard("Завершить добавление файлов к отчету"),
        });
    });

    bot.hears("Завершить добавление файлов к отчету", async (ctx) => {
        const user = await getUser(ctx);
        if (!user) return;

        const report = reportWithPhotos(ctx);
        if (!report?.reportId) {
            await ctx.reply("Не выбран отчет, к которому нужно добавить файлы. Выберите конструкцию заново.", {
                reply_markup: filialActionsKeyboard,
            });
            return;
        }

        if (report.reportData.photos.length === 0) {
            await ctx.reply(NEED_REPORT_FILE_PROMPT, {
                reply_markup: addFilesKeyboard("Завершить добавление файлов к отчету"),
            });
            return;
        }

        const res = await addFilesToReport({reportId: report.reportId, photos: report.reportData.photos}, user);
        if (res.status == "success") {
            await replyReportSaved(ctx, "Файлы успешно добавлены к отчету.");
            return;
        }
        await replyReportFailed(ctx, res.message);
    });

    bot.hears("Отменить создание отчета", async (ctx) => {
        const user = await getUser(ctx);
        if (!user) return;
        clearMarketingReport(ctx);
        await ctx.reply(`Создание отчета отменено, ${user.name}! Выберите интересующий вас пункт меню`, {
            reply_markup: filialActionsKeyboard,
        });
    });
};

export default addHears;
