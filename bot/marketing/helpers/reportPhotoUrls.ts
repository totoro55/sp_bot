import {MyContext} from "../../../types/global/myContext";

const reportFileCount = (ctx: MyContext): number => {
    const kept = ctx.session.marketing_report_curren_files.length;
    const added = ctx.session.marketing_report?.newFiles?.length ?? 0;
    return kept + added;
};

export {reportFileCount};
