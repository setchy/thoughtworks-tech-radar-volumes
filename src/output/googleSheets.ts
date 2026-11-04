import { exit } from 'node:process';

import { google } from 'googleapis';

import {
  CSV_HEADERS,
  canonicalizeRingName,
  URLS,
} from '../shared/constants.ts';
import { logger } from '../shared/logger.ts';
import type { BlipTimelineEntry } from '../shared/types.ts';

import { getVolumePublicationDate } from '../operations/utils.ts';

function getGoogleSheetsClient() {
  const sheetId = process.env.GOOGLE_SHEET_ID;
  const clientEmail = process.env.GOOGLE_CLIENT_EMAIL;
  const privateKey = process.env.GOOGLE_PRIVATE_KEY;

  if (!sheetId || !clientEmail || !privateKey) {
    logger.error('Missing Sheet ID, Client Email or Private Key');
    exit(1);
  }

  const auth = new google.auth.GoogleAuth({
    credentials: {
      client_email: clientEmail,
      private_key: privateKey,
    },
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });

  return {
    sheetId,
    sheets: google.sheets({
      version: 'v4',
      auth,
    }),
  };
}

export async function updateGoogleSheets(
  volume: string,
  volumeData: BlipTimelineEntry[],
) {
  const data = volumeData.map((blip) => [
    blip.name,
    canonicalizeRingName(blip.ring),
    blip.quadrant,
    blip.isNew.toString().toUpperCase(),
    // getStatus omitted here; CSV dataset previously prepended headers elsewhere
    '',
    blip.descriptionHtml,
  ]);
  data.unshift(CSV_HEADERS);

  const sheetName = `Vol ${volume} (${getVolumePublicationDate(volume)})`;
  const { sheetId, sheets } = getGoogleSheetsClient();

  try {
    const _response = await sheets.spreadsheets.values.get({
      spreadsheetId: sheetId,
      range: sheetName,
    });
  } catch (error) {
    const status = (error as { status?: number }).status;

    // Only treat a 400 as a missing sheet. Transient errors (e.g. rate
    // limits or server errors) must not be mistaken for a missing sheet,
    // otherwise we'd attempt to create a sheet that already exists.
    if (status !== 400) {
      throw error;
    }

    logger.warn(`Sheet ${sheetName} not found.  Creating new sheet...`);

    try {
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
    } catch (addError) {
      const message = (addError as { message?: string }).message ?? '';

      if (!message.includes('already exists')) {
        throw addError;
      }

      logger.warn(`Sheet ${sheetName} already exists.  Skipping creation.`);
    }
  }

  // Massage the description field (remove quotes) prior to updating the sheet
  const descriptionIndex = 5;
  for (const index in data) {
    const i = Number.parseInt(index, 10);
    data[i][descriptionIndex] = data[i][descriptionIndex]
      .replace(/^"|"$/g, '')
      .replaceAll('""', '"');
  }

  await sheets.spreadsheets.values.update({
    spreadsheetId: sheetId,
    range: sheetName,
    valueInputOption: 'RAW',
    requestBody: {
      values: data,
    },
  });

  logger.info(
    `Google Sheet ${sheetName} has been updated: ${URLS.GOOGLE_SHEET}${sheetId}&sheetName=${sheetName}`,
  );
}

/**
 * Returns the numeric Google Sheets tab id (gid) for every sheet, keyed by title.
 * Deep links need the gid; tab names alone do not work in public sheet URLs.
 */
export async function fetchGoogleSheetGids(): Promise<Map<string, number>> {
  const { sheetId, sheets } = getGoogleSheetsClient();
  const response = await sheets.spreadsheets.get({
    spreadsheetId: sheetId,
    fields: 'sheets.properties(sheetId,title)',
  });

  const gids = new Map<string, number>();

  for (const sheet of response.data.sheets ?? []) {
    const title = sheet.properties?.title;
    const gid = sheet.properties?.sheetId;

    if (title !== undefined && title !== null && gid != null) {
      gids.set(title, gid);
    }
  }

  return gids;
}
