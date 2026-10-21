const STORED_PREFIX = /^(\d{9,})_(.+)$/;

const attachmentDisplayName = (storedName: string): string => {
    const match = STORED_PREFIX.exec(storedName);
    return match ? match[2] : storedName;
};

const parseAttachmentField = (value: unknown): string[] => {
    if (Array.isArray(value)) {
        return value.flatMap((item) => parseAttachmentField(item));
    }
    if (value && typeof value === "object" && "name" in value) {
        const name = (value as {name?: unknown}).name;
        return typeof name === "string" ? parseAttachmentField(name) : [];
    }
    if (typeof value !== "string") return [];
    return value.split(",").map((name) => name.trim()).filter(Boolean);
};

const pairStorageNames = (shownNames: string[], storedNames: string[]): string[] | null => {
    const pool = [...storedNames];
    const paired: string[] = [];
    for (const shownName of shownNames) {
        const index = pool.findIndex((storedName) => {
            return storedName === shownName || attachmentDisplayName(storedName) === shownName;
        });
        if (index < 0) return null;
        paired.push(pool.splice(index, 1)[0]);
    }
    return pool.length === 0 ? paired : null;
};

export {attachmentDisplayName, pairStorageNames, parseAttachmentField};
