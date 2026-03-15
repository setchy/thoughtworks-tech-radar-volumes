import _ from 'lodash';
import type { BlipTimelineEntry, ReportType } from '../../types';
import { QUADRANT_SORT_ORDER, RING_SORT_ORDER, FILES } from '../../common/constants';
import { readJSONFile } from '../../utils';
import { generateCSV, generateJSON, updateGoogleSheets, formatCSVDataset } from './csv';

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

export { generateCSV };
export { generateJSON };
export { updateGoogleSheets };
export { formatCSVDataset };
