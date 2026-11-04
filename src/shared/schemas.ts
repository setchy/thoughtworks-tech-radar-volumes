import { z } from 'zod';

import type { MasterData, VolumeMetrics, VolumeMetricsData } from './types.ts';

export const blipTimelineEntrySchema = z.object({
  name: z.string(),
  quadrant: z.string(),
  ring: z.string(),
  volume: z.number(),
  publishedDate: z.string(),
  descriptionHtml: z.string(),
  isNew: z.boolean(),
  hasMovedIn: z.boolean(),
  hasMovedOut: z.boolean(),
  relatedBlips: z.array(z.string()),
});

export const blipTimelineEntryListSchema = z.array(blipTimelineEntrySchema);

export const masterDataSchema = z.object({
  blipEntries: blipTimelineEntryListSchema,
}) satisfies z.ZodType<MasterData>;

export const volumeMetricsSchema = z.object({
  volume: z.number().int().positive(),
  publishedDate: z.string(),
  total: z.number().int().nonnegative(),
  status: z.object({
    new: z.number().int().nonnegative(),
    movedIn: z.number().int().nonnegative(),
    movedOut: z.number().int().nonnegative(),
    noChange: z.number().int().nonnegative(),
  }),
  rings: z.object({
    adopt: z.number().int().nonnegative(),
    trial: z.number().int().nonnegative(),
    assess: z.number().int().nonnegative(),
    caution: z.number().int().nonnegative(),
  }),
  quadrants: z.object({
    techniques: z.number().int().nonnegative(),
    platforms: z.number().int().nonnegative(),
    tools: z.number().int().nonnegative(),
    'languages-and-frameworks': z.number().int().nonnegative(),
  }),
  files: z.object({
    csv: z.string(),
    json: z.string(),
  }),
  sheetGid: z.number().int().nonnegative().nullable().default(null),
}) satisfies z.ZodType<VolumeMetrics>;

export const volumeMetricsDataSchema = z.object({
  volumes: z.array(volumeMetricsSchema),
}) satisfies z.ZodType<VolumeMetricsData>;
