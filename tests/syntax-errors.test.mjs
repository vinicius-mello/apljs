import { test } from 'node:test';
import assert from 'node:assert/strict';
import { evaluateApl, parseToAst } from '../apl.js';

// Syntax errors name the offending APL text and carry its source range
// (error.aplSpan, [from, to)) so the REPL can underline it

const syntaxError = (src) => {
  try {
    parseToAst(src);
  } catch (error) {
    return error;
  }
  assert.fail(`expected a syntax error for ${src}`);
};

test('pieces that do not combine are quoted from the source', () => {
  const error = syntaxError('4 5 +');
  assert.equal(error.message, "SYNTAX ERROR: can't combine “4 5” and “+”");
  assert.deepEqual(error.aplSpan, [0, 5]);
});

test('the range points inside the statement and dfn that failed', () => {
  const error = syntaxError('x←1 ⋄ f←{⍵ +} ⋄ f 1');
  assert.match(error.message, /“⍵” and “\+”/);
  assert.deepEqual(error.aplSpan, [9, 12]);
});

test('tokenizer and unknown-glyph errors carry a range too', () => {
  assert.deepEqual(syntaxError('1 ⌶ 2').aplSpan, [2, 3]);
  assert.deepEqual(syntaxError('1 "').aplSpan, [2, 3]);
});

test('valid code is unaffected by the source ranges on nodes', () => {
  assert.equal(evaluateApl('f←{⍵×2} ⋄ +/f ⍳4'), 12);
});
