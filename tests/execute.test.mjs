import { test } from 'node:test';
import assert from 'node:assert/strict';
import { evaluateApl, AplJS } from '../apl.js';
import { assertAplEqual } from './helpers.mjs';

// ⍎ runs in the caller's session: same variables and name categories;
// ⍕ and ⍎ keep their session when passed as operands

test('⍎ sees session variables and dfns', () => {
  assert.equal(evaluateApl("x←7 ⋄ ⍎'x+1'"), 8);
  assert.equal(evaluateApl("f←{⍵+1} ⋄ ⍎'f 5'"), 6);
});

test('a dfn defined through ⍎ is a function in later code', () => {
  const run = AplJS();
  run("⍎'g←{⍵×2}'");
  assert.equal(run('g 4'), 8);
});

test('⍕ and ⍎ work as operands of each', () => {
  assertAplEqual(evaluateApl('⍕¨1 2'), ['1', '2']);
  assertAplEqual(evaluateApl("⍎¨'1+1' '2×3'"), [2, 6]);
  assertAplEqual(evaluateApl('⎕pp←3 ⋄ ⍕¨○1 2'), ['3.14', '6.28']);
});

test('separate evaluateApl calls do not share sessions', () => {
  evaluateApl('zz←1');
  assert.equal(evaluateApl('⎕typeof zz'), 'undefined');
});
