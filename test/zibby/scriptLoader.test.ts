import { describe, it, expect } from 'vitest';
import { loadScriptsWithFetch } from '../../scripts/zibby-script-loader.mjs';

const SRC = './_expo/static/js/web/entry-abc123.js';
const page = (tail: string) =>
  `<html><head><script type="module">globalThis.__EXPO_ROUTER_HYDRATE__=true;</script></head>` +
  `<body><div id="root">x</div>${tail}</body></html>`;

describe('loadScriptsWithFetch', () => {
  it('swaps the bundle tag for a loader and leaves the rest of the page alone', () => {
    const out = loadScriptsWithFetch(page(`<script src="${SRC}" defer></script>`));
    expect(out).not.toContain(`<script src="${SRC}"`);
    expect(out.startsWith(page('').replace('</body></html>', ''))).toBe(true);
    expect(out.endsWith('</script></body></html>')).toBe(true);
  });

  it('fails the build when a page does not have exactly one bundle tag', () => {
    expect(() => loadScriptsWithFetch(page(''))).toThrow(/bundle tag/);
    const two = `<script src="${SRC}" defer></script>`.repeat(2);
    expect(() => loadScriptsWithFetch(page(two))).toThrow(/bundle tag/);
  });

  it('fetches the bundle marked as XHR and runs it once the document has parsed', async () => {
    const html = loadScriptsWithFetch(page(`<script src="${SRC}" defer></script>`));
    const code = html.match(/<script>([\s\S]*?)<\/script><\/body>/)![1];
    const requests: unknown[] = [];
    const appended: unknown[] = [];
    let onParsed: (() => void) | undefined;
    const document = {
      readyState: 'loading',
      addEventListener: (type: string, fn: () => void) => {
        if (type === 'DOMContentLoaded') onParsed = fn;
      },
      createElement: () => ({}),
      body: { appendChild: (el: unknown) => appended.push(el) },
    };
    const fetch = async (url: string, init: unknown) => {
      requests.push([url, init]);
      return { ok: true, text: async () => 'BUNDLE' };
    };
    const tick = () => new Promise((resolve) => setTimeout(resolve, 0));

    new Function('document', 'fetch', 'console', code)(document, fetch, console);
    expect(requests).toEqual([[SRC, { headers: { 'x-requested-with': 'XMLHttpRequest' } }]]);
    await tick();
    expect(appended).toEqual([]);
    onParsed!();
    await tick();
    expect(appended).toEqual([{ text: 'BUNDLE' }]);
  });
});
