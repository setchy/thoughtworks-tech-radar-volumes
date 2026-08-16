import _ from 'lodash';

import {
  FILES,
  normalizeRingName,
  QUADRANT_SORT_ORDER,
  RING_SORT_ORDER,
} from '../shared/constants.ts';
import { blipTimelineEntryListSchema } from '../shared/schemas.ts';
import type { BlipTimelineEntry, ReportType } from '../shared/types.ts';

import { readJSONFile } from '../data/repository.ts';
import { formatCSVDataset, generateCSV } from './csv.ts';
import { updateGoogleSheets } from './googleSheets.ts';
import { generateJSON } from './json.ts';

export function generateVolumes(reportType: ReportType) {
  const data = readJSONFile<BlipTimelineEntry[]>(
    FILES.DATA.MASTER,
    blipTimelineEntryListSchema,
  );

  const groupedByVolumes = _.groupBy(data, 'volume');

  _.forEach(groupedByVolumes, (dataChunk, volume) => {
    const sortedData = _.orderBy(dataChunk, [
      (entry) => _.indexOf(QUADRANT_SORT_ORDER, entry.quadrant),
      (entry) => _.indexOf(RING_SORT_ORDER, normalizeRingName(entry.ring)),
      (entry) => entry.name.toLowerCase(),
    ]);

    switch (reportType) {
      case 'csv':
        generateCSV(volume, sortedData);
        break;
      case 'json':
        generateJSON(volume, sortedData);
        break;
      case 'google-sheets':
        updateGoogleSheets(volume, sortedData);
        break;
      default:
        generateCSV(volume, sortedData);
        generateJSON(volume, sortedData);
        updateGoogleSheets(volume, sortedData);
        break;
    }
  });
}

export { formatCSVDataset, generateCSV, generateJSON, updateGoogleSheets };
