import * as dotenv from 'dotenv';
dotenv.config({
  path: './config/.env',
});

import { Command, Option } from 'commander';
import { generateVolumes } from './files';
import { parseRadarSitemap } from './links';
import { generateMasterData } from './timeline';
import { reportTypes } from './types';
const program = new Command();

program
  .name('tech-radar-volumes')
  .description('A CLI tool to fetch and process ThoughtWorks Tech Radar data')
  .option(
    '-l, --links',
    'Links: fetch all radar blip page links from web.\nOutput: blip links will be saved in `data/links.json`.',
  )
  .option(
    '-d, --data',
    'Data: fetch detailed blip history from web.\nInputs: requires `data/links.json`.\nOutput: detailed history will be saved in `data/master.json`.',
  )
  .addOption(
    new Option(
      '-v, --volumes <type>',
      'Volumes: generate publication volumes in specified format(s).\nInputs: requires `data/master.json`.\nOutput: generated volumes will be saved in `volumes/*`.',
    )
      .choices(reportTypes)
      .default('all'),
  );

program.parse(process.argv);

const options = program.opts();

if (options.links) {
  console.log('fetching all radar blip page links from sitemap');
  parseRadarSitemap();
} else if (options.data) {
  console.log('fetching detailed blip history from archive');
  generateMasterData();
} else if (options.volumes) {
  console.log(`generating ${options.volumes} volumes`);
  generateVolumes(options.volumes);
} else {
  console.log('fetching all radar blip page links from sitemap');
  parseRadarSitemap().then(() => {
    console.log('fetching detailed blip history from archive');
    generateMasterData().then(() => {
      console.log('generating all volumes');
      generateVolumes('all');
    });
  });
}
