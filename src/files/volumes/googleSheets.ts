import { exit } from 'node:process';

import { google } from 'googleapis';

import { CSV_HEADERS, URLS } from '../../common/constants';
import type { BlipTimelineEntry } from '../../types';
import { getVolumePublicationDate } from '../utils';

export async function updateGoogleSheets(
  volume: string,
  volumeData: BlipTimelineEntry[],
) {
  const data = volumeData.map((blip) => [
    blip.name,
    blip.ring,
    blip.quadrant,
    blip.isNew.toString().toUpperCase(),
    // getStatus omitted here; CSV dataset previously prepended headers elsewhere
    '',
    blip.descriptionHtml,
  ]);
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
    const _response = await sheets.spreadsheets.values.get({
      spreadsheetId: sheetId,
      range: sheetName,
    });
  } catch (_error) {
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
    const i = Number.parseInt(index, 10);
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
