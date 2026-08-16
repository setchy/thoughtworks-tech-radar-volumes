import { FILES, SEARCHABLE_FIELDS } from '../shared/constants.ts';
import { blipTimelineEntryListSchema } from '../shared/schemas.ts';
import type {
  BlipTimelineEntry,
  EnrichedBlip,
  SearchableField,
} from '../shared/types.ts';

import { readJSONFile } from '../data/repository.ts';
import { getStatus } from './utils.ts';

type SearchOpts = {
  keyword: string;
  field?: string | null;
  volume?: string | null;
};

export function isValidSearchField(field: string): field is SearchableField {
  return SEARCHABLE_FIELDS.includes(field as SearchableField);
}

export async function searchData(opts: SearchOpts): Promise<EnrichedBlip[]> {
  const data = readJSONFile<BlipTimelineEntry[]>(
    FILES.DATA.MASTER,
    blipTimelineEntryListSchema,
  );
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
      if (!isValidSearchField(opts.field)) {
        return false;
      }
      const val = String(entry[opts.field] ?? '').toLowerCase();
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
