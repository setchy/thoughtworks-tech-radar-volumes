import { writeJSONFile } from '../data/repository';
import {
  escapeDescriptionHTML,
  getStatus,
  getVolumeFileName,
} from '../operations/utils';
import { FILES } from '../shared/constants';
import type { BlipTimelineEntry } from '../shared/types';

export function generateJSON(volume: string, volumeData: BlipTimelineEntry[]) {
  const data = volumeData.map((row) => ({
    name: row.name,
    ring: row.ring,
    quadrant: row.quadrant,
    isNew: row.isNew.toString().toUpperCase(),
    status: getStatus(row),
    description: escapeDescriptionHTML(row.descriptionHtml),
  }));

  const filename = `${FILES.VOLUMES.FOLDER}/json/${getVolumeFileName(volume)}.json`;
  console.log('Creating JSON file', filename);
  writeJSONFile(filename, data);
}
