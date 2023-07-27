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

async function generateCSVs() {
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

            const blips = publication.blips;

            // Confirm that the blips are sorted
            const sortedBlips = _.orderBy(blips, [
                (blip: RadarBlip) =>
                    _.indexOf(QUADRANT_SORT_ORDER, blip.quadrant.toLowerCase()),
                (blip: RadarBlip) =>
                    _.indexOf(RING_SORT_ORDER, blip.ring.toLowerCase()),
                (blip: RadarBlip) => blip.name.toLowerCase(),
            ]);

            const csvData = sortedBlips.map((blip) => {
                const movement = calculateBlipStatus(
                    publications,
                    volume,
                    blip,
                );

                return [
                    blip.name,
                    blip.ring.toLowerCase(),
                    blip.quadrant.toLowerCase(),
                    isNewBlip(movement),
                    movement,
                    escapeDescriptionHTML(blip.description),
                ].join(',');
            });

            // const filename = `../${FILES.VOLUMES.FOLDER}/${FILES.VOLUMES.FILE_PREFIX} ${volume + 1} (${publicationDate}).csv`;
            const filename = `../${FILES.VOLUMES.FOLDER}/${
                FILES.VOLUMES.FILE_PREFIX
            } ${volume + 1}.csv`;
            console.log('Creating CSV file', filename);
            fs.writeFileSync(
                filename,
                CSV_HEADERS.join(',') + '\n' + csvData.join('\n'),
            );
        });
    } catch (error) {
        console.error(`Failed to fetch ${URLS.SEARCH_API}: ${error}`);
    }
}

generateCSVs();
