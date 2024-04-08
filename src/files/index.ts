import fs from 'node:fs';
import _ from 'lodash';
import {
  CSV_HEADERS,
  FILES,
  QUADRANT_SORT_ORDER,
  RING_SORT_ORDER,
} from '../common/constants';
import type { BlipTimelineEntry } from '../types';
import { escapeDescriptionHTML } from './utils';
import { getStatus, getVolumeFileName } from './utils';

export function generateVolumes(reportType: 'all' | 'csv' | 'json') {
  const data: BlipTimelineEntry[] = JSON.parse(
    fs.readFileSync(FILES.DATA.MASTER).toString(),
  );

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
  const csvData = volumeData.map((row) =>
    [
      row.name,
      row.ring,
      row.quadrant,
      row.isNew.toString().toUpperCase(),
      getStatus(row),
      escapeDescriptionHTML(row.descriptionHtml),
    ].join(','),
  );

  const csvFilename = `${FILES.VOLUMES.FOLDER}/csv/${getVolumeFileName(
    volume,
  )}.csv`;
  console.log('Creating CSV file', csvFilename);
  fs.writeFileSync(
    csvFilename,
    `${CSV_HEADERS.join(',')}\n${csvData.join('\n')}`,
  );
}

function generateJSON(volume: string, volumeData: BlipTimelineEntry[]) {
  const jsonData = volumeData.map((row) => ({
    name: row.name,
    ring: row.ring,
    quadrant: row.quadrant,
    isNew: row.isNew.toString().toUpperCase(),
    status: getStatus(row),
    description: escapeDescriptionHTML(row.descriptionHtml),
  }));

  const jsonFilename = `${FILES.VOLUMES.FOLDER}/json/${getVolumeFileName(
    volume,
  )}.json`;
  console.log('Creating JSON file', jsonFilename);
  fs.writeFileSync(jsonFilename, JSON.stringify(jsonData, null, 4));
}
