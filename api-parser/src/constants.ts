export const URLS = {
    SEARCH_API: 'https://www.thoughtworks.com/rest/radar/publish/en/search',
};

export const FILES = {
    VOLUMES: {
        CSV_FOLDER: 'volumes/csv',
        JSON_FOLDER: 'volumes/json',
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
