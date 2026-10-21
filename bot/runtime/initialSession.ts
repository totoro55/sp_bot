import {SessionData} from "../../types/global/myContext";

const initialSession = (): SessionData => ({
    user: null,
    auth_expires_in: 0,
    selected_filial: null,
    marketing_report_period: null,
    marketing_report_files: [],
    marketing_report: null,
    marketing_report_curren_files: [],
    reportFilesSynced: false,
    outboundBusy: null,
});

export {initialSession};
