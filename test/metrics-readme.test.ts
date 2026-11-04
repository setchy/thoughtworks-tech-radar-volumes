import { describe, expect, it } from 'vitest';

import type { VolumeMetricsData } from '../src/shared/types.ts';

import {
  formatVolumeMetricsMarkdown,
  README_METRICS_END,
  README_METRICS_START,
  replaceVolumeMetricsSection,
} from '../src/output/metricsReadme.ts';

const metrics: VolumeMetricsData = {
  volumes: [
    {
      volume: 1,
      publishedDate: 'Jan 2010',
      total: 38,
      status: { new: 38, movedIn: 0, movedOut: 0, noChange: 0 },
      rings: { adopt: 9, trial: 11, assess: 14, caution: 4 },
      quadrants: {
        techniques: 10,
        platforms: 14,
        tools: 7,
        'languages-and-frameworks': 7,
      },
      files: {
        csv: 'volumes/csv/Thoughtworks Technology Radar Volume 01 (Jan 2010).csv',
        json: 'volumes/json/Thoughtworks Technology Radar Volume 01 (Jan 2010).json',
      },
      sheetGid: null,
    },
    {
      volume: 35,
      publishedDate: 'Nov 2026',
      total: 117,
      status: { new: 87, movedIn: 18, movedOut: 0, noChange: 12 },
      rings: { adopt: 11, trial: 49, assess: 47, caution: 10 },
      quadrants: {
        techniques: 45,
        platforms: 22,
        tools: 36,
        'languages-and-frameworks': 14,
      },
      files: {
        csv: 'volumes/csv/Thoughtworks Technology Radar Volume 35 (Nov 2026).csv',
        json: 'volumes/json/Thoughtworks Technology Radar Volume 35 (Nov 2026).json',
      },
      sheetGid: null,
    },
  ],
};

describe('formatVolumeMetricsMarkdown', () => {
  it('formats a collapsible summary with per-volume rows and totals', () => {
    const markdown = formatVolumeMetricsMarkdown(metrics);

    expect(markdown).toContain(
      '<summary>Volume metrics — 2 volumes, 155 blips</summary>',
    );
    expect(markdown).toMatch(
      /\| 1\s+\| Jan 2010\s+\|\s+38\s+\|\s+38\s+\|\s+0\s+\|\s+0\s+\|\s+0\s+\|/,
    );
    expect(markdown).toMatch(
      /\| 35\s+\| Nov 2026\s+\|\s+117\s+\|\s+87\s+\|\s+18\s+\|\s+0\s+\|\s+12\s+\|/,
    );
    expect(markdown).toMatch(
      /\| \*\*Total\*\*\s+\|\s+\| \*\*155\*\* \| \*\*125\*\* \|\s+\*\*18\*\* \|\s+\*\*0\*\* \|\s+\*\*12\*\* \|/,
    );
    expect(markdown).toContain('Latest: **Volume 35 (Nov 2026)** — 117 blips.');
  });

  it('throws when there are no volumes', () => {
    expect(() => formatVolumeMetricsMarkdown({ volumes: [] })).toThrow(
      /without radar volumes/,
    );
  });
});

describe('replaceVolumeMetricsSection', () => {
  it('replaces only the marked section', () => {
    const readme = `before\n${README_METRICS_START}\nold\n${README_METRICS_END}\nafter`;

    expect(replaceVolumeMetricsSection(readme, 'new')).toBe(
      'before\nnew\nafter',
    );
  });

  it('throws when the markers are missing', () => {
    expect(() => replaceVolumeMetricsSection('README', 'new')).toThrow(
      /markers/,
    );
  });
});
