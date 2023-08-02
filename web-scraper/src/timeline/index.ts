import puppeteer from 'puppeteer';
import { JSDOM } from 'jsdom';
import { parse } from 'url';
import { BlipTimelineEntry, MasterData } from '../types';
import _ from 'lodash';
import { RING_SORT_ORDER } from '../common/constants';
import {
    getVolumeNameFromDate,
    getBlipNameFromDOM,
    getDescriptionHTMLFromBlipDOM,
    getPublishedDateFromBlipDOM,
    getQuadrantNameFromPath,
    getRingNameFromBlipDOM,
} from './utils';

export async function extractBlipTimeline(
    blipURL: string,
): Promise<MasterData> {
    const { path } = parse(blipURL);

    const browser = await puppeteer.launch({ headless: 'new' });

    const page = await browser.newPage();
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

        blipMasterData.blipEntries.push(blipTimelineEntry);
    });

    // Reverse the order so that it's easier to calculate the isNew, hasMovedIn, hasMovedOut boolean values
    blipMasterData.blipEntries = _.reverse(blipMasterData.blipEntries);

    calculateBlipMovements(blipMasterData);

    return blipMasterData;
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
