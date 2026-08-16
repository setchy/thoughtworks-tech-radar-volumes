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
    .action(() => {
      logger.info('fetching all radar blip page links from sitemap');
      parseRadarSitemap();
    });

  fetchCmd
    .command('data')
    .description('fetch detailed blip history and write data/master.json')
    .action(() => {
      logger.info('fetching detailed blip history from archive');
      generateMasterData();
    });

  fetchCmd
    .command('all')
    .description('run links, data and generate volumes')
    .action(() => {
      logger.info('fetching all radar blip page links from sitemap');
      parseRadarSitemap().then(() => {
        logger.info('fetching detailed blip history from archive');
        generateMasterData().then(() => {
          logger.info('generating all volumes');
          generateVolumes('all');
        });
      });
    });
}
