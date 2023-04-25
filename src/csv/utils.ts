export function escapeDescriptionHTML(description: string): string {
    return `"${description.replace(/"/g, '""')}"`;
}
