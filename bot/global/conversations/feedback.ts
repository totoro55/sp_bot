import {MyContext, MyConversation} from "../../../types/global/myContext";
import {Keyboard} from "grammy";
import {backKeyboard} from "../keyboards/back";
import {sendFeedback} from "../handlers";
import {TUser} from "../../../types/global/TUser";
import {readableError} from "../helpers/readableError";
import {telegramFileName} from "../../marketing/upload/fileName";
import {startFeedbackUpload} from "../../marketing/upload/startFeedbackUpload";
import {isVideoUpload, maxUploadBytes} from "../../../config/filesConfig";

export default async function feedback(conversation: MyConversation, ctx: MyContext, user: TUser ) {
    const userId = user.id

    await ctx.reply("Выберите вид обращения", {
        reply_markup: new Keyboard()
            .text("Проблема").row()
            .text("Предложение").row()
            .text("Отменить").resized()
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
            :"Отправьте ваше предложение ответным сообщением:", {
            reply_markup: new Keyboard()
                .text("Отменить").resized()
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
            .text("Отменить").resized()
    })

    const ctx3 = await conversation.waitFor("message:file"
        , {
            async otherwise(c){
                if (c.message?.text == "Отменить") {
                    await c.reply("Создание обращения отменено", {reply_markup: backKeyboard})
                    await conversation.halt()
                }

                if (c.message?.text == "Продолжить без вложения") {
                    try {
                        const res = await sendFeedback({
                            feedbackType: type === "Проблема" ? "problem" : "offer",
                            userId,
                            description,
                        })
                        await c.reply(res, {reply_markup: backKeyboard})
                    } catch (error) {
                        await c.reply(`Не удалось отправить обращение. ${readableError(error)}`, {reply_markup: backKeyboard})
                    }
                    await conversation.halt()
                }

                await c.reply("Для добавления вложения, отправьте его ответным сообщением или создайте обращение без добавления файла, нажав на соответствующую кнопку", {
                    reply_markup: new Keyboard()
                        .text("Продолжить без вложения").row()
                        .text("Отменить").resized()
                })
            }
        })

    const document = ctx3.message?.document
    const video = ctx3.message?.video
    const photos = ctx3.message?.photo
    const telegramFileId = document?.file_id || video?.file_id || photos?.[photos.length - 1]?.file_id
    const fileSize = document?.file_size || video?.file_size || photos?.[photos.length - 1]?.file_size
    if (!telegramFileId) {
        await ctx3.reply("Не удалось прочитать вложение. Заполните обращение еще раз.", {
            reply_markup: backKeyboard,
        })
        return
    }
    const feedbackName = document?.file_name || video?.file_name;
    const feedbackMime = document?.mime_type || video?.mime_type;
    const feedbackVideo = isVideoUpload(feedbackName, feedbackMime, Boolean(video));
    const feedbackLimit = maxUploadBytes(feedbackVideo);
    if (fileSize && fileSize > feedbackLimit) {
        const limit = feedbackVideo ? "50 МБ" : "20 МБ";
        await ctx3.reply(`Вложение больше ${limit}. Заполните обращение еще раз и отправьте файл меньшего размера или без вложения.`, {
            reply_markup: backKeyboard,
        })
        return
    }

    const fileName = telegramFileName(document?.file_name || video?.file_name, document?.mime_type || video?.mime_type)
    await conversation.external(async (outside) => {
        await startFeedbackUpload(outside, {
            userId,
            feedbackType: type === "Проблема" ? "problem" : "offer",
            description,
            fileName,
            telegramFileId,
        })
    })
}