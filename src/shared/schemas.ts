import { z } from 'zod';

import type { MasterData } from './types.ts';

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
