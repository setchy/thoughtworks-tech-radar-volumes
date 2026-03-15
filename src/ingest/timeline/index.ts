import { exit } from 'node:process';

import { load } from 'cheerio';
import _ from 'lodash';

import { readJSONFile, writeJSONFile } from '../../data/repository';
import {
  FILES,
  QUADRANT_SORT_ORDER,
  RING_SORT_ORDER,
} from '../../shared/constants';
import type { BlipTimelineEntry, MasterData } from '../../shared/types';
import {
  getDescriptionHTMLFromBlipDOM,
  getPublishedDateFromBlipDOM,
  getQuadrantNameFromPath,
  getRingNameFromBlipDOM,
  getVolumeNameFromDate,
} from './utils';

export async function generateMasterData() {
  const masterData: MasterData = {
    blipEntries: [],
  };

  const radarLinks = readJSONFile<string[]>(FILES.DATA.LINKS);

  console.log(
    `Commencing processing of ${radarLinks.length} blip timelines...`,
  );

  for (const [index, link] of radarLinks.entries()) {
    console.log(
      `${index + 1} of ${radarLinks.length}: Extracting blip timeline from ${link}`,
    );

    const blipMasterData: MasterData = await extractBlipTimeline(link);
    masterData.blipEntries.push(...blipMasterData.blipEntries);
  }

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

  const response = await fetch(blipURL);

  if (response.status === 403) {
    console.error(
      'Encountered HTTP 403 Forbidden: Cloudflare has rate limited us...',
    );
    exit(1);
  }

  const html = await response.text();

  const $ = load(html);

  const blipMasterData: MasterData = { blipEntries: [] };

  const timelineNodes = $('div[blip="blip"]');
  const timelineEntries: string[] = timelineNodes
    .toArray()
    .map((el) => $(el).html() || '');

  const blipName = (
    $('.hero-banner__overlay__container__title').text() || ''
  ).trim();

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
  const publishedDate = getPublishedDateFromBlipDOM(blipPublicationHtml);
  const volume = getVolumeNameFromDate(publishedDate);
  const quadrant = getQuadrantNameFromPath(path);
  const ring = getRingNameFromBlipDOM(blipPublicationHtml);
  const descriptionHtml = getDescriptionHTMLFromBlipDOM(blipPublicationHtml);

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
