import { readFileSync, writeFileSync } from 'node:fs';

import { logger } from '../shared/logger.ts';
import type { VolumeMetrics, VolumeMetricsData } from '../shared/types.ts';

export const README_PATH = 'README.md';
export const README_METRICS_START = '<!-- volume-metrics:start -->';
export const README_METRICS_END = '<!-- volume-metrics:end -->';
export const README_LATEST_LINKS_START = '<!-- volume-latest-links:start -->';
export const README_LATEST_LINKS_END = '<!-- volume-latest-links:end -->';
export const README_BLIPS_BADGE_START = '<!-- blips-badge:start -->';
export const README_BLIPS_BADGE_END = '<!-- blips-badge:end -->';

const GITHUB_RAW_BASE =
  'https://raw.githubusercontent.com/setchy/thoughtworks-tech-radar-volumes/main';
const GITHUB_VOLUMES_BASE =
  'https://github.com/setchy/thoughtworks-tech-radar-volumes/tree/main/volumes';
const GOOGLE_SHEET_ID = '1VRXOw7EUGBIeM8Khd5GFocxOWT59HRJtqs9-WbB61FI';
const GOOGLE_SHEETS_URL = `https://docs.google.com/spreadsheets/d/${GOOGLE_SHEET_ID}/edit?usp=sharing`;
const googleSheetGidUrl = (gid: number) =>
  `https://docs.google.com/spreadsheets/d/${GOOGLE_SHEET_ID}/edit#gid=${gid}`;

const EMPTY_VOLUMES_ERROR =
  'Cannot format a README summary without radar volumes';

const formatNumber = (value: number) => value.toLocaleString('en-US');

const rawFileUrl = (path: string) => `${GITHUB_RAW_BASE}/${encodeURI(path)}`;

const formatGoogleSheetLink = (sheetGid: number | null) =>
  sheetGid === null
    ? '[Sheets][volumes-google-sheets]'
    : `[Sheets](${googleSheetGidUrl(sheetGid)})`;

type Alignment = 'left' | 'right';

function formatTable(
  headers: string[],
  rows: string[][],
  alignments: Alignment[],
): string[] {
  const widths = headers.map((header, index) =>
    Math.max(header.length, ...rows.map((row) => row[index].length)),
  );

  const formatCell = (cell: string, index: number) =>
    alignments[index] === 'right'
      ? cell.padStart(widths[index])
      : cell.padEnd(widths[index]);

  const formatRow = (cells: string[]) =>
    `| ${cells.map((cell, index) => formatCell(cell, index)).join(' | ')} |`;

  const separator = `| ${widths
    .map((width, index) =>
      alignments[index] === 'right'
        ? `${'-'.repeat(width - 1)}:`
        : '-'.repeat(width),
    )
    .join(' | ')} |`;

  return [formatRow(headers), separator, ...rows.map(formatRow)];
}

function getLatestVolume(data: VolumeMetricsData): VolumeMetrics {
  const [firstVolume] = data.volumes;
  if (!firstVolume) {
    throw new Error(EMPTY_VOLUMES_ERROR);
  }

  return data.volumes.reduce(
    (current, volume) => (volume.volume > current.volume ? volume : current),
    firstVolume,
  );
}

export function formatLatestLinksMarkdown(data: VolumeMetricsData): string {
  const latest = getLatestVolume(data);

  return [
    README_LATEST_LINKS_START,
    `[volumes-latest-csv]: ${rawFileUrl(latest.files.csv)}`,
    `[volumes-latest-json]: ${rawFileUrl(latest.files.json)}`,
    `[volumes-csv]: ${GITHUB_VOLUMES_BASE}/csv`,
    `[volumes-json]: ${GITHUB_VOLUMES_BASE}/json`,
    `[volumes-google-sheets]: ${GOOGLE_SHEETS_URL}`,
    README_LATEST_LINKS_END,
  ].join('\n');
}

export function formatBlipsBadgeMarkdown(data: VolumeMetricsData): string {
  const blips = data.volumes.reduce((sum, volume) => sum + volume.total, 0);
  const formattedBlips = formatNumber(blips).replaceAll(',', '%2C');

  return [
    README_BLIPS_BADGE_START,
    `[blips-badge]: https://img.shields.io/badge/blips-${formattedBlips}-blue?logo=satellite`,
    README_BLIPS_BADGE_END,
  ].join('\n');
}

export function formatVolumeMetricsMarkdown(data: VolumeMetricsData): string {
  if (data.volumes.length === 0) {
    throw new Error(EMPTY_VOLUMES_ERROR);
  }

  const totals = data.volumes.reduce(
    (accumulator, volume) => ({
      blips: accumulator.blips + volume.total,
      new: accumulator.new + volume.status.new,
      movedIn: accumulator.movedIn + volume.status.movedIn,
      movedOut: accumulator.movedOut + volume.status.movedOut,
      noChange: accumulator.noChange + volume.status.noChange,
    }),
    { blips: 0, new: 0, movedIn: 0, movedOut: 0, noChange: 0 },
  );

  const rows = data.volumes.map((volume) => [
    String(volume.volume),
    volume.publishedDate,
    formatNumber(volume.total),
    formatNumber(volume.status.new),
    formatNumber(volume.status.movedIn),
    formatNumber(volume.status.movedOut),
    formatNumber(volume.status.noChange),
    `[CSV](${encodeURI(volume.files.csv)})`,
    `[JSON](${encodeURI(volume.files.json)})`,
    formatGoogleSheetLink(volume.sheetGid),
  ]);

  rows.push([
    '**Total**',
    '',
    `**${formatNumber(totals.blips)}**`,
    `**${formatNumber(totals.new)}**`,
    `**${formatNumber(totals.movedIn)}**`,
    `**${formatNumber(totals.movedOut)}**`,
    `**${formatNumber(totals.noChange)}**`,
    '',
    '',
    '',
  ]);

  const table = formatTable(
    [
      'Volume',
      'Published',
      'Blips',
      'New',
      'Moved in',
      'Moved out',
      'No change',
      'CSV',
      'JSON',
      'Sheets',
    ],
    rows,
    [
      'left',
      'left',
      'right',
      'right',
      'right',
      'right',
      'right',
      'left',
      'left',
      'left',
    ],
  );

  return [
    README_METRICS_START,
    '<!-- Generated by `pnpm start volumes metrics` from data/volume-metrics.json. Do not edit by hand. -->',
    '> [!IMPORTANT]',
    '> _When using either the CSV or JSON data formats, please make sure to use the GitHub RAW file URL (eg: [latest volume CSV][volumes-latest-csv] or [latest volume JSON][volumes-latest-json])_',
    '-   <img src="./assets/icons/csv.png" width="26" height="26" alt="CSV"></img> **CSV** — [GitHub - Thoughtworks Volumes][volumes-csv]',
    '-   <img src="./assets/icons/json.png" width="26" height="26" alt="JSON"></img> **JSON** — [GitHub - Thoughtworks Volumes][volumes-json]',
    '-   <img src="./assets/icons/google-sheets.svg" width="24" height="24" alt="Google Sheets" /> **Google Sheets** — [Thoughtworks Technology Radar Volumes][volumes-google-sheets]',
    '',
    '<details>',
    `<summary>Volume metrics — ${data.volumes.length} volumes, ${formatNumber(totals.blips)} blips</summary>`,
    '',
    ...table,
    '',
    '</details>',
    README_METRICS_END,
  ].join('\n');
}

function replaceMarkedSection(
  readme: string,
  startMarker: string,
  endMarker: string,
  markdown: string,
): string {
  const start = readme.indexOf(startMarker);
  const end = readme.indexOf(endMarker);

  if (start === -1 || end === -1 || end < start) {
    throw new Error(
      `README is missing the ${startMarker} / ${endMarker} markers`,
    );
  }

  return `${readme.slice(0, start)}${markdown}${readme.slice(end + endMarker.length)}`;
}

export function replaceVolumeMetricsSection(
  readme: string,
  markdown: string,
): string {
  return replaceMarkedSection(
    readme,
    README_METRICS_START,
    README_METRICS_END,
    markdown,
  );
}

export function replaceBlipsBadgeSection(
  readme: string,
  markdown: string,
): string {
  return replaceMarkedSection(
    readme,
    README_BLIPS_BADGE_START,
    README_BLIPS_BADGE_END,
    markdown,
  );
}

export function replaceLatestLinksSection(
  readme: string,
  markdown: string,
): string {
  return replaceMarkedSection(
    readme,
    README_LATEST_LINKS_START,
    README_LATEST_LINKS_END,
    markdown,
  );
}

export function updateReadmeMetrics(data: VolumeMetricsData) {
  const readme = readFileSync(README_PATH, 'utf-8');
  const withBadge = replaceBlipsBadgeSection(
    readme,
    formatBlipsBadgeMarkdown(data),
  );
  const withMetrics = replaceVolumeMetricsSection(
    withBadge,
    formatVolumeMetricsMarkdown(data),
  );
  const updated = replaceLatestLinksSection(
    withMetrics,
    formatLatestLinksMarkdown(data),
  );

  logger.info('Updating README volume metrics summary', README_PATH);
  writeFileSync(README_PATH, updated, 'utf-8');
}
