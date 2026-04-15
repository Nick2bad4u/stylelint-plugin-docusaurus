/**
 * Escape user-authored text for safe placement inside a Markdown table cell.
 *
 * Handles all characters that are significant in GFM table cells or inline
 * Markdown syntax and may be misinterpreted by linters:
 *
 * - Backslash: escape first to avoid double-escaping
 * - Pipe: cell column separator
 * - Asterisk: emphasis marker
 * - Opening bracket: link/image reference start
 * - Newlines: replaced with HTML breaks to keep the cell on one line
 *
 * @param {string} value
 *
 * @returns {string}
 */
export function escapeMarkdownTableCell(value) {
    return value
        .replaceAll("\\", "\\\\")
        .replaceAll("|", "\\|")
        .replaceAll("*", "\\*")
        .replaceAll("[", "\\[")
        .replace(/\r?\n/gu, "<br>");
}
