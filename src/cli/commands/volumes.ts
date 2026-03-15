import { Argument, type Command } from 'commander';

import { generateVolumes } from '../../output';
import { REPORT_TYPES } from '../../shared/constants';
import type { ReportType } from '../../shared/types';

export function volumesCommand(program: Command) {
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
}
