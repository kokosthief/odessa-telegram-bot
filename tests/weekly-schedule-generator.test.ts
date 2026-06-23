import { getPreferredFacilitatorLink } from '../src/weekly-schedule-generator';

describe('weekly schedule facilitator links', () => {
  it('uses the Wix website field when no SoundCloud link exists', () => {
    expect(
      getPreferredFacilitatorLink({
        website: 'https://b-art.example',
      })
    ).toBe('https://b-art.example');
  });

  it('prefers SoundCloud, then website, then Instagram', () => {
    expect(
      getPreferredFacilitatorLink({
        soundcloudUrl: 'https://soundcloud.example/dj',
        website: 'https://website.example/dj',
        instagramUrl: 'https://instagram.example/dj',
      })
    ).toBe('https://soundcloud.example/dj');

    expect(
      getPreferredFacilitatorLink({
        website: 'https://website.example/dj',
        instagramUrl: 'https://instagram.example/dj',
      })
    ).toBe('https://website.example/dj');

    expect(
      getPreferredFacilitatorLink({
        instagramUrl: 'https://instagram.example/dj',
      })
    ).toBe('https://instagram.example/dj');
  });
});
