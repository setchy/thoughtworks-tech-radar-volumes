export interface RadarPublication {
    date: string;
    blips: RadarBlip[];
}

export interface RadarBlip {
    blip_id: number;
    name: string;
    description: string;
    ring: string;
    quadrant: string;
    blip_status: BlipStatus;
    volume_date: string;

    // Unused in API Parser
    quadrantSortOrder: string;
    ringSortOrder: number;
    radarId: number;
    movement: string;
    locale: string;
    editStatus: string;
    lastModified: string;
    radius: string;
    theta: string;
    faded: string;
    urlLabel: string;
    id: string;
    blip_selector: string;
}

enum BlipStatus {
    NO_CHANGE = 'c',
    NEW = 't',
    MOVE_IN = 'move_in',
    MOVE_OUT = 'move_out',
}
