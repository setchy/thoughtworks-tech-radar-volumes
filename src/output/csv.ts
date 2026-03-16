import { writeCSVFile } from '../data/repository';
import {
  escapeDescriptionHTML,
  getStatus,
  getVolumeFileName,
} from '../operations/utils';
import { CSV_HEADERS, FILES } from '../shared/constants';
import type { BlipTimelineEntry } from '../shared/types';

export function formatCSVDataset(data: BlipTimelineEntry[]) {
  return data.map((blip) => [
    blip.name,
    blip.ring,
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

  console.log('Creating CSV file', filename);

  writeCSVFile(filename, csvData);
}
