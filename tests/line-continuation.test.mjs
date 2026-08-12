import { test } from 'node:test';
import assert from 'node:assert/strict';
import { evaluateApl } from '../apl.js';

// An em dash immediately before a line break (with optional trailing
// spaces/tabs in between) fuses the next line onto this one - both the
// dash and the break vanish, same as WHITESPACE/COMMENT. Editor-side, this
// is typed via the "\dash" escape (see APL_ESCAPES in apl.html).

test('em dash + newline joins a wrapped expression into one statement', () => {
  assert.equal(evaluateApl('x←1+—\n2\nx'), 3);
});

test('trailing spaces/tabs between the dash and the newline are still absorbed', () => {
  assert.equal(evaluateApl('x←1+—  \t \n2\nx'), 3);
});

test('a continuation still lets ⋄ split further statements normally on the joined line', () => {
  assert.equal(evaluateApl('a←1—\n  ⋄b←2\na+b'), 3);
});

test('a real line ending in a bare \\ (scan/expand) is unaffected by the dash rule', () => {
  assert.deepEqual(evaluateApl('g←+\\\nA←g 1 2 3\nA'), [1, 3, 6]);
});
