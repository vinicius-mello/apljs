import { test } from 'node:test';
import { evaluateApl } from '../apl.js';
import { assertAplEqual } from './helpers.mjs';

// / and \ are dual-purpose like real APL: ⍺/⍵ compress and f/ reduce
// along the LAST axis share one glyph (same for \: ⍺\⍵ expand and f\
// scan-last-axis) - see the / and \ comment on global_category in apl.js.
// ⌿/⍀ stay first-axis-only and unchanged.

test('/ still compresses dyadically, unchanged', () => {
  assertAplEqual(evaluateApl('3/1 2 3'), [1, 1, 1, 2, 2, 2, 3, 3, 3]);
});

test('monadic / reduces along the last axis: sums each ROW of a matrix', () => {
  assertAplEqual(evaluateApl('+/2 3⍴⍳6'), [3, 12]);
});

test('⌿ still reduces along the first axis: sums each COLUMN of a matrix', () => {
  assertAplEqual(evaluateApl('+⌿2 3⍴⍳6'), [3, 5, 7]);
});

test('\\ expands dyadically (compress\'s structural inverse)', () => {
  assertAplEqual(evaluateApl('1 0 1 0 1\\1 2 3'), [1, 0, 2, 0, 3]);
});

test('monadic \\ scans along the last axis: cumsum within each ROW', () => {
  assertAplEqual(evaluateApl('+\\2 3⍴⍳6'), [[0, 1, 3], [3, 7, 12]]);
});

test('⍀ still scans along the first axis: cumsum down each COLUMN', () => {
  assertAplEqual(evaluateApl('+⍀2 3⍴⍳6'), [[0, 1, 2], [3, 5, 7]]);
});

test('reduce-last/scan-last are identity on rank<=1, like ⌿/⍀', () => {
  assertAplEqual(evaluateApl('+/5'), 5);
  assertAplEqual(evaluateApl('(+/⊂1 2 3)≡⊂1 2 3'), 1);
});

// Regressions for real parser bugs hit while building this: giving / and
// \ their own category (not bare 'M') to keep the generic monadic-operator
// rule from grabbing a fragment of an unfinished ⍺ strand, then finding
// every CAT_BOUNDARY_* list that also needed the new category added.

test('f/ as a standalone operator-derived function works parenthesized, assigned, and under each', () => {
  assertAplEqual(evaluateApl('(+/)1 2 3'), 6);
  assertAplEqual(evaluateApl('sum←+/ ⋄ sum 1 2 3'), 6);
  assertAplEqual(evaluateApl('(+/)¨(1 2 3)(4 5 6)'), [6, 15]);
});

test('a multi-element ⍺ mask fully forms as one strand before expand consumes it', () => {
  assertAplEqual(evaluateApl('1 1 0 1\\1 2 3'), [1, 2, 0, 3]);
});

test('/ does not swallow a reshape\'s ⍺ strand that sits to its right', () => {
  assertAplEqual(evaluateApl('2×1 0 1/1 2 3'), [2, 6]);
});

test('⊂ still applies to its own argument when / or \\ sits immediately to its left', () => {
  assertAplEqual(evaluateApl('1 0 1/⊂1 2 3'), [[[1, 2, 3]], [[1, 2, 3]]]);
});

test('/⍨ (compress with swapped args) still binds - / as another operator\'s operand', () => {
  assertAplEqual(evaluateApl('1 2 3 4/⍨0 1 0 1'), [2, 4]);
});
