export type MarketingReport = {
    advStructureId: string,
    advStructureType: string,
    reportId: string | null,
    reportData: {
        status: string,
        comment: string,
        photos: Array<string | {[p:string]: string}>
    }
}