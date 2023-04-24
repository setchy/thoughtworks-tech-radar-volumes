import https from "https";
import { parse } from "url";
import { JSDOM } from "jsdom";
import { BlipTimelineEntry, MasterData } from "./types";
import fs from "fs";
import _ from "lodash";
import { CSV_HEADERS, QUADRANT_SORT_ORDER, RING_SORT_ORDER, VOLUME_TO_DATE } from "./constants";

const BASE_URL = "https://www.thoughtworks.com";
const SEARCH_URL = `${BASE_URL}/radar/search`;


async function extractRadarLinks(): Promise<string[]> {
  const { host, path } = parse(SEARCH_URL);

  return new Promise((resolve, reject) => {
    const request = https.get({ host, path }, (response) => {
      if (response.statusCode !== 200) {
        reject(new Error(`Failed to fetch ${SEARCH_URL}: ${response.statusMessage}`));
      } else {
        let html = "";
        response.on("data", (chunk) => (html += chunk));
        response.on("end", () => {
          const links: string[] = [];
          const regex = /href="(\/radar\/(languages-and-frameworks|techniques|platforms|tools)\/[^"]+)"/g;
          let match;
          while ((match = regex.exec(html))) {
            links.push(constructFullURL(match[1]));
          }
          resolve(links);
        });
      }
    });
    request.on("error", (error) => reject(error));
  });
}

async function extractBlipTimeline(blipURL: string) : Promise<MasterData> {
    const { host, path } = parse(blipURL);

    return new Promise((resolve, reject) => {
        const request = https.get({ host, path }, (response) => {
          if (response.statusCode !== 200) {
            reject(new Error(`Failed to fetch ${blipURL}: ${response.statusMessage}`));
          } else {
            let html = "";
            response.on("data", (chunk) => (html += chunk));
            response.on("end", () => {

                const blipMasterData : MasterData = {
                    blipEntries: []
                }

                const dom = new JSDOM(html);

                const blipTimeline = dom.window.document.querySelectorAll("div[blip='blip']");

                blipTimeline.forEach((blipUpdate: { innerHTML: any; }) => {
                    const blipUpdateDOM = new JSDOM(blipUpdate.innerHTML);

                    const name = getBlipNameFromDOM(dom);
                    const publishedDate = getPublishedDateFromBlipDOM(blipUpdateDOM);
                    const volume = getVolumeNameFromDate(publishedDate)
                    const quadrant = getQuadrantNameFromBlipDOM(blipUpdateDOM);
                    const ring = getRingNameFromBlipDOM(blipUpdateDOM);
                    const descriptionHtml = getDescriptionHTMLFromBlipDOM(blipUpdateDOM);
                    
                    const blipTimelineEntry: BlipTimelineEntry = {
                        name: name,
                        quadrant: quadrant,
                        ring: ring,
                        volume: volume,
                        publishedDate: publishedDate,
                        descriptionHtml: descriptionHtml
                    }

                    blipMasterData.blipEntries.push(blipTimelineEntry);
                });

                resolve(blipMasterData);
            });
          }
        });
        request.on("error", (error) => reject(error));
      });
}

// function generateVolumeCSVs(masterData: MasterData) {
function generateVolumeCSVs() {
    const data : MasterData = JSON.parse(fs.readFileSync('data/master.json').toString());

    const groupedByVolumes = _.groupBy(data.blipEntries, "volume");

    _.forEach(groupedByVolumes, (value, key) => {
        const sortedBlipEntries = _.orderBy(value, [
          entry => _.indexOf(QUADRANT_SORT_ORDER, entry.quadrant),
          entry => _.indexOf(RING_SORT_ORDER, entry.ring),
          'name'
        ]);

        const csvVolume = sortedBlipEntries.map(entry => [
          entry.name,
          entry.ring,
          entry.quadrant,
          'FALSE', // TODO - Implement this maybe
          'FALSE',
          'FALSE',
          `"${escapeDescriptionHTML(entry.descriptionHtml)}"`
        ].join(','));

        console.log('Creating CSV file', `temp/${key}.csv`)
        fs.writeFileSync(`temp/${key}.csv`, CSV_HEADERS.join(',') + '\n' + csvVolume.join('\n'));
    });
}

function getVolumeNameFromDate(date: string): string {
    const volume = Object.entries(VOLUME_TO_DATE).find(([, volumeDate]) => volumeDate === date);
    return volume ? volume[0] : date;
}

function constructFullURL(path: string): string {
    return `${BASE_URL}${path}`;
}

function getBlipNameFromDOM(dom: JSDOM): string {
    const cssClass = "hero-banner__overlay__container__title";

    return dom.window.document.querySelector(`h1.${cssClass}`)?.innerHTML.trim() || "";
}

function getPublishedDateFromBlipDOM(dom: JSDOM): string {
    const cssClass = "cmp-blip-timeline__item--time";

    return dom.window.document.querySelector(`div.${cssClass}`)?.innerHTML.trim() || "";
}

function getQuadrantNameFromBlipDOM(dom: JSDOM): string {
    const cssClass = "cmp-blip-timeline__item--ring";

    const quadrantDiv = dom.window.document.querySelector(`div.${cssClass}`);
    return quadrantDiv?.classList.toString().replace(cssClass, "").trim().toLowerCase() || "";
}

function getRingNameFromBlipDOM(dom: JSDOM): string {
    const cssClass = "cmp-blip-timeline__item--ring";

    const quadrantDiv = dom.window.document.querySelector(`div.${cssClass}`);
    const quadrantDOM = new JSDOM(quadrantDiv?.innerHTML || "");

    return quadrantDOM.window.document.querySelector(`span`)?.innerHTML.trim().toLowerCase() || "";
}

function getDescriptionHTMLFromBlipDOM(dom: JSDOM): string {
    const cssClass = "blip-timeline-description";

    return dom.window.document.querySelector(`div.${cssClass}`)?.innerHTML.trim() || "";
}

function escapeDescriptionHTML(description: string): string {
    return description.replace(/"/g, '""');
}

async function main() {

    const masterData : MasterData = {
        blipEntries: []
    }

    const radarLinks = await extractRadarLinks();

    console.log(`Found ${radarLinks.length} radar links`)

    for (const [index, link] of radarLinks.entries()) {
        console.log(`${index} of ${radarLinks.length}: Extracting blip timeline from ${link?.replace(`${BASE_URL}/radar/`, '')}...`)

        const blipMasterData: MasterData = await extractBlipTimeline(link);
        masterData.blipEntries.push(... blipMasterData.blipEntries);
    }

    fs.writeFileSync('data/master.json', JSON.stringify(masterData, null, 2));

}

// main()
generateVolumeCSVs();