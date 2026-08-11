import { test } from 'node:test';
import assert from 'node:assert/strict';
import { evaluateApl } from '../apl.js';

// @ (at) — regressions for 5f68da7

test('@ accepts a scalar index, treated as a 1-element list', () => {
  assert.deepEqual(evaluateApl('0@2⊢1 2 3 4 5'), [1, 2, 0, 4, 5]);
});

test('assignRec does not leak an extra property for a scalar index', () => {
  const result = evaluateApl('0@2⊢1 2 3 4 5');
  assert.deepEqual(Object.keys(result), ['0', '1', '2', '3', '4']);
});
