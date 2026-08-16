import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import type { BlipTimelineEntry } from '../src/shared/types.ts';

const mocks = vi.hoisted(() => {
  const updateCalls: Array<{ range: string; values: unknown[][] }> = [];
  const getCalls: string[] = [];

  const mockValues = {
    get: vi.fn(async (args: { range: string }) => {
      getCalls.push(args.range);
      return { data: { values: [] } };
    }),
    update: vi.fn(
      async (args: { range: string; requestBody: { values: unknown[][] } }) => {
        updateCalls.push({
          range: args.range,
          values: args.requestBody.values,
        });
        return { data: {} };
      },
    ),
  };

  return { updateCalls, getCalls, mockValues };
});

vi.mock('googleapis', () => {
  class GoogleAuth {}
  return {
    google: {
      auth: {
        GoogleAuth,
      },
      sheets: vi.fn().mockReturnValue({
        spreadsheets: {
          values: mocks.mockValues,
          batchUpdate: vi.fn(),
        },
      }),
    },
  };
});

import { updateGoogleSheets } from '../src/output/googleSheets.ts';

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

describe('updateGoogleSheets', () => {
  beforeEach(() => {
    mocks.updateCalls.length = 0;
    mocks.getCalls.length = 0;
    mocks.mockValues.get.mockClear();
    mocks.mockValues.update.mockClear();
    vi.stubEnv('GOOGLE_SHEET_ID', 'sheet-id');
    vi.stubEnv('GOOGLE_CLIENT_EMAIL', 'svc@example.com');
    vi.stubEnv('GOOGLE_PRIVATE_KEY', 'private-key');
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('prepends headers and canonicalizes the ring', async () => {
    await updateGoogleSheets('1', [
      makeEntry({ name: 'A', isNew: true }),
      makeEntry({ name: 'B', ring: 'hold', hasMovedIn: true }),
    ]);

    expect(mocks.getCalls).toEqual(['Vol 1 (Jan 2010)']);
    expect(mocks.updateCalls).toHaveLength(1);
    expect(mocks.updateCalls[0].range).toBe('Vol 1 (Jan 2010)');
    expect(mocks.updateCalls[0].values[0]).toEqual([
      'name',
      'ring',
      'quadrant',
      'isNew',
      'status',
      'description',
      'relatedBlips',
    ]);
    expect(mocks.updateCalls[0].values[1]).toEqual([
      'A',
      'adopt',
      'tools',
      'TRUE',
      '',
      '',
    ]);
    expect(mocks.updateCalls[0].values[2][1]).toBe('caution');
  });
});
