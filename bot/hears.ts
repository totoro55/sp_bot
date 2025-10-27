import {Bot, InlineKeyboard, InputFile, Keyboard} from "grammy";
import {MyApi, MyContext} from "../types/global/myContext";
import getUser from "./global/handlers/getUser";
import {startKeyboard} from "./global/keyboards/start";
import {findFilialByCode} from "./global/middlewares";
import {findFilialKeyboard} from "./global/keyboards/findFilial";
import getActiveReportPeriods from "./marketing/handlers/getActiveReportPeriods";
import getAdvertisingStructuresByFilial from "./marketing/handlers/getAdvertisingStructuresByFilial";
import updateReport from "./marketing/handlers/updateReport";
import addReport from "./marketing/handlers/addReport";
import getReportCurrentPhotosByReportId from "./marketing/handlers/getReportCurrentPhotosByReportId";
import {getFilesFromZip} from "./marketing/helpers/getPhotosFromZip";
import addFilesToReport from "./marketing/handlers/addFilesToReport";


const addHears = (bot: Bot<MyContext, MyApi>) => {

    bot.hears("Обратная связь", async (ctx) => {
        const user = await getUser(ctx)
        if (!user) return
        await ctx.conversation.enter("feedback", user);
    })

    bot.hears("Назад в меню", async (ctx) => {
        ctx.session.marketing_report_period = null
        ctx.session.marketing_report_files = []
        ctx.session.marketing_report_curren_files = []

        await ctx.reply(`Выберите интересующий вас пункт меню`, {reply_markup: startKeyboard})
    })

    bot.hears("Отдел рекламы", async (ctx) => {
        await ctx.reply(`Выберите необходимую операцию`, {
            reply_markup:
                new Keyboard()
                    .text("Отчеты о рекламных конструкциях").row()
                    .text("Видеоинструкция").row()
                    .text("Назад в меню").row()
        })
    })

    bot.hears("Отчеты о рекламных конструкциях", async (ctx) => {
        const user = await getUser(ctx)
        if (!user) return
        const filial = ctx.session.selected_filial
        if (!filial) {
            await ctx.reply(`Не выбран филиал. Для заполнения отчета о рекламных конструкциях необходимо выбрать филиал.`, {
                reply_markup: new Keyboard()
                    .text("Выбор филиала").row()
                    .text("Назад в меню").row()
            })
            return
        }
        await ctx.reply(`Выбран филиал ${filial.name}. Вы можете выбрать другой филиал или перейти к заполнению отчета о рекламных конструкциях.`,
            {
                reply_markup: new Keyboard()
                    .text("Заполнение отчета о РК").row()
                    .text("Выбор филиала").row()
                    .text("Назад в меню").row()
            })
        return

    })

    bot.hears("Выбор филиала", async (ctx) => {
        const user = await getUser(ctx)
        if (!user) return
        const filial = ctx.session.selected_filial
        if (!filial) {
            return findFilialByCode.replyWithMarkdown(ctx, "Отправьте код филиала, без пробелов:")
        }
        await ctx.reply(`Выбран филиал ${filial.name}. Вы можете выбрать другой филиал осуществив поиск:`, {reply_markup: findFilialKeyboard})
        return
    })

    bot.hears("По коду филиала", async (ctx) => {
        const user = await getUser(ctx)
        if (!user) return
        return findFilialByCode.replyWithMarkdown(ctx, "Отправьте код филиала, без пробелов:")
    })

    bot.hears("Заполнение отчета о РК", async (ctx) => {
        const user = await getUser(ctx)
        if (!user) return
        const filial = ctx.session.selected_filial
        if (!filial) {
            await ctx.reply(`Не выбран филиал. Для заполнения отчета о рекламных конструкциях необходимо выбрать филиал.`, {
                reply_markup: new Keyboard()
                    .text("Выбор филиала").row()
                    .text("Назад в меню").row()
            })
            return
        }
        const reportPeriods = await getActiveReportPeriods()
        if (!reportPeriods || reportPeriods.length === 0) {
            await ctx.reply(`На текущий момент не происходит сбор отчетов. Если уверены, что вам необходимо отправить отчет о состоянии РК - обратитесь к ответственным сотрудникам отдела рекламы.`,
                {
                    reply_markup: new Keyboard()
                        .text("Назад в меню").row()
                })
            return
        }

        const keyboard = new InlineKeyboard();
        reportPeriods.forEach((r) => keyboard.text(r.name, `marketing_report_period_${r.id}`).row());

        await ctx.reply("Выберите период отчета", {reply_markup: keyboard})
        return
    })

    bot.hears("Выбрать другой период", async (ctx) => {
        const user = await getUser(ctx)
        if (!user) return
        const filial = ctx.session.selected_filial
        if (!filial) {
            await ctx.reply(`Не выбран филиал. Для заполнения отчета о рекламных конструкциях необходимо выбрать филиал.`, {
                reply_markup: new Keyboard()
                    .text("Выбор филиала").row()
                    .text("Назад в меню").row()
            })
            return
        }
        const reportPeriods = await getActiveReportPeriods()
        if (!reportPeriods || reportPeriods.length === 0) {
            await ctx.reply(`На текущий момент не происходит сбор отчетов. Если уверены, что вам необходимо отправить отчет о состоянии РК - обратитесь к ответственным сотрудникам отдела рекламы.`,
                {
                    reply_markup: new Keyboard()
                        .text("Назад в меню").row()
                })
            return
        }

        const keyboard = new InlineKeyboard();
        reportPeriods.forEach((r) => keyboard.text(r.name, `marketing_report_period_${r.id}`).row());

        await ctx.reply("Выберите период отчета", {reply_markup: keyboard})
        return
    })

    bot.hears("Выбрать рекламную конструкцию", async (ctx) => {
        const user = await getUser(ctx)
        if (!user) return

        const filial = ctx.session.selected_filial
        if (!filial) {
            await ctx.reply(`Не выбран филиал. Для заполнения отчета о рекламных конструкциях необходимо выбрать филиал.`, {
                reply_markup: new Keyboard()
                    .text("Выбор филиала").row()
                    .text("Назад в меню").row()
            })
            return
        }

        const reportPeriod = ctx.session.marketing_report_period
        if (!reportPeriod) {
            await ctx.reply(`Не выбран период отчета`, {
                reply_markup: new Keyboard()
                    .text("Выбрать другой период").row()
                    .text("Назад в меню").row()
            })
            return
        }

        const advStructures = await getAdvertisingStructuresByFilial(filial)
        if (!advStructures || advStructures.length === 0) {
            await ctx.reply(`Не найдены рекламные конструкции по указанному филиалу. Обратитесь в Отдел рекламы.`, {
                reply_markup: new Keyboard()
                    .text("Выбор филиала").row()
                    .text("Назад в меню").row()
            })
            return
        }

        const keyboard = new InlineKeyboard();
        advStructures.forEach((adv, i) => keyboard.text((i + 1) + ". " + adv["3710"], `adv_structure_${adv.id}`).row());

        await ctx.reply("Выберите рекламную конструкцию:", {reply_markup: keyboard})
        return
    })

    bot.hears(["Редактировать отчет", "Заполнить отчет"], async (ctx) => {
        const user = await getUser(ctx)
        if (!user) return

        if (!ctx.session.marketing_report) {
            await ctx.reply("Не указаны данные необходимые для заполнения отчета", {reply_markup: new Keyboard().text("Заполнение отчета о РК").row().text("Назад в меню")})
            return
        }
        await ctx.conversation.enter("report", ctx.session.marketing_report)
    })

    bot.hears("Завершить добавление файлов", async (ctx) => {
        const user = await getUser(ctx)
        if (!user) return

        const report = ctx.session.marketing_report
        if (!report) return

        const period = ctx.session.marketing_report_period
        if (!period) return

        if (!report.reportData.photos.length && !ctx.session.marketing_report_curren_files.length) {
            await ctx.reply("Необходимо добавить как минимум 1 фото/видео, отображающие состояние конструкции.\nМинимальный рахмер файла - 2Мб\nМаксимальный размер файла - 20Мб.\n\n" +
                "Для корректной отправки необходимо отправлять фото без сжатия, как файлы. Видео можно отправлять со сжатием.", {
                reply_markup: new Keyboard()
                    .text("Завершить добавление файлов").row()
                    .text("Отменить создание отчета").row()
            })
            return
        }

        if (report.reportId) {

            const res = await updateReport(
                {
                    ...report,
                    reportData: {
                        status: report.reportData.status,
                        comment: report.reportData.comment,
                        photos: [
                            ...ctx.session.marketing_report_curren_files.length
                                ? ctx.session.marketing_report_curren_files.map(f=>f.fileUrl)
                                : []
                            , ...report.reportData.photos],
                    }
                },
                period.id, user)
            if (res.status == "success") {
                await ctx.reply("Отчет успешно обновлен. Вы можете заполнить отчет по другой РК или вернуться в главное меню.", {
                    reply_markup: new Keyboard().text("Выбрать рекламную конструкцию").row().text("Назад в меню").row()
                })
                ctx.session.marketing_report = null
                return
            } else {
                await ctx.reply(`${res.message}`, {
                    reply_markup: new Keyboard().text("Назад в меню").row()
                })
                ctx.session.marketing_report = null
                return
            }
        } else {
            const res = await addReport(report, period.id, user)
            if (res.status == "success") {
                await ctx.reply("Отчет успешно добавлен. Вы можете заполнить отчет по другой РК или вернуться в главное меню.", {
                    reply_markup: new Keyboard().text("Выбрать рекламную конструкцию").row().text("Назад в меню").row()
                })
                ctx.session.marketing_report = null
                return
            } else {
                await ctx.reply(`Произошла ошибка: ${res.message}. Обратитесь к ответственным.`, {
                    reply_markup: new Keyboard().text("Назад в меню").row()
                })
                ctx.session.marketing_report = null
                return
            }
        }
    })

    bot.hears("Добавить фото/видео к имеющемуся отчету", async (ctx: MyContext) => {
        const user = await getUser(ctx)
        if (!user) return
        if (!ctx.session.marketing_report?.reportId) return

        if (ctx.session.marketing_report && ctx.session.marketing_report.reportId) {
            try {
                await ctx.reply("Пожалуйста подождите, загружается список ранее добавленных файлов")
                const filesBase64 = await getReportCurrentPhotosByReportId(Number(ctx.session.marketing_report.reportId))
                const files = await getFilesFromZip(filesBase64)

                if (files && files.length > 0) {
                    for (const file of files) {
                        const fileId = Date.now().toString()
                        const msg = await ctx.replyWithDocument(new InputFile(file.content, file.filename), {
                            caption: file.filename,
                            reply_markup: new InlineKeyboard().text("Удалить файл", "delete_file_"+fileId)
                        })
                        const fileUrl = await bot.api.getFile(msg.document.file_id).then(res => res.getUrl())
                        ctx.session.marketing_report_curren_files = [...ctx.session.marketing_report_curren_files, {fileId: fileId, fileUrl: fileUrl}]
                    }
                } else {
                    await ctx.reply("Не удалось загрузить файлы или файлы к указанному отчету отсутствуют.")
                }
                await ctx.reply("Загружены файлы. Вы можете удалить файл нажав на соответствующую кнопку расположенную под ним.")
            } catch (e) {
                await ctx.reply(`Не удалось загрузить список имеющихся файлов ошибка ${JSON.stringify(e)}`)
            }
        }

        await ctx.reply("Добавьте фото/видео, отображающие состояние конструкции.\nМинимальный размер файла - 1Мб\nМаксимальный размер файла - 20Мб.\n\n" +
            "Для корректной отправки необходимо отправлять фото без сжатия, как файлы. Видео можно отправлять со сжатием.", {
            reply_markup: new Keyboard()
                .text("Завершить добавление файлов к отчету").row()
                .text("Отменить создание отчета").row()
        })
    });

    bot.hears("Завершить добавление файлов к отчету", async (ctx) => {
        const user = await getUser(ctx)
        if (!user) return
        if (!ctx.session.marketing_report?.reportId) return

        if (!ctx.session.marketing_report.reportData.photos && !ctx.session.marketing_report_curren_files.length) {
            await ctx.reply("Необходимо добавить как минимум 1 фото/видео, отображающие состояние конструкции.\nМинимальный размер файла - 1Мб\nМаксимальный размер файла - 20Мб.\n\n" +
                "Для корректной отправки необходимо отправлять фото без сжатия, как файлы. Видео можно отправлять со сжатием.", {
                reply_markup: new Keyboard()
                    .text("Завершить добавление файлов").row()
                    .text("Отменить создание отчета").row()
            })
            return
        }

        const res = await addFilesToReport({
            reportId: ctx.session.marketing_report?.reportId, photos: [
                ...ctx.session.marketing_report_curren_files.length
                    ? ctx.session.marketing_report_curren_files.map(f=>f.fileUrl)
                    : []
                , ...ctx.session.marketing_report.reportData.photos]
        }, user)
        if (res.status == "success") {
            await ctx.reply("Файлы успешно добавлены к отчету. Вы можете заполнить отчет по другой РК или вернуться в главное меню.", {
                reply_markup: new Keyboard().text("Выбрать рекламную конструкцию").row().text("Назад в меню").row()
            })
            ctx.session.marketing_report = null
            return
        } else {
            await ctx.reply(`${res.message}`, {
                reply_markup: new Keyboard().text("Назад в меню").row()
            })
            ctx.session.marketing_report = null
            return
        }
    })

    bot.hears("Отменить создание отчета", async (ctx: MyContext) => {
        const user = await getUser(ctx)
        if (!user) return
        ctx.session.marketing_report_files = []
        ctx.session.marketing_report = null
        ctx.session.marketing_report_curren_files = []
        await ctx.reply(`Создание отчета отменено, ${user.name}! Выберите интересующий вас пункт меню`, {
            reply_markup: new Keyboard()
                .text("Заполнение отчета о РК").row()
                .text("Выбор филиала").row()
                .text("Назад в меню").row()})
    });
}

export default addHears