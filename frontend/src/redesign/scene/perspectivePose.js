export function perspectivePose(progress, index) {
  const p = Math.max(0, Math.min(1, Number.isFinite(progress) ? progress : 0));
  const ease = p * p * (3 - 2 * p);
  const side = index - 1.5;
  return {
    position: [
      side * 0.76 * (1 - ease),
      (index % 2 ? -0.38 : 0.38) * (1 - ease),
      side * (0.5 - 0.25 * ease),
    ],
    rotation: [
      (index % 2 ? 0.42 : -0.34) * (1 - ease),
      side * 0.48 * (1 - ease),
      side * 0.35 * (1 - ease) + 0.09 * side * ease,
    ],
  };
}
