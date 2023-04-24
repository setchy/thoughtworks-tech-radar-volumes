import { URLS, VOLUME_PUBLICATION_DATES } from './constants';

export function escapeDescriptionHTML(description: string): string {
    return `"${description.replace(/"/g, '""')}"`;
}

export function constructFullURL(path: string): string {
    return `${URLS.BASE}${path}`;
}

export function getVolumeNameFromDate(publishedDate: string): number {
    return (
        VOLUME_PUBLICATION_DATES.findIndex(
            (volumePublicationDate) => volumePublicationDate === publishedDate,
        ) + 1
    );
}

export function getShortPath(url: string): string {
    return url.replace(URLS.RADAR, '');
}
