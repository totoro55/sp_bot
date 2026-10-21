import {MyContext} from "../../../types/global/myContext";

const reportPhotoUrls = (ctx: MyContext): string[] => {
    const saved = ctx.session.marketing_report_curren_files.map((file) => file.fileUrl);
    const added = ctx.session.marketing_report?.reportData.photos ?? [];
    return [...saved, ...added].filter((url): url is string => typeof url === "string");
};

export {reportPhotoUrls};
