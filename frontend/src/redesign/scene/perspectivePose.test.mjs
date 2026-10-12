import assert from "node:assert/strict";
import test from "node:test";
import { perspectivePose } from "./perspectivePose.js";
test("Out-of-range and invalid scroll values produce bounded finite transforms", () => {
  for (const p of [-10, 0, 0.5, 1, 10, NaN, Infinity])
    for (let i = 0; i < 4; i++) {
      const pose = perspectivePose(p, i);
      assert.ok([...pose.position, ...pose.rotation].every(Number.isFinite));
    }
  assert.deepEqual(perspectivePose(-10, 0), perspectivePose(0, 0));
  assert.deepEqual(perspectivePose(10, 3), perspectivePose(1, 3));
});
test("Focus aligns screen positions while preserving real depth between panels", () => {
  const poses = [0, 1, 2, 3].map((i) => perspectivePose(1, i));
  for (const pose of poses) {
    assert.equal(Math.abs(pose.position[0]), 0);
    assert.equal(Math.abs(pose.position[1]), 0);
  }
  assert.equal(new Set(poses.map((p) => p.position[2])).size, 4);
  assert.ok(
    perspectivePose(0, 0).position[0] < perspectivePose(0, 3).position[0],
  );
});
test("Scroll reversal restores the exact arrangement without accumulated state", () => {
  const original = perspectivePose(0.25, 2);
  perspectivePose(0.9, 2);
  perspectivePose(1, 2);
  assert.deepEqual(perspectivePose(0.25, 2), original);
  assert.notDeepEqual(original, perspectivePose(0.75, 2));
});
