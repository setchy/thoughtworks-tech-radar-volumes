import { load } from 'cheerio';

import {
  NOT_FOUND_VOLUME_NUMBER,
  VOLUME_PUBLICATION_DATES,
} from '../../shared/constants';
import { SELECTORS } from './selectors';

export function getRingNameFromBlipDOM(html: string): string {
  const $ = load(html);
  const quadrantDiv = $(`div.${SELECTORS.TIMELINE_ENTRY.RING}`).first();
  const spanText = quadrantDiv.find('span').first().text() || '';

  return spanText.trim().toLowerCase();
}

// Format is: /radar/quadrant-name/blip-name
export function getQuadrantNameFromPath(path: string | null): string {
  if (path) {
    return path.split('/')[2].toLowerCase();
  }

  return 'unknown';
}

export function getPublishedDateFromBlipDOM(html: string): string {
  const $ = load(html);

  return (
    $(`div.${SELECTORS.TIMELINE_ENTRY.TIME}`).first().text() || ''
  ).trim();
}

export function getDescriptionHTMLFromBlipDOM(html: string): string {
  const $ = load(html);

  return (
    $(`div.${SELECTORS.TIMELINE_ENTRY.DESCRIPTION}`).first().html() || ''
  ).trim();
}

export function getVolumeNameFromDate(publishedDate: string): number {
  const index = VOLUME_PUBLICATION_DATES.indexOf(publishedDate);

  if (index < 0) {
    console.error(
      'ERROR: Publication volume not found in "VOLUME_PUBLICATION_DATES".  Please update the array with the new date->volume mappings',
    );
    return NOT_FOUND_VOLUME_NUMBER;
  }

  return index + 1;
}

export function getRelatedBlipsFromBlipDOM(html: string): string[] {
  const $ = load(html);
  const relatedBlips: string[] = [];

  $(
    `${SELECTORS.RELATED_BLIPS.CONTAINER} > ${SELECTORS.RELATED_BLIPS.ITEM} > ${SELECTORS.RELATED_BLIPS.LINK}`,
  ).each((_, el) => {
    const ariaLabel = $(el).attr('aria-label') || '';
    const blipName = ariaLabel.split(',')[0]?.trim();
    if (blipName) {
      relatedBlips.push(blipName);
    }
  });

  return relatedBlips;
}
