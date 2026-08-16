import { Command } from 'commander';

import { logger } from '../shared/logger.ts';

import {
  fetchCommand,
  filterCommand,
  searchCommand,
  statsCommand,
  validateCommand,
  volumesCommand,
} from './commands/index.ts';
import { CLI_EXAMPLES } from './examples.ts';

export function createCLI() {
  const program = new Command();

  program
    .name('tech-radar-volumes')
    .description('A CLI tool to fetch and process ThoughtWorks Tech Radar data')
    .version('latest');

  fetchCommand(program);
  volumesCommand(program);
  searchCommand(program);
  filterCommand(program);
  statsCommand(program);
  validateCommand(program);

  program.on('--help', () => {
    logger.info('');
    logger.info('Examples:');
    for (const example of CLI_EXAMPLES) {
      logger.info(`  ${example}`);
    }
    logger.info('');
  });

  program.showSuggestionAfterError();

  return program;
}
