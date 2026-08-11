import { test } from 'node:test';
import assert from 'node:assert/strict';
import { evaluateApl } from '../apl.js';

// ⌹ (domino) — regressions for 14d60ff and c154d7b

test('monadic ⌹ on a boxed argument is a domain error, not a silent garbage matrix', () => {
  assert.throws(() => evaluateApl('⌹⊂2 2⍴1 2 3 4'), /Domino requires/);
});

test('monadic ⌹ pseudo-inverts a plain vector as a single row', () => {
  const result = evaluateApl('⌹1 2 3');
  assert.deepEqual(result.map((x) => Math.round(x * 1e6) / 1e6), [0.071429, 0.142857, 0.214286]);
});

test('dyadic ⍺⌹⍵ always pseudo-inverts ⍵, matrix-multiplying ⍺ on the left: ⍺+.×⌹⍵', () => {
  // matrix ⌹ vector
  assert.deepEqual(evaluateApl('(2 2⍴1 0 0 2)⌹1 2'), [0.2, 0.8]);
  // vector ⌹ matrix — not the same formula/result as the matrix-on-left case above
  assert.deepEqual(evaluateApl('1 2⌹2 2⍴1 0 0 2'), [1, 1]);
});
