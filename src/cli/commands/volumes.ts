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
      'generate publication volumes and dataset metrics.\nInputs: requires `data/master.json`.\nOutput: generated volumes will be saved in `volumes/*` and `data/volume-metrics.json`.\n',
    )
    .action(async (type: ReportType) => {
      logger.info(`generating ${type} output`);
      await generateVolumes(type);
    });
}
