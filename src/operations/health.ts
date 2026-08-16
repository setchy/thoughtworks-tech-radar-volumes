import { FILES, NOT_FOUND_VOLUME_NUMBER } from '../shared/constants.ts';
import { blipTimelineEntryListSchema } from '../shared/schemas.ts';
import type { BlipTimelineEntry } from '../shared/types.ts';

import { readJSONFile } from '../data/repository.ts';

// Volumes 1-14 genuinely lack descriptions in the source; these are informational, not errors.
export const EMPTY_DESCRIPTION_EXPECTED_MAX_VOLUME = 14;

export type DataHealth = {
  total: number;
  unknownVolumes: number;
  unknownQuadrants: number;
  emptyDescriptions: {
    total: number;
    expected: number;
    unexpected: number;
  };
};

export function summarizeHealth(): DataHealth {
  const data = readJSONFile<BlipTimelineEntry[]>(
    FILES.DATA.MASTER,
    blipTimelineEntryListSchema,
  );

  const emptyDescriptionEntries = data.filter(
    (entry) => entry.descriptionHtml.trim() === '',
  );
  const expectedEmptyDescriptions = emptyDescriptionEntries.filter(
    (entry) => entry.volume <= EMPTY_DESCRIPTION_EXPECTED_MAX_VOLUME,
  ).length;

  return {
    total: data.length,
    unknownVolumes: data.filter(
      (entry) => entry.volume === NOT_FOUND_VOLUME_NUMBER,
    ).length,
    unknownQuadrants: data.filter((entry) => entry.quadrant === 'unknown')
      .length,
    emptyDescriptions: {
      total: emptyDescriptionEntries.length,
      expected: expectedEmptyDescriptions,
      unexpected: emptyDescriptionEntries.length - expectedEmptyDescriptions,
    },
  };
}
