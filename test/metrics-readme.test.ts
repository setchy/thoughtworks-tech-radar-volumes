import { describe, expect, it } from 'vitest';

import type { VolumeMetricsData } from '../src/shared/types.ts';

import {
  formatLatestLinksMarkdown,
  formatVolumeMetricsMarkdown,
  README_LATEST_LINKS_END,
  README_LATEST_LINKS_START,
  README_METRICS_END,
  README_METRICS_START,
  replaceLatestLinksSection,
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
      sheetGid: 12345,
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
    expect(markdown).not.toContain('Latest:');
    expect(markdown).toContain('> [!IMPORTANT]');
    expect(markdown).toContain(
      '(eg: [latest volume CSV][volumes-latest-csv] or [latest volume JSON][volumes-latest-json])',
    );
    expect(markdown).toContain(
      '-   <img src="./assets/icons/csv.png" width="26" height="26" alt="CSV"></img> **CSV** — [GitHub - Thoughtworks Volumes][volumes-csv]',
    );
    expect(markdown).toContain(
      '-   <img src="./assets/icons/json.png" width="26" height="26" alt="JSON"></img> **JSON** — [GitHub - Thoughtworks Volumes][volumes-json]',
    );
    expect(markdown).toContain(
      '-   <img src="./assets/icons/google-sheets.svg" width="24" height="24" alt="Google Sheets" /> **Google Sheets** — [Thoughtworks Technology Radar Volumes][volumes-google-sheets]',
    );
  });

  it('links each volume to its CSV, JSON and Google Sheets files', () => {
    const markdown = formatVolumeMetricsMarkdown(metrics);

    expect(markdown).toContain(
      '[CSV](volumes/csv/Thoughtworks%20Technology%20Radar%20Volume%2001%20(Jan%202010).csv)',
    );
    expect(markdown).toContain(
      '[JSON](volumes/json/Thoughtworks%20Technology%20Radar%20Volume%2001%20(Jan%202010).json)',
    );
    expect(markdown).toContain('[Sheets][volumes-google-sheets]');
    expect(markdown).toContain(
      '[Sheets](https://docs.google.com/spreadsheets/d/1VRXOw7EUGBIeM8Khd5GFocxOWT59HRJtqs9-WbB61FI/edit#gid=12345)',
    );
  });

  it('throws when there are no volumes', () => {
    expect(() => formatVolumeMetricsMarkdown({ volumes: [] })).toThrow(
      /without radar volumes/,
    );
  });
});

describe('formatLatestLinksMarkdown', () => {
  it('formats raw GitHub links for the latest volume files', () => {
    const markdown = formatLatestLinksMarkdown(metrics);

    expect(markdown).toContain(
      '[volumes-latest-csv]: https://raw.githubusercontent.com/setchy/thoughtworks-tech-radar-volumes/main/volumes/csv/Thoughtworks%20Technology%20Radar%20Volume%2035%20(Nov%202026).csv',
    );
    expect(markdown).toContain(
      '[volumes-latest-json]: https://raw.githubusercontent.com/setchy/thoughtworks-tech-radar-volumes/main/volumes/json/Thoughtworks%20Technology%20Radar%20Volume%2035%20(Nov%202026).json',
    );
    expect(markdown).toContain(
      '[volumes-csv]: https://github.com/setchy/thoughtworks-tech-radar-volumes/tree/main/volumes/csv',
    );
    expect(markdown).toContain(
      '[volumes-json]: https://github.com/setchy/thoughtworks-tech-radar-volumes/tree/main/volumes/json',
    );
    expect(markdown).toContain(
      '[volumes-google-sheets]: https://docs.google.com/spreadsheets/d/1VRXOw7EUGBIeM8Khd5GFocxOWT59HRJtqs9-WbB61FI/edit?usp=sharing',
    );
  });

  it('throws when there are no volumes', () => {
    expect(() => formatLatestLinksMarkdown({ volumes: [] })).toThrow(
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

describe('replaceLatestLinksSection', () => {
  it('replaces only the marked latest links', () => {
    const readme = `before\n${README_LATEST_LINKS_START}\nold\n${README_LATEST_LINKS_END}\nafter`;

    expect(replaceLatestLinksSection(readme, 'new')).toBe('before\nnew\nafter');
  });

  it('throws when the markers are missing', () => {
    expect(() => replaceLatestLinksSection('README', 'new')).toThrow(/markers/);
  });
});
