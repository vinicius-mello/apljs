import { test } from 'node:test';
import { AplJS, G } from '../apl.js';
import { assertAplEqual } from './helpers.mjs';

// ⍠ (buildObject) command arguments — regression for the discloseCommandArgs
// fix: a real array used inside a command, e.g. (#data pts), must reach the
// receiver (d3/Plot or any other FFI object) as the array itself, not as the
// 1-element box G.strand wraps it in as a strand member.

test('a real-array argument in a chained ⍠ command reaches the receiver undisclosed', () => {
  const session = AplJS();
  const pts = session('pts←⍉2 3⍴1 2 3 4 5 6');
  const cmdList = session('(#data pts)');
  const received = [];
  const receiver = { data(x) { received.push(x); return receiver; } };
  G.buildObject(cmdList, receiver);
  assertAplEqual(received[0], pts);
});

test('a real-array argument in a single bare ⍠ command (monadic object build) is also disclosed', () => {
  const session = AplJS();
  session('pts←⍉2 3⍴1 2 3 4 5 6');
  const obj = session('⍠(#data pts)');
  assertAplEqual(obj.data, session('pts'));
});
