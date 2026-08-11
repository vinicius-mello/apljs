import { test } from 'node:test';
import { evaluateApl } from '../apl.js';
import { assertAplEqual } from './helpers.mjs';

// ⊂ (enclose) and strand — regressions for c73ce0a, bb3aa6b, e800f08

test('⊂ on an already-simple scalar is a no-op, not a new box', () => {
  assertAplEqual(evaluateApl('⊂5'), 5);
  assertAplEqual(evaluateApl('(⊂5)≡5'), 1);
});

test('⊂ does not gain depth on an already-simple scalar', () => {
  assertAplEqual(evaluateApl('⊂⊂5'), 5);
  assertAplEqual(evaluateApl('(⊂⊂5)≡⊂5'), 1);
});

test('a real box has rank 0', () => {
  assertAplEqual(evaluateApl('⍴⊂1 2 3'), []);
});

test('a strand of vectors encloses every item, so it is not a matrix', () => {
  assertAplEqual(evaluateApl('⍴(1 2)(3 4)'), [2]);
  assertAplEqual(evaluateApl('((1 2)(3 4))≡(⊂1 2),⊂3 4'), 1);
});
