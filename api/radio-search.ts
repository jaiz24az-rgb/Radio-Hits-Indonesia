import type { IncomingMessage, ServerResponse } from 'http';
import { URL } from 'url';

export default async function handler(
  req: IncomingMessage & { query?: Record<string, string> },
  res: ServerResponse
) {
  const parsedUrl = new URL(req.url || '', 'http://localhost');
  const query = parsedUrl.searchParams.get('query') || '';
  const country = parsedUrl.searchParams.get('country') || 'Indonesia';
  const tag = parsedUrl.searchParams.get('tag') || '';
  const limit = parseInt(parsedUrl.searchParams.get('limit') || '40', 10);

  const mirrors = [
    'https://de1.api.radio-browser.info',
    'https://nl1.api.radio-browser.info',
    'https://at1.api.radio-browser.info',
  ];

  let foundStations: any[] = [];

  for (const mirror of mirrors) {
    try {
      const searchUrl = new URL(`${mirror}/json/stations/search`);
      if (country && country.toLowerCase() !== 'all') {
        searchUrl.searchParams.set('country', country);
      }
      if (query) {
        searchUrl.searchParams.set('name', query);
      }
      if (tag) {
        searchUrl.searchParams.set('tag', tag);
      }
      searchUrl.searchParams.set('limit', String(limit));
      searchUrl.searchParams.set('order', 'clickcount');
      searchUrl.searchParams.set('reverse', 'true');
      searchUrl.searchParams.set('hidebroken', 'true');

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 6000);

      const apiRes = await fetch(searchUrl.toString(), {
        headers: {
          'User-Agent': 'RadioHitsIndonesia/1.0',
          'Accept': 'application/json',
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (apiRes.ok) {
        const data = await apiRes.json();
        if (Array.isArray(data)) {
          foundStations = data;
          break;
        }
      }
    } catch {
      // Continue to next mirror
    }
  }

  const formatted = foundStations.map((st: any) => {
    const freqMatch = st.name.match(/(\d{2,3}(?:\.\d)?)\s*(?:FM|AM)?/i);
    const frequency = freqMatch ? `${freqMatch[1]} FM` : (st.tags?.includes('am') ? 'AM' : 'Online FM');

    const tagsStr = (st.tags || '').toLowerCase();
    let category = 'Pop & Hits';
    if (tagsStr.includes('dangdut') || tagsStr.includes('koplo') || tagsStr.includes('tarling') || tagsStr.includes('campursari')) {
      category = 'Dangdut';
    } else if (tagsStr.includes('news') || tagsStr.includes('berita') || tagsStr.includes('talk') || tagsStr.includes('information')) {
      category = 'Berita & Talk';
    } else if (tagsStr.includes('islam') || tagsStr.includes('religi') || tagsStr.includes('quran') || tagsStr.includes('dakwah') || tagsStr.includes('christian') || tagsStr.includes('gospel')) {
      category = 'Religi & Inspirasi';
    } else if (tagsStr.includes('local') || tagsStr.includes('komunitas') || tagsStr.includes('daerah') || tagsStr.includes('tradisional') || tagsStr.includes('culture')) {
      category = 'Daerah & Komunitas';
    }

    const city = st.state || st.country || 'Indonesia';

    return {
      id: `rb-${st.stationuuid || Math.random().toString(36).substring(2, 9)}`,
      name: st.name.trim(),
      tagline: st.tags ? st.tags.split(',').slice(0, 3).join(', ') : 'Siaran Radio Online',
      frequency: frequency,
      city: city,
      category: category,
      streamUrl: st.url_resolved || st.url,
      logo: st.favicon && st.favicon.startsWith('http') ? st.favicon : undefined,
      bitrate: st.bitrate ? `${st.bitrate} kbps` : '128 kbps',
      codec: st.codec || 'MP3',
      votes: st.votes || 0,
      clickcount: st.clickcount || 0,
      country: st.country,
      color: '#EF4444',
      accentGradient: 'from-red-600 to-rose-700',
      isCustom: true,
    };
  });

  res.statusCode = 200;
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.end(
    JSON.stringify({
      success: true,
      total: formatted.length,
      stations: formatted,
    })
  );
}
