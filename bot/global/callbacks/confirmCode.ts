import {MyContext} from "../../../types/global/myContext";
import {confirmCodeQuestion} from "../middlewares";

const confirmCode = async (ctx: MyContext) => {
    return confirmCodeQuestion.replyWithMarkdown(ctx, "Введите код подтверждения, отправленный на ваш почтовый ящик:");
}

export default confirmCode;