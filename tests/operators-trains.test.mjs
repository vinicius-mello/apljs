import { test } from 'node:test';
import assert from 'node:assert/strict';
import { evaluateApl } from '../apl.js';
import { assertAplEqual } from './helpers.mjs';

// ⍣ with a right-operand condition, value-left forks, dops using ⍵⍵

test('f⍣g returns the first new value that satisfies the condition', () => {
  assert.equal(evaluateApl('{⍵×2}⍣{⍺>100}1'), 128);
  assert.equal(evaluateApl('{1+⍵÷2}⍣=1'), 2);
});

test('a fork with a value on the left still passes ⍺ to its right tine', () => {
  assert.equal(evaluateApl('2 (1+-) 5'), -2);
  assert.equal(evaluateApl('(1+-) 5'), -4);
});

test('a dfn mentioning ⍺⍺ and ⍵⍵ is a dyadic operator', () => {
  assert.equal(evaluateApl('f←{⍺⍺ ⍵⍵ ⍵} ⋄ (-f|) ¯3'), -3);
  assertAplEqual(evaluateApl('f←{(⍺⍺ ⍵),⍵⍵ ⍵} ⋄ (-f⌽) 1 2'), [-1, -2, 2, 1]);
});
