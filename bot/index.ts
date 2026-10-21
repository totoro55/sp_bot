import "dotenv/config";
import {Bot, session} from "grammy";
import {hydrate} from "@grammyjs/hydrate";
import {conversations, createConversation} from "@grammyjs/conversations";
import {hydrateFiles} from "@grammyjs/files";
import {HttpsProxyAgent} from "https-proxy-agent";
import {MyApi, MyContext} from "../types/global/myContext";
import {assertRuntimeEnv, telegramProxyUrl} from "../config/env";
import addCallbacks from "./callbacks";
import addMiddlewares from "./middlewares";
import addHears from "./hears";
import feedback from "./global/conversations/feedback";
import report from "./marketing/conversations/report";
import {onReportConversationExit} from "./marketing/conversations/reportExit";
import {acceptReportFile} from "./marketing/acceptReportFile";
import {bindUploadApi} from "./marketing/upload/queue";
import {chatLock} from "./runtime/chatLock";
import {sessionStorage} from "./runtime/sessionStorage";
import {initialSession} from "./runtime/initialSession";
import {logBotError} from "./runtime/logBotError";
import {uploadGuard} from "./uploadGuard";
import {startCommand} from "./commands/start";

assertRuntimeEnv();

const proxyUrl = telegramProxyUrl();
const bot = new Bot<MyContext, MyApi>(process.env.BOT_TOKEN!, proxyUrl ? {
    client: {
        baseFetchConfig: {
            agent: new HttpsProxyAgent(proxyUrl),
            compress: true,
        },
    },
} : {});

bot.use(chatLock());
bot.use(session({initial: initialSession, storage: sessionStorage}));
bot.use(uploadGuard());

bot.api.config.use(hydrateFiles(process.env.BOT_TOKEN!));
bindUploadApi(bot.api);
bot.use(hydrate());
bot.use(conversations({onExit: onReportConversationExit}));
bot.use(createConversation(feedback));
bot.use(createConversation(report));
addMiddlewares(bot);
addCallbacks(bot);
addHears(bot);

bot.on(":file", acceptReportFile);
bot.catch(logBotError);
bot.command("start", startCommand);

export default bot;
