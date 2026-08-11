import { test } from 'node:test';
import assert from 'node:assert/strict';
import { evaluateApl } from '../apl.js';

// ⌿ (reduce) / ⍀ (scan) — regressions for eb47e31 and a5b1512

test('+⌿ and ×⌿ have ad hoc identity elements over an empty vector', () => {
  assert.equal(evaluateApl('+⌿⍬'), 0);
  assert.equal(evaluateApl('×⌿⍬'), 1);
});

test('reduce/scan over a rank-0 argument is identity, not an error', () => {
  assert.equal(evaluateApl('+⌿5'), 5);
  assert.equal(evaluateApl('+⍀5'), 5);
  assert.equal(evaluateApl('(+⌿⊂1 2 3)≡⊂1 2 3'), 1);
  assert.equal(evaluateApl('(+⍀⊂1 2 3)≡⊂1 2 3'), 1);
});
