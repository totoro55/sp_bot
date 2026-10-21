let fileSequence = 0;

const createFileId = (): string => {
    fileSequence = (fileSequence + 1) % 1000;
    return `${Date.now()}${fileSequence.toString().padStart(3, "0")}`;
};

export {createFileId};
