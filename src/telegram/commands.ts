export interface ParsedTelegramCommand {
  command: string;
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

  const [rawCommand = ''] = text.trim().split(/\s+/, 1);
  const [command = '', botUsername] = rawCommand.split('@');

  if (!command) {
    return null;
  }

  const expected = currentBotUsername?.replace(/^@/, '').toLowerCase();
  const addressed = botUsername?.toLowerCase();

  return {
    command,
    ...(botUsername ? { botUsername } : {}),
    isAddressedToThisBot: !addressed || !expected || addressed === expected,
  };
}
