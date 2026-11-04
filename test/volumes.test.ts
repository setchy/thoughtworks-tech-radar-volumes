import { beforeEach, describe, expect, it, vi } from 'vitest';

import type {
  BlipTimelineEntry,
  VolumeMetricsData,
} from '../src/shared/types.ts';

import { fetchGoogleSheetGids } from '../src/output/googleSheets.ts';
import { generateVolumes } from '../src/output/index.ts';
import { updateReadmeMetrics } from '../src/output/metricsReadme.ts';

const masterData: BlipTimelineEntry[] = [
  {
    name: 'Gamma',
    quadrant: 'tools',
    ring: 'assess',
    volume: 1,
    publishedDate: 'Jan 2010',
    descriptionHtml: '',
    isNew: false,
    hasMovedIn: false,
    hasMovedOut: false,
    relatedBlips: [],
  },
  {
    name: 'Alpha',
    quadrant: 'tools',
    ring: 'adopt',
    volume: 1,
    publishedDate: 'Jan 2010',
    descriptionHtml: '',
    isNew: true,
    hasMovedIn: false,
    hasMovedOut: false,
    relatedBlips: [],
  },
  {
    name: 'Beta',
    quadrant: 'techniques',
    ring: 'trial',
    volume: 1,
    publishedDate: 'Jan 2010',
    descriptionHtml: '',
    isNew: false,
    hasMovedIn: false,
    hasMovedOut: false,
    relatedBlips: [],
  },
  {
    name: 'Delta',
    quadrant: 'platforms',
    ring: 'adopt',
    volume: 2,
    publishedDate: 'Apr 2010',
    descriptionHtml: '',
    isNew: true,
    hasMovedIn: false,
    hasMovedOut: false,
    relatedBlips: [],
  },
];

const writtenCSVs: Array<[string, string[]]> = [];
const writtenJSONs: Array<[string, unknown]> = [];

vi.mock('../src/data/repository.ts', () => ({
  readJSONFile: () => masterData,
  writeJSONFile: (filename: string, contents: unknown) => {
    writtenJSONs.push([filename, contents]);
  },
  writeCSVFile: (filename: string, data: string[]) => {
    writtenCSVs.push([filename, data]);
  },
}));

vi.mock('../src/output/googleSheets.ts', () => ({
  updateGoogleSheets: vi.fn().mockResolvedValue(undefined),
  fetchGoogleSheetGids: vi.fn().mockResolvedValue(new Map()),
}));

vi.mock('../src/output/metricsReadme.ts', () => ({
  updateReadmeMetrics: vi.fn(),
}));

describe('generateVolumes', () => {
  beforeEach(() => {
    writtenCSVs.length = 0;
    writtenJSONs.length = 0;
    vi.clearAllMocks();
  });

  it('groups master data into per-volume CSV files', () => {
    generateVolumes('csv');

    expect(writtenCSVs).toHaveLength(2);
    const [vol1Name, vol1Lines] = writtenCSVs[0];
    expect(vol1Name).toContain('Volume 01');
    // Header + 3 rows, ordered by quadrant then ring then name.
    expect(vol1Lines).toHaveLength(4);
    expect(vol1Lines[0]).toBe(
      'name,ring,quadrant,isNew,status,description,relatedBlips',
    );
    expect(vol1Lines[1]).toContain('Beta');
    expect(vol1Lines[2]).toContain('Alpha');
    expect(vol1Lines[3]).toContain('Gamma');
  });

  it('groups master data into per-volume JSON files', () => {
    generateVolumes('json');

    expect(writtenJSONs).toHaveLength(2);
    const [vol2Name, contents] = writtenJSONs[1];
    expect(vol2Name).toContain('Volume 02');
    const rows = contents as Array<Record<string, unknown>>;
    expect(rows).toHaveLength(1);
    expect(rows[0].name).toBe('Delta');
  });

  it('writes only the metrics index for the metrics report', async () => {
    await generateVolumes('metrics');

    expect(writtenCSVs).toHaveLength(0);
    expect(writtenJSONs).toHaveLength(1);

    const [filename, contents] = writtenJSONs[0];
    expect(filename).toBe('data/volume-metrics.json');
    expect((contents as VolumeMetricsData).volumes).toHaveLength(2);
    expect(updateReadmeMetrics).toHaveBeenCalledWith(contents);
  });

  it('writes the metrics index as part of the full pipeline', async () => {
    await generateVolumes('all');

    const metrics = writtenJSONs.find(
      ([filename]) => filename === 'data/volume-metrics.json',
    );
    expect(metrics).toBeDefined();
    if (!metrics) {
      throw new Error('Missing data/volume-metrics.json output');
    }
    expect((metrics[1] as VolumeMetricsData).volumes).toHaveLength(2);
    expect(updateReadmeMetrics).toHaveBeenCalledWith(metrics[1]);
    expect(fetchGoogleSheetGids).toHaveBeenCalled();
  });

  it('refreshes metrics with sheet gids for the google-sheets report', async () => {
    await generateVolumes('google-sheets');

    expect(fetchGoogleSheetGids).toHaveBeenCalled();
    expect(writtenJSONs).toHaveLength(1);
    expect(writtenJSONs[0][0]).toBe('data/volume-metrics.json');
  });
});
