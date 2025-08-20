import {MyContext, MyConversation} from "../../../types/global/myContext";
import {Keyboard} from "grammy";
import {backKeyboard} from "../keyboards/back";
import {sendFeedback} from "../handlers";
import bot from "../../index";
import {TUser} from "../../../types/global/TUser";

export default async function feedback(conversation: MyConversation, ctx: MyContext, user: TUser ) {
    const userId = user.id

    await ctx.reply("Выберите вид обращения", {
        reply_markup: new Keyboard()
            .text("Проблема").row()
            .text("Предложение").row()
            .text("Отменить").row()
    })

    const ctx1 = await conversation.waitForHears(["Проблема", "Предложение", "Отменить"], {
        async otherwise(ctx){
            await ctx.reply("Пожалуйста, выберите необходимый пункт меню")
        }
    })

    if (ctx1.message?.text == "Отменить") {
        await ctx.reply("Создание обращения отменено", {reply_markup: backKeyboard})
        return
    }

    const type = ctx1.message?.text!


    await ctx.reply(type == "Проблема"
            ?"Опишите вашу проблему ответным сообщением:"
            :"Отправьте ваше предложение ответным сообщение:", {
            reply_markup: new Keyboard()
                .text("Отменить").row()
        }
    )

    const ctx2 = await conversation.waitFor(":text", {
        async otherwise(c) {
            await c.reply(`Пожалуйста, отправьте описание ${type==="Проблема" ? "проблемы" : "предложения"} ответным сообщением`)
        }
    })

    if (ctx2.message?.text == "Отменить") {
        await ctx.reply("Создание обращения отменено", {reply_markup: backKeyboard})
        return
    }
    const description = ctx2.message?.text!

    await ctx.reply("Вы можете добавить вложение к вашему обращению, для этого отправьте его ответным сообщением", {
        reply_markup: new Keyboard()
            .text("Продолжить без вложения").row()
            .text("Отменить").row()
    })

    const ctx3 = await conversation.waitFor("message:file"
        , {
            async otherwise(c){
                if (c.message?.text == "Отменить") {
                    await c.reply("Создание обращения отменено", {reply_markup: backKeyboard})
                    await conversation.halt()
                }

                if (c.message?.text == "Продолжить без вложения") {
                    const res = await sendFeedback(
                        type === "Проблема" ? "problem" : "offer",
                        userId,
                        description
                    )

                    await c.reply(res, {reply_markup: backKeyboard})
                    await conversation.halt()
                }

                await c.reply("Для добавления вложения, отправьте его ответным сообщением или создайте обращение без добавления файла, нажав на соответствующую кнопку", {
                    reply_markup: new Keyboard()
                        .text("Продолжить без вложения").row()
                        .text("Отменить").row()
                })
            }
        })

    const file = await ctx3.getFile()
    const fileUrl = await bot.api.getFile(file.file_id).then(res=>res.getUrl())
    const res = await sendFeedback(
        type === "Проблема" ? "problem" : "offer",
        userId,
        description,
        fileUrl
    )

    await ctx3.reply(res, {reply_markup: backKeyboard})
    return
}