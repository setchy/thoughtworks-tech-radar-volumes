import * as dotenv from 'dotenv';

dotenv.config({
  path: './config/.env',
});

import { createCLI } from './cli/index.ts';

const program = createCLI();
program.parse(process.argv);
