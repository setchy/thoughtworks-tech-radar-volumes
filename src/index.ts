import * as dotenv from 'dotenv';

dotenv.config({
  path: './config/.env',
});

import { Argument, Command } from 'commander';

import { generateVolumes } from './files';
import { parseRadarSitemap } from './links';
import { generateMasterData } from './timeline';
import { type ReportType, reportTypes } from './types';
import { searchData, filterData, summarizeStats } from './files/search';

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

program
  .command('search')
  .description('search master dataset for a keyword (defaults to name and description)')
  .option('-k, --keyword <keyword>', 'keyword to search for')
  .option('-f, --field <field>', 'specific field to search (name, quadrant, ring, description)')
  .option('-v, --volume <volume>', 'filter by volume number or name')
  .option('--json', 'output raw JSON')
  .action(async (opts: any) => {
    if (!opts.keyword) {
      console.error('ERROR: --keyword is required for search');
      process.exit(1);
    }
    const results = await searchData({
      keyword: opts.keyword,
      field: opts.field,
      volume: opts.volume,
    });

    if (opts.json) {
      console.log(JSON.stringify(results, null, 2));
    } else {
      results.forEach((r: any) => {
        console.log(`${r.volume} • ${r.quadrant} • ${r.ring} • ${r.name}`);
        console.log(`  ${r.description?.slice(0, 200).replace(/\n/g, ' ')}${r.description && r.description.length > 200 ? '…' : ''}`);
      });
    }
  });

program
  .command('filter')
  .description('filter master dataset by volume, quadrant, ring or status')
  .option('-v, --volume <volume>', 'filter by volume number or name')
  .option('-q, --quadrant <quadrant>', 'filter by quadrant')
  .option('-r, --ring <ring>', 'filter by ring')
  .option('--status <status>', 'filter by status (e.g. ADOPT, TRIAL)')
  .option('--new <new>', 'filter to blips marked as new in that volume (true|false)')
  .option('--movement <movement>', 'filter by movement: in|out|none')
  .option('--json', 'output raw JSON')
  .action(async (opts: any) => {
    // Validate and parse the `--new` flag value if provided
    let isNewValue: boolean | null = null;
    if (opts.new !== undefined) {
      const v = String(opts.new).toLowerCase();
      if (v !== 'true' && v !== 'false') {
        console.error('ERROR: --new must be "true" or "false"');
        process.exit(1);
      }
      isNewValue = v === 'true';
    }

    const results = await filterData({
      volume: opts.volume,
      quadrant: opts.quadrant,
      ring: opts.ring,
      status: opts.status,
      isNew: isNewValue,
      movement: opts.movement,
    });

    if (opts.json) {
      console.log(JSON.stringify(results, null, 2));
    } else {
      results.forEach((r: any) => {
        console.log(`${r.volume} • ${r.quadrant} • ${r.ring} • ${r.name}`);
      });
    }
  });

program
  .command('stats')
  .description('show statistics for the master dataset')
  .option('-b, --by <group>', 'group stats by: volume|quadrant|ring|all', 'all')
  .option('--json', 'output raw JSON')
  .action(async (opts: any) => {
    const stats = await summarizeStats({ by: opts.by });
    if (opts.json) {
      console.log(JSON.stringify(stats, null, 2));
    } else {
      console.log('Statistics:');
      if (opts.by === 'volume' || opts.by === 'all') {
        console.log('\nBy volume:');
        Object.entries(stats.byVolume || {}).forEach(([k, v]) => console.log(`  ${k}: ${v}`));
      }
      if (opts.by === 'quadrant' || opts.by === 'all') {
        console.log('\nBy quadrant:');
        Object.entries(stats.byQuadrant || {}).forEach(([k, v]) => console.log(`  ${k}: ${v}`));
      }
      if (opts.by === 'ring' || opts.by === 'all') {
        console.log('\nBy ring:');
        Object.entries(stats.byRing || {}).forEach(([k, v]) => console.log(`  ${k}: ${v}`));
      }
      console.log(`\nTotal blips: ${stats.total}`);
    }
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
