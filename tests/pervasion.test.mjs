import { test } from 'node:test';
import { evaluateApl } from '../apl.js';
import { assertAplEqual } from './helpers.mjs';

// Pervasive functions (mdfunc/drel) vs a boxed argument — regressions for bb3aa6b

test('a boxed argument broadcasts its disclosed content against each array element, not zips', () => {
  // Not a length error even though the box's content and the array differ
  // in length by coincidence of size - each array element is compared
  // against the box's WHOLE disclosed content, and each non-scalar
  // sub-result is individually re-enclosed.
  assertAplEqual(evaluateApl('3 4=⊂1 2 3 4'), [[[0, 0, 1, 0]], [[0, 0, 0, 1]]]);
});
