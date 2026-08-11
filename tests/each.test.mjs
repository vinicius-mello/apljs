import { test } from 'node:test';
import { evaluateApl } from '../apl.js';
import { assertAplEqual } from './helpers.mjs';

// ¨ (each) — regressions for 18a199a

test('¨ treats a boxed argument as one rank-0 cell, not an array to iterate', () => {
  assertAplEqual(evaluateApl('⍴⊢¨⊂1 2 3'), []); // rank 0, not shape [3]
});

test('¨ over two boxed rank-0 arguments discloses, applies, and re-encloses', () => {
  assertAplEqual(evaluateApl('(⊂1 2 3),¨⊂4 5 6'), [[1, 2, 3, 4, 5, 6]]);
});
