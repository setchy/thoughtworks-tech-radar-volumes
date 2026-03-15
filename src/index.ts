import * as dotenv from 'dotenv';

dotenv.config({
  path: './config/.env',
});

import { createCLI } from './cli';

const program = createCLI();
program.parse(process.argv);
