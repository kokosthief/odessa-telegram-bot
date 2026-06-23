const HTML_ESCAPE_MAP: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
};

export function escapeTelegramHtml(value: unknown): string {
  return String(value ?? '').replace(/[&<>"]/g, char => HTML_ESCAPE_MAP[char] || char);
}

export function bold(value: unknown): string {
  return `<b>${escapeTelegramHtml(value)}</b>`;
}

export function italic(value: unknown): string {
  return `<i>${escapeTelegramHtml(value)}</i>`;
}

export function blockquote(value: unknown, options: { expandable?: boolean } = {}): string {
  const attr = options.expandable ? ' expandable' : '';
  return `<blockquote${attr}>${escapeTelegramHtml(value)}</blockquote>`;
}

export function stripTelegramHtml(value: string): string {
  return value
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/?(?:b|strong|i|em|u|s|strike|del|code|pre|blockquote|span)(?:\s+[^>]*)?>/gi, '')
    .replace(/<a\s+[^>]*href=["'][^"']+["'][^>]*>(.*?)<\/a>/gi, '$1')
    .replace(/&quot;/g, '"')
    .replace(/&gt;/g, '>')
    .replace(/&lt;/g, '<')
    .replace(/&amp;/g, '&');
}
