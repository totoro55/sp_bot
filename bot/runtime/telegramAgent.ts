import {HttpsProxyAgent} from "https-proxy-agent";
import {telegramProxyUrl} from "../../config/env";

const proxyUrl = telegramProxyUrl();
const telegramAgent = proxyUrl ? new HttpsProxyAgent(proxyUrl) : undefined;

export {proxyUrl, telegramAgent};
