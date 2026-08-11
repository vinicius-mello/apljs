import assert from 'node:assert/strict';

// Enclosed/shaped values carry extra own properties (e.g. `shape`) on top
// of their JS array indices - deepStrictEqual treats those as mismatches
// even when the indexed contents match. JSON.stringify only serializes an
// array's indexed elements, at every nesting level, so it's a clean way to
// compare structure/values while ignoring that bookkeeping.
export const assertAplEqual = (actual, expected) => {
  assert.equal(JSON.stringify(actual), JSON.stringify(expected));
};
