import { test } from 'node:test';
import assert from 'node:assert/strict';
import { evaluateApl } from '../apl.js';

// ⌷ (squad) — regressions for 546b0fa

test('monadic ⌷ is identity', () => {
  assert.equal(evaluateApl('(⌷⊂1 2 3)≡⊂1 2 3'), 1);
});

test('indexing into a rank-0 argument is a length error', () => {
  assert.throws(() => evaluateApl('2⌷⊂1 2 3 4 5'), /Length error/);
});

test('out-of-bounds index is an index error', () => {
  assert.throws(() => evaluateApl('10⌷1 2 3'), /Index error/);
});

test('a boxed per-axis entry selects several indices along that axis', () => {
  assert.deepEqual(evaluateApl('(0 1)(2)⌷2 3⍴⍳6'), [2, 5]);
  assert.deepEqual(evaluateApl('(0 1)(1 2)⌷2 3⍴⍳6'), [[1, 2], [4, 5]]);
});

test('an empty ⍬ per-axis selector gives an empty result on that axis', () => {
  assert.deepEqual(evaluateApl('(0 1)(⍬)⌷2 3⍴⍳6'), [[], []]);
});
