import { MasterData } from './types';
import fs from 'fs';
import _ from 'lodash';
import {
    FILES,
    QUADRANT_SORT_ORDER,
    RING_SORT_ORDER,
} from './common/constants';
import { getShortPath } from './common/utils';
import { extractRadarLinks } from './links';
import { extractBlipTimeline } from './timeline';

async function generateMasterData() {
    const masterData: MasterData = {
        blipEntries: [],
    };

    // const radarLinks = await extractRadarLinks();
    const radarLinks = JSON.parse(fs.readFileSync(FILES.DATA.LINKS, 'utf8'));

    console.log(`Found ${radarLinks.length} radar links`);

    for (const [index, link] of radarLinks.entries()) {
        console.log(
            `${index + 1} of ${
                radarLinks.length
            }: Extracting blip timeline from ${getShortPath(link)}`,
        );

        const blipMasterData: MasterData = await extractBlipTimeline(link);
        masterData.blipEntries.push(...blipMasterData.blipEntries);

        // Add an artificial delay to reduce chance of CloudFront rate limiting
        await new Promise((r) => setTimeout(r, 5000));
    }

    const sortedMasterData = _.orderBy(masterData.blipEntries, [
        'volume',
        (entry) => _.indexOf(QUADRANT_SORT_ORDER, entry.quadrant),
        (entry) => _.indexOf(RING_SORT_ORDER, entry.ring),
        'name',
    ]);

    fs.writeFileSync(
        FILES.DATA.MASTER,
        JSON.stringify(sortedMasterData, null, 4),
    );
}

generateMasterData();
