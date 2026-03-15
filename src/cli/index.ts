import { Command } from 'commander';

import {
  fetchCommand,
  filterCommand,
  searchCommand,
  statsCommand,
  volumesCommand,
} from './commands';
import { CLI_EXAMPLES } from './examples';

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

  program.on('--help', () => {
    console.log('');
    console.log('Examples:');
    for (const example of CLI_EXAMPLES) {
      console.log(`  ${example}`);
    }
    console.log('');
  });

  program.showSuggestionAfterError();

  return program;
}
