import { test } from 'node:test';
import assert from 'node:assert/strict';
import { evaluateApl } from '../apl.js';
import { assertAplEqual } from './helpers.mjs';

// A string argument is a character vector (a 1-character one a scalar);
// a string item inside an array stays opaque, like an enclosed vector.

test('⍴ of a string is its length, ⍴ of a single character is ⍬', () => {
  assertAplEqual(evaluateApl("⍴'abc'"), [3]);
  assertAplEqual(evaluateApl("⍴'a'"), []);
  assertAplEqual(evaluateApl("⍴'ab' 'cd'"), [2]);
});

test('reshaping a string cycles its characters into a string', () => {
  assert.equal(evaluateApl("5⍴'abc'"), 'abcab');
  assertAplEqual(evaluateApl("2 2⍴'abcd'"), [['a', 'b'], ['c', 'd']]);
});

test('catenating strings gives a string', () => {
  assert.equal(evaluateApl("'ab','cd'"), 'abcd');
  assert.equal(evaluateApl("'ab','c'"), 'abc');
  assertAplEqual(evaluateApl("'ab',1"), ['a', 'b', 1]);
  assert.equal(evaluateApl(",'abc'"), 'abc');
});

test('comparing characters gives scalars, and numbers vs characters is 0', () => {
  assert.equal(evaluateApl("'a'='a'"), 1);
  assertAplEqual(evaluateApl("'abc'='abd'"), [1, 1, 0]);
  assertAplEqual(evaluateApl("'banana'='a'"), [0, 1, 0, 1, 0, 1]);
  assert.equal(evaluateApl("1='a'"), 0);
  assert.equal(evaluateApl("{'a'=⍵:1 ⋄ 0}'a'"), 1);
});

test('grade, take, drop and squad work on strings', () => {
  assertAplEqual(evaluateApl("⍋'banana'"), [1, 3, 5, 0, 2, 4]);
  assertAplEqual(evaluateApl("⍒'abc'"), [2, 1, 0]);
  assert.equal(evaluateApl("4↑'ab'"), 'ab  ');
  assert.equal(evaluateApl("¯4↑'ab'"), '  ab');
  assert.equal(evaluateApl("2↓'abcd'"), 'cd');
  assert.equal(evaluateApl("(⊂2 0)⌷'abc'"), 'ca');
  assert.equal(evaluateApl("1 0 1\\'ab'"), 'a b');
});

test('take and drop extend a scalar and pad with the fill element', () => {
  assertAplEqual(evaluateApl('3↑5'), [5, 0, 0]);
  assertAplEqual(evaluateApl('¯3↑1 2'), [0, 1, 2]);
  assertAplEqual(evaluateApl('2 3↑2 2⍴1'), [[1, 1, 0], [1, 1, 0]]);
  assertAplEqual(evaluateApl('⍴5↓1 2'), [0]);
});

test('each visits the characters of a string', () => {
  assertAplEqual(evaluateApl("≢¨'abc'"), [1, 1, 1]);
  assert.equal(evaluateApl("{⍵}¨'abc'"), 'abc');
  assertAplEqual(evaluateApl("≢¨'abc' 'de'"), [3, 2]);
});

test('dyadic ⍳ and ⍸ give a scalar for a scalar right argument', () => {
  assert.equal(evaluateApl('2 3 4⍳3'), 1);
  assert.equal(evaluateApl("'abc'⍳'b'"), 1);
  assertAplEqual(evaluateApl("'abc'⍳'cax'"), [2, 0, 3]);
  assert.equal(evaluateApl('10 20 30⍸15'), 0);
  assertAplEqual(evaluateApl('10 20 30⍸5 15 30'), [-1, 0, 2]);
});

test('@ can replace characters of a string', () => {
  assert.equal(evaluateApl("'X'@0 2⊢'abc'"), 'XbX');
});

test('numbers sort before characters', () => {
  assertAplEqual(evaluateApl("⍋'b' 1 'a' 0"), [3, 1, 2, 0]);
});
