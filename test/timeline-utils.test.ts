import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

import {
  getDescriptionHTMLFromBlipDOM,
  getPublishedDateFromBlipDOM,
  getQuadrantNameFromPath,
  getRelatedBlipsFromBlipDOM,
  getRingNameFromBlipDOM,
  getVolumeNameFromDate,
} from '../src/ingest/timeline/utils.ts';

const fixture = (name: string) =>
  readFileSync(
    fileURLToPath(new URL(`./fixtures/${name}`, import.meta.url)),
    'utf-8',
  );

describe('getRingNameFromBlipDOM', () => {
  it('returns the ring name from the first timeline entry, lowercased', () => {
    const entry =
      '<div class="cmp-blip-timeline__item--ring"><span>Adopt</span></div>';
    expect(getRingNameFromBlipDOM(entry)).toBe('adopt');
  });

  it('returns an empty string when no ring is present', () => {
    expect(getRingNameFromBlipDOM('<div></div>')).toBe('');
  });
});

describe('getPublishedDateFromBlipDOM', () => {
  it('returns the published date text from the first timeline entry', () => {
    const entry = '<div class="cmp-blip-timeline__item--time">Jan 2011</div>';
    expect(getPublishedDateFromBlipDOM(entry)).toBe('Jan 2011');
  });
});

describe('getDescriptionHTMLFromBlipDOM', () => {
  it('returns the description HTML when present', () => {
    const entry =
      '<div class="blip-timeline-description"><p>Some <strong>text</strong>.</p></div>';
    expect(getDescriptionHTMLFromBlipDOM(entry)).toBe(
      '<p>Some <strong>text</strong>.</p>',
    );
  });

  it('returns an empty string when the description block is empty', () => {
    const entry = '<div class="blip-timeline-description"></div>';
    expect(getDescriptionHTMLFromBlipDOM(entry)).toBe('');
  });
});

describe('getQuadrantNameFromPath', () => {
  it('extracts the quadrant from a radar path', () => {
    expect(getQuadrantNameFromPath('/radar/techniques/build-pipelines')).toBe(
      'techniques',
    );
  });

  it('returns unknown for a null path', () => {
    expect(getQuadrantNameFromPath(null)).toBe('unknown');
  });
});

describe('getVolumeNameFromDate', () => {
  it('maps a known publication date to its volume number', () => {
    expect(getVolumeNameFromDate('Jan 2010')).toBe(1);
    expect(getVolumeNameFromDate('Apr 2026')).toBe(34);
  });

  it('returns 100 for an unknown publication date', () => {
    expect(getVolumeNameFromDate('Not a real date')).toBe(100);
  });
});

describe('getRelatedBlipsFromBlipDOM', () => {
  it('extracts related blip names from aria-labels', () => {
    const html =
      '<ul class="related-blips-list">' +
      '<li class="related-blip-item">' +
      '<a class="related-blip-item__href" aria-label="Continuous delivery, Software engineering practice">Continuous delivery</a>' +
      '</li>' +
      '<li class="related-blip-item">' +
      '<a class="related-blip-item__href" aria-label="Automated build and deploy, Software engineering practice">Automated build and deploy</a>' +
      '</li>' +
      '</ul>';
    expect(getRelatedBlipsFromBlipDOM(html)).toEqual([
      'Continuous delivery',
      'Automated build and deploy',
    ]);
  });

  it('returns an empty array when no related blips are present', () => {
    expect(getRelatedBlipsFromBlipDOM('<div></div>')).toEqual([]);
  });

  it('handles a full multi-volume fixture page', () => {
    const html = fixture('multi-volume.html');
    expect(getRelatedBlipsFromBlipDOM(html)).toEqual([
      'Continuous delivery',
      'Automated build and deploy',
    ]);
  });
});
