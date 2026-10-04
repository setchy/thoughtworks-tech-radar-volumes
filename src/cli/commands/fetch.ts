import type { Command } from 'commander';

import { logger } from '../../shared/logger.ts';

import { parseRadarSitemap } from '../../ingest/links/index.ts';
import { generateMasterData } from '../../ingest/timeline/index.ts';
import { generateVolumes } from '../../output/index.ts';

export function fetchCommand(program: Command) {
  const fetchCmd = program
    .command('fetch')
    .description(
      'fetch blip links and data (group commands for fetching/ingesting data)',
    );

  fetchCmd
    .command('links')
    .description('fetch blip page links from sitemap')
    .action(async () => {
      logger.info('fetching all radar blip page links from sitemap');
      await parseRadarSitemap();
    });

  fetchCmd
    .command('data')
    .description('fetch detailed blip history and write data/master.json')
    .action(async () => {
      logger.info('fetching detailed blip history from archive');
      await generateMasterData();
    });

  fetchCmd
    .command('all')
    .description('run links, data and generate volumes')
    .action(async () => {
      logger.info('fetching all radar blip page links from sitemap');
      await parseRadarSitemap();
      logger.info('fetching detailed blip history from archive');
      await generateMasterData();
      logger.info('generating all volumes');
      await generateVolumes('all');
    });
}
