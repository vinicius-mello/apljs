import { test } from 'node:test';
import assert from 'node:assert/strict';
import { evaluateApl } from '../apl.js';
import { assertAplEqual } from './helpers.mjs';

// ⍪ table/catenate-first, , along the last axis, ↑ mix, ↓ split, ⊇ select,
// ⌺ stencil, ⍣ with negative counts, APL error classes, ⍕ layout

test(', catenates matrices along the last axis', () => {
  assertAplEqual(evaluateApl('(2 2⍴1),2 2⍴0'), [[1, 1, 0, 0], [1, 1, 0, 0]]);
  assertAplEqual(evaluateApl('(2 2⍴1),9 8'), [[1, 1, 9], [1, 1, 8]]);
  assertAplEqual(evaluateApl('(2 2⍴1),0'), [[1, 1, 0], [1, 1, 0]]);
  assertAplEqual(evaluateApl('⍴(2 3⍴0),2 3 4⍴0'), [2, 3, 5]);
  assert.throws(() => evaluateApl('(2 2⍴1),3 3⍴0'), /LENGTH ERROR/);
});

test('monadic , ravels every axis', () => {
  assertAplEqual(evaluateApl('⍴,2 2 2⍴⍳8'), [8]);
  assert.equal(evaluateApl('≡,(1 2)(3 4)'), 2);
});

test('⍪ makes a table, and catenates along the first axis', () => {
  assertAplEqual(evaluateApl('⍪1 2 3'), [[1], [2], [3]]);
  assertAplEqual(evaluateApl('⍴⍪2 3 4⍴0'), [2, 12]);
  assertAplEqual(evaluateApl('⍪5'), [[5]]);
  assertAplEqual(evaluateApl('1 2⍪3 4'), [1, 2, 3, 4]);
  assertAplEqual(evaluateApl('(2 2⍴1)⍪7 8'), [[1, 1], [1, 1], [7, 8]]);
  assertAplEqual(evaluateApl('(2 2⍴1)⍪0'), [[1, 1], [1, 1], [0, 0]]);
});

test('monadic ↑ mixes items into a padded array', () => {
  assertAplEqual(evaluateApl('↑(1 2)(3 4 5)'), [[1, 2, 0], [3, 4, 5]]);
  assertAplEqual(evaluateApl('↑1 (2 3)'), [[1, 0], [2, 3]]);
  assertAplEqual(evaluateApl("↑'ab' 'cde'"), [['a', 'b', ' '], ['c', 'd', 'e']]);
  assertAplEqual(evaluateApl('↑1 2 3'), [1, 2, 3]);
});

test('monadic ↓ splits the last axis into enclosed vectors', () => {
  assertAplEqual(evaluateApl('↓2 3⍴⍳6'), [[[0, 1, 2]], [[3, 4, 5]]]);
  assert.equal(evaluateApl('(↓2 3⍴⍳6)≡(0 1 2)(3 4 5)'), 1);
  assertAplEqual(evaluateApl("↓2 3⍴'abcdef'"), ['abc', 'def']);
  assert.equal(evaluateApl('(↑↓M)≡M←3 4⍴⍳12'), 1);
});

test('⍺⊇⍵ selects one item per index', () => {
  assert.equal(evaluateApl("2 0⊇'abc'"), 'ca');
  assertAplEqual(evaluateApl('3 1⊇10 20 30 40'), [40, 20]);
  assertAplEqual(evaluateApl('(0 1)(1 0)⊇2 2⍴⍳4'), [1, 2]);
});

test('f⌺g passes each neighbourhood and its padding', () => {
  assertAplEqual(evaluateApl('{+/⍵}⌺3⊢1 2 3'), [3, 6, 5]);
  assertAplEqual(evaluateApl('{⍺}⌺3⊢1 2 3'), [[1], [0], [-1]]);
  assertAplEqual(evaluateApl('{+/,⍵}⌺3 3⊢3 3⍴1'), [[4, 6, 4], [6, 9, 6], [4, 6, 4]]);
  assert.throws(() => evaluateApl('{+/⍵}⌺2⊢1 2 3'), /DOMAIN ERROR/);
});

test('the stencil Game of Life agrees with the classic one on a glider', () => {
  const src = [
    'life←{⊃1 ⍵ ∨.∧ 3 4 = +/ +⌿ ¯1 0 1 ∘.⊖ ¯1 0 1 ⌽¨ ⊂⍵}',
    'L←{3=s-⍵∧4=s←{+/,⍵}⌺3 3⊢⍵}',
    'g←8 8↑3 3⍴0 1 0 0 0 1 1 1 1',
    '((L⍣4)g)≡(life⍣4)g',
  ].join('\n');
  assert.equal(evaluateApl(src), 1);
});

test('⍣ with a negative count applies the inverse', () => {
  assert.equal(evaluateApl('2(+⍣¯1)5'), 3);
  assert.equal(evaluateApl('(-⍣¯1)5'), -5);
  assert.equal(evaluateApl('(*⍣¯1)1'), 0);
  assertAplEqual(evaluateApl('10(⊥⍣¯1)123'), [1, 2, 3]);
  assertAplEqual(evaluateApl('2(⊥⍣¯1)5'), [1, 0, 1]);
  assert.equal(evaluateApl('(2∘+)⍣¯1⊢5'), 3);
  assert.equal(evaluateApl('(÷∘2)⍣¯1⊢5'), 10);
  assert.equal(evaluateApl('(2∘×)⍣¯2⊢20'), 5);
  assert.equal(evaluateApl('((2∘×)∘(3∘+))⍣¯1⊢10'), 2);
  assertAplEqual(evaluateApl('1(⌽⍣¯1)1 2 3'), [3, 1, 2]);
  assert.throws(() => evaluateApl('({⍵+1}⍣¯1)3'), /DOMAIN ERROR: no inverse/);
});

test('errors carry an APL error class', () => {
  assert.throws(() => evaluateApl('1 2+1 2 3'), /^Error: LENGTH ERROR/);
  assert.throws(() => evaluateApl('3⌷1 2'), /INDEX ERROR/);
  assert.throws(() => evaluateApl('~2'), /DOMAIN ERROR/);
  assert.throws(() => evaluateApl('1 2 ⌶ 3'), /SYNTAX ERROR: unknown primitive ⌶ at position 4/);
});

test('⍕ lays out nested, character and higher-rank arrays', () => {
  assert.equal(evaluateApl('⍕(1 2)(3 4)'), '1 2  3 4');
  assert.equal(evaluateApl("⍕2 3⍴'abcdef'"), 'abc\ndef');
  assert.equal(evaluateApl('⍕2 2 2⍴⍳8'), '0 1\n2 3\n\n4 5\n6 7');
  assert.equal(evaluateApl('⍕1 (2 2⍴⍳4) 5'), '1  0 1  5\n   2 3');
  assert.equal(evaluateApl('⍕2 2⍴1 10 100 1000'), '  1   10\n100 1000');
});
