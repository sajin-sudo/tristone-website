import http from 'node:http';
import {handle} from '../dist/server/index.js';

export async function respond(req, res, env = process.env) {
  try {
    const headers = new Headers();
    for (const [key, value] of Object.entries(req.headers)) {
      if (key.startsWith('oai-') || value === undefined) continue;
      headers.set(key, Array.isArray(value) ? value.join(', ') : value);
    }
    const origin = env.PUBLIC_ORIGIN || `https://${headers.get('host') || 'localhost'}`;
    const url = new URL(req.url, origin);
    if (url.origin !== new URL(origin).origin) {
      res.writeHead(400); res.end('Invalid request'); return;
    }
    // ChatGPT identity dispatch is unavailable on Hostinger. Keep CMS routes closed.
    if (url.pathname.startsWith('/api/admin/') || ['/admin', '/admin.html', '/admin.js', '/signin-with-chatgpt'].includes(url.pathname)) {
      res.writeHead(503, {'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'no-store'});
      res.end('The website editor has not been connected on this hosting provider.'); return;
    }
    const chunks = []; let size = 0;
    for await (const chunk of req) {
      size += chunk.length;
      if (size > 11 * 1024 * 1024) {
        res.writeHead(413); res.end('Upload too large'); return;
      }
      chunks.push(chunk);
    }
    const request = new Request(url, {
      method: req.method, headers,
      ...(!['GET', 'HEAD'].includes(req.method) ? {body: Buffer.concat(chunks)} : {})
    });
    const result = await handle(request, env);
    res.writeHead(result.status, Object.fromEntries(result.headers));
    res.end(Buffer.from(await result.arrayBuffer()));
  } catch (error) {
    console.error('Website request failed:', error.message);
    if (!res.headersSent) res.writeHead(500, {'Content-Type': 'text/plain'});
    res.end('Website temporarily unavailable');
  }
}

export async function start() {
  const port = Number(process.env.PORT || 3000);
  if (!Number.isInteger(port) || port < 0 || port > 65535) throw new Error('Invalid PORT');
  const server = http.createServer((req, res) => respond(req, res));
  await new Promise((resolve, reject) => {
    server.once('error', reject);
    server.listen(port, '0.0.0.0', resolve);
  });
  console.log(`TriStone listening on port ${server.address().port}`);
  return server;
}
