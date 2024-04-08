import _ from 'lodash';
import {
  CSV_HEADERS,
  FILES,
  QUADRANT_SORT_ORDER,
  RING_SORT_ORDER,
} from '../common/constants';
import type { BlipTimelineEntry } from '../types';
import { readJSONFile, writeCSVFile, writeJSONFile } from '../utils';
import { escapeDescriptionHTML } from './utils';
import { getStatus, getVolumeFileName } from './utils';

export function generateVolumes(reportType: 'all' | 'csv' | 'json') {
  const data = readJSONFile<BlipTimelineEntry[]>(FILES.DATA.MASTER);

  const groupedByVolumes = _.groupBy(data, 'volume');

  _.forEach(groupedByVolumes, (data, volume) => {
    const sortedData = _.orderBy(data, [
      (entry) => _.indexOf(QUADRANT_SORT_ORDER, entry.quadrant),
      (entry) => _.indexOf(RING_SORT_ORDER, entry.ring),
      (entry) => entry.name.toLowerCase(),
    ]);

    switch (reportType) {
      case 'csv':
        generateCSV(volume, sortedData);
        break;
      case 'json':
        generateJSON(volume, sortedData);
        break;
      default:
        generateCSV(volume, sortedData);
        generateJSON(volume, sortedData);
        break;
    }
  });
}

function generateCSV(volume: string, volumeData: BlipTimelineEntry[]) {
  const data = volumeData.map((row) => [
    row.name,
    row.ring,
    row.quadrant,
    row.isNew.toString().toUpperCase(),
    getStatus(row),
    escapeDescriptionHTML(row.descriptionHtml),
  ]);

  const filename = `${FILES.VOLUMES.FOLDER}/csv/${getVolumeFileName(
    volume,
  )}.csv`;

  console.log('Creating CSV file', filename);

  writeCSVFile(filename, CSV_HEADERS, data);
}

function generateJSON(volume: string, volumeData: BlipTimelineEntry[]) {
  const data = volumeData.map((row) => ({
    name: row.name,
    ring: row.ring,
    quadrant: row.quadrant,
    isNew: row.isNew.toString().toUpperCase(),
    status: getStatus(row),
    description: escapeDescriptionHTML(row.descriptionHtml),
  }));

  const filename = `${FILES.VOLUMES.FOLDER}/json/${getVolumeFileName(
    volume,
  )}.json`;
  console.log('Creating JSON file', filename);
  writeJSONFile(filename, data);
}
