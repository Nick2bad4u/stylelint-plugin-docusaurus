/**
 * Escape user-authored text for safe placement inside a Markdown table cell.
 *
 * @param {string} value
 *
 * @returns {string}
 */
export function escapeMarkdownTableCell(value) {
    return value
        .replaceAll("\\", "\\\\")
        .replaceAll("|", "\\|")
        .replace(/\r?\n/gu, "<br>");
}
