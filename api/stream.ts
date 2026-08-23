import type { IncomingMessage, ServerResponse } from 'http';
import http from 'http';
import https from 'https';
import { URL } from 'url';

export const config = {
  api: {
    responseLimit: false,
  },
};

export default function handler(req: IncomingMessage & { query?: Record<string, string> }, res: ServerResponse) {
  // Extract target URL from query
  let rawTargetUrl = '';
  if (req.url) {
    const parsed = new URL(req.url, 'http://localhost');
    rawTargetUrl = parsed.searchParams.get('url') || '';
  }

  if (!rawTargetUrl) {
    res.statusCode = 400;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ error: 'Missing "url" query parameter' }));
    return;
  }

  let streamUrl: URL;
  try {
    streamUrl = new URL(rawTargetUrl);
  } catch {
    res.statusCode = 400;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ error: 'Invalid URL format' }));
    return;
  }

  if (streamUrl.protocol !== 'http:' && streamUrl.protocol !== 'https:') {
    res.statusCode = 400;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ error: 'Only HTTP and HTTPS streams are supported' }));
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
    insecureHTTPParser: true,
    rejectUnauthorized: false,
    headers: {
      'Host': streamUrl.host,
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36 RadioPlayer/2.0',
      'Accept': '*/*',
      'Icy-MetaData': '0',
      'Connection': 'close',
    },
    timeout: 15000,
  };

  const proxyReq = client.request(options, (proxyRes) => {
    // Handle HTTP Redirects (301, 302, 303, 307, 308)
    if (
      proxyRes.statusCode &&
      [301, 302, 303, 307, 308].includes(proxyRes.statusCode) &&
      proxyRes.headers.location
    ) {
      const redirectUrl = new URL(proxyRes.headers.location, streamUrl.href).href;
      res.statusCode = 302;
      res.setHeader('Location', `/api/stream?url=${encodeURIComponent(redirectUrl)}`);
      res.end();
      proxyRes.resume();
      return;
    }

    if (proxyRes.statusCode && proxyRes.statusCode >= 400) {
      if (!res.headersSent) {
        res.statusCode = proxyRes.statusCode;
        res.setHeader('Content-Type', 'text/plain');
        res.end(`Upstream server returned ${proxyRes.statusCode}`);
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

    res.statusCode = proxyRes.statusCode || 200;
    res.setHeader('Content-Type', contentType);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Range, Content-Type, Icy-MetaData');
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');

    proxyRes.pipe(res);

    req.on('close', () => {
      proxyRes.destroy();
      proxyReq.destroy();
    });
  });

  proxyReq.on('timeout', () => {
    proxyReq.destroy();
    if (!res.headersSent) {
      res.statusCode = 504;
      res.setHeader('Content-Type', 'text/plain');
      res.end('Gateway Timeout: Stream server did not respond');
    }
  });

  proxyReq.on('error', (err) => {
    if (!res.headersSent) {
      res.statusCode = 502;
      res.setHeader('Content-Type', 'text/plain');
      res.end(`Proxy connection error: ${err.message}`);
    } else if (!res.writableEnded) {
      res.end();
    }
  });

  proxyReq.end();
}
