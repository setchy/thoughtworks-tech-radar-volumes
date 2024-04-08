import fs from 'node:fs';
import { CSV_HEADERS, FILES } from '../common/constants';

function countRows() {
  for (let i = 1; i <= CSV_HEADERS.length; i++) {
    const data = fs.readFileSync(
      `${FILES.VOLUMES.FOLDER}/${FILES.VOLUMES.FILE_PREFIX} ${i}.csv`,
    );

    console.log(`Volume ${i}: ${data.toString().split('\n').length} rows`);
  }
}

countRows();
