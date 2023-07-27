import { isUndefined } from 'lodash';
import { RadarBlip, RadarPublication } from './types';
import _ from 'lodash';
import { RING_SORT_ORDER } from './constants';

export function escapeDescriptionHTML(description: string): string {
    const escapedDescription = description
        .replace(/"/g, '""')
        .replace(/\n/g, '<br>');

    return `"${escapedDescription}"`;
}

export function isNewBlip(movement: string): string {
    return movement === 'new' ? 'TRUE' : 'FALSE';
}

export function calculateBlipStatus(
    publications: RadarPublication[],
    volume: number,
    blip: RadarBlip,
): string {
    let movement = 'new';

    const currentRingIndex = _.indexOf(
        RING_SORT_ORDER,
        blip.ring.toLowerCase(),
    );

    for (let i = 0; i < volume; i++) {
        const previousBlip = publications[i].blips.find(
            (previousBlip) => previousBlip.blip_id === blip.blip_id,
        );

        if (isUndefined(previousBlip)) {
            continue;
        }

        const previousRingIndex = _.indexOf(
            RING_SORT_ORDER,
            previousBlip?.ring.toLowerCase(),
        );

        if (currentRingIndex > previousRingIndex) {
            movement = 'moved out';
        } else if (currentRingIndex < previousRingIndex) {
            movement = 'moved in';
        } else {
            movement = 'no change';
        }
    }

    return movement;
}
