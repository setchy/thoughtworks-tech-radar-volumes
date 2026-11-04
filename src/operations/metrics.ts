import countBy from 'lodash/countBy.js';
import groupBy from 'lodash/groupBy.js';

import type { Quadrant, Ring } from '../shared/constants.ts';
import {
  canonicalizeRingName,
  FILES,
  QUADRANT_NAMES,
  RING_NAMES,
} from '../shared/constants.ts';
import type {
  BlipTimelineEntry,
  VolumeMetrics,
  VolumeStatusMetrics,
} from '../shared/types.ts';

import {
  getStatus,
  getVolumeFileName,
  getVolumePublicationDate,
} from './utils.ts';

/**
 * Summarizes the master dataset into derived per-volume metrics.
 *
 * Statuses are mutually exclusive (new, moved in, moved out, no change), as are
 * ring and quadrant counts, so each set sums to the volume total.
 */
export function summarizeVolumeMetrics(
  entries: BlipTimelineEntry[],
): VolumeMetrics[] {
  const groupedByVolume = groupBy(entries, (entry) => String(entry.volume));

  return Object.entries(groupedByVolume)
    .map(([volume, volumeEntries]) => ({
      volume: Number.parseInt(volume, 10),
      entries: volumeEntries,
    }))
    .sort((a, b) => a.volume - b.volume)
    .map(({ volume, entries: volumeEntries }) => {
      const statusCounts = countBy(volumeEntries, getStatus);
      const status: VolumeStatusMetrics = {
        new: statusCounts.new ?? 0,
        movedIn: statusCounts['moved in'] ?? 0,
        movedOut: statusCounts['moved out'] ?? 0,
        noChange: statusCounts['no change'] ?? 0,
      };

      const ringCounts = countBy(volumeEntries, (entry) =>
        canonicalizeRingName(entry.ring),
      );
      const rings = Object.fromEntries(
        RING_NAMES.map((ring) => [ring, ringCounts[ring] ?? 0]),
      ) as Record<Ring, number>;

      const quadrantCounts = countBy(volumeEntries, (entry) => entry.quadrant);
      const quadrants = Object.fromEntries(
        QUADRANT_NAMES.map((quadrant) => [
          quadrant,
          quadrantCounts[quadrant] ?? 0,
        ]),
      ) as Record<Quadrant, number>;

      const filename = getVolumeFileName(String(volume));

      return {
        volume,
        publishedDate: getVolumePublicationDate(String(volume)),
        total: volumeEntries.length,
        status,
        rings,
        quadrants,
        files: {
          csv: `${FILES.VOLUMES.FOLDER}/csv/${filename}.csv`,
          json: `${FILES.VOLUMES.FOLDER}/json/${filename}.json`,
        },
      };
    });
}
