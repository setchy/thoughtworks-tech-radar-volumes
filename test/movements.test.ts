import { describe, expect, it } from 'vitest';

import type { BlipTimelineEntry, MasterData } from '../src/shared/types.ts';

import { calculateBlipMovements } from '../src/ingest/timeline/index.ts';

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

function toMaster(entries: BlipTimelineEntry[]): MasterData {
  return { blipEntries: entries };
}

describe('calculateBlipMovements', () => {
  it('marks the first appearance as new', () => {
    const data = toMaster([makeEntry({ volume: 1 }), makeEntry({ volume: 2 })]);

    calculateBlipMovements(data);

    expect(data.blipEntries[0].isNew).toBe(true);
    expect(data.blipEntries[1].isNew).toBe(false);
  });

  it('marks hasMovedIn when the ring moves inward', () => {
    // RING_SORT_ORDER: adopt(0) < trial(1) < assess(2) < caution(3)
    // Moving assess -> adopt is inward.
    const data = toMaster([
      makeEntry({ volume: 1, ring: 'assess' }),
      makeEntry({ volume: 2, ring: 'adopt' }),
    ]);

    calculateBlipMovements(data);

    expect(data.blipEntries[1].hasMovedIn).toBe(true);
    expect(data.blipEntries[1].hasMovedOut).toBe(false);
  });

  it('marks hasMovedOut when the ring moves outward', () => {
    // Moving adopt -> assess is outward.
    const data = toMaster([
      makeEntry({ volume: 1, ring: 'adopt' }),
      makeEntry({ volume: 2, ring: 'assess' }),
    ]);

    calculateBlipMovements(data);

    expect(data.blipEntries[1].hasMovedOut).toBe(true);
    expect(data.blipEntries[1].hasMovedIn).toBe(false);
  });

  it('does not flag movement for an unchanged ring', () => {
    const data = toMaster([
      makeEntry({ volume: 1, ring: 'trial' }),
      makeEntry({ volume: 2, ring: 'trial' }),
    ]);

    calculateBlipMovements(data);

    expect(data.blipEntries[1].hasMovedIn).toBe(false);
    expect(data.blipEntries[1].hasMovedOut).toBe(false);
  });

  it('treats hold and caution as the same ring across the vol-34 boundary', () => {
    // hold (vol 33) -> caution (vol 34) must not register as a movement.
    const data = toMaster([
      makeEntry({ volume: 33, ring: 'hold' }),
      makeEntry({ volume: 34, ring: 'caution' }),
    ]);

    calculateBlipMovements(data);

    expect(data.blipEntries[1].hasMovedIn).toBe(false);
    expect(data.blipEntries[1].hasMovedOut).toBe(false);
  });
});
