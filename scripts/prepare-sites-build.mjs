import { copyFile, mkdir, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const dist = resolve(root, 'dist');

await mkdir(resolve(dist, '.openai'), { recursive: true });
await copyFile(resolve(root, '.openai', 'hosting.json'), resolve(dist, '.openai', 'hosting.json'));

await mkdir(resolve(dist, 'server'), { recursive: true });
await writeFile(
  resolve(dist, 'server', 'index.js'),
  `export default {
  async fetch(request, env) {
    const response = await env.ASSETS.fetch(request);
    if (response.status !== 404) {
      return response;
    }

    const accept = request.headers.get('accept') || '';
    if (!accept.includes('text/html')) {
      return response;
    }

    const url = new URL(request.url);
    url.pathname = '/index.html';
    return env.ASSETS.fetch(new Request(url, request));
  },
};
`,
);
