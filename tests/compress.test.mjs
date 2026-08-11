import { test } from 'node:test';
import { evaluateApl } from '../apl.js';
import { assertAplEqual } from './helpers.mjs';

// / (compress) — regressions for 7d431d1

test('a scalar ⍺ broadcasts over ⍵', () => {
  assertAplEqual(evaluateApl('3/1 2 3'), [1, 1, 1, 2, 2, 2, 3, 3, 3]);
});

test('a boxed ⍵ item is replicated whole, not disclosed', () => {
  assertAplEqual(evaluateApl('1 0 1/⊂1 2 3'), [[[1, 2, 3]], [[1, 2, 3]]]);
});
