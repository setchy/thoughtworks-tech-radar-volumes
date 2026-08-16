import type { Command } from 'commander';

import { logger } from '../../shared/logger.ts';

import { summarizeHealth } from '../../operations/index.ts';

export function validateCommand(program: Command) {
  program
    .command('validate')
    .description('check the master dataset for data quality issues')
    .option('-o, --output <format>', 'output format: text|json', 'text')
    .action(async (opts: { output?: string }) => {
      const health = summarizeHealth();

      const hasErrors =
        health.unknownVolumes > 0 || health.unknownQuadrants > 0;

      if (opts.output === 'json') {
        logger.info(JSON.stringify({ health, hasErrors }, null, 2));
      } else {
        logger.info(`Total entries: ${health.total}`);
        logger.info(`Unknown volumes: ${health.unknownVolumes}`);
        logger.info(`Unknown quadrants: ${health.unknownQuadrants}`);
        logger.info(
          `Empty descriptions: ${health.emptyDescriptions.total} (${health.emptyDescriptions.expected} expected in volumes 1-14, ${health.emptyDescriptions.unexpected} unexpected)`,
        );

        if (health.unknownVolumes > 0) {
          logger.error('ERROR: dataset contains records with unknown volumes');
        }
        if (health.unknownQuadrants > 0) {
          logger.error(
            'ERROR: dataset contains records with unknown quadrants',
          );
        }

        logger.info(hasErrors ? 'Dataset health: ERROR' : 'Dataset health: OK');
      }

      if (hasErrors) {
        process.exit(1);
      }
    });
}
