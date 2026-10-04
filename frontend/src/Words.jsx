/* 3D word-by-word scroll animation.
   Splits text into word spans; the parent gets .w3d (watched by ScrollFX),
   each word flips up in 3D with a stagger based on its index (--i). */
export default function Words({ text, cap = 24, step = 26 }) {
  const words = String(text ?? '').split(/\s+/).filter(Boolean);
  return (
    <>
      {words.map((w, i) => (
        <span className="w-wrap" key={i}>
          <span className="w" style={{ '--i': Math.min(i, cap), '--step': `${step}ms` }}>
            {w}
          </span>
          {i < words.length - 1 ? ' ' : null}
        </span>
      ))}
    </>
  );
}
