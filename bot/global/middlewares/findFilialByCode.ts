import {StatelessQuestion} from "@grammyjs/stateless-question";
import {MyContext} from "../../../types/global/myContext";
import {getFilialByCode} from "../handlers";
import {findFilialKeyboard} from "../keyboards/findFilial";
import {Keyboard} from "grammy";
import {readableError} from "../helpers/readableError";

const findFilialByCode = new StatelessQuestion("find_filial_by_code", async (ctx:MyContext) => {
    if (!ctx.message?.text) return

    try {

        const filial = await getFilialByCode(ctx.message?.text)
        if (!filial) {
            await ctx.reply("Филиал не найден. Проверьте введенный код или попробуйте другой способ поиска:", {reply_markup: findFilialKeyboard})
            return
        }
        ctx.session.selected_filial = filial
        await ctx.reply(`Выбран филиал ${filial.code} / ${filial.name}. Вы можете вернуться в меню или повторить поиск:`, {
            reply_markup: new Keyboard()
                .text("Отчеты о рекламных конструкциях").row()
                .text("Выбор филиала").row()
                .text("Назад в меню").resized()
        })
        return

    } catch (error) {
        await ctx.reply(`Не удалось выполнить поиск филиала. ${readableError(error)}`)
        return
    }
})

export default findFilialByCode;