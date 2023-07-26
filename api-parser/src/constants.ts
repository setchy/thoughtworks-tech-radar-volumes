export const URLS = {
    SEARCH_API: 'https://www.thoughtworks.com/rest/radar/publish/en/search',
};

export const FILES = {
    VOLUMES: {
        FOLDER: 'volumes',
        FILE_PREFIX: 'Thoughtworks Technology Radar Volume',
    },
    DATA: {
        RAW: 'data/api-response.json',
    },
};

export const CSV_HEADERS = [
    'name',
    'ring',
    'quadrant',
    'isNew',
    'status',
    'description',
];

export const QUADRANT_SORT_ORDER = [
    'techniques',
    'platforms',
    'tools',
    'languages-and-frameworks',
];

export const RING_SORT_ORDER = ['adopt', 'trial', 'assess', 'hold'];
