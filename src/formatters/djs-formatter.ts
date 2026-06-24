import { DJDatabase } from '../types/dj';
import { escapeTelegramHtml } from '../telegram/formatting';

const ALIAS_NAMES = new Set(['Faralduin', 'Ma-rifa']);

function getPreferredDJLink(info: DJDatabase[string]): string | undefined {
  return info.soundcloud || info.link || info.website || info.instagram;
}

export function formatDJsList(djData: DJDatabase): string {
  const names = Object.keys(djData)
    .filter(name => !ALIAS_NAMES.has(name))
    .sort((a, b) => a.localeCompare(b, 'en', { sensitivity: 'base' }));

  if (names.length === 0) {
    return '🎧 <b>Odessa DJs</b>\n\nNo DJs found yet.';
  }

  const lines = names.map(name => {
    const info = djData[name];
    const safeName = escapeTelegramHtml(name);
    const url = info ? getPreferredDJLink(info) : undefined;
    return url ? `• <a href="${escapeTelegramHtml(url)}">${safeName}</a>` : `• ${safeName}`;
  });

  return `🎧 <b>Odessa DJs</b>\n\n${lines.join('\n')}\n\nUse /dj name for a full profile.`;
}
