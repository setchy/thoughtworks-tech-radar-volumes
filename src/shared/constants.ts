export const URLS = {
  BASE: 'https://www.thoughtworks.com',
  RADAR: 'https://www.thoughtworks.com/radar',
  SEARCH: 'https://www.thoughtworks.com/radar/search',
  SITEMAP: 'https://www.thoughtworks.com/rest/radar/sitemap/en.xml',
  GOOGLE_SHEET: 'https://docs.google.com/spreadsheets/d/',
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
  'relatedBlips',
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
  'Apr 2024',
  'Oct 2024',
  'Apr 2025',
  'Nov 2025',
  'Apr 2026',
];

export const NOT_FOUND_VOLUME_NUMBER = 100;

export const QUADRANT_SORT_ORDER = [
  'techniques',
  'platforms',
  'tools',
  'languages-and-frameworks',
];

// From Apr 2026 (Volume 34), Thoughtworks renamed "Hold" to "Caution". Both are treated as equivalent.
export const CAUTION_RENAME_VOLUME = 34;

export const RING_SORT_ORDER = ['adopt', 'trial', 'assess', 'caution'];

// Returns the canonical ring name for a given volume: 'caution' for vol 34+, 'hold' for earlier.
export function getRingNameForVolume(ring: string, volume: number): string {
  const isHoldOrCaution = ring === 'hold' || ring === 'caution';

  if (!isHoldOrCaution) {
    return ring;
  }

  return volume >= CAUTION_RENAME_VOLUME ? 'caution' : 'hold';
}

// Normalizes ring name for comparison/movement calculation — maps legacy 'hold' to canonical 'caution'.
export function normalizeRingName(ring: string): string {
  return ring === 'hold' ? 'caution' : ring;
}

export const BLIP_STATUSES = [
  'new',
  'moved in',
  'moved out',
  'no change',
] as const;

export const REPORT_TYPES = ['all', 'csv', 'json', 'google-sheets'] as const;

export const SEARCHABLE_FIELDS = [
  'name',
  'quadrant',
  'ring',
  'volume',
  'publishedDate',
  'descriptionHtml',
  'isNew',
  'hasMovedIn',
  'hasMovedOut',
  'relatedBlips',
] as const;
