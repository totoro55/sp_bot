import {Bot, InlineKeyboard} from "grammy";
import {MyApi, MyContext} from "../../types/global/myContext";
import {TUser} from "../../types/global/TUser";
import getUser from "../global/handlers/getUser";
import {ADD_REPORT_FILES_PROMPT, NEED_REPORT_FILE_PROMPT} from "../../config/filesConfig";
import {showCurrentReportFiles} from "./helpers/showCurrentReportFiles";
import {reportFileCount} from "./helpers/reportPhotoUrls";
import {askReportPeriod, requireFilial} from "./helpers/askReportPeriod";
import {clearMarketingReport} from "./helpers/reportSession";
import {reportPlace} from "./helpers/reportContext";
import {startReportUpload} from "./upload/startReportUpload";
import {replyInlineChoice} from "./helpers/replyInlineChoice";
import {structureListButtons} from "./helpers/structureLabel";
import getAdvertisingStructuresByFilial from "./handlers/getAdvertisingStructuresByFilial";
import {
    addFilesKeyboard,
    changeStructureOrPeriodKeyboard,
    chooseFilialKeyboard,
    choosePeriodKeyboard,
    continueReportKeyboard,
    filialActionsKeyboard,
} from "./keyboards/report";

const NO_PERIODS_FOR_FILL = "На текущий момент не происходит сбор отчетов. Если уверены, что вам необходимо отправить отчет о состоянии РК - обратитесь к ответственным сотрудникам Отдела Рекламы.";
const NO_PERIODS_FOR_CHANGE = "В настоящее время сбор отчётов не производится. В случае необходимости отправки отчёта о состоянии РК просим обратиться к ответственным сотрудникам отдела рекламы.";

const hasReportFiles = (ctx: MyContext): boolean => reportFileCount(ctx) > 0;

const finishAddingFiles = async (ctx: MyContext, user: TUser, mode: "form" | "files"): Promise<void> => {
    const report = ctx.session.marketing_report;
    const label = mode === "files" ? "Завершить добавление файлов к отчету" : "Завершить добавление файлов";

    if (mode === "form") {
        if (!report || !ctx.session.marketing_report_period) {
            await ctx.reply("Не выбран отчет или период. Начните заполнение заново.", {
                reply_markup: filialActionsKeyboard,
            });
            return;
        }
    } else if (!report?.reportId) {
        await ctx.reply("Не выбран отчет, к которому нужно добавить файлы. Выберите конструкцию заново.", {
            reply_markup: filialActionsKeyboard,
        });
        return;
    }

    if (!hasReportFiles(ctx)) {
        await ctx.reply(NEED_REPORT_FILE_PROMPT, {
            reply_markup: addFilesKeyboard(label),
        });
        return;
    }

    await startReportUpload(ctx, user, mode);
};

const addReportHears = (bot: Bot<MyContext, MyApi>): void => {
    bot.hears("Отчеты о рекламных конструкциях", async (ctx) => {
        const access = await requireFilial(ctx);
        if (!access) return;
        await ctx.reply(
            `Выбран филиал ${access.filial.name}. Вы можете выбрать другой филиал или перейти к заполнению отчета о рекламных конструкциях.`,
            {reply_markup: filialActionsKeyboard},
        );
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
        await finishAddingFiles(ctx, user, "form");
    });

    bot.hears("Добавить фото/видео к отчету", async (ctx) => {
        const user = await getUser(ctx);
        if (!user) return;
        const report = ctx.session.marketing_report;
        if (!report?.reportId) {
            await ctx.reply("Сначала выберите конструкцию, по которой уже есть отчет.", {
                reply_markup: changeStructureOrPeriodKeyboard,
            });
            return;
        }
        ctx.session.marketing_report = {...report, acceptFiles: true};

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
        await finishAddingFiles(ctx, user, "files");
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

export {addReportHears};
