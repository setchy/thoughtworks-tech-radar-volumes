import fs from 'node:fs';

export function readJSONFile<T>(filename: string): T {
  return JSON.parse(fs.readFileSync(filename, 'utf8').toString());
}

export function writeJSONFile(filename: string, contents: unknown) {
  fs.writeFileSync(filename, `${JSON.stringify(contents, null, 2)}\n`);
}

export function writeCSVFile(filename: string, data: string[]) {
  fs.writeFileSync(filename, data.join('\n'));
}
