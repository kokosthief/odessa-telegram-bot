import { formatDJsList } from '../src/formatters/djs-formatter';

describe('DJs list formatter', () => {
  it('renders linked DJ names, filters duplicate aliases, and escapes HTML', () => {
    const message = formatDJsList({
      'Samaya': {
        soundcloud: 'https://soundcloud.example/samaya?x=1&y=2',
      },
      'Ma-rifa': {
        soundcloud: 'https://soundcloud.example/alias',
      },
      'A <B>': {
        instagram: 'https://instagram.example/a?name="b"',
      },
      'No Link': {},
    });

    expect(message).toContain('🎧 <b>Odessa DJs</b>');
    expect(message).toContain('<a href="https://soundcloud.example/samaya?x=1&amp;y=2">Samaya</a>');
    expect(message).toContain('<a href="https://instagram.example/a?name=&quot;b&quot;">A &lt;B&gt;</a>');
    expect(message).toContain('• No Link');
    expect(message).not.toContain('Ma-rifa');
    expect(message).toContain('Use /dj name for a full profile.');
  });
});
