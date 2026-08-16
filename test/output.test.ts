import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { BlipTimelineEntry } from '../src/shared/types.ts';

import { formatCSVDataset } from '../src/output/csv.ts';
import { generateJSON } from '../src/output/json.ts';

const writtenJSON: unknown[] = [];

vi.mock('../src/data/repository.ts', () => ({
  readJSONFile: vi.fn(),
  writeJSONFile: (_filename: string, contents: unknown) => {
    writtenJSON.push(contents);
  },
  writeCSVFile: vi.fn(),
}));

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

describe('formatCSVDataset', () => {
  it('shapes rows with canonical ring and status', () => {
    const rows = formatCSVDataset([
      makeEntry({ name: 'A', isNew: true }),
      makeEntry({ name: 'B', ring: 'hold', hasMovedIn: true }),
      makeEntry({ name: 'C', hasMovedOut: true }),
    ]);

    expect(rows[0]).toEqual(['A', 'adopt', 'tools', 'TRUE', 'new', '""', '']);
    expect(rows[1][1]).toBe('caution');
    expect(rows[1][4]).toBe('moved in');
    expect(rows[2][4]).toBe('moved out');
  });

  it('escapes description HTML in CSV style', () => {
    const rows = formatCSVDataset([
      makeEntry({ descriptionHtml: 'He said "hi" and\nmoved on' }),
    ]);
    expect(rows[0][5]).toBe('"He said ""hi"" and<br>moved on"');
  });

  it('joins related blips with semicolons', () => {
    const rows = formatCSVDataset([makeEntry({ relatedBlips: ['X', 'Y'] })]);
    expect(rows[0][6]).toBe('X;Y');
  });
});

describe('generateJSON', () => {
  beforeEach(() => {
    writtenJSON.length = 0;
  });

  it('shapes JSON records with canonical ring and status', () => {
    const data = [
      makeEntry({ name: 'A', isNew: true }),
      makeEntry({ name: 'B', ring: 'hold', hasMovedIn: true }),
    ];

    generateJSON('1', data);

    const rows = writtenJSON[0] as Array<Record<string, unknown>>;
    expect(rows).toHaveLength(2);
    expect(rows[0]).toEqual({
      name: 'A',
      ring: 'adopt',
      quadrant: 'tools',
      isNew: 'TRUE',
      status: 'new',
      description: '""',
      relatedBlips: [],
    });
    expect(rows[1].ring).toBe('caution');
    expect(rows[1].status).toBe('moved in');
  });
});
