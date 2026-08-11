import { test } from 'node:test';
import { evaluateApl } from '../apl.js';
import { assertAplEqual } from './helpers.mjs';

// ⊖/⌽ per-axis (reverseAxis/rotateAxis) — regressions for 9bf2f83:
// a rank-0 argument has no axis to rotate, so it must be a no-op

test('⊖ on a boxed (rank-0) argument is a no-op', () => {
  assertAplEqual(evaluateApl('(1⊖⊂1 2 3)≡⊂1 2 3'), 1);
});
