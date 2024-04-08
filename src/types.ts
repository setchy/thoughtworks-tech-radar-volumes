export interface MasterData {
  blipEntries: BlipTimelineEntry[];
}

export interface BlipTimelineEntry {
  name: string;
  quadrant: string;
  ring: string;
  volume: number;
  publishedDate: string;
  descriptionHtml: string;
  isNew: boolean;
  hasMovedIn: boolean;
  hasMovedOut: boolean;
}

export type BlipStatus = 'new' | 'moved in' | 'moved out' | 'no change';
