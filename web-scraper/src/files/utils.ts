export function escapeDescriptionHTML(description: string): string {
    const escapedDescription = description
        .replace(/"/g, '""')
        .replace(/\n/g, '<br>');

    return `"${escapedDescription}"`;
}
