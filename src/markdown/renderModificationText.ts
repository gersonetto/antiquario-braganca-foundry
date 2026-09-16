/**
 * Conversor markdown -> HTML mínimo pro texto de "modification.text" (anotação do
 * mestre). Cobre só o subconjunto usado na planilha hoje: negrito (**texto**),
 * tabelas em pipe (GFM) e quebra de linha simples (like remark-breaks) — não é um
 * parser de markdown completo. Foundry não tem parser de markdown nativo.
 */
export function renderModificationText(text: string): string {
  const blocks = text.trim().split(/\n{2,}/);
  return blocks.map(renderBlock).join('');
}

function renderBlock(block: string): string {
  const lines = block.split('\n');
  if (isTable(lines)) return renderTable(lines);
  const html = lines.map(renderInline).join('<br>');
  return `<p>${html}</p>`;
}

function isTable(lines: string[]): boolean {
  if (lines.length < 2) return false;
  const separator = lines[1].trim();
  return /^\|?(\s*:?-+:?\s*\|)+\s*:?-+:?\s*\|?$/.test(separator);
}

function renderTable(lines: string[]): string {
  const [headerLine, , ...bodyLines] = lines;
  const header = splitRow(headerLine);
  const rows = bodyLines.map(splitRow);

  const thead = `<tr>${header.map((cell) => `<th>${renderInline(cell)}</th>`).join('')}</tr>`;
  const tbody = rows
    .map((row) => `<tr>${row.map((cell) => `<td>${renderInline(cell)}</td>`).join('')}</tr>`)
    .join('');

  return `<div class="table-wrap"><table><thead>${thead}</thead><tbody>${tbody}</tbody></table></div>`;
}

function splitRow(line: string): string[] {
  return line
    .trim()
    .replace(/^\||\|$/g, '')
    .split('|')
    .map((cell) => cell.trim());
}

function renderInline(text: string): string {
  return escapeHtml(text).replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}
