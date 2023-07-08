import fs from 'fs';
import _ from 'lodash';
import {
    CSV_HEADERS,
    FILES,
    QUADRANT_SORT_ORDER,
    RING_SORT_ORDER,
} from '../common/constants';
import { escapeDescriptionHTML } from './utils';

function generateVolumeCSVs() {
    const data = JSON.parse(fs.readFileSync(FILES.DATA.MASTER).toString());

    console.log(data);

    const groupedByVolumes = _.groupBy(data, 'volume');

    _.forEach(groupedByVolumes, (data, volume) => {
        const sortedData = _.orderBy(data, [
            (entry) => _.indexOf(QUADRANT_SORT_ORDER, entry.quadrant),
            (entry) => _.indexOf(RING_SORT_ORDER, entry.ring),
            'name',
        ]);

        const csvData = sortedData.map((row) =>
            [
                row.name,
                row.ring,
                row.quadrant,
                row.isNew.toString().toUpperCase(),
                getStatus(row),
                escapeDescriptionHTML(row.descriptionHtml),
            ].join(','),
        );

        const filename = `${FILES.VOLUMES.FOLDER}/${FILES.VOLUMES.FILE_PREFIX} ${volume}.csv`;
        console.log('Creating CSV file', filename);
        fs.writeFileSync(
            filename,
            CSV_HEADERS.join(',') + '\n' + csvData.join('\n'),
        );
    });
}

function getStatus(row: any) {
    if (row.isNew) {
        return 'new';
    } else if (row.hasMovedIn) {
        return 'moved in';
    } else if (row.hasMovedOut) {
        return 'moved out';
    } else {
        return 'no change';
    }
}

generateVolumeCSVs();
