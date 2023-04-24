import { JSDOM } from 'jsdom';

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

export function getQuadrantNameFromBlipDOM(dom: JSDOM): string {
    const cssClass = 'cmp-blip-timeline__item--ring';

    const quadrantDiv = dom.window.document.querySelector(`div.${cssClass}`);
    return (
        quadrantDiv?.classList
            .toString()
            .replace(cssClass, '')
            .trim()
            .toLowerCase() || ''
    );
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
