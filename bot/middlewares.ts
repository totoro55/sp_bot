import {Bot} from "grammy";
import {MyApi, MyContext} from "../types/global/myContext";
import {confirmCodeQuestion, findFilialByCode, loginQuestion} from "./global/middlewares";


const addMiddlewares = (bot:Bot<MyContext, MyApi>)=> {
    bot.use(loginQuestion.middleware())
    bot.use(confirmCodeQuestion.middleware())
    bot.use(findFilialByCode.middleware())
}

export default addMiddlewares;