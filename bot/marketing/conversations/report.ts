import {MyContext, MyConversation} from "../../../types/global/myContext";
import {MarketingReport} from "../../../types/marketing/MarketingReport";
import {Keyboard} from "grammy";
import {backKeyboard} from "../../global/keyboards/back";
import {messageFromAdvStructureType} from "../helpers/messageFromAdvStructureType";

export default async function report(conversation: MyConversation, ctx: MyContext, report: MarketingReport) {
    await ctx.reply("Укажите состояние конструкции", {
        reply_markup: new Keyboard()
            .text("Все ок").row()
            .text("Есть дефекты").row()
            .text("Отменить").row()
    })

    const ctx1 = await conversation.waitForHears(["Все ок", "Есть дефекты", "Отменить"], {
        async otherwise(ctx) {
            await ctx.reply("Пожалуйста, выберите необходимый пункт меню")
        }
    })

    if (ctx1.message?.text == "Отменить") {
        await ctx.reply("Создание отчета отменено", {reply_markup: backKeyboard})
        await conversation.external((ctx) => {
            ctx.session.marketing_report = null
            ctx.session.marketing_report_curren_files = []
        })
        return
    }

    const status = ctx1.message?.text!

    // if (status == "Все ок") {
    //     comment = "Дефектов нет"
    //     await conversation.skip({next:true})
    // } else {
    //     await ctx.reply("Опишите дефекты ответным сообщением:", {
    //             reply_markup: new Keyboard()
    //                 .text("Отменить").row()
    //         }
    //     )
    // }

    const ctx2Message = messageFromAdvStructureType(status, report.advStructureType)

    await ctx.reply(ctx2Message, {
            reply_markup: new Keyboard()
                .text("Отменить").row()
        }
    )

    const ctx2 = await conversation.waitFor(":text", {
        async otherwise(c) {
            await c.reply(`Пожалуйста, опишите ${status === "Есть дефекты" ? "имеющиеся деффекты" : "состояние конструкции"} ответным сообщением`)
        }
    })

    if (ctx2.message?.text == "Отменить") {
        await ctx.reply("Создание отчета отменено", {reply_markup: backKeyboard})
        await conversation.external((ctx) => {
            ctx.session.marketing_report = null
            ctx.session.marketing_report_curren_files = []
        })
        return
    }
    const comment = ctx2.message?.text!
    await conversation.external((ctx) => {
        ctx.session.marketing_report = {...report, reportData: {status: status, comment: comment, photos: []}}
    })

    await ctx.reply("Необходимо добавить фото/видео", {
        reply_markup: new Keyboard()
                .text("Добавить фото/видео").row()
                .text("Отменить").row()

    })



    const ctx3 = await conversation.waitForHears(["Добавить фото/видео", "Отменить"], {
        async otherwise(ctx) {
            await ctx.reply("Пожалуйста, выберите необходимый пункт меню")
        }
    })

    if (ctx3.message?.text == "Добавить фото/видео"){
        await conversation.external((ctx) => {
            ctx.session.marketing_report = {...report, reportData: {status: status, comment: comment, photos: []}}
        })
    }


    if (ctx3.message?.text == "Отменить") {
        await ctx.reply("Создание отчета отменено", {reply_markup: backKeyboard})
        await conversation.external((ctx) => {
            ctx.session.marketing_report = null
            ctx.session.marketing_report_curren_files = []
        })
        return
    }
    await conversation.halt()
}