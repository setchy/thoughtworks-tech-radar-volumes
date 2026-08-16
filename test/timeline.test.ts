import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

import { afterEach, describe, expect, it, vi } from 'vitest';

import { extractBlipTimeline } from '../src/ingest/timeline/index.ts';

const fixture = (name: string) =>
  readFileSync(
    fileURLToPath(new URL(`./fixtures/${name}`, import.meta.url)),
    'utf-8',
  );

function stubFetch(html: string) {
  vi.stubGlobal(
    'fetch',
    vi.fn().mockResolvedValue({
      status: 200,
      text: () => Promise.resolve(html),
    }),
  );
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('extractBlipTimeline', () => {
  it('extracts a multi-volume timeline with movement flags', async () => {
    stubFetch(fixture('multi-volume.html'));

    const result = await extractBlipTimeline(
      'https://www.thoughtworks.com/radar/techniques/build-pipelines',
    );

    expect(result.blipEntries).toHaveLength(4);
    expect(result.blipEntries.map((e) => e.name)).toEqual([
      'Build pipelines',
      'Build pipelines',
      'Build pipelines',
      'Build pipelines',
    ]);
    expect(result.blipEntries.map((e) => e.volume)).toEqual([1, 2, 3, 4]);
    expect(result.blipEntries.map((e) => e.quadrant)).toEqual([
      'techniques',
      'techniques',
      'techniques',
      'techniques',
    ]);
    expect(result.blipEntries.map((e) => e.ring)).toEqual([
      'adopt',
      'adopt',
      'adopt',
      'adopt',
    ]);
    expect(result.blipEntries.map((e) => e.isNew)).toEqual([
      true,
      false,
      false,
      false,
    ]);
    expect(result.blipEntries.map((e) => e.relatedBlips)).toEqual([
      ['Continuous delivery', 'Automated build and deploy'],
      ['Continuous delivery', 'Automated build and deploy'],
      ['Continuous delivery', 'Automated build and deploy'],
      ['Continuous delivery', 'Automated build and deploy'],
    ]);
    expect(result.blipEntries[3].descriptionHtml).toContain(
      'proliferation of continuous integration',
    );
  });

  it('extracts hold/caution ring rename across the volume-34 boundary', async () => {
    stubFetch(fixture('hold-caution.html'));

    const result = await extractBlipTimeline(
      'https://www.thoughtworks.com/radar/techniques/ai-accelerated-shadow-it',
    );

    // Newest-first DOM is reversed to oldest-first, so volumes ascend.
    expect(result.blipEntries.map((e) => e.volume)).toEqual([32, 33, 34]);
    // The stored ring records the source naming: hold pre-34, caution at 34.
    expect(result.blipEntries.map((e) => e.ring)).toEqual([
      'hold',
      'hold',
      'caution',
    ]);
    // No spurious movement across the rename boundary.
    expect(result.blipEntries.map((e) => e.hasMovedIn)).toEqual([
      false,
      false,
      false,
    ]);
    expect(result.blipEntries.map((e) => e.hasMovedOut)).toEqual([
      false,
      false,
      false,
    ]);
    expect(result.blipEntries[0].isNew).toBe(true);
  });

  it('handles blips with no related blips', async () => {
    stubFetch(fixture('no-related-blips.html'));

    const result = await extractBlipTimeline(
      'https://www.thoughtworks.com/radar/tools/some-blip',
    );

    expect(result.blipEntries).toHaveLength(2);
    expect(result.blipEntries[0].relatedBlips).toEqual([]);
    expect(result.blipEntries[0].quadrant).toBe('tools');
  });
});
