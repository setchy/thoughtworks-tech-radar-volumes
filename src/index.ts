import * as dotenv from 'dotenv';

dotenv.config({
  path: './config/.env',
});

import { Argument, Command } from 'commander';

import {
  formatEnrichedBlip,
  formatStats,
  validateOutputFormat,
} from './cli/formatters';
import { BLIP_STATUSES, REPORT_TYPES } from './common/constants';
import { generateVolumes } from './files';
import { filterData, searchData, summarizeStats } from './files/search';
import { parseRadarSitemap } from './links';
import { generateMasterData } from './timeline';
import type { BlipStatus, ReportType } from './types';

const program = new Command();

program
  .name('tech-radar-volumes')
  .description('A CLI tool to fetch and process ThoughtWorks Tech Radar data')
  .version('latest');

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

program
  .command('volumes')
  .addArgument(
    new Argument('[type]', 'type of report to generate')
      .choices(REPORT_TYPES)
      .default('all'),
  )
  .description(
    'generate publication volumes in specified format(s).\nInputs: requires `data/master.json`.\nOutput: generated volumes will be saved in `volumes/*`.\n',
  )
  .action((type: ReportType) => {
    console.log(`generating ${type} volumes`);
    generateVolumes(type);
  });

program
  .command('search')
  .description(
    'search master dataset for a keyword (defaults to name and description)',
  )
  .option('-k, --keyword <keyword>', 'keyword to search for')
  .option(
    '-f, --field <field>',
    'specific field to search (name, quadrant, ring, description)',
  )
  .option('-v, --volume <volume>', 'filter by volume number or name')
  .option(
    '-o, --output <format>',
    'output format: text|json|jsonl|csv|table',
    'text',
  )
  .action(
    async (opts: {
      keyword?: string;
      field?: string;
      volume?: string;
      output?: string;
    }) => {
      if (!opts.keyword) {
        console.error('ERROR: --keyword is required for search');
        process.exit(1);
      }
      const results = await searchData({
        keyword: opts.keyword,
        field: opts.field,
        volume: opts.volume,
      });

      const format = validateOutputFormat(opts.output || 'text');
      formatEnrichedBlip(results, format);
    },
  );

program
  .command('filter')
  .description('filter master dataset by volume, quadrant, ring or status')
  .option('-v, --volume <volume>', 'filter by volume number or name')
  .option('-q, --quadrant <quadrant>', 'filter by quadrant')
  .option('-r, --ring <ring>', 'filter by ring')
  .option(
    '-s, --status <status>',
    'filter by status (new|moved in|moved out|no change)',
  )
  .option(
    '-o, --output <format>',
    'output format: text|json|jsonl|csv|table',
    'text',
  )
  .action(
    async (opts: {
      volume?: string;
      quadrant?: string;
      ring?: string;
      status?: string;
      output?: string;
    }) => {
      const status = opts.status
        ? (String(opts.status).toLowerCase() as BlipStatus)
        : null;
      if (status && !BLIP_STATUSES.includes(status)) {
        console.error(
          'ERROR: --status must be one of new|moved in|moved out|no change',
        );
        process.exit(1);
      }

      const results = await filterData({
        volume: opts.volume,
        quadrant: opts.quadrant,
        ring: opts.ring,
        status: status,
      });

      const format = validateOutputFormat(opts.output || 'text');
      formatEnrichedBlip(results, format);
    },
  );

program
  .command('stats')
  .description('show statistics for the master dataset')
  .option('-b, --by <group>', 'group stats by: volume|quadrant|ring|all', 'all')
  .option(
    '-o, --output <format>',
    'output format: text|json|jsonl|csv|table',
    'text',
  )
  .action(async (opts: { by?: string; output?: string }) => {
    const stats = await summarizeStats({
      by: opts.by as 'volume' | 'quadrant' | 'ring' | 'all',
    });
    const format = validateOutputFormat(opts.output || 'text');
    formatStats(
      stats,
      format,
      opts.by as 'volume' | 'quadrant' | 'ring' | 'all',
    );
  });

program.on('--help', () => {
  console.log('');
  console.log('Examples:');
  console.log('  $ tech-radar-volumes');
  console.log('  $ tech-radar-volumes fetch links');
  console.log('  $ tech-radar-volumes fetch data');
  console.log('  $ tech-radar-volumes volumes csv');
  console.log('  $ tech-radar-volumes stats --by=quadrant -o json');
  console.log('  $ tech-radar-volumes search -k react');
  console.log('  $ tech-radar-volumes search -k "test cafe" -o json');
  console.log(
    '  $ tech-radar-volumes filter -v 10 -q "languages-and-frameworks" -o csv',
  );
  console.log('  $ tech-radar-volumes stats --by=volume -o table');
  console.log('  $ tech-radar-volumes help volumes');
  console.log('  $ tech-radar-volumes help');
  console.log('');
});

program.showSuggestionAfterError();

program.parse(process.argv);
