import { test } from 'node:test';
import assert from 'node:assert/strict';
import { evaluateApl } from '../apl.js';

// ⍞ (quote) — regression: ⍞ must bind to the very next function/operator
// only, before an actual call (Apply, DyadicApply, or /\'s dyadic
// compress/expand) gets a chance to consume a trailing value as that
// function's argument. Quoting an already-called value is always a no-op
// (there's no G.quote - see ⍞'s own comment in global_category), so
// letting a call happen first was a pure footgun: ⍞ f v applied f to v
// and then quoted the (already plain) result, silently eating v instead of
// leaving it as a sibling of the quoted f. Fixed via the CAT_BOUNDARY_*_CALL
// lists, which drop 'Q' from just the four call-forming rules while every
// train/operator-composing rule (Atop, Fork, OperatorApply,
// DyadicOperatorApply) still treats ⍞ as a left boundary, so ⍞ keeps
// widening across a whole deferred train same as before.

test('⍞ binds to the function immediately after it, not through a call', () => {
  const withoutParens = evaluateApl('update←{1+⍵} ⋄ (#interval ⍞update 125)');
  const withParens = evaluateApl('update←{1+⍵} ⋄ (#interval (⍞update) 125)');
  for (const result of [withoutParens, withParens]) {
    assert.equal(result.length, 3);
    assert.equal(result[0], 'interval');
    assert.equal(typeof result[1], 'function');
    assert.equal(result[1](5), 6);
    assert.equal(result[2], 125);
  }
});

test('quoting a monadic application no longer silently collapses to the call\'s result', () => {
  const result = evaluateApl('⍞+3');
  assert.equal(result.length, 2);
  assert.equal(typeof result[0], 'function');
  assert.equal(result[0](3), 3);
  assert.equal(result[1], 3);
});

test('⍞ still quotes a whole deferred train, unaffected (0⌷⊢ stays one function)', () => {
  const fn = evaluateApl('⍞0⌷⊢');
  assert.equal(typeof fn, 'function');
  assert.equal(fn([10, 20, 30]), 10);
});
