import { FILES } from '../../common/constants';
import type { BlipTimelineEntry } from '../../types';
import { readJSONFile } from '../../utils';
import { getStatus } from '../utils';

type FilterOpts = {
  volume?: string | null;
  quadrant?: string | null;
  ring?: string | null;
  status?: string | null;
  isNew?: boolean | null;
  movement?: 'in' | 'out' | 'none' | null;
};

export async function filterData(opts: FilterOpts) {
  const data = readJSONFile<BlipTimelineEntry[]>(FILES.DATA.MASTER);

  const filtered = data.filter((entry) => {
    if (
      opts.volume &&
      !String(entry.volume).toLowerCase().includes(opts.volume.toLowerCase())
    )
      return false;
    if (
      opts.quadrant &&
      entry.quadrant.toLowerCase() !== opts.quadrant.toLowerCase()
    )
      return false;
    if (opts.ring && entry.ring.toLowerCase() !== opts.ring.toLowerCase())
      return false;
    if (
      opts.status &&
      String(getStatus(entry)).toLowerCase() !== opts.status.toLowerCase()
    )
      return false;

    if (typeof opts.isNew === 'boolean') {
      if (Boolean(entry.isNew) !== opts.isNew) return false;
    }

    if (opts.movement) {
      if (opts.movement === 'in' && !entry.hasMovedIn) return false;
      if (opts.movement === 'out' && !entry.hasMovedOut) return false;
      if (opts.movement === 'none' && (entry.hasMovedIn || entry.hasMovedOut))
        return false;
    }

    return true;
  });

  return filtered.map((e) => ({
    name: e.name,
    quadrant: e.quadrant,
    ring: e.ring,
    volume: e.volume,
    description: e.descriptionHtml,
    status: getStatus(e),
    isNew: e.isNew,
    hasMovedIn: e.hasMovedIn,
    hasMovedOut: e.hasMovedOut,
  }));
}
