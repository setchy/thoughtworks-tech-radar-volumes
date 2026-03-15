import type { Command } from 'commander';

import { searchData } from '../../operations';
import { formatEnrichedBlip, validateOutputFormat } from '../formatters';

export function searchCommand(program: Command) {
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
}
