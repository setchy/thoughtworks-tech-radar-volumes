import _ from 'lodash';

import { FILES } from '../../common/constants';
import type { BlipTimelineEntry } from '../../types';
import { readJSONFile } from '../../utils';

type StatsOpts = {
  by?: 'volume' | 'quadrant' | 'ring' | 'all';
};

export async function summarizeStats(opts: StatsOpts = {}) {
  const data = readJSONFile<BlipTimelineEntry[]>(FILES.DATA.MASTER);

  const byVolume = _.countBy(data, (d) => String(d.volume));
  const byQuadrant = _.countBy(data, (d) => String(d.quadrant));
  const byRing = _.countBy(data, (d) => String(d.ring));

  const total = data.length;

  const out: any = { total };
  if (opts.by === 'volume' || opts.by === 'all' || !opts.by) out.byVolume = byVolume;
  if (opts.by === 'quadrant' || opts.by === 'all' || !opts.by) out.byQuadrant = byQuadrant;
  if (opts.by === 'ring' || opts.by === 'all' || !opts.by) out.byRing = byRing;

  return out;
}
