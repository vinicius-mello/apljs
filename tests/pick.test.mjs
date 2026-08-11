import { test } from 'node:test';
import assert from 'node:assert/strict';
import { evaluateApl } from '../apl.js';

// ⊃ (pick) — regressions for 453ef7b

test('monadic ⊃ discloses a boxed first item', () => {
  assert.equal(evaluateApl('(⊃(⊂1 2),⊂3 4)≡1 2'), 1);
});

test('monadic ⊃ on an empty vector is 0', () => {
  assert.deepEqual(evaluateApl('⊃⍬'), 0);
});

test('dyadic ⊃ with a scalar index discloses the selected item', () => {
  assert.equal(evaluateApl('(1⊃(⊂1 2),⊂3 4)≡3 4'), 1);
});

test('dyadic ⊃ with a simple ⍺ walks nesting levels as one path, not several picks', () => {
  assert.equal(evaluateApl('(1 1⊃(1 2)(3(4 5)))≡4 5'), 1);
});
