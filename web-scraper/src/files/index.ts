import fs from 'fs';
import _ from 'lodash';
import {
    CSV_HEADERS,
    FILES,
    QUADRANT_SORT_ORDER,
    RING_SORT_ORDER,
    VOLUME_PUBLICATION_DATES,
} from '../common/constants';
import { escapeDescriptionHTML } from './utils';

function generateVolumes() {
    const data = JSON.parse(fs.readFileSync(FILES.DATA.MASTER).toString());

    const groupedByVolumes = _.groupBy(data, 'volume');

    _.forEach(groupedByVolumes, (data, volume) => {
        const sortedData = _.orderBy(data, [
            (entry) => _.indexOf(QUADRANT_SORT_ORDER, entry.quadrant),
            (entry) => _.indexOf(RING_SORT_ORDER, entry.ring),
            (entry) => entry.name.toLowerCase(),
        ]);

        generateCSV(volume, sortedData);

        generateJSON(volume, sortedData);
    });
}

function generateCSV(volume: string, volumeData: any[]) {
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
        '../' + csvFilename,
        CSV_HEADERS.join(',') + '\n' + csvData.join('\n'),
    );
}

function generateJSON(volume: string, volumeData: any[]) {
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
    fs.writeFileSync('../' + jsonFilename, JSON.stringify(jsonData, null, 4));
}

function getVolumeFileName(volume: string) {
    return `${FILES.VOLUMES.FILE_PREFIX} ${getPaddedVolumeNumber(
        volume,
    )} (${getVolumePublicationDate(volume)})`;
}

function getPaddedVolumeNumber(volume: string) {
    return volume.padStart(2, '0');
}

function getVolumePublicationDate(volume: string) {
    const volumeBaseZero = parseInt(volume) - 1;

    return VOLUME_PUBLICATION_DATES[volumeBaseZero];
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

generateVolumes();
