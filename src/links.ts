import https from 'https';
import { parse } from 'url';
import fs from 'fs';
import { FILES, URLS } from './constants';
import { constructFullURL } from './utils';

export async function extractRadarLinks(): Promise<string[]> {
    const { host, path } = parse(URLS.SEARCH);

    return new Promise((resolve, reject) => {
        const request = https.get({ host, path }, (response) => {
            if (response.statusCode !== 200) {
                reject(
                    new Error(
                        `Failed to fetch ${URLS.SEARCH}: ${response.statusMessage}`,
                    ),
                );
            } else {
                let html = '';
                response.on('data', (chunk) => (html += chunk));
                response.on('end', () => {
                    const links: string[] = [];
                    const regex =
                        /href="(\/radar\/(languages-and-frameworks|techniques|platforms|tools)\/[^"]+)"/g;
                    let match;
                    while ((match = regex.exec(html))) {
                        links.push(constructFullURL(match[1]));
                    }

                    fs.writeFileSync(
                        FILES.DATA.LINKS,
                        JSON.stringify(links, null, 4),
                    );
                    resolve(links);
                });
            }
        });
        request.on('error', (error) => reject(error));
    });
}

extractRadarLinks();
