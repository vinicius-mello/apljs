import { test } from 'node:test';
import { evaluateApl } from '../apl.js';
import { assertAplEqual } from './helpers.mjs';

// ∘.f (outer product) — regressions for a5cf40d, 60e7c70, 895c658

test('a scalar argument is one atomic cell, not an empty axis', () => {
  assertAplEqual(evaluateApl('2∘.×1 2 3'), [2, 4, 6]);
  assertAplEqual(evaluateApl('1 2 3∘.×2'), [2, 4, 6]);
});

test('every cell fed to f is disclosed first, and the result re-enclosed if not scalar', () => {
  // ,3 alone is already non-scalar, so even a plain-number cell (2) comes
  // back boxed.
  assertAplEqual(evaluateApl('2∘.,3'), [[2, 3]]);
  // A boxed cell is disclosed before f runs, then the (non-scalar) result
  // re-enclosed - not left untouched as (⊂1 2) 3.
  assertAplEqual(evaluateApl('(⊂1 2)∘.,3'), [[1, 2, 3]]);
});

test('an element pulled out of a real array argument (not a whole scalar-like argument) is left untouched', () => {
  // Each already-boxed array element enters f as-is (still a box), and
  // the box survives inside the comma result untouched - not disclosed
  // into (⊂1 2 5)(⊂3 4 5).
  assertAplEqual(evaluateApl('(⊂1 2)(⊂3 4)∘.,5'), [[[[[1, 2]], 5]], [[[[3, 4]], 5]]]);
});
