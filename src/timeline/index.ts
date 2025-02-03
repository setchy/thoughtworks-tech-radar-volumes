import { JSDOM } from 'jsdom';
import _ from 'lodash';
import puppeteer, { type Page } from 'puppeteer';
import {
  FILES,
  QUADRANT_SORT_ORDER,
  RING_SORT_ORDER,
} from '../common/constants';
import type { BlipTimelineEntry, MasterData } from '../types';
import {
  getDescriptionHTMLFromBlipDOM,
  getPublishedDateFromBlipDOM,
  getQuadrantNameFromPath,
  getRingNameFromBlipDOM,
  getVolumeNameFromDate,
} from './utils';

import { exit } from 'node:process';
import { readJSONFile, writeJSONFile } from '../utils';

let page: Page;

export async function generateMasterData() {
  const browser = await puppeteer.launch({
    headless: true,
    slowMo: 45, // To reduce chance of CloudFront rate limiting
    args: ['--no-sandbox', '--disable-setuid-sandbox'], // FIXME: workaround
  });
  page = await browser.newPage();

  const masterData: MasterData = {
    blipEntries: [],
  };

  const radarLinks = readJSONFile<string[]>(FILES.DATA.LINKS);

  console.log(
    `Commencing processing of ${radarLinks.length} blip timelines...`,
  );

  for (const [index, link] of radarLinks.entries()) {
    console.log(
      `${index + 1} of ${
        radarLinks.length
      }: Extracting blip timeline from ${link}`,
    );

    const blipMasterData: MasterData = await extractBlipTimeline(link);
    masterData.blipEntries.push(...blipMasterData.blipEntries);
  }

  browser.close();

  const sortedMasterData = _.orderBy(masterData.blipEntries, [
    'volume',
    (entry) => _.indexOf(QUADRANT_SORT_ORDER, entry.quadrant),
    (entry) => _.indexOf(RING_SORT_ORDER, entry.ring),
    'name',
  ]);

  writeJSONFile(FILES.DATA.MASTER, sortedMasterData);
}

export async function extractBlipTimeline(
  blipURL: string,
): Promise<MasterData> {
  const { pathname } = new URL(blipURL);

  const response = await page.goto(blipURL);

  if (response?.status() === 403) {
    console.error(
      'Encountered HTTP 403 Forbidden: Cloudflare has rate limited us...',
    );
    exit(1);
  }

  const blipMasterData: MasterData = {
    blipEntries: [],
  };

  await page.waitForSelector('div[blip="blip"]');

  const timelineEntries = await page.$$eval(
    'div[blip="blip"]',
    (publications) => publications.map((publication) => publication.innerHTML),
  );

  const blipNameElement = await page.$(
    '.hero-banner__overlay__container__title',
  );
  const blipName =
    (await blipNameElement?.evaluate((element) =>
      element.textContent?.trim(),
    )) || '';

  for (const blipPublicationHtml of timelineEntries) {
    const blipTimelineEntry: BlipTimelineEntry =
      createBlipTimelineEntryFromPublication(
        blipName,
        blipPublicationHtml,
        pathname,
      );

    blipMasterData.blipEntries.push(blipTimelineEntry);
  }

  // Reverse the order so that it's easier to calculate the isNew, hasMovedIn, hasMovedOut boolean values
  blipMasterData.blipEntries = _.reverse(blipMasterData.blipEntries);

  calculateBlipMovements(blipMasterData);

  return blipMasterData;
}

function createBlipTimelineEntryFromPublication(
  blipName: string,
  blipPublicationHtml: string,
  path: string | null,
) {
  const blipUpdateDOM = new JSDOM(blipPublicationHtml);

  const publishedDate = getPublishedDateFromBlipDOM(blipUpdateDOM);
  const volume = getVolumeNameFromDate(publishedDate);
  const quadrant = getQuadrantNameFromPath(path);
  const ring = getRingNameFromBlipDOM(blipUpdateDOM);
  const descriptionHtml = getDescriptionHTMLFromBlipDOM(blipUpdateDOM);

  const blipTimelineEntry: BlipTimelineEntry = {
    name: blipName,
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
