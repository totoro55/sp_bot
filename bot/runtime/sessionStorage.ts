import {MemorySessionStorage} from "grammy";
import {SessionData} from "../../types/global/myContext";

const sessionStorage = new MemorySessionStorage<SessionData>();

export {sessionStorage};
