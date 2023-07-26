export function escapeDescriptionHTML(description: string): string {
    const escapedDescription = description
        .replace(/"/g, '""')
        .replace(/\n/g, '<br>');

    return `"${escapedDescription}"`;
}

export function isNewBlip(blipStatus: string): boolean {
    return blipStatus === 't';
}

export function calculateBlipStatus(blipStatus: string): string {
    // TODO - implement for older publications
    return blipStatus;
}
