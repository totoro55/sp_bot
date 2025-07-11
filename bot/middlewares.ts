import {Bot} from "grammy";
import addMainCallbacks from "./global/callbacks";

const addMiddlewares = (bot:Bot)=> {
    addMainCallbacks(bot)
}

export default addMiddlewares;