import fs from 'node:fs';
import _ from 'lodash';
import { FILES } from '../common/constants';
import type { MasterData } from '../types';

function sortDataAlphabetically() {
  const masterData: MasterData = JSON.parse(
    fs.readFileSync(FILES.DATA.MASTER).toString(),
  );

  // Sort json document
  const sortedForTesting = _.orderBy(masterData, ['name']);

  fs.writeFileSync(
    'data/master-sorted.json',
    JSON.stringify(sortedForTesting, null, 4),
  );
}

sortDataAlphabetically();
