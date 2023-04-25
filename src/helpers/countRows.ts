import fs from 'fs';
import _ from 'lodash';
import { FILES } from '../common/constants';

function countRows() {
    for (let i = 1; i <= 27; i++) {
        const data = fs.readFileSync(
            `${FILES.VOLUMES.FOLDER}/${FILES.VOLUMES.FILE_PREFIX} ${i}.csv`,
        );

        console.log(`Volume ${i}: ${data.toString().split('\n').length} rows`);
    }
}

countRows();
