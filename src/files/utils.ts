import { FILES, VOLUME_PUBLICATION_DATES } from '../common/constants';
import type { BlipStatus, BlipTimelineEntry } from '../types';

export function escapeDescriptionHTML(description: string): string {
  const escapedDescription = description
    .replace(/"/g, '""')
    .replace(/\n/g, '<br>');

  return `"${escapedDescription}"`;
}
export function getVolumeFileName(volume: string) {
  return `${FILES.VOLUMES.FILE_PREFIX} ${getPaddedVolumeNumber(
    volume,
  )} (${getVolumePublicationDate(volume)})`;
}
function getPaddedVolumeNumber(volume: string) {
  return volume.padStart(2, '0');
}
export function getVolumePublicationDate(volume: string) {
  const volumeBaseZero = Number.parseInt(volume, 10) - 1;

  return VOLUME_PUBLICATION_DATES[volumeBaseZero];
}
export function getStatus(row: BlipTimelineEntry): BlipStatus {
  if (row.isNew) {
    return 'new';
  }

  if (row.hasMovedIn) {
    return 'moved in';
  }

  if (row.hasMovedOut) {
    return 'moved out';
  }

  return 'no change';
}
