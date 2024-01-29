export const URLS = {
    BASE: 'https://www.thoughtworks.com',
    RADAR: 'https://www.thoughtworks.com/radar',
    SEARCH: 'https://www.thoughtworks.com/radar/search',
};

export const FILES = {
    DATA: {
        LINKS: 'data/search-links.json',
        MASTER: 'data/search-data.json',
    },
    VOLUMES: {
        FOLDER: 'volumes',
        FILE_PREFIX: 'Thoughtworks Technology Radar Volume',
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

export const VOLUME_PUBLICATION_DATES = [
    'Jan 2010',
    'Apr 2010',
    'Aug 2010',
    'Jan 2011',
    'Jul 2011',
    'Mar 2012',
    'Oct 2012',
    'May 2013',
    'Jan 2014',
    'Jul 2014',
    'Jan 2015',
    'May 2015',
    'Nov 2015',
    'Apr 2016',
    'Nov 2016',
    'Mar 2017',
    'Nov 2017',
    'May 2018',
    'Nov 2018',
    'Apr 2019',
    'Nov 2019',
    'May 2020',
    'Oct 2020',
    'Apr 2021',
    'Oct 2021',
    'Mar 2022',
    'Oct 2022',
    'Apr 2023',
    'Sep 2023',
];

export const NOT_FOUND_VOLUME_NUMBER = 100;

export const QUADRANT_SORT_ORDER = [
    'techniques',
    'platforms',
    'tools',
    'languages-and-frameworks',
];

export const RING_SORT_ORDER = ['adopt', 'trial', 'assess', 'hold'];

export const DEFAULT_WAIT_TIME = 5000;
