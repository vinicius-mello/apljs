import { test } from 'node:test';
import assert from 'node:assert/strict';
import { evaluateApl } from '../apl.js';

// dfn variable scoping: plain ← is always local, ⊢← is the explicit escape
// to write through to a global - regressions for the "let G.var" crash

test('plain ← inside a dfn shadows a same-named global instead of writing through', () => {
  assert.equal(evaluateApl('y←1 ⋄ f←{y←2} ⋄ f 5 ⋄ y'), 1);
});

test('⊢← inside a dfn writes through to the global instead of declaring a local', () => {
  assert.equal(evaluateApl('y←1 ⋄ f←{y⊢←2} ⋄ f 5 ⋄ y'), 2);
});

test('⊢← from a nested dfn still reaches the true top-level global', () => {
  assert.equal(evaluateApl('x←1 ⋄ f←{g←{x⊢←99} ⋄ g ⍵ ⋄ x} ⋄ f 5 ⋄ x'), 99);
});

test('a strand assignment target inside a dfn locals every name, even one that shadows a global', () => {
  assert.deepEqual(evaluateApl('y←1 ⋄ f←{a b y←1 2 3} ⋄ f 5 ⋄ y'), 1);
});

test('an inner dfn can still shadow an outer dfn local via plain ← without touching it', () => {
  assert.deepEqual(evaluateApl('f←{outer←10 ⋄ g←{outer←99 ⋄ outer} ⋄ (g ⍵),outer} ⋄ f 5'), [99, 10]);
});
