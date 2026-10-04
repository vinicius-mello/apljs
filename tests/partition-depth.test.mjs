import { test } from 'node:test';
import assert from 'node:assert/strict';
import { evaluateApl } from '../apl.js';
import { assertAplEqual } from './helpers.mjs';

// ≡ depth, ⍺⊂⍵ partitioned enclose, ⊆ nest/partition, ⍸ boxing,
// ⍷ with strings, ⍴ of an empty vector, ∆/⍙ names, syntax errors

test('monadic ≡ is depth, negative when items have uneven depth', () => {
  assert.equal(evaluateApl('≡5'), 0);
  assert.equal(evaluateApl('≡1 2'), 1);
  assert.equal(evaluateApl('≡(1 2)(3 4)'), 2);
  assert.equal(evaluateApl('≡1 (2 3)'), -2);
  assert.equal(evaluateApl('≡⊂⊂1 2'), 3);
  assert.equal(evaluateApl('≡⍬'), 1);
  assert.equal(evaluateApl('≡2 2⍴1 2 3 4'), 1);
  assert.equal(evaluateApl('≡⍳2 2'), 2);
  assert.equal(evaluateApl("≡'abc' 'de'"), 2);
});

test('⍺⊂⍵ starts ⍺[i] new partitions before ⍵[i]', () => {
  assertAplEqual(evaluateApl('1 0 1 0⊂1 2 3 4'), [[[1, 2]], [[3, 4]]]);
  assertAplEqual(evaluateApl('0 1 0 2⊂1 2 3 4'), [[[2, 3]], [[]], [[4]]]);
  assertAplEqual(evaluateApl("1 0 1 0⊂'abcd'"), ['ab', 'cd']);
  assert.equal(evaluateApl('≡1 0 1 0⊂1 2 3 4'), 2);
  assert.equal(evaluateApl('(1 0 1 0⊂1 2 3 4)≡(1 2)(3 4)'), 1);
});

test('⍺⊆⍵ starts a partition only where ⍺ grows, and 0 drops items', () => {
  assertAplEqual(evaluateApl('1 1 2 2⊆1 2 3 4'), [[[1, 2]], [[3, 4]]]);
  assertAplEqual(evaluateApl('2 2 1⊆1 2 3'), [[[1, 2, 3]]]);
  assertAplEqual(evaluateApl('1 1 0 1⊆1 2 3 4'), [[[1, 2]], [[4]]]);
  assertAplEqual(evaluateApl("1 1 0 1 1⊆'ab cd'"), ['ab', 'cd']);
});

test('monadic ⊆ encloses only a simple array', () => {
  assert.equal(evaluateApl('≡⊆1 2 3'), 2);
  assert.equal(evaluateApl('(⊆(1 2)(3 4))≡(1 2)(3 4)'), 1);
  assert.equal(evaluateApl('⊆5'), 5);
});

test('monadic ⍸ on a matrix gives a vector of boxed index pairs', () => {
  assertAplEqual(evaluateApl('⍴⍸2 2⍴1 0 0 1'), [2]);
  assertAplEqual(evaluateApl('⍸2 2⍴1 0 0 1'), [[[0, 0]], [[1, 1]]]);
  assertAplEqual(evaluateApl('⍸1 0 2'), [0, 2, 2]);
});

test('⍷ searches for a string pattern character by character', () => {
  assertAplEqual(evaluateApl("'ab'⍷'cabd'"), [0, 1, 0, 0]);
  assertAplEqual(evaluateApl('2 3⍷1 2 3 2 3'), [0, 1, 0, 1, 0]);
});

test('reshaping an empty vector fills with 0', () => {
  assertAplEqual(evaluateApl('5⍴⍬'), [0, 0, 0, 0, 0]);
});

test('∆ and ⍙ are ordinary name characters', () => {
  assert.equal(evaluateApl('a∆b←3 ⋄ ⍙x←4 ⋄ a∆b+⍙x'), 7);
  assert.equal(evaluateApl('f∆←{⍵+1} ⋄ f∆ 2'), 3);
});

test('an expression that cannot be fully combined is a SYNTAX ERROR', () => {
  assert.throws(() => evaluateApl('4 5 +'), /SYNTAX ERROR/);
});
