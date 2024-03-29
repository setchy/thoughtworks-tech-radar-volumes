import {
    FILES,
    CSV_HEADERS,
    URLS,
    QUADRANT_SORT_ORDER,
    RING_SORT_ORDER,
} from './constants';
import axios from 'axios';
import _ from 'lodash';
import fs from 'fs';
import { calculateBlipStatus, escapeDescriptionHTML, isNewBlip } from './utils';
import type { RadarBlip, RadarPublication } from './types';

async function generateVolumes() {
    try {
        const publications = (
            await axios.get<RadarPublication[]>(URLS.SEARCH_API)
        ).data;

        fs.writeFileSync(FILES.DATA.RAW, JSON.stringify(publications, null, 4));

        publications.forEach((publication, volume) => {
            const publicationDate = new Date(
                publication.date,
            ).toLocaleDateString('default', {
                year: 'numeric',
                month: 'short',
            });

            const volumeNumber = (volume + 1).toLocaleString('en-US', {
                minimumIntegerDigits: 2,
                useGrouping: false,
            });

            const blips = publication.blips;

            // Confirm that the blips are sorted
            const sortedBlips = _.orderBy(blips, [
                (blip: RadarBlip) =>
                    _.indexOf(QUADRANT_SORT_ORDER, blip.quadrant.toLowerCase()),
                (blip: RadarBlip) =>
                    _.indexOf(RING_SORT_ORDER, blip.ring.toLowerCase()),
                (blip: RadarBlip) => blip.name.toLowerCase(),
            ]);

            createCSVs(publications, sortedBlips, volume);
            createJSONs(publications, sortedBlips, volume);
        });
    } catch (error) {
        console.error(`Failed to fetch ${URLS.SEARCH_API}: ${error}`);
    }
}

generateVolumes();

function createCSVs(
    publications: RadarPublication[],
    blips: RadarBlip[],
    volume: number,
) {
    const publicationDate = new Date(
        publications[volume].date,
    ).toLocaleDateString('default', {
        year: 'numeric',
        month: 'short',
    });

    const volumeNumber = (volume + 1).toLocaleString('en-US', {
        minimumIntegerDigits: 2,
        useGrouping: false,
    });

    const csvData = blips.map((blip) => {
        const movement = calculateBlipStatus(publications, volume, blip);

        return [
            blip.name,
            blip.ring.toLowerCase(),
            blip.quadrant.toLowerCase(),
            isNewBlip(movement),
            movement,
            escapeDescriptionHTML(blip.description),
        ].join(',');
    });

    const filename = `../${FILES.VOLUMES.CSV_FOLDER}/${FILES.VOLUMES.FILE_PREFIX} ${volumeNumber} (${publicationDate}).csv`;

    console.log('Creating CSV file', filename);
    fs.writeFileSync(
        filename,
        CSV_HEADERS.join(',') + '\n' + csvData.join('\n'),
    );
}

function createJSONs(
    publications: RadarPublication[],
    blips: RadarBlip[],
    volume: number,
) {
    const publicationDate = new Date(
        publications[volume].date,
    ).toLocaleDateString('default', {
        year: 'numeric',
        month: 'short',
    });

    const volumeNumber = (volume + 1).toLocaleString('en-US', {
        minimumIntegerDigits: 2,
        useGrouping: false,
    });

    const jsonData = blips.map((blip) => {
        const movement = calculateBlipStatus(publications, volume, blip);

        return {
            name: blip.name,
            ring: blip.ring.toLowerCase(),
            quadrant: blip.quadrant.toLowerCase(),
            isNew: isNewBlip(movement),
            status: movement,
            description: escapeDescriptionHTML(blip.description),
        };
    });

    const filename = `../${FILES.VOLUMES.JSON_FOLDER}/${FILES.VOLUMES.FILE_PREFIX} ${volumeNumber} (${publicationDate}).json`;

    fs.writeFileSync(filename, JSON.stringify(jsonData, null, 4));
}
