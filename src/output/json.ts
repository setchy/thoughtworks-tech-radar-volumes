import { FILES } from '../shared/constants.ts';
import { logger } from '../shared/logger.ts';
import type { BlipTimelineEntry } from '../shared/types.ts';

import { writeJSONFile } from '../data/repository.ts';
import {
  escapeDescriptionHTML,
  getStatus,
  getVolumeFileName,
} from '../operations/utils.ts';

export function generateJSON(volume: string, volumeData: BlipTimelineEntry[]) {
  const data = volumeData.map((row) => ({
    name: row.name,
    ring: row.ring,
    quadrant: row.quadrant,
    isNew: row.isNew.toString().toUpperCase(),
    status: getStatus(row),
    description: escapeDescriptionHTML(row.descriptionHtml),
    relatedBlips: row.relatedBlips,
  }));

  const filename = `${FILES.VOLUMES.FOLDER}/json/${getVolumeFileName(volume)}.json`;
  logger.info('Creating JSON file', filename);
  writeJSONFile(filename, data);
}
