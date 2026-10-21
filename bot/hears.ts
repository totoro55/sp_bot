import {Bot} from "grammy";
import {MyApi, MyContext} from "../types/global/myContext";
import {addMenuHears} from "./global/menuHears";
import {addReportHears} from "./marketing/reportHears";

const addHears = (bot: Bot<MyContext, MyApi>): void => {
    addMenuHears(bot);
    addReportHears(bot);
};

export default addHears;
