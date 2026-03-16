export const SELECTORS = {
  TIMELINE_NODES: 'div[blip="blip"]',
  BLIP_NAME: '.hero-banner__overlay__container__title',
  TIMELINE_ENTRY: {
    RING: 'cmp-blip-timeline__item--ring',
    TIME: 'cmp-blip-timeline__item--time',
    DESCRIPTION: 'blip-timeline-description',
  },
  RELATED_BLIPS: {
    CONTAINER: 'ul.related-blips-list',
    ITEM: 'li.related-blip-item',
    LINK: 'a.related-blip-item__href',
  },
} as const;
