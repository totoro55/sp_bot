export type MarketingReport = {
    advStructureId: string,
    advStructureType: string,
    advStructureTitle?: string,
    reportId: string | null,
    newFiles?: {fileId: string, telegramFileId: string, fileName: string}[],
    reportData: {
        status: string,
        comment: string,
        photos: Array<string | {[p:string]: string}>
    }
}