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
  return `"${String(value ?? '').replace(/"/g, '""')}"`;
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
  if (format === 'json') {
    logger.info(JSON.stringify(stats, null, 2));
    return;
  }

  if (format === 'jsonl') {
    if (stats.byVolume)
      logger.info(JSON.stringify({ by: 'volume', data: stats.byVolume }));
    if (stats.byQuadrant)
      logger.info(JSON.stringify({ by: 'quadrant', data: stats.byQuadrant }));
    if (stats.byRing)
      logger.info(JSON.stringify({ by: 'ring', data: stats.byRing }));
    return;
  }

  if (format === 'csv') {
    const printCSV = (
      obj: Record<string, number> | undefined,
      header: string,
    ) => {
      logger.info(`${header},count`);
      Object.entries(obj || {}).forEach(([k, v]) => {
        logger.info(`${k},${v}`);
      });
    };

    if (groupBy === 'volume' || groupBy === 'all')
      printCSV(stats.byVolume, 'volume');
    if (groupBy === 'quadrant' || groupBy === 'all') {
      if (groupBy === 'all') logger.info('');
      printCSV(stats.byQuadrant, 'quadrant');
    }
    if (groupBy === 'ring' || groupBy === 'all') {
      if (groupBy === 'all') logger.info('');
      printCSV(stats.byRing, 'ring');
    }
    return;
  }

  if (format === 'table') {
    if (groupBy === 'volume' || groupBy === 'all') {
      logger.info('\nBy volume:');
      // eslint-disable-next-line no-console
      logger.table(stats.byVolume);
    }
    if (groupBy === 'quadrant' || groupBy === 'all') {
      logger.info('\nBy quadrant:');
      // eslint-disable-next-line no-console
      logger.table(stats.byQuadrant);
    }
    if (groupBy === 'ring' || groupBy === 'all') {
      logger.info('\nBy ring:');
      // eslint-disable-next-line no-console
      logger.table(stats.byRing);
    }
    logger.info(`\nTotal blips: ${stats.total}`);
    return;
  }

  // default: text
  logger.info('Statistics:');
  if (groupBy === 'volume' || groupBy === 'all') {
    logger.info('\nBy volume:');
    Object.entries(stats.byVolume || {}).forEach(([k, v]) => {
      logger.info(`  ${k}: ${v}`);
    });
  }
  if (groupBy === 'quadrant' || groupBy === 'all') {
    logger.info('\nBy quadrant:');
    Object.entries(stats.byQuadrant || {}).forEach(([k, v]) => {
      logger.info(`  ${k}: ${v}`);
    });
  }
  if (groupBy === 'ring' || groupBy === 'all') {
    logger.info('\nBy ring:');
    Object.entries(stats.byRing || {}).forEach(([k, v]) => {
      logger.info(`  ${k}: ${v}`);
    });
  }
  logger.info(`\nTotal blips: ${stats.total}`);
}
