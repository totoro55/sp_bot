import {MyContext} from "../../../types/global/myContext";

const clearMarketingReport = (ctx: MyContext): void => {
    ctx.session.marketing_report = null;
    ctx.session.marketing_report_files = [];
    ctx.session.marketing_report_curren_files = [];
};

const resetMarketingSession = (ctx: MyContext): void => {
    clearMarketingReport(ctx);
    ctx.session.marketing_report_period = null;
};

export {clearMarketingReport, resetMarketingSession};
