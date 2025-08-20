import {MyContext} from "../../../types/global/myContext";
import {loginQuestion} from "../middlewares";

const register = async (ctx: MyContext) => {
    return loginQuestion.replyWithMarkdown(ctx, "Введите ваш логин. Только логин, без @dns-shop.ru:");
}

export default register;