import * as dotenv from 'dotenv';

dotenv.config({
  path: './config/.env',
});

import { Argument, Command } from 'commander';

import { generateVolumes } from './files';
import { filterData, searchData, summarizeStats } from './files/search';
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

    const out = String(opts.output || 'text').toLowerCase();
    if (!['text', 'json', 'jsonl', 'csv', 'table'].includes(out)) {
      console.error('ERROR: --output must be one of text|json|jsonl|csv|table');
      process.exit(1);
    }

    const escapeCSV = (s: any) =>
      '"' + String(s || '').replace(/"/g, '""') + '"';

    switch (out) {
      case 'json':
        console.log(JSON.stringify(results, null, 2));
        break;
      case 'jsonl':
        results.forEach((r: any) => console.log(JSON.stringify(r)));
        break;
      case 'csv':
        console.log('name,ring,quadrant,isNew,status,description');
        results.forEach((r: any) =>
          console.log(
            [
              escapeCSV(r.name),
              escapeCSV(r.ring),
              escapeCSV(r.quadrant),
              escapeCSV(r.isNew),
              escapeCSV(r.status),
              escapeCSV(r.description),
            ].join(','),
          ),
        );
        break;
      case 'table':
        // eslint-disable-next-line no-console
        console.table(results);
        break;
      default:
        results.forEach((r: any) => {
          console.log(`${r.volume} • ${r.quadrant} • ${r.ring} • ${r.name}`);
          console.log(
            `  ${r.description?.slice(0, 200).replace(/\n/g, ' ')}${r.description && r.description.length > 200 ? '…' : ''}`,
          );
        });
        break;
    }
  });

program
  .command('filter')
  .description('filter master dataset by volume, quadrant, ring or status')
  .option('-v, --volume <volume>', 'filter by volume number or name')
  .option('-q, --quadrant <quadrant>', 'filter by quadrant')
  .option('-r, --ring <ring>', 'filter by ring')
  .option('--status <status>', 'filter by status (e.g. ADOPT, TRIAL)')
  .option(
    '--new <new>',
    'filter to blips marked as new in that volume (true|false)',
  )
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
  .option(
    '-o, --output <format>',
    'output format: text|json|jsonl|csv|table',
    'text',
  )
  .action(async (opts: any) => {
    const stats = await summarizeStats({ by: opts.by });
    const out = String(opts.output || 'text').toLowerCase();
    if (!['text', 'json', 'jsonl', 'csv', 'table'].includes(out)) {
      console.error('ERROR: --output must be one of text|json|jsonl|csv|table');
      process.exit(1);
    }

    if (out === 'json') {
      console.log(JSON.stringify(stats, null, 2));
      return;
    }

    if (out === 'jsonl') {
      // print each top-level grouping as a JSON line
      if (stats.byVolume)
        console.log(JSON.stringify({ by: 'volume', data: stats.byVolume }));
      if (stats.byQuadrant)
        console.log(JSON.stringify({ by: 'quadrant', data: stats.byQuadrant }));
      if (stats.byRing)
        console.log(JSON.stringify({ by: 'ring', data: stats.byRing }));
      return;
    }

    if (out === 'csv') {
      const printCSV = (obj: any, header: string) => {
        console.log(`${header},count`);
        Object.entries(obj || {}).forEach(([k, v]) => console.log(`${k},${v}`));
      };

      if (opts.by === 'volume' || opts.by === 'all')
        printCSV(stats.byVolume, 'volume');
      if (opts.by === 'quadrant' || opts.by === 'all') {
        if (opts.by === 'all') console.log('');
        printCSV(stats.byQuadrant, 'quadrant');
      }
      if (opts.by === 'ring' || opts.by === 'all') {
        if (opts.by === 'all') console.log('');
        printCSV(stats.byRing, 'ring');
      }

      return;
    }

    if (out === 'table') {
      if (opts.by === 'volume' || opts.by === 'all') {
        console.log('\nBy volume:');
        // eslint-disable-next-line no-console
        console.table(stats.byVolume);
      }
      if (opts.by === 'quadrant' || opts.by === 'all') {
        console.log('\nBy quadrant:');
        // eslint-disable-next-line no-console
        console.table(stats.byQuadrant);
      }
      if (opts.by === 'ring' || opts.by === 'all') {
        console.log('\nBy ring:');
        // eslint-disable-next-line no-console
        console.table(stats.byRing);
      }
      console.log(`\nTotal blips: ${stats.total}`);
      return;
    }

    // default: text
    console.log('Statistics:');
    if (opts.by === 'volume' || opts.by === 'all') {
      console.log('\nBy volume:');
      Object.entries(stats.byVolume || {}).forEach(([k, v]) =>
        console.log(`  ${k}: ${v}`),
      );
    }
    if (opts.by === 'quadrant' || opts.by === 'all') {
      console.log('\nBy quadrant:');
      Object.entries(stats.byQuadrant || {}).forEach(([k, v]) =>
        console.log(`  ${k}: ${v}`),
      );
    }
    if (opts.by === 'ring' || opts.by === 'all') {
      console.log('\nBy ring:');
      Object.entries(stats.byRing || {}).forEach(([k, v]) =>
        console.log(`  ${k}: ${v}`),
      );
    }
    console.log(`\nTotal blips: ${stats.total}`);
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
