import {MyContext, MyConversation} from "../../../types/global/myContext";
import {MarketingReport} from "../../../types/marketing/MarketingReport";
import {Keyboard} from "grammy";
import {backKeyboard} from "../../global/keyboards/back";

export default async function report(conversation: MyConversation, ctx: MyContext, report: MarketingReport ) {
    await ctx.reply("Укажите состояние конструкции", {
        reply_markup: new Keyboard()
            .text("Проблем нет").row()
            .text("Есть дефект").row()
            .text("Отменить").row()
    })

    const ctx1 = await conversation.waitForHears(["Проблем нет", "Есть дефект", "Отменить"], {
        async otherwise(ctx){
            await ctx.reply("Пожалуйста, выберите необходимый пункт меню")
        }
    })

    if (ctx1.message?.text == "Отменить") {
        await ctx.reply("Создание отчета отменено", {reply_markup: backKeyboard})
        await conversation.external((ctx)=>{
            ctx.session.marketing_report = null
        })
        return
    }

    const status = ctx1.message?.text!

    await ctx.reply(status == "Есть дефект"
            ?"Опишите дефекты ответным сообщением:"
            :"Вы можете дополнитеьно описать состояние конструкции или напишите 'Все ок' ответным сообщением, если все в порядке:", {
            reply_markup: new Keyboard()
                .text("Отменить").row()
        }
    )

    const ctx2 = await conversation.waitFor(":text", {
        async otherwise(c) {
            await c.reply(`Пожалуйста, опишите ${status==="Есть дефект" ? "имеющиеся деффекты" : "состояние конструкции"} ответным сообщением`)
        }
    })

    if (ctx2.message?.text == "Отменить") {
        await ctx.reply("Создание отчета отменено", {reply_markup: backKeyboard})
        await conversation.external((ctx)=>{
            ctx.session.marketing_report = null
        })
        return
    }
    const comment = ctx2.message?.text!
    await conversation.external((ctx)=>{
        ctx.session.marketing_report = {...report, reportData:{status:status, comment:comment, photos:[]}}
    })

    await ctx.reply("Необходимо добавить фото/видео", {
        reply_markup: new Keyboard()
            .text("Добавить фото/видео").row()
            .text("Отменить").row()
    })

    const ctx3 = await conversation.waitForHears(["Добавить фото/видео", "Отменить"], {
        async otherwise(ctx){
            await ctx.reply("Пожалуйста, выберите необходимый пункт меню")
        }
    })

    if (ctx3.message?.text == "Отменить") {
        await ctx.reply("Создание отчета отменено", {reply_markup: backKeyboard})
        await conversation.external((ctx)=>{
            ctx.session.marketing_report = null
        })
        return
    }
    await conversation.halt()
}