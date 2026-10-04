import { logger } from '../shared/logger.ts';
import type { EnrichedBlip } from '../shared/types.ts';

import type { StatsOutput } from '../operations/stats.ts';

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
  if (value == null) {
    return '""';
  }

  return `"${String(value).replace(/"/g, '""')}"`;
}

export function formatEnrichedBlip(
  results: EnrichedBlip[],
  format: OutputFormat,
): void {
  switch (format) {
    case 'json':
      logger.info(JSON.stringify(results, null, 2));
      break;
    case 'jsonl':
      results.forEach((r) => {
        logger.info(JSON.stringify(r));
      });
      break;
    case 'csv':
      logger.info('name,ring,quadrant,isNew,status,description');
      results.forEach((r) => {
        logger.info(
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
      logger.table(results);
      break;
    default:
      results.forEach((r) => {
        logger.info(`${r.volume} • ${r.quadrant} • ${r.ring} • ${r.name}`);
        logger.info(
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
  switch (format) {
    case 'json':
      logger.info(JSON.stringify(stats, null, 2));
      return;
    case 'jsonl':
      printStatsJSONL(stats);
      return;
    case 'csv':
      printStatsCSV(stats, groupBy);
      return;
    case 'table':
      printStatsTable(stats, groupBy);
      return;
    default:
      printStatsText(stats, groupBy);
  }
}

type StatsGroupBy = 'volume' | 'quadrant' | 'ring' | 'all' | undefined;

const STATS_DIMENSIONS = [
  { key: 'volume', data: (stats: StatsOutput) => stats.byVolume },
  { key: 'quadrant', data: (stats: StatsOutput) => stats.byQuadrant },
  { key: 'ring', data: (stats: StatsOutput) => stats.byRing },
] as const;

function includesDimension(
  groupBy: StatsGroupBy,
  dimension: (typeof STATS_DIMENSIONS)[number]['key'],
): boolean {
  return groupBy === 'all' || groupBy === dimension;
}

function printStatsJSONL(stats: StatsOutput): void {
  STATS_DIMENSIONS.forEach(({ key, data }) => {
    if (data(stats))
      logger.info(JSON.stringify({ by: key, data: data(stats) }));
  });
}

function printStatsCSV(stats: StatsOutput, groupBy: StatsGroupBy): void {
  STATS_DIMENSIONS.filter(({ key }) => includesDimension(groupBy, key)).forEach(
    ({ key, data }, index) => {
      if (groupBy === 'all' && index > 0) {
        logger.info('');
      }
      logger.info(`${key},count`);
      Object.entries(data(stats) || {}).forEach(([k, v]) => {
        logger.info(`${k},${v}`);
      });
    },
  );
}

function printStatsTable(stats: StatsOutput, groupBy: StatsGroupBy): void {
  STATS_DIMENSIONS.filter(({ key }) => includesDimension(groupBy, key)).forEach(
    ({ key, data }) => {
      logger.info(`\nBy ${key}:`);
      // eslint-disable-next-line no-console
      logger.table(data(stats));
    },
  );
  logger.info(`\nTotal blips: ${stats.total}`);
}

function printStatsText(stats: StatsOutput, groupBy: StatsGroupBy): void {
  logger.info('Statistics:');
  STATS_DIMENSIONS.filter(({ key }) => includesDimension(groupBy, key)).forEach(
    ({ key, data }) => {
      logger.info(`\nBy ${key}:`);
      Object.entries(data(stats) || {}).forEach(([k, v]) => {
        logger.info(`  ${k}: ${v}`);
      });
    },
  );
  logger.info(`\nTotal blips: ${stats.total}`);
}
