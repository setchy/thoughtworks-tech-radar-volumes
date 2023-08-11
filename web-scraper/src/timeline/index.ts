import { JSDOM } from 'jsdom';
import { parse } from 'url';
import { BlipTimelineEntry, MasterData } from '../types';
import _ from 'lodash';
import {
    FILES,
    QUADRANT_SORT_ORDER,
    RING_SORT_ORDER,
} from '../common/constants';
import {
    getVolumeNameFromDate,
    getBlipNameFromDOM,
    getDescriptionHTMLFromBlipDOM,
    getPublishedDateFromBlipDOM,
    getQuadrantNameFromPath,
    getRingNameFromBlipDOM,
} from './utils';
import puppeteer, { Page } from 'puppeteer';

import fs from 'fs';

import { getShortPath } from './../common/utils';

let page: Page;

async function generateMasterData() {
    const browser = await puppeteer.launch({ headless: 'new' });
    page = await browser.newPage();

    const masterData: MasterData = {
        blipEntries: [],
    };

    const radarLinks = JSON.parse(fs.readFileSync(FILES.DATA.LINKS, 'utf8'));

    console.log(
        `Commencing processing of ${radarLinks.length} blip timelines...`,
    );

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

export async function extractBlipTimeline(
    blipURL: string,
): Promise<MasterData> {
    const { path } = parse(blipURL);

    await page.goto(blipURL);

    const blipMasterData: MasterData = {
        blipEntries: [],
    };

    await page.waitForSelector('div[blip="blip"]');

    const timelineEntries = await page.$$eval(
        'div[blip="blip"]',
        (publications) =>
            publications.map((publication) => publication.innerHTML),
    );

    timelineEntries.forEach((blipPublication) => {
        const blipTimelineEntry: BlipTimelineEntry =
            createBlipTimelineEntryFromPublication(blipPublication, path);

        blipMasterData.blipEntries.push(blipTimelineEntry);
    });

    // Reverse the order so that it's easier to calculate the isNew, hasMovedIn, hasMovedOut boolean values
    blipMasterData.blipEntries = _.reverse(blipMasterData.blipEntries);

    calculateBlipMovements(blipMasterData);

    return blipMasterData;
}

function createBlipTimelineEntryFromPublication(
    blipPublication: string,
    path: string | null,
) {
    const blipUpdateDOM = new JSDOM(blipPublication);

    const name = getBlipNameFromDOM(blipUpdateDOM);
    const publishedDate = getPublishedDateFromBlipDOM(blipUpdateDOM);
    const volume = getVolumeNameFromDate(publishedDate);
    const quadrant = getQuadrantNameFromPath(path);
    const ring = getRingNameFromBlipDOM(blipUpdateDOM);
    const descriptionHtml = getDescriptionHTMLFromBlipDOM(blipUpdateDOM);

    const blipTimelineEntry: BlipTimelineEntry = {
        name: name,
        quadrant: quadrant,
        ring: ring,
        volume: volume,
        publishedDate: publishedDate,
        descriptionHtml: descriptionHtml,

        // Default these to false - will be reset after calculating movements
        isNew: false,
        hasMovedIn: false,
        hasMovedOut: false,
    };
    return blipTimelineEntry;
}

function calculateBlipMovements(blipMasterData: MasterData) {
    for (let i = 0; i < blipMasterData.blipEntries.length; i++) {
        if (i === 0) {
            blipMasterData.blipEntries[i].isNew = true;
        }

        if (i > 0) {
            const currentRingIndex = _.indexOf(
                RING_SORT_ORDER,
                blipMasterData.blipEntries[i].ring,
            );
            const previousRingIndex = _.indexOf(
                RING_SORT_ORDER,
                blipMasterData.blipEntries[i - 1].ring,
            );

            if (currentRingIndex > previousRingIndex) {
                blipMasterData.blipEntries[i].hasMovedOut = true;
            } else if (currentRingIndex < previousRingIndex) {
                blipMasterData.blipEntries[i].hasMovedIn = true;
            }
        }
    }
}

generateMasterData();
