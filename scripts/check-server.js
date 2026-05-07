const { spawn } = require('node:child_process');
const http = require('node:http');

const port = 41737;
const server = spawn(process.execPath, ['server.js'], {
  env: { ...process.env, PORT: String(port) },
  stdio: ['ignore', 'pipe', 'pipe']
});

let output = '';
let settled = false;
const timeout = setTimeout(() => finish(new Error('Timed out waiting for server check')), 5000);

server.stdout.on('data', chunk => {
  output += chunk.toString();
  if (output.includes(`:${port}`)) runChecks();
});

server.stderr.on('data', chunk => {
  output += chunk.toString();
});

server.on('exit', code => {
  if (!settled) finish(new Error(`Server exited before checks completed with code ${code}: ${output}`));
});

async function runChecks() {
  if (settled) return;
  try {
    const malformed = await request('/%E0%A4%A');
    if (malformed.statusCode !== 400) {
      throw new Error(`Expected malformed URL to return 400, got ${malformed.statusCode}`);
    }

    const health = await request('/healthz');
    if (health.statusCode !== 200 || health.body !== 'ok') {
      throw new Error(`Expected /healthz to return 200 ok, got ${health.statusCode} ${health.body}`);
    }

    finish();
  } catch (error) {
    finish(error);
  }
}

function request(path) {
  return new Promise((resolve, reject) => {
    const req = http.get({ hostname: '127.0.0.1', port, path }, res => {
      let body = '';
      res.setEncoding('utf8');
      res.on('data', chunk => {
        body += chunk;
      });
      res.on('end', () => resolve({ statusCode: res.statusCode, body }));
    });
    req.on('error', reject);
  });
}

function finish(error) {
  if (settled) return;
  settled = true;
  clearTimeout(timeout);
  server.kill();
  if (error) {
    console.error(error.message);
    process.exitCode = 1;
    return;
  }
  console.log('Server smoke check passed');
}
