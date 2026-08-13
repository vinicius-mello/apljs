import { test } from 'node:test';
import { evaluateApl } from '../apl.js';
import { assertAplEqual } from './helpers.mjs';

// ⍤ (rank) — regression for a grammar bug found while verifying the / vs ⌿
// last-axis fix: the D-operator-forming rule in reduceStack only accepted
// 'F' or 'V' as an operator's LEFT operand, never 'R' (⌿/⍀//\\'s own
// category), even though CAT_F_V already accepted 'R' on the RIGHT operand
// side. So +⍤1 parsed fine but ⌿⍤1 never did, purely because ⌿ happened to
// sit on the wrong side of ⍤.

test('⌿ (category R) can be a D-operator\'s left operand, not just F', () => {
  assertAplEqual(evaluateApl('1 0 1(⌿⍤1 1)3⍴1 2 3'), evaluateApl('1 0 1/3⍴1 2 3'));
});

test('⍺(⌿⍤1 1)⍵ forces first-axis ⌿ onto rank-1 cells, matching last-axis ⍺/⍵', () => {
  assertAplEqual(
    evaluateApl('1 0 1 0(⌿⍤1 1)2 3 4⍴⍳24'),
    evaluateApl('1 0 1 0/2 3 4⍴⍳24')
  );
});
