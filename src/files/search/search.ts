import { FILES } from '../../common/constants';
import type { BlipTimelineEntry, EnrichedBlip } from '../../types';
import { readJSONFile } from '../../utils';
import { getStatus } from '../utils';

type SearchOpts = {
  keyword: string;
  field?: string | null;
  volume?: string | null;
};

export async function searchData(opts: SearchOpts): Promise<EnrichedBlip[]> {
  const data = readJSONFile<BlipTimelineEntry[]>(FILES.DATA.MASTER);
  const keyword = opts.keyword.toLowerCase();

  const filtered = data.filter((entry) => {
    if (opts.volume) {
      if (
        !String(entry.volume).toLowerCase().includes(opts.volume.toLowerCase())
      ) {
        return false;
      }
    }

    if (opts.field) {
      const val = String(
        (entry as unknown as Record<string, unknown>)[opts.field] || '',
      ).toLowerCase();
      return val.includes(keyword);
    }

    // Default: search name and descriptionHtml
    const nameMatch = String(entry.name || '')
      .toLowerCase()
      .includes(keyword);
    const descMatch = String(entry.descriptionHtml || '')
      .toLowerCase()
      .includes(keyword);

    return nameMatch || descMatch;
  });

  return filtered.map((e) => ({
    ...e,
    status: getStatus(e),
  }));
}
