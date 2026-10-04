import countBy from 'lodash/countBy.js';

import { canonicalizeRingName, FILES } from '../shared/constants.ts';
import { blipTimelineEntryListSchema } from '../shared/schemas.ts';
import type { BlipTimelineEntry } from '../shared/types.ts';

import { readJSONFile } from '../data/repository.ts';

type StatsOpts = {
  by?: 'volume' | 'quadrant' | 'ring' | 'all';
};

export type StatsOutput = {
  total: number;
  byVolume?: Record<string, number>;
  byQuadrant?: Record<string, number>;
  byRing?: Record<string, number>;
};

export function summarizeStats(opts: StatsOpts = {}): StatsOutput {
  const data = readJSONFile<BlipTimelineEntry[]>(
    FILES.DATA.MASTER,
    blipTimelineEntryListSchema,
  );

  const byVolume = countBy(data, (d) => String(d.volume));
  const byQuadrant = countBy(data, (d) => String(d.quadrant));
  const byRing = countBy(data, (d) => canonicalizeRingName(d.ring));

  const total = data.length;

  const out: StatsOutput = { total };
  if (opts.by === 'volume' || opts.by === 'all' || !opts.by)
    out.byVolume = byVolume;
  if (opts.by === 'quadrant' || opts.by === 'all' || !opts.by)
    out.byQuadrant = byQuadrant;
  if (opts.by === 'ring' || opts.by === 'all' || !opts.by) out.byRing = byRing;

  return out;
}
