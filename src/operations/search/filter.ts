import { readJSONFile } from '../../data/repository';
import { FILES } from '../../shared/constants';
import type {
  BlipStatus,
  BlipTimelineEntry,
  EnrichedBlip,
} from '../../shared/types';
import { getStatus } from '../utils';

type FilterOpts = {
  volume?: string | null;
  quadrant?: string | null;
  ring?: string | null;
  status?: BlipStatus | null;
};
export async function filterData(opts: FilterOpts): Promise<EnrichedBlip[]> {
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
    if (opts.status && getStatus(entry) !== opts.status) return false;

    return true;
  });

  return filtered.map((e) => ({
    ...e,
    status: getStatus(e),
  }));
}
