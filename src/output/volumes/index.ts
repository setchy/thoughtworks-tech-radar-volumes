import _ from 'lodash';

import { readJSONFile } from '../../data/repository';
import {
  FILES,
  QUADRANT_SORT_ORDER,
  RING_SORT_ORDER,
} from '../../shared/constants';
import type { BlipTimelineEntry, ReportType } from '../../shared/types';
import { formatCSVDataset, generateCSV } from './csv';
import { updateGoogleSheets } from './googleSheets';
import { generateJSON } from './json';

export function generateVolumes(reportType: ReportType) {
  const data = readJSONFile<BlipTimelineEntry[]>(FILES.DATA.MASTER);

  const groupedByVolumes = _.groupBy(data, 'volume');

  _.forEach(groupedByVolumes, (dataChunk, volume) => {
    const sortedData = _.orderBy(dataChunk, [
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
