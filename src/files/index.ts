import { exit } from 'node:process';
import { google } from 'googleapis';
import _ from 'lodash';

import {
  CSV_HEADERS,
  FILES,
  QUADRANT_SORT_ORDER,
  RING_SORT_ORDER,
  URLS,
} from '../common/constants';
import type { BlipTimelineEntry, ReportType } from '../types';
import { readJSONFile, writeCSVFile, writeJSONFile } from '../utils';
import {
  escapeDescriptionHTML,
  getStatus,
  getVolumeFileName,
  getVolumePublicationDate,
} from './utils';

export function generateVolumes(reportType: ReportType) {
  const data = readJSONFile<BlipTimelineEntry[]>(FILES.DATA.MASTER);

  const groupedByVolumes = _.groupBy(data, 'volume');

  _.forEach(groupedByVolumes, (data, volume) => {
    const sortedData = _.orderBy(data, [
      (entry) => _.indexOf(QUADRANT_SORT_ORDER, entry.quadrant),
      (entry) => _.indexOf(RING_SORT_ORDER, entry.ring),
      (entry) => entry.name.toLowerCase(),
    ]);

    switch (reportType) {
      case 'csv':
        generateCSV(volume, sortedData);
        break;
      case 'json':
        generateJSON(volume, sortedData);
        break;
      case 'google-sheets':
        updateGoogleSheets(volume, sortedData);
        break;
      default:
        generateCSV(volume, sortedData);
        generateJSON(volume, sortedData);
        updateGoogleSheets(volume, sortedData);
        break;
    }
  });
}

function generateCSV(volume: string, volumeData: BlipTimelineEntry[]) {
  const data = formatCSVDataset(volumeData);

  const csvData = data.map((row) => row.join(','));
  csvData.unshift(CSV_HEADERS.join(','));

  const filename = `${FILES.VOLUMES.FOLDER}/csv/${getVolumeFileName(
    volume,
  )}.csv`;

  console.log('Creating CSV file', filename);

  writeCSVFile(filename, csvData);
}

function generateJSON(volume: string, volumeData: BlipTimelineEntry[]) {
  const data = volumeData.map((row) => ({
    name: row.name,
    ring: row.ring,
    quadrant: row.quadrant,
    isNew: row.isNew.toString().toUpperCase(),
    status: getStatus(row),
    description: escapeDescriptionHTML(row.descriptionHtml),
  }));

  const filename = `${FILES.VOLUMES.FOLDER}/json/${getVolumeFileName(
    volume,
  )}.json`;
  console.log('Creating JSON file', filename);
  writeJSONFile(filename, data);
}

async function updateGoogleSheets(
  volume: string,
  volumeData: BlipTimelineEntry[],
) {
  const data = formatCSVDataset(volumeData);
  data.unshift(CSV_HEADERS);

  const sheetName = `Vol ${volume} (${getVolumePublicationDate(volume)})`;
  const sheetId = process.env.GOOGLE_SHEET_ID;
  const clientEmail = process.env.GOOGLE_CLIENT_EMAIL;
  const privateKey = process.env.GOOGLE_PRIVATE_KEY;

  if (!sheetId || !clientEmail || !privateKey) {
    console.error('Missing Sheet ID, Client Email or Private Key');
    exit(1);
  }

  const auth = new google.auth.GoogleAuth({
    credentials: {
      client_email: clientEmail,
      private_key: privateKey,
    },
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });

  const sheets = google.sheets({
    version: 'v4',
    auth,
  });

  try {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: sheetId,
      range: sheetName,
    });
  } catch (error) {
    console.warn(`Sheet ${sheetName} not found.  Creating new sheet...`);

    await sheets.spreadsheets.batchUpdate({
      spreadsheetId: sheetId,
      requestBody: {
        requests: [
          {
            addSheet: {
              properties: {
                title: sheetName,
              },
            },
          },
        ],
      },
    });
  }

  // Massage the description field (remove quotes) prior to updating the sheet
  const descriptionIndex = 5;
  for (const index in data) {
    const i = Number.parseInt(index);
    data[i][descriptionIndex] = data[i][descriptionIndex]
      .replace(/^"|"$/g, '')
      .replace(/""/g, '"');
  }

  await sheets.spreadsheets.values.update({
    spreadsheetId: sheetId,
    range: sheetName,
    valueInputOption: 'RAW',
    requestBody: {
      values: data,
    },
  });

  console.log(
    `Google Sheet ${sheetName} has been updated: ${URLS.GOOGLE_SHEET}${sheetId}&sheetName=${sheetName}`,
  );
}

function formatCSVDataset(data: BlipTimelineEntry[]) {
  return data.map((blip) => [
    blip.name,
    blip.ring,
    blip.quadrant,
    blip.isNew.toString().toUpperCase(),
    getStatus(blip),
    escapeDescriptionHTML(blip.descriptionHtml),
  ]);
}
