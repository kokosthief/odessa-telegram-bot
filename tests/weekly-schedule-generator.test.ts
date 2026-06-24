import { getPreferredFacilitatorLink } from '../src/weekly-schedule-generator';
import { WixDJLoader } from '../src/utils/wix-dj-loader';

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

  it('keeps local JSON soundcloud/instagram/website links when Wix is unavailable', async () => {
    const loader = new WixDJLoader();
    jest.spyOn(loader, 'getEnhancedDJInfo').mockResolvedValue(null);

    await expect(loader.getDJInfoWithFallback('B.Art')).resolves.toMatchObject({
      soundcloudUrl: 'https://soundcloud.com/b-art-ecstatic',
      instagramUrl: 'https://www.instagram.com/artmetb/',
    });

    await expect(loader.getDJInfoWithFallback('Divana')).resolves.toMatchObject({
      soundcloudUrl: 'https://soundcloud.com/djdivana',
      instagramUrl: 'https://www.instagram.com/djdivana',
      website: 'https://www.divanamusic.com/',
    });
  });
});
