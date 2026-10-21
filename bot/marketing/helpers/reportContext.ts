import {MyContext} from "../../../types/global/myContext";

const reportPlace = (ctx: MyContext): string => {
    const filial = ctx.session.selected_filial?.name;
    const period = ctx.session.marketing_report_period?.name;
    const structure = ctx.session.marketing_report?.advStructureTitle
        || ctx.session.marketing_report?.advStructureType;
    return [
        filial ? `Филиал: ${filial}` : "",
        period ? `Период: ${period}` : "",
        structure ? `Конструкция: ${structure}` : "",
    ].filter(Boolean).join("\n");
};

const filesCountText = (count: number): string => {
    const mod10 = count % 10;
    const mod100 = count % 100;
    if (mod10 === 1 && mod100 !== 11) return `${count} файл`;
    if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return `${count} файла`;
    return `${count} файлов`;
};

const acceptedFileText = (count: number): string => {
    return `Файл принят. В отчете ${filesCountText(count)}. Когда загрузите все, нажмите «Завершить».`;
};

const savedReportText = (ctx: MyContext, lead: string): string => {
    const place = reportPlace(ctx);
    const next = "Вы можете заполнить отчет по другой РК или вернуться в главное меню.";
    return place ? `${lead}\n\n${place}\n\n${next}` : `${lead} ${next}`;
};

export {acceptedFileText, reportPlace, savedReportText};
