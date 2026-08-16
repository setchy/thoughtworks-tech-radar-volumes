import { Argument, type Command } from 'commander';

import { REPORT_TYPES } from '../../shared/constants.ts';
import { logger } from '../../shared/logger.ts';
import type { ReportType } from '../../shared/types.ts';

import { generateVolumes } from '../../output/index.ts';

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
      logger.info(`generating ${type} volumes`);
      generateVolumes(type);
    });
}
