import { MasterData } from './types';
import fs from 'fs';
import _ from 'lodash';
import { FILES } from './constants';
import { parse } from 'url';
import { getQuadrantNameFromPath } from './helpers';

function sortData() {
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

// sortData();

function testThis() {
    const { host, path } = parse(
        'https://www.thoughtworks.com/radar/platforms/net-core',
    );

    console.log(host);
    console.log(path);

    console.log(getQuadrantNameFromPath(path));
}

testThis();
