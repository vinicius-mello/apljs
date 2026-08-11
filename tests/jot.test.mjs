import { test } from 'node:test';
import assert from 'node:assert/strict';
import { evaluateApl } from '../apl.js';

// ∘ (jot) — regressions for 5f56b56: binding a value must not swap ⍺/⍵

test('(f∘g)⍵ with f a bound value calls g(⍵, f), not g(f, ⍵)', () => {
  assert.equal(evaluateApl('(2∘|)5'), 1); // 2|5, not 5|2
});

test('(f∘g)⍵ with g a bound value calls f(⍵, g), not f(g, ⍵)', () => {
  assert.equal(evaluateApl('(|∘2)5'), 2); // 5|2, not 2|5
});
