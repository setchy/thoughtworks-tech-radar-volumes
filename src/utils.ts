import fs from 'node:fs';
import { EOL } from 'node:os';

const DEFAULT_ENCODING = 'utf-8';

export function readJSONFile<T>(filename: string): T {
  return JSON.parse(fs.readFileSync(filename, DEFAULT_ENCODING).toString());
}

export function writeJSONFile(filename: string, contents: unknown) {
  fs.writeFileSync(
    filename,
    `${JSON.stringify(contents, null, 2)}\n`,
    DEFAULT_ENCODING,
  );
}

export function writeCSVFile(filename: string, data: string[]) {
  fs.writeFileSync(filename, data.join('\n'), DEFAULT_ENCODING);
  fs.appendFileSync(filename, EOL, DEFAULT_ENCODING);
}
