import type { Command } from 'commander';

import { filterData } from '../../operations';
import { BLIP_STATUSES } from '../../shared/constants';
import type { BlipStatus } from '../../shared/types';
import { formatEnrichedBlip, validateOutputFormat } from '../formatters';

export function filterCommand(program: Command) {
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
}
