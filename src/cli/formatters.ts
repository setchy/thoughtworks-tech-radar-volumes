import type { StatsOutput } from '../files/search/stats';
import type { EnrichedBlip } from '../types';

export const OUTPUT_FORMATS = [
  'text',
  'json',
  'jsonl',
  'csv',
  'table',
] as const;
export type OutputFormat = (typeof OUTPUT_FORMATS)[number];

export function validateOutputFormat(format: string): OutputFormat {
  const normalized = String(format || 'text').toLowerCase() as OutputFormat;
  if (!OUTPUT_FORMATS.includes(normalized)) {
    throw new Error(
      `Invalid output format: ${format}. Must be one of: ${OUTPUT_FORMATS.join('|')}`,
    );
  }
  return normalized;
}

export function escapeCSV(value: unknown): string {
  return `"${String(value ?? '').replace(/"/g, '""')}"`;
}

export function formatEnrichedBlip(
  results: EnrichedBlip[],
  format: OutputFormat,
): void {
  switch (format) {
    case 'json':
      console.log(JSON.stringify(results, null, 2));
      break;
    case 'jsonl':
      results.forEach((r) => {
        console.log(JSON.stringify(r));
      });
      break;
    case 'csv':
      console.log('name,ring,quadrant,isNew,status,description');
      results.forEach((r) => {
        console.log(
          [
            escapeCSV(r.name),
            escapeCSV(r.ring),
            escapeCSV(r.quadrant),
            escapeCSV(r.isNew),
            escapeCSV(r.status),
            escapeCSV(r.descriptionHtml),
          ].join(','),
        );
      });
      break;
    case 'table':
      // eslint-disable-next-line no-console
      console.table(results);
      break;
    default:
      results.forEach((r) => {
        console.log(`${r.volume} • ${r.quadrant} • ${r.ring} • ${r.name}`);
        console.log(
          `  ${r.descriptionHtml?.slice(0, 200).replace(/\n/g, ' ')}${r.descriptionHtml && r.descriptionHtml.length > 200 ? '…' : ''}`,
        );
      });
  }
}

export function formatStats(
  stats: StatsOutput,
  format: OutputFormat,
  groupBy?: 'volume' | 'quadrant' | 'ring' | 'all',
): void {
  if (format === 'json') {
    console.log(JSON.stringify(stats, null, 2));
    return;
  }

  if (format === 'jsonl') {
    if (stats.byVolume)
      console.log(JSON.stringify({ by: 'volume', data: stats.byVolume }));
    if (stats.byQuadrant)
      console.log(JSON.stringify({ by: 'quadrant', data: stats.byQuadrant }));
    if (stats.byRing)
      console.log(JSON.stringify({ by: 'ring', data: stats.byRing }));
    return;
  }

  if (format === 'csv') {
    const printCSV = (
      obj: Record<string, number> | undefined,
      header: string,
    ) => {
      console.log(`${header},count`);
      Object.entries(obj || {}).forEach(([k, v]) => {
        console.log(`${k},${v}`);
      });
    };

    if (groupBy === 'volume' || groupBy === 'all')
      printCSV(stats.byVolume, 'volume');
    if (groupBy === 'quadrant' || groupBy === 'all') {
      if (groupBy === 'all') console.log('');
      printCSV(stats.byQuadrant, 'quadrant');
    }
    if (groupBy === 'ring' || groupBy === 'all') {
      if (groupBy === 'all') console.log('');
      printCSV(stats.byRing, 'ring');
    }
    return;
  }

  if (format === 'table') {
    if (groupBy === 'volume' || groupBy === 'all') {
      console.log('\nBy volume:');
      // eslint-disable-next-line no-console
      console.table(stats.byVolume);
    }
    if (groupBy === 'quadrant' || groupBy === 'all') {
      console.log('\nBy quadrant:');
      // eslint-disable-next-line no-console
      console.table(stats.byQuadrant);
    }
    if (groupBy === 'ring' || groupBy === 'all') {
      console.log('\nBy ring:');
      // eslint-disable-next-line no-console
      console.table(stats.byRing);
    }
    console.log(`\nTotal blips: ${stats.total}`);
    return;
  }

  // default: text
  console.log('Statistics:');
  if (groupBy === 'volume' || groupBy === 'all') {
    console.log('\nBy volume:');
    Object.entries(stats.byVolume || {}).forEach(([k, v]) => {
      console.log(`  ${k}: ${v}`);
    });
  }
  if (groupBy === 'quadrant' || groupBy === 'all') {
    console.log('\nBy quadrant:');
    Object.entries(stats.byQuadrant || {}).forEach(([k, v]) => {
      console.log(`  ${k}: ${v}`);
    });
  }
  if (groupBy === 'ring' || groupBy === 'all') {
    console.log('\nBy ring:');
    Object.entries(stats.byRing || {}).forEach(([k, v]) => {
      console.log(`  ${k}: ${v}`);
    });
  }
  console.log(`\nTotal blips: ${stats.total}`);
}
