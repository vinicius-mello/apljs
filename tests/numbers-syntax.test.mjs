import { test } from 'node:test';
import assert from 'node:assert/strict';
import { evaluateApl, tokenizer, parseExpression, global_category, formatNum } from '../apl.js';
import { assertAplEqual } from './helpers.mjs';

// Tokenizer (numbers, strings, system names, unknown glyphs), ⍕ number
// spelling, ! gamma, ÷ by zero, scalar ⊤, reduce identities, scalar
// extension in f.g, pervasive ○

test('numbers accept scientific notation and high minus in the exponent', () => {
  assert.equal(evaluateApl('1e3'), 1000);
  assert.equal(evaluateApl('2.5E¯2'), 0.025);
  assert.equal(evaluateApl('¯1E¯3'), -0.001);
});

test("a doubled quote inside a string is one quote", () => {
  assert.equal(evaluateApl("'it''s'"), "it's");
  assert.equal(evaluateApl("≢'it''s'"), 4);
  assert.equal(evaluateApl("''''"), "'");
});

test('system names are case-insensitive, and ⎕IO is a fixed 0', () => {
  assert.equal(evaluateApl('⎕PP'), 10);
  assert.equal(evaluateApl('⎕PP←4 ⋄ ⍕○1'), '3.142');
  assert.equal(evaluateApl('⎕IO'), 0);
  assert.throws(() => evaluateApl('⎕IO←1'), /DOMAIN ERROR/);
});

test('an unknown glyph is an APL syntax error, not a JS one', () => {
  assert.throws(() => evaluateApl('⌶1 2'), /SYNTAX ERROR: unknown primitive ⌶/);
});

test('⍕ spells every minus sign as ¯ and uses E notation', () => {
  assert.equal(evaluateApl('⍕-0.0000001'), '¯1E¯7');
  assert.equal(evaluateApl('⍕1E21'), '1E21');
  assert.equal(evaluateApl('⍕¯3'), '¯3');
  assert.equal(evaluateApl('2⍕¯1.5'), '¯1.50');
});

test('⎕PP rounding survives very small and very large numbers', () => {
  assert.equal(evaluateApl('⍕1E¯300'), '1E¯300');
  assert.equal(evaluateApl('⍕1E300'), '1E300');
});

test('! extends to non-integers via gamma', () => {
  assert.ok(Math.abs(evaluateApl('!2.5') - 3.323350970447843) < 1e-12);
  assert.ok(Math.abs(evaluateApl('!¯0.5') - Math.sqrt(Math.PI)) < 1e-12);
  assert.equal(evaluateApl('!5'), 120);
  assert.equal(evaluateApl('2!5'), 10);
  assert.equal(evaluateApl('30!60'), 118264581564861424);
  assert.throws(() => evaluateApl('!¯1'), /DOMAIN ERROR/);
});

test('÷ by zero: 0÷0 is 1, anything else is a DOMAIN ERROR', () => {
  assert.equal(evaluateApl('0÷0'), 1);
  assert.throws(() => evaluateApl('1÷0'), /DOMAIN ERROR/);
  assert.throws(() => evaluateApl('÷0'), /DOMAIN ERROR/);
  assert.equal(evaluateApl('÷4'), 0.25);
});

test('⊤ with a scalar radix gives one digit per item of ⍵', () => {
  assert.equal(evaluateApl('10⊤123'), 3);
  assertAplEqual(evaluateApl('10⊤12 34'), [2, 4]);
  assertAplEqual(evaluateApl('2 2 2⊤5'), [1, 0, 1]);
});

test('reducing an empty vector uses the function identity element', () => {
  assert.equal(evaluateApl('⌈/⍬'), -Infinity);
  assert.equal(evaluateApl('⌊/⍬'), Infinity);
  assert.equal(evaluateApl('∧/⍬'), 1);
  assert.equal(evaluateApl('∨/⍬'), 0);
  assert.equal(evaluateApl('-/⍬'), 0);
  assert.throws(() => evaluateApl('{⍺+⍵}/⍬'), /DOMAIN ERROR/);
  assertAplEqual(evaluateApl('+\\⍬'), []);
});

test('f.g extends a scalar argument', () => {
  assert.equal(evaluateApl('2+.×3 4'), 14);
  assert.equal(evaluateApl('3 4+.×2'), 14);
  assert.equal(evaluateApl('1 2 3+.×4 5 6'), 32);
});

test('○ is pervasive in both arguments', () => {
  const [s, c] = evaluateApl('1 2○0');
  assert.equal(s, 0);
  assert.equal(c, 1);
  assertAplEqual(evaluateApl('○1 2').map((x) => +x.toFixed(6)), [3.141593, 6.283185]);
  assert.throws(() => evaluateApl('12○1'), /DOMAIN ERROR/);
});

test('parsing does not mutate the caller token list', () => {
  const tokens = tokenizer('1+2');
  const before = JSON.stringify(tokens);
  parseExpression(tokens, [{ ...global_category }]);
  assert.equal(JSON.stringify(tokens), before);
});

test('formatNum (used by the REPL display) spells numbers the APL way', () => {
  assert.equal(formatNum(-0.6180339887), '¯0.6180339887');
  assert.equal(formatNum(-1e-7), '¯1E¯7');
  assert.equal(formatNum(1e21), '1E21');
  assert.equal(formatNum(-Infinity), '¯∞');
  assert.equal(formatNum(-0), '0');
  assert.equal(formatNum(42), '42');
});
