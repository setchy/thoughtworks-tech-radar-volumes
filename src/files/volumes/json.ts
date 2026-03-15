import type { BlipTimelineEntry } from '../../types';
import { writeJSONFile } from '../../utils';
import { escapeDescriptionHTML, getStatus, getVolumeFileName } from '../utils';
import { FILES } from '../../common/constants';

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
