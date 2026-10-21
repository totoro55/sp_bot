import {MyContext, MyConversation} from "../../../types/global/myContext";
import {MarketingReport} from "../../../types/marketing/MarketingReport";
import {Keyboard} from "grammy";
import {backKeyboard} from "../../global/keyboards/back";
import {messageFromAdvStructureType} from "../helpers/messageFromAdvStructureType";
import {clearMarketingReport} from "../helpers/reportSession";

const cancelKeyboard = new Keyboard().text("Отменить").row();
const statusKeyboard = new Keyboard()
    .text("Все ок").row()
    .text("Есть дефекты").row()
    .text("Отменить").row();
const addPhotoKeyboard = new Keyboard()
    .text("Добавить фото/видео").row()
    .text("Отменить").row();

export default async function report(conversation: MyConversation, ctx: MyContext, report: MarketingReport) {
    const cancelReport = async () => {
        await ctx.reply("Создание отчета отменено", {reply_markup: backKeyboard});
        await conversation.external((outside) => {
            clearMarketingReport(outside);
        });
    };

    await ctx.reply("Укажите состояние конструкции", {reply_markup: statusKeyboard});

    const statusCtx = await conversation.waitForHears(["Все ок", "Есть дефекты", "Отменить"], {
        async otherwise(wrong) {
            await wrong.reply("Пожалуйста, выберите необходимый пункт меню");
        },
    });

    if (statusCtx.message?.text == "Отменить") {
        await cancelReport();
        return;
    }

    const status = statusCtx.message?.text!;
    await ctx.reply(messageFromAdvStructureType(status, report.advStructureType), {reply_markup: cancelKeyboard});

    const commentCtx = await conversation.waitFor(":text", {
        async otherwise(wrong) {
            await wrong.reply(`Пожалуйста, опишите ${status === "Есть дефекты" ? "имеющиеся дефекты" : "состояние конструкции"} ответным сообщением`);
        },
    });

    if (commentCtx.message?.text == "Отменить") {
        await cancelReport();
        return;
    }

    const comment = commentCtx.message?.text!;
    const draft: MarketingReport = {...report, reportData: {status, comment, photos: []}};
    await conversation.external((outside) => {
        outside.session.marketing_report = draft;
    });

    await ctx.reply("Необходимо добавить фото/видео", {reply_markup: addPhotoKeyboard});

    const photoCtx = await conversation.waitForHears(["Добавить фото/видео", "Отменить"], {
        async otherwise(wrong) {
            await wrong.reply("Пожалуйста, выберите необходимый пункт меню");
        },
    });

    if (photoCtx.message?.text == "Отменить") {
        await cancelReport();
        return;
    }

    await conversation.halt();
}
