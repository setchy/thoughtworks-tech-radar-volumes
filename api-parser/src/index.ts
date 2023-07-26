import {
    FILES,
    CSV_HEADERS,
    URLS,
    QUADRANT_SORT_ORDER,
    RING_SORT_ORDER,
} from './constants';
import axios from 'axios';
import { RadarBlip, RadarPublication } from './types';
import _ from 'lodash';
import fs from 'fs';
import { calculateBlipStatus, escapeDescriptionHTML, isNewBlip } from './utils';

async function generateCSVs() {
    try {
        const publications = (
            await axios.get<RadarPublication[]>(URLS.SEARCH_API)
        ).data;

        console.log(publications);

        let volumeNumber = 1;

        for (const publication of publications) {
            const publicationDate = new Date(publication.date);
            const publicationDateFormatted = publicationDate.toLocaleDateString(
                'default',
                {
                    year: 'numeric',
                    month: 'short',
                },
            );

            const blips = publication.blips;

            // Confirm that the blips are sorted
            const sortedBlips = _.orderBy(blips, [
                (blip: RadarBlip) =>
                    _.indexOf(QUADRANT_SORT_ORDER, blip.quadrant.toLowerCase()),
                (blip: RadarBlip) =>
                    _.indexOf(RING_SORT_ORDER, blip.ring.toLowerCase()),
                (blip: RadarBlip) => blip.name.toLowerCase(),
            ]);

            // TODO - loop over sortedBlips and backfill any missing attributes for older publications.

            const csvData = sortedBlips.map((blip) =>
                [
                    blip.name,
                    blip.ring,
                    blip.quadrant,
                    isNewBlip(blip.blip_status),
                    calculateBlipStatus(blip.blip_status),
                    escapeDescriptionHTML(blip.description),
                ].join(','),
            );

            const filename = `${FILES.VOLUMES.FOLDER}/${FILES.VOLUMES.FILE_PREFIX} ${volumeNumber} (${publicationDateFormatted}).csv`;
            console.log('Creating CSV file', filename);
            fs.writeFileSync(
                filename,
                CSV_HEADERS.join(',') + '\n' + csvData.join('\n'),
            );

            volumeNumber += 1;
        }
    } catch (error) {
        console.error(`Failed to fetch ${URLS.SEARCH_API}: ${error}`);
    }
}

generateCSVs();
