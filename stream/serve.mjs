// The stream's studio: serves stream/, opens studio.html to look at every scene of overlay.html, and reloads on save.
//   npm run stream            http://localhost:4174, and refreshes OBS's overlays on each save
//   npm run stream -- --no-obs   leaves OBS alone
// OBS is reached through its WebSocket server, with the password of its own settings file.
import { createHash } from 'node:crypto';
import { watch } from 'node:fs';
import { readFile, stat } from 'node:fs/promises';
import { createServer } from 'node:http';
import { homedir } from 'node:os';
import { extname, join, normalize } from 'node:path';
import { fileURLToPath } from 'node:url';

const DIR = fileURLToPath(new URL('.', import.meta.url));
const PORT = Number(process.env.PORT) || 4174;
const withObs = !process.argv.includes('--no-obs');
const TYPES = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.mjs': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png' };
// Rewritten every few seconds by now-playing.sh: not an edit
const IGNORED = /^now-playing\.js/;

const clients = new Set();

const server = createServer(async (request, response) => {
  const { pathname } = new URL(request.url, 'http://localhost');

  if (pathname === '/__livereload') {
    response.writeHead(200, { 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-store' });
    response.write('\n');
    clients.add(response);
    request.on('close', () => clients.delete(response));
    return;
  }

  const path = join(DIR, normalize(decodeURIComponent(pathname === '/' ? '/studio.html' : pathname)));
  const info = path.startsWith(DIR) ? await stat(path).catch(() => null) : null;
  if (!info?.isFile()) {
    response.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
    response.end('Not found');
    return;
  }
  const body = await readFile(path);
  response.writeHead(200, { 'Content-Type': TYPES[extname(path)] ?? 'application/octet-stream', 'Cache-Control': 'no-store', 'Content-Length': body.length });
  response.end(request.method === 'HEAD' ? undefined : body);
});

// --- OBS: refresh the browser sources that show overlay.html -----------------------------------
async function refreshObs() {
  let password;
  try {
    const config = JSON.parse(await readFile(join(homedir(), 'Library/Application Support/obs-studio/plugin_config/obs-websocket/config.json'), 'utf8'));
    if (!config.server_enabled) return 'its WebSocket server is off';
    password = config.server_password;
  } catch {
    return 'no OBS settings found';
  }

  return new Promise((resolve) => {
    const socket = new WebSocket('ws://localhost:4455');
    const waiting = new Map();
    let id = 0;
    const call = (requestType, requestData = {}) => new Promise((done) => {
      const requestId = String(++id);
      waiting.set(requestId, done);
      socket.send(JSON.stringify({ op: 6, d: { requestType, requestId, requestData } }));
    });
    const finish = (result) => { clearTimeout(timer); socket.close(); resolve(result); };
    const timer = setTimeout(() => finish('no answer'), 3000);

    socket.onerror = () => finish('not running');
    socket.onmessage = async ({ data }) => {
      const { op, d } = JSON.parse(data);
      if (op === 0) {
        const identify = { rpcVersion: 1 };
        if (d.authentication) {
          const sha = (text) => createHash('sha256').update(text).digest('base64');
          identify.authentication = sha(sha(password + d.authentication.salt) + d.authentication.challenge);
        }
        socket.send(JSON.stringify({ op: 1, d: identify }));
      }
      if (op === 7) waiting.get(d.requestId)?.(d.responseData ?? {});
      if (op === 2) {
        const { inputs = [] } = await call('GetInputList', { inputKind: 'browser_source' });
        let count = 0;
        for (const { inputName } of inputs) {
          const { inputSettings = {} } = await call('GetInputSettings', { inputName });
          if (!String(inputSettings.url).includes('stream/overlay.html')) continue;
          await call('PressInputPropertiesButton', { inputName, propertyName: 'refreshnocache' });
          count++;
        }
        finish(`${count} overlay${count > 1 ? 's' : ''} refreshed`);
      }
    };
  });
}

// --- Saves: the studio reloads its preview, OBS its overlays -----------------------------------
let pending;
watch(DIR, (_, file) => {
  if (!file || IGNORED.test(file)) return;
  clearTimeout(pending);
  pending = setTimeout(async () => {
    clients.forEach((client) => client.write(`data: ${file}\n\n`));
    const obs = withObs && file === 'overlay.html' ? ` · OBS: ${await refreshObs()}` : '';
    console.log(`${file} saved, studio reloaded${obs}`);
  }, 150);
});

server.listen(PORT, () => console.log(`Studio on http://localhost:${PORT}${withObs ? ', OBS refreshed on each save' : ''}`));
