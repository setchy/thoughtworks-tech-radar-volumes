export interface MasterData {
    blipEntries: BlipTimelineEntry[]
}

export interface BlipTimelineEntry {
    name: string
    quadrant: string
    ring: string
    volume: string
    publishedDate: string
    descriptionHtml: string
}