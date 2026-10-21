import {MyContext, MyConversation} from "../../../types/global/myContext";
import {MarketingReport} from "../../../types/marketing/MarketingReport";
import {Keyboard} from "grammy";
import {messageFromAdvStructureType} from "../helpers/messageFromAdvStructureType";
import {clearMarketingReport} from "../helpers/reportSession";
import {filialActionsKeyboard} from "../keyboards/report";

const cancelKeyboard = new Keyboard().text("Отменить").resized();
const statusKeyboard = new Keyboard()
    .text("Все ок").row()
    .text("Есть дефекты").row()
    .text("Отменить").resized();

export default async function report(conversation: MyConversation, ctx: MyContext, reportDraft: MarketingReport) {
    const cancelReport = async () => {
        await ctx.reply("Создание отчета отменено. Выберите интересующий вас пункт меню", {
            reply_markup: filialActionsKeyboard,
        });
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
    await ctx.reply(messageFromAdvStructureType(status, reportDraft.advStructureType), {reply_markup: cancelKeyboard});

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
    await conversation.external((outside) => {
        outside.session.marketing_report = {
            ...reportDraft,
            acceptFiles: true,
            reportData: {status, comment, photos: []},
        };
    });
    await conversation.halt();
}
