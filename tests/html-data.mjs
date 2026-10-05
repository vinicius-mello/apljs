import fs from 'node:fs';

// Reads the literal data arrays (examples, primitive docs, escapes) out of
// apl.html's module script, so tests can check them against the real
// implementation. Each `const NAME = [...]` / `{...}` literal is located by
// bracket matching (skipping over string literals) and evaluated as plain
// JS - they only contain literals, so nothing from the page actually runs.
const html = fs.readFileSync(new URL('../apl.html', import.meta.url), 'utf8');

const literalAfter = (name) => {
  const at = html.indexOf(`const ${name} = `);
  if (at < 0) {
    throw new Error(`apl.html has no "const ${name} = " literal`);
  }
  const start = html.slice(at).search(/[[{]/) + at;
  const pairs = { '[': ']', '{': '}' };
  const stack = [];
  for (let i = start; i < html.length; i++) {
    const c = html[i];
    if (c === '"' || c === "'" || c === '`') {
      for (i++; html[i] !== c; i++) {
        if (html[i] === '\\') i++;
      }
    } else if (pairs[c]) {
      stack.push(pairs[c]);
    } else if (c === ']' || c === '}') {
      stack.pop();
      if (stack.length === 0) {
        return new Function(`return (${html.slice(start, i + 1)});`)();
      }
    }
  }
  throw new Error(`unterminated literal for ${name}`);
};

// The REPL samples are string arrays joined with newlines.
export const sample = (name) => literalAfter(name).join('\n');
export const primitiveDocs = () => literalAfter('PRIMITIVE_DOCS');
export const graphicsDocs = () => literalAfter('GRAPHICS_DOCS');
export const ffiExamples = () => literalAfter('FFI_EXAMPLES');
export const escapes = () => literalAfter('APL_ESCAPES');
export const languageBar = () => literalAfter('LANGUAGE_BAR');
export const glyphExtraNames = () => literalAfter('GLYPH_EXTRA_NAMES');
export const exampleIds = () => {
  const block = html.slice(html.indexOf('const EXAMPLES = ['), html.indexOf('];', html.indexOf('const EXAMPLES = [')));
  return [...block.matchAll(/code: (\w+)/g)].map((m) => m[1]);
};
