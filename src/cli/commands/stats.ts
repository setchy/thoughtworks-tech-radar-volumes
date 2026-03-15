import type { Command } from 'commander';

import { summarizeStats } from '../../operations';
import { formatStats, validateOutputFormat } from '../formatters';

export function statsCommand(program: Command) {
  program
    .command('stats')
    .description('show statistics for the master dataset')
    .option(
      '-b, --by <group>',
      'group stats by: volume|quadrant|ring|all',
      'all',
    )
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
}
