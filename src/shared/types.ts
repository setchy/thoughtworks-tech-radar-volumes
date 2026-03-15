import type {
  BLIP_STATUSES,
  REPORT_TYPES,
  SEARCHABLE_FIELDS,
} from './constants';

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

export interface EnrichedBlip extends BlipTimelineEntry {
  status: BlipStatus;
}

export type BlipStatus = (typeof BLIP_STATUSES)[number];

export type ReportType = (typeof REPORT_TYPES)[number];

export type SearchableField = (typeof SEARCHABLE_FIELDS)[number];
