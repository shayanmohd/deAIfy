// Runs after `expo export`. Zibby's preview (zibby.run/apps/<id>/...) answers a plain
// <script src> for a .js file with 403: its CSRF guard refuses a JavaScript response to a
// request that is not marked as XHR. So each exported page fetches its bundle itself, marked,
// and runs it once the document has parsed, as `defer` did. Harmless where scripts load
// normally (the app's own origin, GitHub Pages). Drop it once Zibby serves app scripts.
import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const BUNDLE_TAG = /<script src="(\.\/_expo\/static\/js\/web\/[^"]+\.js)" defer><\/script>/g;

const loader = (src) =>
  '<script>(function(){' +
  `var code=fetch(${JSON.stringify(src)},{headers:{"x-requested-with":"XMLHttpRequest"}})` +
  '.then(function(r){if(!r.ok)throw new Error("HTTP "+r.status+" for "+r.url);return r.text()});' +
  'function run(){code.then(function(t){var s=document.createElement("script");s.text=t;document.body.appendChild(s)},' +
  'function(e){console.error("Could not load the app script.",e)})}' +
  'document.readyState==="loading"?document.addEventListener("DOMContentLoaded",run):run()' +
  '})()</script>';

/**
 * Swap a page's bundle tag for the loader. Throws unless there is exactly one, so a change in
 * Expo's output fails the build instead of shipping pages that never start.
 */
export function loadScriptsWithFetch(html) {
  let found = 0;
  const out = html.replace(BUNDLE_TAG, (_, src) => {
    found++;
    return loader(src);
  });
  if (found !== 1) throw new Error(`expected one <script src="./_expo/static/js/web/…" defer> bundle tag, found ${found}`);
  return out;
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  const dir = process.argv[2] ?? 'dist';
  for (const name of readdirSync(dir).filter((f) => f.endsWith('.html'))) {
    const file = path.join(dir, name);
    try {
      writeFileSync(file, loadScriptsWithFetch(readFileSync(file, 'utf8')));
    } catch (e) {
      throw new Error(`${file}: ${e.message}`);
    }
  }
}
