import { URLS } from './constants';

export function getShortPath(url: string): string {
    return url.replace(URLS.RADAR, '');
}
