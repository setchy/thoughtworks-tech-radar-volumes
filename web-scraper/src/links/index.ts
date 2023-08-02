import fs from 'fs';
import { FILES, URLS } from '../common/constants';
import puppeteer, { Page } from 'puppeteer';
import _ from 'lodash';

const SELECTOR_RESULT_ITEM = 'a[data-testid="result-item__title"]';
const links: string[] = [];

let page: Page;

export async function extractRadarLinks(): Promise<string[]> {
    let i = 0;
    let totalRecords;

    const browser = await puppeteer.launch({ headless: 'new' });
    page = await browser.newPage();

    while (true) {
        await openResultsPageAndWaitForLoad(i);

        // On the first parse, extract and store the total records we're targeting to parse
        if (totalRecords === undefined) {
            totalRecords = await getTotalRecordCount();
        }

        if (!totalRecords || i === totalRecords) {
            break;
        }

        const paginatedBlips = await getBlipResultsOnPage();

        addPagedResultsToLinks(paginatedBlips);

        i += paginatedBlips.length;

        // Add an artificial delay to reduce chance of CloudFront rate limiting
        await new Promise((r) => setTimeout(r, 5000));
    }

    browser.close();

    const uniqueLinks = _.uniq(links);
    fs.writeFileSync(FILES.DATA.LINKS, JSON.stringify(uniqueLinks, null, 4));

    return uniqueLinks;
}

extractRadarLinks();

async function getTotalRecordCount(): Promise<number | null> {
    return await page.evaluate(() => {
        const spanElement = document.querySelector(
            'span[data-testid="pagination-info-text"]',
        );
        const text = spanElement?.textContent;
        const regex = /(\d+)\sblips/;
        const match = text?.match(regex);
        return match ? parseInt(match[1]) : null;
    });
}

async function getBlipResultsOnPage(): Promise<string[]> {
    return await page.$$eval(SELECTOR_RESULT_ITEM, (links) =>
        links.map((link) => link.href),
    );
}

async function openResultsPageAndWaitForLoad(startingPosition: number) {
    await page.goto(`${URLS.SEARCH}?firstResult=${startingPosition}`);

    // Wait for the elements to be present before extracting them
    await page.waitForSelector(SELECTOR_RESULT_ITEM);
}

function addPagedResultsToLinks(newLinks: string[]) {
    console.log(
        `Adding items ${links.length + 1} through ${
            links.length + newLinks.length
        } to the list...`,
    );

    links.push(...newLinks);
    links.sort();
}
