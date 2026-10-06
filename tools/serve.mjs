// Serveur local : gzip comme sur GitHub Pages, rechargement automatique.
//   node tools/serve.mjs           sert les sources
//   node tools/serve.mjs --build   sert dist/ (minifié), reconstruit à chaque modification
import { watch } from 'node:fs';
import { readFile, stat } from 'node:fs/promises';
import { createServer } from 'node:http';
import { extname, join, normalize } from 'node:path';
import { gzipSync } from 'node:zlib';
import { ROOT, DIST, build } from './build.mjs';

const PORT = Number(process.env.PORT) || 4173;
const useBuild = process.argv.includes('--build');
const served = useBuild ? DIST : ROOT;

const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.xml': 'application/xml',
  '.txt': 'text/plain; charset=utf-8',
  '.json': 'application/json',
  '.avif': 'image/avif',
  '.jpg': 'image/jpeg',
  '.png': 'image/png',
};
const COMPRESSED = new Set(['.html', '.css', '.js', '.svg', '.xml', '.txt', '.json']);
const IGNORED = /^(dist|node_modules|\.git|tools)(\/|$)/;
const RELOAD_SNIPPET =
  '<script>new EventSource("/__livereload").onmessage = () => location.reload();</script>';

const clients = new Set();

async function resolve(urlPath) {
  const path = join(served, normalize(decodeURIComponent(urlPath)));
  if (!path.startsWith(served.replace(/\/$/, ''))) return null;
  const info = await stat(path).catch(() => null);
  if (info?.isDirectory()) return resolve(`${urlPath.replace(/\/$/, '')}/index.html`);
  return info ? path : null;
}

const server = createServer(async (request, response) => {
  const { pathname } = new URL(request.url, 'http://localhost');

  if (pathname === '/__livereload') {
    response.writeHead(200, { 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-store' });
    response.write('\n');
    clients.add(response);
    request.on('close', () => clients.delete(response));
    return;
  }

  const found = await resolve(pathname);
  const path = found ?? join(served, '404.html');
  const ext = extname(path);
  let body = await readFile(path);
  if (ext === '.html') body = Buffer.from(body.toString().replace('</body>', `${RELOAD_SNIPPET}</body>`));

  const headers = { 'Content-Type': TYPES[ext] ?? 'application/octet-stream', 'Cache-Control': 'no-cache' };
  if (COMPRESSED.has(ext) && /\bgzip\b/.test(request.headers['accept-encoding'] ?? '')) {
    body = gzipSync(body);
    headers['Content-Encoding'] = 'gzip';
    headers.Vary = 'Accept-Encoding';
  }
  headers['Content-Length'] = body.length;
  response.writeHead(found ? 200 : 404, headers);
  response.end(request.method === 'HEAD' ? undefined : body);
});

let pending;
watch(ROOT, { recursive: true }, (_, file) => {
  if (!file || IGNORED.test(file)) return;
  clearTimeout(pending);
  pending = setTimeout(async () => {
    try {
      if (useBuild) await build();
      clients.forEach((client) => client.write('data: reload\n\n'));
      console.log(`${file} modifié, page rechargée`);
    } catch (error) {
      console.error(`Construction échouée : ${error.message}`);
    }
  }, 100);
});

if (useBuild) await build();
server.listen(PORT, () => {
  console.log(`${useBuild ? 'dist/ (minifié)' : 'Sources'} servi sur http://localhost:${PORT}`);
});
