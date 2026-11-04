import { describe, expect, it } from 'vitest';

import type { BlipTimelineEntry } from '../src/shared/types.ts';

import { summarizeVolumeMetrics } from '../src/operations/metrics.ts';

function makeEntry(overrides: Partial<BlipTimelineEntry>): BlipTimelineEntry {
  return {
    name: 'Blip',
    quadrant: 'tools',
    ring: 'adopt',
    volume: 1,
    publishedDate: 'Jan 2010',
    descriptionHtml: '',
    isNew: false,
    hasMovedIn: false,
    hasMovedOut: false,
    relatedBlips: [],
    ...overrides,
  };
}

describe('summarizeVolumeMetrics', () => {
  it('summarizes status, ring and quadrant counts per volume', () => {
    const metrics = summarizeVolumeMetrics([
      makeEntry({
        volume: 1,
        isNew: true,
        ring: 'adopt',
        quadrant: 'techniques',
      }),
      makeEntry({
        volume: 1,
        hasMovedIn: true,
        ring: 'hold',
        quadrant: 'platforms',
      }),
      makeEntry({
        volume: 1,
        hasMovedOut: true,
        ring: 'assess',
        quadrant: 'tools',
      }),
      makeEntry({
        volume: 1,
        ring: 'trial',
        quadrant: 'languages-and-frameworks',
      }),
      makeEntry({ volume: 2, isNew: true, ring: 'caution', quadrant: 'tools' }),
    ]);

    expect(metrics.map((m) => m.volume)).toEqual([1, 2]);

    const [volumeOne, volumeTwo] = metrics;
    expect(volumeOne).toMatchObject({
      volume: 1,
      publishedDate: 'Jan 2010',
      total: 4,
      status: { new: 1, movedIn: 1, movedOut: 1, noChange: 1 },
      rings: { adopt: 1, trial: 1, assess: 1, caution: 1 },
      quadrants: {
        techniques: 1,
        platforms: 1,
        tools: 1,
        'languages-and-frameworks': 1,
      },
      files: {
        csv: 'volumes/csv/Thoughtworks Technology Radar Volume 01 (Jan 2010).csv',
        json: 'volumes/json/Thoughtworks Technology Radar Volume 01 (Jan 2010).json',
      },
    });

    expect(volumeTwo).toMatchObject({
      volume: 2,
      publishedDate: 'Apr 2010',
      total: 1,
      status: { new: 1, movedIn: 0, movedOut: 0, noChange: 0 },
      rings: { adopt: 0, trial: 0, assess: 0, caution: 1 },
      quadrants: {
        techniques: 0,
        platforms: 0,
        tools: 1,
        'languages-and-frameworks': 0,
      },
      files: {
        csv: 'volumes/csv/Thoughtworks Technology Radar Volume 02 (Apr 2010).csv',
        json: 'volumes/json/Thoughtworks Technology Radar Volume 02 (Apr 2010).json',
      },
    });
  });

  it('keeps all metric dimensions summing to the volume total', () => {
    const [volume] = summarizeVolumeMetrics([
      makeEntry({ volume: 1, isNew: true, ring: 'adopt', quadrant: 'tools' }),
      makeEntry({
        volume: 1,
        hasMovedIn: true,
        ring: 'trial',
        quadrant: 'platforms',
      }),
      makeEntry({
        volume: 1,
        hasMovedOut: true,
        ring: 'assess',
        quadrant: 'techniques',
      }),
      makeEntry({
        volume: 1,
        ring: 'hold',
        quadrant: 'languages-and-frameworks',
      }),
    ]);

    const statusTotal = Object.values(volume.status).reduce(
      (sum, count) => sum + count,
      0,
    );
    const ringTotal = Object.values(volume.rings).reduce(
      (sum, count) => sum + count,
      0,
    );
    const quadrantTotal = Object.values(volume.quadrants).reduce(
      (sum, count) => sum + count,
      0,
    );

    expect(statusTotal).toBe(volume.total);
    expect(ringTotal).toBe(volume.total);
    expect(quadrantTotal).toBe(volume.total);
  });

  it('returns an empty list when there are no entries', () => {
    expect(summarizeVolumeMetrics([])).toEqual([]);
  });
});
