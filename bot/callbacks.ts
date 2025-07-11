import {Bot} from "grammy";
import addMainCallbacks from "./global/callbacks";

const addCallbacks = (bot:Bot)=> {
    addMainCallbacks(bot)
}

export default addCallbacks;