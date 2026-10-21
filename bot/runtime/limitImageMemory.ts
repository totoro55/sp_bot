import sharp from "sharp";

const limitImageMemory = (): void => {
    sharp.cache(false);
    sharp.concurrency(1);
};

export {limitImageMemory};
