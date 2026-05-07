const http = require('node:http');
const { createReadStream, statSync } = require('node:fs');
const { extname, join, normalize } = require('node:path');

const root = __dirname;
const port = Number(process.env.PORT || 3000);
const entry = 'prompt_driven_interface_effect_lab_v2_single.html';

const contentTypes = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8'
};

function resolvePath(urlPath) {
  let cleanPath;
  try {
    cleanPath = decodeURIComponent(urlPath.split('?')[0]);
  } catch (error) {
    if (error instanceof URIError) return { status: 400, filePath: null };
    throw error;
  }

  const safePath = cleanPath === '/' ? `/${entry}` : cleanPath;
  const relativePath = safePath.slice(1);
  const filePath = normalize(join(root, relativePath));
  if (!filePath.startsWith(root)) return { status: 403, filePath: null };
  return { status: 200, filePath };
}

const server = http.createServer((req, res) => {
  if ((req.url || '').startsWith('/healthz')) {
    res.writeHead(200, { 'content-type': 'text/plain; charset=utf-8' });
    res.end('ok');
    return;
  }

  const { status, filePath } = resolvePath(req.url || '/');
  if (!filePath) {
    const message = status === 400 ? 'Bad request' : 'Forbidden';
    res.writeHead(status, { 'content-type': 'text/plain; charset=utf-8' });
    res.end(message);
    return;
  }

  try {
    const stats = statSync(filePath);
    if (!stats.isFile()) throw new Error('Not a file');
    res.writeHead(200, {
      'content-type': contentTypes[extname(filePath)] || 'application/octet-stream',
      'cache-control': extname(filePath) === '.html' ? 'no-cache' : 'public, max-age=3600'
    });
    if (req.method === 'HEAD') {
      res.end();
      return;
    }
    createReadStream(filePath).pipe(res);
  } catch (_) {
    res.writeHead(404, { 'content-type': 'text/plain; charset=utf-8' });
    res.end('Not found');
  }
});

server.listen(port, '0.0.0.0', () => {
  console.log(`Effect lab listening on http://0.0.0.0:${port}`);
});
