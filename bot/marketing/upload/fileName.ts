const uniqueFileName = (original: string, used: Set<string>): string => {
    const cleaned = original.replace(/[\\/]/g, "_").replace(/\s+/g, " ").trim() || "file";
    if (!used.has(cleaned)) {
        used.add(cleaned);
        return cleaned;
    }

    const dot = cleaned.lastIndexOf(".");
    const base = dot > 0 ? cleaned.slice(0, dot) : cleaned;
    const extension = dot > 0 ? cleaned.slice(dot) : "";
    let index = 2;
    let next = `${base}_${index}${extension}`;
    while (used.has(next)) {
        index += 1;
        next = `${base}_${index}${extension}`;
    }
    used.add(next);
    return next;
};

const telegramFileName = (name: string | undefined, mime: string | undefined): string => {
    const trimmed = name?.trim();
    if (trimmed) return trimmed;
    if (mime?.includes("png")) return "photo.png";
    if (mime?.includes("webp")) return "photo.webp";
    if (mime?.includes("gif")) return "photo.gif";
    if (mime?.includes("video")) return "video.mp4";
    return "photo.jpg";
};

export {telegramFileName, uniqueFileName};
