import { JSDOM } from 'jsdom';
import {
    NOT_FOUND_VOLUME_NUMBER,
    VOLUME_PUBLICATION_DATES,
} from '../common/constants';

export function getBlipNameFromDOM(dom: JSDOM): string {
    const cssClass = 'hero-banner__overlay__container__title';

    return (
        dom.window.document.querySelector(`h1.${cssClass}`)?.innerHTML.trim() ||
        ''
    );
}

export function getRingNameFromBlipDOM(dom: JSDOM): string {
    const cssClass = 'cmp-blip-timeline__item--ring';

    const quadrantDiv = dom.window.document.querySelector(`div.${cssClass}`);
    const quadrantDOM = new JSDOM(quadrantDiv?.innerHTML || '');

    return (
        quadrantDOM.window.document
            .querySelector(`span`)
            ?.innerHTML.trim()
            .toLowerCase() || ''
    );
}

// Format is: /radar/quadrant-name/blip-name
export function getQuadrantNameFromPath(path: string | null): string {
    if (path) {
        return path.split('/')[2].toLowerCase();
    }

    return 'unknown';
}

export function getPublishedDateFromBlipDOM(dom: JSDOM): string {
    const cssClass = 'cmp-blip-timeline__item--time';

    return (
        dom.window.document
            .querySelector(`div.${cssClass}`)
            ?.innerHTML.trim() || ''
    );
}

export function getDescriptionHTMLFromBlipDOM(dom: JSDOM): string {
    const cssClass = 'blip-timeline-description';

    return (
        dom.window.document
            .querySelector(`div.${cssClass}`)
            ?.innerHTML.trim() || ''
    );
}

export function getVolumeNameFromDate(publishedDate: string): number {
    const index = VOLUME_PUBLICATION_DATES.findIndex(
        (volumePublicationDate) => volumePublicationDate === publishedDate,
    );

    if (index < 0) {
        console.error(
            'ERROR: Publication volume not found in "VOLUME_PUBLICATION_DATES".  Please update the array with the new date->volume mappings',
        );
        return NOT_FOUND_VOLUME_NUMBER;
    }

    return index + 1;
}
