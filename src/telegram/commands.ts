export interface ParsedTelegramCommand {
  command: string;
  args: string;
  botUsername?: string;
  isAddressedToThisBot: boolean;
}

export function parseTelegramCommand(
  text: string | undefined,
  currentBotUsername: string | undefined
): ParsedTelegramCommand | null {
  if (!text || !text.startsWith('/')) {
    return null;
  }

  const trimmed = text.trim();
  const [rawCommand = '', ...argParts] = trimmed.split(/\s+/);
  const [command = '', botUsername] = rawCommand.split('@');

  if (!command) {
    return null;
  }

  const expected = currentBotUsername?.replace(/^@/, '').toLowerCase();
  const addressed = botUsername?.toLowerCase();

  return {
    command,
    args: argParts.join(' ').trim(),
    ...(botUsername ? { botUsername } : {}),
    isAddressedToThisBot: !addressed || !expected || addressed === expected,
  };
}
