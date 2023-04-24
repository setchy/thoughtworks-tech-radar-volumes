import fs from 'fs';
import _ from 'lodash';
import {
    CSV_HEADERS,
    FILES,
    QUADRANT_SORT_ORDER,
    RING_SORT_ORDER,
} from './constants';
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
                row.hasMovedIn.toString().toUpperCase(),
                row.hasMovedOut.toString().toUpperCase(),
                escapeDescriptionHTML(row.descriptionHtml),
            ].join(','),
        );

        console.log('Creating CSV file', `temp/Volume ${volume}.csv`);
        fs.writeFileSync(
            `${FILES.TEMP}Volume ${volume}.csv`,
            CSV_HEADERS.join(',') + '\n' + csvData.join('\n'),
        );
    });
}

generateVolumeCSVs();
