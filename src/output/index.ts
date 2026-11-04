import groupBy from 'lodash/groupBy.js';
import orderBy from 'lodash/orderBy.js';

import {
  FILES,
  normalizeRingName,
  QUADRANT_SORT_ORDER,
  RING_SORT_ORDER,
} from '../shared/constants.ts';
import { blipTimelineEntryListSchema } from '../shared/schemas.ts';
import type { BlipTimelineEntry, ReportType } from '../shared/types.ts';

import { readJSONFile } from '../data/repository.ts';
import { generateCSV } from './csv.ts';
import { fetchGoogleSheetGids, updateGoogleSheets } from './googleSheets.ts';
import { generateJSON } from './json.ts';
import { generateVolumeMetrics } from './metrics.ts';
import { updateReadmeMetrics } from './metricsReadme.ts';

export async function generateVolumes(reportType: ReportType) {
  const data = readJSONFile<BlipTimelineEntry[]>(
    FILES.DATA.MASTER,
    blipTimelineEntryListSchema,
  );

  if (reportType === 'metrics') {
    updateReadmeMetrics(generateVolumeMetrics(data));
    return;
  }

  const groupedByVolumes = groupBy(data, 'volume');
  const sheetUpdates: Promise<void>[] = [];

  for (const [volume, dataChunk] of Object.entries(groupedByVolumes)) {
    const sortedData = orderBy(dataChunk, [
      (entry) => QUADRANT_SORT_ORDER.indexOf(entry.quadrant),
      (entry) => RING_SORT_ORDER.indexOf(normalizeRingName(entry.ring)),
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
        sheetUpdates.push(updateGoogleSheets(volume, sortedData));
        break;
      default:
        generateCSV(volume, sortedData);
        generateJSON(volume, sortedData);
        sheetUpdates.push(updateGoogleSheets(volume, sortedData));
        break;
    }
  }

  await Promise.all(sheetUpdates);

  if (reportType === 'all' || reportType === 'google-sheets') {
    const sheetGids = await fetchGoogleSheetGids();
    updateReadmeMetrics(generateVolumeMetrics(data, sheetGids));
  }
}

export { formatCSVDataset } from './csv.ts';
export {
  fetchGoogleSheetGids,
  generateCSV,
  generateJSON,
  generateVolumeMetrics,
  updateGoogleSheets,
};
