import fs from 'fs';
import _ from 'lodash';

function countRows() {
    for (let i = 1; i <= 27; i++) {
        const data = fs.readFileSync(
            `volumes/Thoughtworks Technology Radar Volume ${i}.csv`,
        );

        console.log(`Volume ${i}: ${data.toString().split('\n').length} rows`);
    }
}

countRows();
