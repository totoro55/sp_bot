export type MarketingReport = {
    advStructureId: string,
    reportId: string | null,
    reportData: {
        status: string,
        comment: string,
        photos: string[]
    }
}