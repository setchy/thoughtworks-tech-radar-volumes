import type {
  BLIP_STATUSES,
  Quadrant,
  REPORT_TYPES,
  Ring,
  SEARCHABLE_FIELDS,
} from './constants.ts';

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
  relatedBlips: string[];
}

export interface EnrichedBlip extends BlipTimelineEntry {
  status: BlipStatus;
}

export interface VolumeStatusMetrics {
  new: number;
  movedIn: number;
  movedOut: number;
  noChange: number;
}

export interface VolumeMetrics {
  volume: number;
  publishedDate: string;
  total: number;
  status: VolumeStatusMetrics;
  rings: Record<Ring, number>;
  quadrants: Record<Quadrant, number>;
  files: {
    csv: string;
    json: string;
  };
  sheetGid: number | null;
}

export interface VolumeMetricsData {
  volumes: VolumeMetrics[];
}

export type BlipStatus = (typeof BLIP_STATUSES)[number];

export type ReportType = (typeof REPORT_TYPES)[number];

export type SearchableField = (typeof SEARCHABLE_FIELDS)[number];
