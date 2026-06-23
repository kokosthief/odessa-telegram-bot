import { blockquote, bold, escapeTelegramHtml, stripTelegramHtml } from '../src/telegram/formatting';

describe('Telegram formatting helpers', () => {
  it('escapes dynamic text before inserting it into Telegram HTML', () => {
    expect(escapeTelegramHtml('Samaya & DJ <Test> "Live"')).toBe('Samaya &amp; DJ &lt;Test&gt; &quot;Live&quot;');
    expect(bold('DJ <Test>')).toBe('<b>DJ &lt;Test&gt;</b>');
  });

  it('supports expandable blockquotes for long bios', () => {
    expect(blockquote('Deep & bright <journey>', { expandable: true }))
      .toBe('<blockquote expandable>Deep &amp; bright &lt;journey&gt;</blockquote>');
  });

  it('strips Telegram HTML for plain-text fallback', () => {
    expect(stripTelegramHtml('<b>DJ &amp; Friends</b>\n<blockquote expandable>Bio &lt;here&gt;</blockquote>'))
      .toBe('DJ & Friends\nBio <here>');
  });
});
