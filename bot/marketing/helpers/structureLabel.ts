type StructureRow = {[key: string]: unknown};

const OTHER_TYPE = "Другое (наименование РК указано в карточке)";
const DETAIL_FIELDS = ["3713", "3715", "3716"];

const clean = (value: unknown): string => {
    if (typeof value !== "string" && typeof value !== "number") return "";
    return String(value).replace(/\s+/g, " ").trim();
};

const structureName = (adv: StructureRow): string => {
    const type = clean(adv["3710"]);
    if (type === OTHER_TYPE) return clean(adv["3714"]) || "Другое";
    return type || "Конструкция";
};

const structureDetail = (adv: StructureRow, name: string): string => {
    for (const field of DETAIL_FIELDS) {
        const value = clean(adv[field]);
        if (!value || value === name || value.length > 40) continue;
        if (/^\d+$/.test(value) || value === "true" || value === "false") continue;
        return value;
    }
    return "";
};

const fitButtonText = (text: string): string => (text.length > 64 ? `${text.slice(0, 63)}…` : text);

const structureButtonText = (adv: StructureRow, index: number, duplicate: boolean): string => {
    const name = structureName(adv);
    const detail = duplicate ? (structureDetail(adv, name) || clean(adv.id)) : "";
    const text = detail ? `${index + 1}. ${name} — ${detail}` : `${index + 1}. ${name}`;
    return fitButtonText(text);
};

const structureContextName = (adv: StructureRow): string => {
    const name = structureName(adv);
    const detail = structureDetail(adv, name);
    return detail ? `${name} — ${detail}` : name;
};

const structureCaptionTitle = (adv: StructureRow): string => {
    const name = structureName(adv);
    const detail = structureDetail(adv, name);
    const title = `Рекламная конструкция ${name}`;
    return detail ? `${title}\n${detail}` : title;
};

const structureListButtons = (rows: StructureRow[]): {id: string; text: string}[] => {
    const names = rows.map((row) => structureName(row));
    const draft = rows.map((row, index) => {
        const duplicate = names.filter((name) => name === names[index]).length > 1;
        return structureButtonText(row, index, duplicate);
    });
    const counts = new Map<string, number>();
    draft.forEach((text) => counts.set(text, (counts.get(text) || 0) + 1));

    return rows.flatMap((row, index) => {
        const id = clean(row.id);
        if (!id) return [];
        const sameText = (counts.get(draft[index]) || 0) > 1;
        const text = sameText
            ? fitButtonText(`${index + 1}. ${names[index]} — ${id}`)
            : draft[index];
        return [{id, text}];
    });
};

export {structureCaptionTitle, structureContextName, structureListButtons};
