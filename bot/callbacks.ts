import {Bot} from "grammy";
import {MyApi, MyContext} from "../types/global/myContext";
import {confirmCode, register} from "./global/callbacks";
import {deleteFile, selectAdvStructure, selectMarketingReportPeriod} from "./marketing/callbacks";


const addCallbacks = (bot:Bot<MyContext, MyApi>)=> {
    bot.callbackQuery("register", register)
    bot.callbackQuery("confirm_code", confirmCode)

    bot.callbackQuery(/marketing_report_period_([1-9]\d*)/, selectMarketingReportPeriod)
    bot.callbackQuery(/adv_structure_([1-9]\d*)/, selectAdvStructure)
    bot.callbackQuery(/delete_file_([1-9]\d*)/, deleteFile)

}

export default addCallbacks;