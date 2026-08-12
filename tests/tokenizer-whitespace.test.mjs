import { test } from 'node:test';
import assert from 'node:assert/strict';
import { evaluateApl } from '../apl.js';

// Trailing spaces/tabs before a newline used to be swallowed together with
// the newline itself by the WHITESPACE regex (\s matches \r\n too), silently
// fusing two lines into one expression.

test('trailing spaces before a newline do not swallow the line break', () => {
  assert.equal(evaluateApl('x←1   \ny←2\nx+y'), 3);
});

test('trailing tabs before a newline do not swallow the line break', () => {
  assert.equal(evaluateApl('x←1\t\ny←2\nx+y'), 3);
});

test('a blank line with trailing spaces still separates statements', () => {
  assert.equal(evaluateApl('x←1 \n \n y←2\nx+y'), 3);
});
