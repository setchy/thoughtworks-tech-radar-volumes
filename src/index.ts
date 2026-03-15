import * as dotenv from 'dotenv';

dotenv.config({
  path: './config/.env',
});

import { Argument, Command } from 'commander';

import { generateVolumes } from './files';
import { filterData, searchData, summarizeStats } from './files/search';
import { parseRadarSitemap } from './links';
import { generateMasterData } from './timeline';
import {
  type BlipStatus,
  type EnrichedBlip,
  type ReportType,
  reportTypes,
} from './types';

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

      const out = String(opts.output || 'text').toLowerCase();
      if (!['text', 'json', 'jsonl', 'csv', 'table'].includes(out)) {
        console.error(
          'ERROR: --output must be one of text|json|jsonl|csv|table',
        );
        process.exit(1);
      }

      const escapeCSV = (s: unknown) =>
        `"${String(s ?? '').replace(/"/g, '""')}"`;

      switch (out) {
        case 'json':
          console.log(JSON.stringify(results, null, 2));
          break;
        case 'jsonl':
          results.forEach((r) => {
            console.log(JSON.stringify(r));
          });
          break;
        case 'csv':
          console.log('name,ring,quadrant,isNew,status,description');
          results.forEach((r) => {
            const rr = r as EnrichedBlip;
            console.log(
              [
                escapeCSV(rr.name),
                escapeCSV(rr.ring),
                escapeCSV(rr.quadrant),
                escapeCSV(rr.isNew),
                escapeCSV(rr.status),
                escapeCSV(rr.descriptionHtml),
              ].join(','),
            );
          });
          break;
        case 'table':
          // eslint-disable-next-line no-console
          console.table(results);
          break;
        default:
          results.forEach((r) => {
            // r is EnrichedBlip
            const rr = r as unknown as {
              volume: number;
              quadrant: string;
              ring: string;
              name: string;
              descriptionHtml?: string;
            };
            console.log(
              `${rr.volume} • ${rr.quadrant} • ${rr.ring} • ${rr.name}`,
            );
            console.log(
              `  ${rr.descriptionHtml?.slice(0, 200).replace(/\n/g, ' ')}${rr.descriptionHtml && rr.descriptionHtml.length > 200 ? '…' : ''}`,
            );
          });
          break;
      }
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
      const allowedStatuses = ['new', 'moved in', 'moved out', 'no change'];
      const status = opts.status ? String(opts.status).toLowerCase() : null;
      if (status && !allowedStatuses.includes(status)) {
        console.error(
          'ERROR: --status must be one of new|moved in|moved out|no change',
        );
        process.exit(1);
      }

      const results = await filterData({
        volume: opts.volume,
        quadrant: opts.quadrant,
        ring: opts.ring,
        status: status as unknown as BlipStatus | null,
      });

      const out = String(opts.output || 'text').toLowerCase();
      if (!['text', 'json', 'jsonl', 'csv', 'table'].includes(out)) {
        console.error(
          'ERROR: --output must be one of text|json|jsonl|csv|table',
        );
        process.exit(1);
      }

      const escapeCSV = (s: unknown) =>
        `"${String(s ?? '').replace(/"/g, '""')}"`;

      switch (out) {
        case 'json':
          console.log(JSON.stringify(results, null, 2));
          break;
        case 'jsonl':
          results.forEach((r) => {
            console.log(JSON.stringify(r));
          });
          break;
        case 'csv':
          console.log('name,ring,quadrant,isNew,status,description');
          results.forEach((r) => {
            const rr = r as EnrichedBlip;
            console.log(
              [
                escapeCSV(rr.name),
                escapeCSV(rr.ring),
                escapeCSV(rr.quadrant),
                escapeCSV(rr.isNew),
                escapeCSV(rr.status),
                escapeCSV(rr.descriptionHtml),
              ].join(','),
            );
          });
          break;
        case 'table':
          // eslint-disable-next-line no-console
          console.table(results);
          break;
        default:
          results.forEach((r) => {
            const rr = r as unknown as {
              volume: number;
              quadrant: string;
              ring: string;
              name: string;
            };
            console.log(
              `${rr.volume} • ${rr.quadrant} • ${rr.ring} • ${rr.name}`,
            );
          });
          break;
      }
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
      by: opts.by as unknown as 'volume' | 'quadrant' | 'ring' | 'all',
    });
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
      const printCSV = (
        obj: Record<string, number> | undefined,
        header: string,
      ) => {
        console.log(`${header},count`);
        Object.entries(obj || {}).forEach(([k, v]) => {
          console.log(`${k},${v}`);
        });
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
      Object.entries(stats.byVolume || {}).forEach(([k, v]) => {
        console.log(`  ${k}: ${v}`);
      });
    }
    if (opts.by === 'quadrant' || opts.by === 'all') {
      console.log('\nBy quadrant:');
      Object.entries(stats.byQuadrant || {}).forEach(([k, v]) => {
        console.log(`  ${k}: ${v}`);
      });
    }
    if (opts.by === 'ring' || opts.by === 'all') {
      console.log('\nBy ring:');
      Object.entries(stats.byRing || {}).forEach(([k, v]) => {
        console.log(`  ${k}: ${v}`);
      });
    }
    console.log(`\nTotal blips: ${stats.total}`);
  });

program.on('--help', () => {
  console.log('');
  console.log('Examples:');
  console.log('  $ tech-radar-volumes');
  console.log('  $ tech-radar-volumes fetch links');
  console.log('  $ tech-radar-volumes fetch data');
  console.log('  $ tech-radar-volumes volumes csv');
  console.log('  $ tech-radar-volumes help volumes');
  console.log('  $ tech-radar-volumes help');
  console.log('');
});

program.showSuggestionAfterError();

program.parse(process.argv);
