import * as dotenv from 'dotenv';

dotenv.config({
  path: './config/.env',
});

import { Argument, Command } from 'commander';

import { generateVolumes } from './files';
import { parseRadarSitemap } from './links';
import { generateMasterData } from './timeline';
import { type ReportType, reportTypes } from './types';

const program = new Command();

program
  .name('tech-radar-volumes')
  .description('A CLI tool to fetch and process ThoughtWorks Tech Radar data')
  .version('latest');

program
  .command('all', { isDefault: true })
  .description(
    'fetch detailed history for all blips and generate publication volumes',
  )
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

program
  .command('links')
  .description(
    'fetch all radar blip page links from web.\nOutput: blip links will be saved in `data/links.json`.',
  )
  .action(() => {
    console.log('fetching all radar blip page links from sitemap');
    parseRadarSitemap();
  });

program
  .command('data')
  .description(
    'fetch detailed blip history from web.\nInputs: requires `data/links.json`.\nOutput: detailed history will be saved in `data/master.json`.\n',
  )
  .action(() => {
    console.log('fetching detailed blip history from archive');
    generateMasterData();
  });

program
  .command('volumes')
  .addArgument(
    new Argument('[type]', 'type of report to generate')
      .choices(reportTypes)
      .default('all'),
  )
  .description(
    'generate publication volumes in specified format(s).\nInputs: requires `data/master.json`.\nOutput: generated volumes will be saved in `volumes/*`.\n',
  )
  .action((type: ReportType) => {
    console.log(`generating ${type} volumes`);
    generateVolumes(type);
  });

program.on('--help', () => {
  console.log('');
  console.log('Examples:');
  console.log('  $ tech-radar-volumes');
  console.log('  $ tech-radar-volumes links');
  console.log('  $ tech-radar-volumes data');
  console.log('  $ tech-radar-volumes volumes csv');
  console.log('  $ tech-radar-volumes help volumes');
  console.log('  $ tech-radar-volumes help');
  console.log('');
});

program.showSuggestionAfterError();

program.parse(process.argv);
