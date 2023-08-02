import fs from 'fs';
import { FILES, URLS } from '../common/constants';
import puppeteer from 'puppeteer';

export async function extractRadarLinks() {
    const links: string[] = [];

    const PAGE_SIZE = 10;

    let i = 0;
    let totalRecords;

    const browser = await puppeteer.launch({ headless: 'new' });

    while (true) {
        const page = await browser.newPage();

        // Navigate the page to a URL
        await page.goto(`${URLS.SEARCH}?firstResult=${i}`);

        // Wait for the elements to be present before extracting them
        await page.waitForSelector('a[data-testid="result-item__title"]');

        if (totalRecords === undefined) {
            totalRecords = await page.evaluate(() => {
                const spanElement = document.querySelector(
                    'span[data-testid="pagination-info-text"]',
                );
                const text = spanElement?.textContent;
                const regex = /(out of )(\d+)/;
                const match = text?.match(regex);
                return match ? parseInt(match[2]) : null;
            });
        }

        if (!totalRecords || i > totalRecords) {
            break;
        }

        // Extract the elements with the given data-testid attribute
        const elements = await page.$$eval(
            'a[data-testid="result-item__title"]',
            (links) => links.map((link) => link.href),
        );

        console.log(
            `Adding items ${i + 1} through ${
                i + elements.length
            } to the list...`,
        );
        links.push(...elements);
        links.sort();

        fs.writeFileSync(FILES.DATA.LINKS, JSON.stringify(links, null, 4));

        i += PAGE_SIZE;

        // Add an artificial delay to reduce chance of CloudFront rate limiting
        await new Promise((r) => setTimeout(r, 5000));
    }

    browser.close();
}

extractRadarLinks();
