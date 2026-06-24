import { parseTelegramCommand } from '../src/telegram/commands';

describe('Telegram command parsing', () => {
  it('accepts bare commands', () => {
    expect(parseTelegramCommand('/schedule', 'odessa_tg_bot')).toEqual({
      command: '/schedule',
      args: '',
      isAddressedToThisBot: true,
    });
  });

  it('accepts commands addressed to the current bot', () => {
    expect(parseTelegramCommand('/schedule@odessa_tg_bot', '@odessa_tg_bot')).toEqual({
      command: '/schedule',
      args: '',
      botUsername: 'odessa_tg_bot',
      isAddressedToThisBot: true,
    });
  });

  it('ignores commands addressed to a different bot', () => {
    expect(parseTelegramCommand('/schedule@Odessa_Schedule_Bot', 'odessa_tg_bot')).toEqual({
      command: '/schedule',
      args: '',
      botUsername: 'Odessa_Schedule_Bot',
      isAddressedToThisBot: false,
    });
  });

  it('preserves command arguments separately for routing', () => {
    expect(parseTelegramCommand('/dj Samaya', 'odessa_tg_bot')).toEqual({
      command: '/dj',
      args: 'Samaya',
      isAddressedToThisBot: true,
    });
  });
});
