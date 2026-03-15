import type { Command } from 'commander';

import { parseRadarSitemap } from '../../ingest/links';
import { generateMasterData } from '../../ingest/timeline';
import { generateVolumes } from '../../output';

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
      console.log('fetching all radar blip page links from sitemap');
      parseRadarSitemap();
    });

  fetchCmd
    .command('data')
    .description('fetch detailed blip history and write data/master.json')
    .action(() => {
      console.log('fetching detailed blip history from archive');
      generateMasterData();
    });

  fetchCmd
    .command('all')
    .description('run links, data and generate volumes')
    .action(() => {
      console.log('fetching all radar blip page links from sitemap');
      parseRadarSitemap().then(() => {
        console.log('fetching detailed blip history from archive');
        generateMasterData().then(() => {
          console.log('generating all volumes');
          generateVolumes('all');
        });
      });
    });
}
