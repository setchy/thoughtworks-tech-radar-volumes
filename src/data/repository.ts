import fs from 'node:fs';
import { EOL } from 'node:os';

import type { z } from 'zod';

const DEFAULT_ENCODING = 'utf-8';

export function readJSONFile<T>(filename: string, schema?: z.ZodType<T>): T {
  const raw: unknown = JSON.parse(
    fs.readFileSync(filename, DEFAULT_ENCODING).toString(),
  );

  if (schema) {
    const result = schema.safeParse(raw);

    if (!result.success) {
      throw new Error(
        `Invalid data in ${filename}: ${formatZodIssues(result.error.issues, raw)}`,
      );
    }

    return result.data;
  }

  return raw as T;
}

function formatZodIssues(issues: z.ZodIssue[], raw: unknown): string {
  return issues
    .slice(0, 5)
    .map((issue) => {
      const path = issue.path.join('.');

      // For array-of-records datasets, surface the offending record itself.
      let record: unknown;
      if (typeof issue.path[0] === 'number' && Array.isArray(raw)) {
        record = raw[issue.path[0] as number];
      }

      return `[${path || '<root>'}] ${issue.message}${
        record !== undefined ? ` in record: ${JSON.stringify(record)}` : ''
      }`;
    })
    .join('\n');
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
