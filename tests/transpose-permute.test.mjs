import { test } from 'node:test';
import { evaluateApl } from '../apl.js';
import { assertAplEqual } from './helpers.mjs';

// transposeRec/permute (⍉, used by dot product/⌹/decode/encode too) —
// regressions for 473a2c2: a box is rank 0, never a row to transpose into

test('⍉ (monadic and dyadic) on a boxed argument is a no-op, not a dig into its content', () => {
  assertAplEqual(evaluateApl('(⍉⊂2 2⍴1 2 3 4)≡⊂2 2⍴1 2 3 4'), 1);
  assertAplEqual(evaluateApl('(1 0⍉⊂2 2⍴1 2 3 4)≡⊂2 2⍴1 2 3 4'), 1);
});

test('dot product (f.g) over real matrices still matches ordinary matrix multiplication', () => {
  assertAplEqual(evaluateApl('(2 2⍴1 0 0 1)+.×(2 2⍴1 2 3 4)'), [[1, 2], [3, 4]]);
});
