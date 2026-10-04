import { test } from 'node:test';
import assert from 'node:assert/strict';
import { evaluateApl, aplToJavaScript, G, global_category } from '../apl.js';
import { sample, exampleIds, primitiveDocs, graphicsDocs, ffiExamples, escapes } from './html-data.mjs';

// Everything the REPL page shows as runnable APL - the Insert Example
// samples, the help's primitive table, its SVG/FFI examples - checked
// against the real implementation, so a change that breaks an example or
// leaves the help out of date fails here.

// A runtime whose ⎕← output is collected instead of logged.
const quietRuntime = () => {
  const runtime = Object.create(G);
  runtime.emitted = [];
  Object.defineProperty(runtime, 'quad', { set(value) { runtime.emitted.push(value); } });
  return runtime;
};
const usesDom = (src) => /\b(d3|Plot)\b/.test(src);
const unescapeHtml = (s) => s.replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&');

test('every Insert Example sample parses, and the ones without d3/Plot run', () => {
  for (const name of exampleIds()) {
    const src = sample(name);
    assert.doesNotThrow(() => aplToJavaScript(src), `${name} does not parse`);
    if (!usesDom(src)) {
      assert.doesNotThrow(() => evaluateApl(src, quietRuntime()), `${name} fails to run`);
    }
  }
});

// <code> fragments in the primitive table that are deliberately not
// self-contained (they name placeholder arrays/functions, or are partial
// syntax). Anything else must run.
const PLACEHOLDERS = new Set([
  '⍺⍺∇∇(⍹-1)⍺⍺ ⍵', '⍺←', '({1+⍵}pow 3)5', '⎕←value', '⎕←', 'A+.×B', '∘.',
  '2 1⍉array', '2 3⌷array', '1⊃w', 'f@indices', 'a f⍥g w', 'obj.x(a,b).y(c,d)',
  '.y', "(obj⍠'method')⍔⊢args", 'f⍤n', 'b⌹A',
]);

// A claimed result is checked exactly when it's a plain APL value: numbers
// (with ¯, E, ∞) or a quoted string - prose like "matrix" is left alone.
const NUMBER = String.raw`(¯?\d+(\.\d+)?(E¯?\d+)?|¯?∞)`;
const NUMERIC_CLAIM = new RegExp(`^${NUMBER}(\\s+${NUMBER})*$`);
const STRING_CLAIM = /^(["'])(.*)\1$/;

const docSnippets = () => {
  const out = [];
  for (const entry of primitiveDocs()) {
    for (const form of ['monadic', 'dyadic']) {
      for (const m of (entry[form] || '').matchAll(/<code>(.*?)<\/code>(?:\s*→\s*([^,;<]*))?/g)) {
        out.push({ glyph: entry.glyph, src: unescapeHtml(m[1]), claim: (m[2] || '').trim() });
      }
    }
  }
  return out;
};

test('every primitive-table example runs, unless it is a known placeholder', () => {
  for (const { glyph, src } of docSnippets()) {
    if (PLACEHOLDERS.has(src)) continue;
    assert.doesNotThrow(() => evaluateApl(src, quietRuntime()), `${glyph}: ${src}`);
  }
});

test('every exact result claimed in the primitive table is what APL.js gives', () => {
  let checked = 0;
  for (const { glyph, src, claim } of docSnippets()) {
    if (PLACEHOLDERS.has(src) || src.includes('?')) continue;
    const str = claim.match(STRING_CLAIM);
    if (str) {
      assert.equal(evaluateApl(src, quietRuntime()), str[2], `${glyph}: ${src}`);
      checked++;
    } else if (NUMERIC_CLAIM.test(claim)) {
      const shown = G.format(evaluateApl(src, quietRuntime())).replace(/\s+/g, ' ').trim();
      assert.equal(shown, claim.replace(/\s+/g, ' '), `${glyph}: ${src}`);
      checked++;
    }
  }
  assert.ok(checked > 50, `only ${checked} claims were checkable - did the doc format change?`);
});

test('every SVG and FFI help example parses, and the ones without d3/Plot run', () => {
  for (const { example } of graphicsDocs()) {
    assert.doesNotThrow(() => aplToJavaScript(example), example);
  }
  for (const { code } of ffiExamples()) {
    assert.doesNotThrow(() => aplToJavaScript(code), code);
    if (!usesDom(code)) {
      assert.doesNotThrow(() => evaluateApl(code, quietRuntime()), code);
    }
  }
});

test('every primitive glyph has a help entry, and every non-keyboard one an escape', () => {
  const documented = new Set(primitiveDocs().flatMap((e) => e.glyph.split(' ')));
  const escaped = new Set(Object.values(escapes()));
  // → only exists as the hidden left half of ∘. (outer product).
  const glyphs = Object.keys(global_category).filter((g) => !/^[A-Za-z]/.test(g) && g !== '→');
  assert.deepEqual(glyphs.filter((g) => !documented.has(g)), [], 'glyphs missing from PRIMITIVE_DOCS');
  const offKeyboard = glyphs.filter((g) => !g.startsWith('⎕') && /[^\x00-\x7F]/.test(g));
  assert.deepEqual(offKeyboard.filter((g) => ![...g].every((c) => escaped.has(c))), [], 'glyphs without an escape');
});
