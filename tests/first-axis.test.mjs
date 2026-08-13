import { test } from 'node:test';
import assert from 'node:assert/strict';
import { evaluateApl } from '../apl.js';
import { assertAplEqual } from './helpers.mjs';

// ⌿ and ⍀ are now dual-purpose too, mirroring / and \ (see the / and \
// comment on global_category, and last-axis.test.mjs): ⍺⌿⍵ compress and
// f⌿ reduce were already different in arity (dyadic vs monadic) like
// compress/reduce always are, but now share the ⌿ glyph too (same for
// ⍀: ⍺⍀⍵ expand, f⍀ scan). Unlike / and \, which recurse to operate on
// the LAST axis dyadically... actually they don't recurse dyadically
// either in this array model - ⌿/⍀'s dyadic form is structurally
// identical to /'s and \'s own dyadic form (G.reduce/G.scan just
// delegate to G.compress/G.expand), so ⌿/⍀ and /\ agree on every vector
// case and only diverge from real first-vs-last-axis Dyalog semantics
// the same way / and \ already do for matrices.

test('⍺⌿⍵ compresses along the FIRST axis: selects/repeats whole ROWS', () => {
  assertAplEqual(evaluateApl('1 0 1⌿3 3⍴⍳9'), [[0, 1, 2], [6, 7, 8]]);
  assertAplEqual(evaluateApl('3⌿1 2 3'), [1, 1, 1, 2, 2, 2, 3, 3, 3]);
});

test('f⌿ still reduces along the first axis (operator form unaffected)', () => {
  assertAplEqual(evaluateApl('+⌿2 3⍴⍳6'), [3, 5, 7]);
  assert.equal(evaluateApl('+⌿5'), 5);
  assertAplEqual(evaluateApl('(+⌿)1 2 3'), 6);
});

test('⍺⍀⍵ expands along the FIRST axis: inserts fills where ⍺ is 0', () => {
  assertAplEqual(evaluateApl('1 0 1 0 1⍀1 2 3'), [1, 0, 2, 0, 3]);
  assertAplEqual(evaluateApl('1 1 0 1⍀1 2 3'), [1, 2, 0, 3]);
});

test('f⍀ still scans along the first axis (operator form unaffected)', () => {
  assertAplEqual(evaluateApl('+⍀2 3⍴⍳6'), [[0, 1, 2], [3, 5, 7]]);
  assert.equal(evaluateApl('+⍀5'), 5);
});

test('reduce/scan-first are identity on rank<=1, like /\\\'s own identity rule', () => {
  assertAplEqual(evaluateApl('(+⌿⊂1 2 3)≡⊂1 2 3'), 1);
  assertAplEqual(evaluateApl('(+⍀⊂1 2 3)≡⊂1 2 3'), 1);
});

// Regression for the fork-tine bug fixed for / (see last-axis.test.mjs) -
// ⌿ and ⍀ now share R too, so they need the same CAT_TINE_F_V protection
// against a bare, uncombined ⌿ getting stolen as a fork's own left tine
// before its own reduce-operator rule can bind it to the function on its
// left.

test('f⌿ as a fork\'s left tine still combines with its own operand first', () => {
  assert.equal(evaluateApl('(+⌿÷≢)⍳10'), 4.5);
});

test('f⍀ as a fork\'s left tine still combines with its own operand first', () => {
  assertAplEqual(evaluateApl('(+⍀÷≢)⍳4'), [0, 0.25, 0.75, 1.5]);
});

test('⊂ still applies to its own argument when ⌿ sits immediately to its left', () => {
  assertAplEqual(evaluateApl('1 0 1⌿⊂1 2 3'), [[[1, 2, 3]], [[1, 2, 3]]]);
});

test('⌿⍨ (compress-first with swapped args) still binds - ⌿ as another operator\'s operand', () => {
  assertAplEqual(evaluateApl('1 2 3 4⌿⍨0 1 0 1'), [2, 4]);
});
