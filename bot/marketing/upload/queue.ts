import {runFeedbackUpload, FeedbackUploadJob} from "./runFeedbackUpload";
import {runReportUpload, ReportUploadJob} from "./runReportUpload";
import {MyApi} from "../../../types/global/myContext";

type UploadJob = {kind: "report"; job: ReportUploadJob} | {kind: "feedback"; job: FeedbackUploadJob};

const MAX_PARALLEL = 2;
const pending: UploadJob[] = [];
let active = 0;
let api: MyApi | null = null;

const bindUploadApi = (botApi: MyApi): void => {
    api = botApi;
};

const uploadApi = (): MyApi => {
    if (!api) throw new Error("API бота для загрузки файлов не подключено");
    return api;
};

const pump = (): void => {
    while (active < MAX_PARALLEL && pending.length > 0) {
        const item = pending.shift();
        if (!item) return;
        active += 1;
        setImmediate(() => {
            const run = item.kind === "report"
                ? runReportUpload(uploadApi(), item.job)
                : runFeedbackUpload(uploadApi(), item.job);
            run.catch((error) => console.error(error)).finally(() => {
                active -= 1;
                pump();
            });
        });
    }
};

const enqueueUpload = (item: UploadJob): void => {
    pending.push(item);
    pump();
};

export {bindUploadApi, enqueueUpload};
export type {UploadJob};
