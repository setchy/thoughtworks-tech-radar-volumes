import _ from 'lodash';
import { FILES, URLS } from '../common/constants';
import { writeJSONFile } from '../utils';

export async function parseRadarSitemap(): Promise<string[]> {
  const sitemap = await (await fetch(URLS.SITEMAP)).text();

  const regex = /<loc>(.*?)<\/loc>/g;
  const links: string[] = [];
  let match = regex.exec(sitemap);

  while (match !== null) {
    links.push(match[1]);
    match = regex.exec(sitemap);
  }

  links.sort();

  const uniqueLinks = _.uniq(links);
  writeJSONFile(FILES.DATA.LINKS, uniqueLinks);

  console.log(`Found ${uniqueLinks.length} unique radar blip page links`);

  return uniqueLinks;
}
