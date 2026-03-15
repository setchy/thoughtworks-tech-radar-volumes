import { load } from 'cheerio';

import {
  NOT_FOUND_VOLUME_NUMBER,
  VOLUME_PUBLICATION_DATES,
} from '../common/constants';

export function getRingNameFromBlipDOM(html: string): string {
  const cssClass = 'cmp-blip-timeline__item--ring';

  const $ = load(html);
  const quadrantDiv = $(`div.${cssClass}`).first();
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
  const cssClass = 'cmp-blip-timeline__item--time';
  const $ = load(html);

  return ($(`div.${cssClass}`).first().text() || '').trim();
}

export function getDescriptionHTMLFromBlipDOM(html: string): string {
  const cssClass = 'blip-timeline-description';
  const $ = load(html);

  const inner = $(`div.${cssClass}`).first().html() || '';
  return inner.trim().replace(/data-faitracker-click-bind="true"\s*/g, '');
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
