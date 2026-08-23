import express, { Request, Response } from 'express';
import http from 'http';
import https from 'https';
import path from 'path';
import { createServer as createViteServer } from 'vite';

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Health check endpoint
  app.get('/api/health', (req: Request, res: Response) => {
    res.json({ status: 'ok' });
  });

  // Radio Directory Search API (Radio-Browser API Proxy & Discovery)
  app.get('/api/radio-search', async (req: Request, res: Response) => {
    const query = (req.query.query as string) || '';
    const country = (req.query.country as string) || 'Indonesia';
    const tag = (req.query.tag as string) || '';
    const limit = parseInt((req.query.limit as string) || '40', 10);

    const mirrors = [
      'https://de1.api.radio-browser.info',
      'https://nl1.api.radio-browser.info',
      'https://at1.api.radio-browser.info',
    ];

    let foundStations: any[] = [];
    let success = false;

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
            success = true;
            break;
          }
        }
      } catch (err) {
        // Try next mirror
      }
    }

    // Format stations to standardized RadioStation compatible objects
    const formatted = foundStations.map((st: any, idx: number) => {
      // Guess frequency from name or tags if present (e.g. 98.7, 101.5 FM)
      const freqMatch = st.name.match(/(\d{2,3}(?:\.\d)?)\s*(?:FM|AM)?/i);
      const frequency = freqMatch ? `${freqMatch[1]} FM` : (st.tags?.includes('am') ? 'AM' : 'Online FM');

      // Guess category
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

      // City / State detection
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

    res.json({
      success: true,
      total: formatted.length,
      stations: formatted,
    });
  });

  // Audio Streaming Proxy Endpoint
  // Solves: Mixed Content (HTTP on HTTPS), CORS issues, ICY non-standard headers, redirects, and custom ports
  app.get('/api/stream', (req: Request, res: Response) => {
    const targetUrl = req.query.url as string;

    if (!targetUrl) {
      res.status(400).send('Missing "url" query parameter');
      return;
    }

    let parsedUrl: URL;
    try {
      parsedUrl = new URL(targetUrl);
    } catch {
      res.status(400).send('Invalid stream URL');
      return;
    }

    const fetchStream = (streamUrl: URL, redirectCount = 0) => {
      if (redirectCount > 6) {
        if (!res.headersSent) {
          res.status(502).send('Too many redirects');
        }
        return;
      }

      const isHttps = streamUrl.protocol === 'https:';
      const client = isHttps ? https : http;
      const defaultPort = isHttps ? 443 : 80;
      const port = streamUrl.port ? parseInt(streamUrl.port, 10) : defaultPort;

      const options: https.RequestOptions = {
        hostname: streamUrl.hostname,
        port: port,
        path: streamUrl.pathname + streamUrl.search,
        method: 'GET',
        insecureHTTPParser: true, // Crucial for ICY / non-standard HTTP 1.0 headers
        rejectUnauthorized: false, // Critical for radio stations with self-signed / expired certs on stream ports
        headers: {
          'Host': streamUrl.host,
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36 RadioPlayer/2.0',
          'Accept': '*/*',
          'Icy-MetaData': '0',
          'Connection': 'close',
        },
        timeout: 12000,
      };

      const proxyReq = client.request(options, (proxyRes) => {
        // Handle HTTP 301, 302, 303, 307, 308 redirects properly
        if (
          proxyRes.statusCode &&
          [301, 302, 303, 307, 308].includes(proxyRes.statusCode) &&
          proxyRes.headers.location
        ) {
          try {
            const redirectUrl = new URL(proxyRes.headers.location, streamUrl.href);
            proxyRes.resume(); // Discard redirect body data
            fetchStream(redirectUrl, redirectCount + 1);
            return;
          } catch {
            // failed to parse redirect url
          }
        }

        // If upstream error status (404, 500, 502, 503)
        if (proxyRes.statusCode && proxyRes.statusCode >= 400) {
          if (!res.headersSent) {
            res.status(proxyRes.statusCode).send(`Upstream server returned error ${proxyRes.statusCode}`);
          }
          proxyRes.resume();
          return;
        }

        const rawContentType = proxyRes.headers['content-type'] || 'audio/mpeg';
        const contentType =
          rawContentType.includes('audio') ||
          rawContentType.includes('application/ogg') ||
          rawContentType.includes('application/octet-stream')
            ? rawContentType
            : 'audio/mpeg';

        res.writeHead(proxyRes.statusCode || 200, {
          'Content-Type': contentType,
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, OPTIONS',
          'Access-Control-Allow-Headers': 'Range, Origin, Content-Type, Accept',
          'Accept-Ranges': 'none',
        });

        proxyRes.pipe(res);

        proxyRes.on('error', () => {
          if (!res.writableEnded) {
            res.end();
          }
        });
      });

      proxyReq.on('timeout', () => {
        proxyReq.destroy();
        if (!res.headersSent) {
          res.status(504).send('Stream connection timeout');
        }
      });

      proxyReq.on('error', (err) => {
        if (!res.headersSent) {
          res.status(502).send(`Unable to connect to upstream stream: ${err.message}`);
        } else if (!res.writableEnded) {
          res.end();
        }
      });

      // Cleanup upstream connection if client disconnects
      req.on('close', () => {
        proxyReq.destroy();
      });

      proxyReq.end();
    };

    fetchStream(parsedUrl);
  });

  // Vite middleware in dev / Static files in production
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Radio server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
