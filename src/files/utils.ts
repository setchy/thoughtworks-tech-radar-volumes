import { FILES, VOLUME_PUBLICATION_DATES } from '../common/constants';

export function escapeDescriptionHTML(description: string): string {
    const escapedDescription = description
        .replace(/"/g, '""')
        .replace(/\n/g, '<br>');

    return `"${escapedDescription}"`;
}
export function getVolumeFileName(volume: string) {
    return `${FILES.VOLUMES.FILE_PREFIX} ${getPaddedVolumeNumber(
        volume
    )} (${getVolumePublicationDate(volume)})`;
}
function getPaddedVolumeNumber(volume: string) {
    return volume.padStart(2, '0');
}
function getVolumePublicationDate(volume: string) {
    const volumeBaseZero = parseInt(volume) - 1;

    return VOLUME_PUBLICATION_DATES[volumeBaseZero];
}
export function getStatus(row: any) {
    if (row.isNew) {
        return 'new';
    } else if (row.hasMovedIn) {
        return 'moved in';
    } else if (row.hasMovedOut) {
        return 'moved out';
    } else {
        return 'no change';
    }
}
