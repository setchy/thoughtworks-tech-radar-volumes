import {
  CSV_HEADERS,
  canonicalizeRingName,
  FILES,
} from '../shared/constants.ts';
import { logger } from '../shared/logger.ts';
import type { BlipTimelineEntry } from '../shared/types.ts';

import { writeCSVFile } from '../data/repository.ts';
import {
  escapeDescriptionHTML,
  getStatus,
  getVolumeFileName,
} from '../operations/utils.ts';

export function formatCSVDataset(data: BlipTimelineEntry[]) {
  return data.map((blip) => [
    blip.name,
    canonicalizeRingName(blip.ring),
    blip.quadrant,
    blip.isNew.toString().toUpperCase(),
    getStatus(blip),
    escapeDescriptionHTML(blip.descriptionHtml),
    blip.relatedBlips.join(';'),
  ]);
}

export function generateCSV(volume: string, volumeData: BlipTimelineEntry[]) {
  const data = formatCSVDataset(volumeData);

  const csvData = data.map((row) => row.join(','));
  csvData.unshift(CSV_HEADERS.join(','));

  const filename = `${FILES.VOLUMES.FOLDER}/csv/${getVolumeFileName(volume)}.csv`;

  logger.info('Creating CSV file', filename);

  writeCSVFile(filename, csvData);
}
