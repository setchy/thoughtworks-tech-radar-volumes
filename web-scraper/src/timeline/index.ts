import https from 'https';
import { JSDOM } from 'jsdom';
import { parse } from 'url';
import { BlipTimelineEntry, MasterData } from '../types';
import _ from 'lodash';
import { RING_SORT_ORDER } from '../common/constants';
import { getVolumeNameFromDate } from './utils';
import {
    getBlipNameFromDOM,
    getDescriptionHTMLFromBlipDOM,
    getPublishedDateFromBlipDOM,
    getQuadrantNameFromPath,
    getRingNameFromBlipDOM,
} from './utils';

export async function extractBlipTimeline(
    blipURL: string,
): Promise<MasterData> {
    const { host, path } = parse(blipURL);

    return new Promise((resolve, reject) => {
        const request = https.get({ host, path }, (response) => {
            if (response.statusCode !== 200) {
                reject(
                    new Error(
                        `Failed to fetch ${blipURL}: ${response.statusMessage}`,
                    ),
                );
            } else {
                let html = '';
                response.on('data', (chunk) => (html += chunk));
                response.on('end', () => {
                    const blipMasterData: MasterData = {
                        blipEntries: [],
                    };

                    const dom = new JSDOM(html);

                    const blipTimeline =
                        dom.window.document.querySelectorAll(
                            "div[blip='blip']",
                        );

                    blipTimeline.forEach((blipUpdate) => {
                        const blipUpdateDOM = new JSDOM(blipUpdate.innerHTML);

                        const name = getBlipNameFromDOM(dom);
                        const publishedDate =
                            getPublishedDateFromBlipDOM(blipUpdateDOM);
                        const volume = getVolumeNameFromDate(publishedDate);
                        const quadrant = getQuadrantNameFromPath(path);
                        const ring = getRingNameFromBlipDOM(blipUpdateDOM);
                        const descriptionHtml =
                            getDescriptionHTMLFromBlipDOM(blipUpdateDOM);

                        const blipTimelineEntry: BlipTimelineEntry = {
                            name: name,
                            quadrant: quadrant,
                            ring: ring,
                            volume: volume,
                            publishedDate: publishedDate,
                            descriptionHtml: descriptionHtml,

                            // Default these to false - will be reset after calculating movements
                            isNew: false,
                            hasMovedIn: false,
                            hasMovedOut: false,
                        };

                        blipMasterData.blipEntries.push(blipTimelineEntry);
                    });

                    // Reverse the order so that it's easier to calculate the isNew, hasMovedIn, hasMovedOut boolean values
                    blipMasterData.blipEntries = _.reverse(
                        blipMasterData.blipEntries,
                    );

                    calculateBlipMovements(blipMasterData);

                    resolve(blipMasterData);
                });
            }
        });
        request.on('error', (error) => reject(error));
    });
}

function calculateBlipMovements(blipMasterData: MasterData) {
    for (let i = 0; i < blipMasterData.blipEntries.length; i++) {
        if (i === 0) {
            blipMasterData.blipEntries[i].isNew = true;
        }

        if (i > 0) {
            const currentRingIndex = _.indexOf(
                RING_SORT_ORDER,
                blipMasterData.blipEntries[i].ring,
            );
            const previousRingIndex = _.indexOf(
                RING_SORT_ORDER,
                blipMasterData.blipEntries[i - 1].ring,
            );

            if (currentRingIndex > previousRingIndex) {
                blipMasterData.blipEntries[i].hasMovedOut = true;
            } else if (currentRingIndex < previousRingIndex) {
                blipMasterData.blipEntries[i].hasMovedIn = true;
            }
        }
    }
}
