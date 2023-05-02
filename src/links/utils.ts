import { URLS } from '../common/constants';

export function constructFullURL(path: string): string {
    return `${URLS.BASE}${path}`;
}
