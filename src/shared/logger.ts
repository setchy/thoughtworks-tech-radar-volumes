const RESET = '\x1b[0m';
const BOLD = '\x1b[1m';
const RED = '\x1b[31m';
const YELLOW = '\x1b[33m';

function colorize(code: string, text: string): string {
  // Only emit ANSI codes when writing to a terminal, so logs captured in CI
  // or piped to a file stay plain.
  if (!process.stderr.isTTY) {
    return text;
  }
  return `${BOLD}${code}${text}${RESET}`;
}

export const logger = {
  info: (...args: unknown[]) => console.log(...args),
  warn: (...args: unknown[]) =>
    console.warn(...args.map((arg) => colorize(YELLOW, String(arg)))),
  error: (...args: unknown[]) =>
    console.error(...args.map((arg) => colorize(RED, String(arg)))),
  table: (data: unknown) => console.table(data),
};
