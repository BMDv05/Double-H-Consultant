import { useEffect, useRef, useState } from 'react';
import { useLang } from './LangContext.jsx';

/* Horizontal divisions carousel — no arrow buttons.
   The block pins itself with the section heading while the row is scrolled
   through: on a mouse-driven, tall enough viewport the page scroll is handed
   over to the row, so the reader cannot skip past the divisions until they have
   seen them, and the page takes its scrolling back at the end. Dragging a card
   or using the arrow keys moves the page with it, so the two never disagree.
   Touch, reduced motion and short viewports keep the plain free-scrolling row.
   Every way of moving the row (wheel, trackpad swipe, click-drag, arrow keys,
   a click on a card) runs through one requestAnimationFrame loop, so the motion
   has weight instead of jumping in raw pixel steps. The wheel pages a card at a
   time — small trackpad movements gather until there is enough travel — so the
   row always comes to rest on the card grid rather than half-cut, and a drag
   carries the flick's momentum before settling the same way. The edge fade is
   drawn from the live scroll position, so it only appears on the side that
   actually hides content, and the wheel is handed back to the page the moment
   the row cannot travel any further. Each card shows its number, a square photo
   and its title; the description appears while the cursor is over the card. */
export default function DivisionCarousel({ divisions, children }) {
  const { t, dir } = useLang();
  const [hovered, setHovered] = useState(null);
  /* -1 = no card picked, so every description starts hidden */
  const [active, setActive] = useState(-1);
  /* true once the row fits its container — the progress line is hidden then */
  const [fits, setFits] = useState(false);
  const stageRef = useRef(null);
  const pinRef = useRef(null);
  const trackRef = useRef(null);
  const barRef = useRef(null);
  const cardRefs = useRef([]);
  const api = useRef({ center: () => {} });
  const dragMoved = useRef(false);
  const open = hovered === null ? active : hovered;

  useEffect(() => {
    const el = trackRef.current;
    const stage = stageRef.current;
    const pin = pinRef.current;
    if (!el || !stage || !pin) return;
    const isRtl = dir === 'rtl';
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    /* The section pins itself while the row is scrolled through, so the page
       hands its scrolling over to the row and takes it back at the end. That
       only makes sense for a fine pointer and a viewport tall enough to hold
       the pinned block — touch keeps its own free-scrolling row. */
    let locked = false; // is the page driving the row right now?
    let travel = 0; // page scroll the pinned section consumes
    let fromPage = false; // a frame whose position came from the page scroll
    /* The page only moves itself when a gesture actually moved the row (a drag,
       a click, the arrow keys). Every other draw — the first one on load, a
       resize, a late font — must leave the page where the reader put it, or
       opening the site would throw the reader down to this section on its own. */
    let driving = false; // is a gesture moving the row, so the page follows it?

    let cur = 0; // where the row is, in px from its starting edge
    let target = 0; // where the wheel is heading
    let mode = null; // 'follow' (wheel) | 'glide' (settle, key, click)
    let raf = 0;
    let last = 0;
    let gFrom = 0;
    let gTo = 0;
    let gMs = 0;
    let gT0 = 0;
    let budget = 0; // wheel travel gathered since the last card was paged
    let gap = 48; // edge fade width, shared with the CSS (--div-fade)
    const wheelStep = 56; // wheel travel that pages the row on by one card
    let wasFit = null;
    let shownL = -1;
    let shownR = -1;

    const maxPos = () => Math.max(0, el.scrollWidth - el.clientWidth);
    const norm = () => (isRtl ? -el.scrollLeft : el.scrollLeft);
    const put = (px) => {
      el.scrollLeft = isRtl ? -px : px;
    };
    const clamp = (v) => Math.min(Math.max(v, 0), maxPos());
    const readGap = () => {
      const v = parseFloat(getComputedStyle(el).getPropertyValue('--div-fade'));
      gap = Number.isFinite(v) ? v : 48;
    };

    /* ---------- pinning: hand the page scroll over to the row ---------- */
    /* The pinned block hangs from the bottom edge of the header (the CSS uses
       the same --nav-h), so it never slides underneath the nav. The script and
       the CSS must agree on this offset, or the scroll mapping drifts. */
    const navH = () => {
      const v = parseFloat(pin.style.getPropertyValue('--nav-h'));
      return Number.isFinite(v) ? v : 0;
    };
    const pinTop = () => navH();
    /* where the stage sits in the document — read from the stage itself, since
       the pinned child is offset from it while the row is being scrolled */
    const stageTop = () => window.scrollY + stage.getBoundingClientRect().top;
    const canLock = () => !reduce && window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    /* where the row sits according to how far the page has scrolled past the
       stage — the pinned row's position is a function of the page, so a resize
       moves the row, never the page */
    const pagePos = () => {
      const total = maxPos();
      if (!locked || total <= 0 || travel <= 0) return null;
      const done = window.scrollY - (stageTop() - pinTop());
      return Math.min(total, Math.max(0, (done / travel) * total));
    };

    const scrollInstantly = (y) => {
      const root = document.documentElement;
      const prev = root.style.scrollBehavior;
      root.style.scrollBehavior = 'auto'; // the page's smooth-scroll must not lag this
      window.scrollTo(0, y);
      root.style.scrollBehavior = prev;
    };

    /* keep the page in step with a row position the page did not produce:
       a drag, a click, the arrow keys — the scrollbar stays honest */
    const mirrorPage = (p) => {
      const total = maxPos();
      if (!locked || total <= 0 || travel <= 0) return;
      const y = stageTop() - pinTop() + (p / total) * travel;
      if (Math.abs(window.scrollY - y) < 0.5) return;
      scrollInstantly(y);
    };

    /* The pinned block only locks when it fits between the header and the
       bottom of the window — otherwise the bottom of the screen would be cut
       off. Rather than guess how tall the photos may be in each language,
       shrink them by exactly what the block overflows: the row keeps its card
       widths, the photo is cropped (never squashed) and the cap is dropped
       again as soon as there is room, so a tall window is untouched. */
    const fitBlock = () => {
      const icon = pin.querySelector('.div-icon');
      el.style.removeProperty('--div-photo'); // photo back to full height
      if (!icon) return;
      const over = pin.offsetHeight - (window.innerHeight - navH());
      if (over <= 0) return; // it fits — leave the photos alone
      const cap = Math.max(120, Math.round(icon.offsetHeight - over - 2));
      el.style.setProperty('--div-photo', `${cap}px`);
    };

    /* Give the section its extra height when it can be pinned, and take it back
       when it cannot. The pinned block fills the viewport, so it fits exactly
       when the heading and the row still have room between the nav and the
       bottom of the screen — a taller block than that would be cut off, and a
       short viewport, a touch pointer or reduced motion keeps the free row. */
    const measure = () => {
      const nav = document.querySelector('.nav');
      pin.style.setProperty('--nav-h', `${Math.round(nav ? nav.getBoundingClientRect().height : 0)}px`);
      const total = maxPos();
      fitBlock();
      const h = pin.offsetHeight;
      /* the block starts under the header, so it has to fit the space left
         below the header — not the whole window */
      locked = canLock() && total > 2 && h + navH() <= window.innerHeight + 1;
      if (!locked) {
        travel = 0;
        stage.style.removeProperty('height');
        return;
      }
      travel = total;
      stage.style.height = `${Math.round(h + travel)}px`;
    };

    /* How far along the row a card sits, measured from the row's starting edge.
       Using the inline-start edge of the card keeps the maths identical in both
       writing directions. */
    const cardStart = (card, trackRect) => {
      const r = card.getBoundingClientRect();
      return (isRtl ? trackRect.right - r.right : r.left - trackRect.left) + norm();
    };

    /* Positions at which a card sits just clear of the fade, so the card being
       left behind still shows a faded sliver of itself. The cards come in row
       order in both writing directions, so this only has to drop the points
       that clamping collapsed together — a list of distinct stops is what lets
       the wheel page one card at a time. */
    const snapPoints = () => {
      const trackRect = el.getBoundingClientRect();
      const max = maxPos();
      const pts = [0];
      for (const card of cardRefs.current) {
        if (!card) continue;
        const p = clamp(cardStart(card, trackRect) - gap);
        if (p - pts[pts.length - 1] > 1) pts.push(p);
      }
      if (max - pts[pts.length - 1] > 1) pts.push(max);
      else pts[pts.length - 1] = max; // the row has to be able to reach its end
      return pts;
    };

    const nearest = (p) => {
      let best = 0;
      let bestD = Infinity;
      for (const q of snapPoints()) {
        const d = Math.abs(q - p);
        if (d < bestD) {
          bestD = d;
          best = q;
        }
      }
      return best;
    };

    const draw = () => {
      put(cur);
      const max = maxPos();
      const p = Math.min(Math.max(cur, 0), max);
      const start = p <= 1;
      const end = p >= max - 1;
      const fit = start && end;
      if (fit !== wasFit) {
        wasFit = fit;
        setFits(fit);
      }
      /* fade only the side that really hides content — never at an end */
      const l = isRtl ? (end ? 0 : gap) : (start ? 0 : gap);
      const r = isRtl ? (start ? 0 : gap) : (end ? 0 : gap);
      if (l !== shownL) {
        shownL = l;
        el.style.setProperty('--fade-l', `${l}px`);
      }
      if (r !== shownR) {
        shownR = r;
        el.style.setProperty('--fade-r', `${r}px`);
      }
      const bar = barRef.current;
      if (bar) {
        const total = el.scrollWidth || 1;
        bar.style.transform = `translateX(${p}px) scaleX(${Math.min(1, el.clientWidth / total)})`;
      }
      if (!fromPage && driving) mirrorPage(p);
    };

    const tick = (now) => {
      if (mode === 'follow') {
        /* a rAF stamp can predate the frame we scheduled, and a backgrounded
           tab can leave a long gap — keep both out of the easing */
        const dt = Math.min(Math.max(now - last, 0), 50);
        last = now;
        cur += (target - cur) * (1 - Math.exp(-dt / 105));
        if (Math.abs(target - cur) < 0.4) {
          cur = target;
          mode = null;
          budget = 0; // the burst is over — next one starts from the card
        }
      } else if (mode === 'glide') {
        const q = gMs > 0 ? Math.min(1, (now - gT0) / gMs) : 1;
        cur = gFrom + (gTo - gFrom) * (1 - Math.pow(1 - q, 3));
        if (q >= 1) {
          cur = gTo;
          mode = null;
        }
      }
      draw();
      if (mode) {
        raf = requestAnimationFrame(tick);
        return;
      }
      raf = 0;
      driving = false; // the row is at rest, so the page stops following it
    };

    const run = () => {
      if (raf) cancelAnimationFrame(raf);
      last = performance.now();
      raf = requestAnimationFrame(tick);
    };

    const glide = (to, ms) => {
      mode = 'glide';
      driving = true;
      cur = norm();
      gFrom = cur;
      gTo = clamp(to);
      gMs = ms;
      gT0 = performance.now();
      if (reduce) {
        cur = gTo;
        mode = null;
        draw();
        driving = false;
        return;
      }
      run();
    };

    const follow = () => {
      mode = 'follow';
      driving = true;
      if (reduce) {
        cur = target;
        mode = null;
        draw();
        driving = false;
        return;
      }
      run();
    };

    const stop = () => {
      if (raf) cancelAnimationFrame(raf);
      raf = 0;
      mode = null;
      cur = norm();
    };

    /* The wheel pages the row one card at a time rather than nudging it by the
       raw delta: small trackpad movements gather until there is enough travel
       for a whole card, so the row always lands on the card grid and never
       springs back to where it started. */
    const onWheel = (e) => {
      const max = maxPos();
      if (max <= 0) return;
      /* pinned: the wheel scrolls the page, which is what moves the row */
      if (locked) return;
      let d = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
      /* wheel deltas can arrive as lines or pages — make them pixels */
      if (e.deltaMode === 2) d *= el.clientWidth;
      else if (e.deltaMode === 1) d *= 20;
      if (!d) return;
      readGap();
      const pts = snapPoints();
      /* travel already queued counts, so a fast burst keeps advancing */
      const from = mode === 'follow' ? target : norm();
      let i = 0;
      for (let k = 1; k < pts.length; k += 1) if (Math.abs(pts[k] - from) < Math.abs(pts[i] - from)) i = k;
      /* nothing left in that direction — let the wheel scroll the page again */
      if (d > 0 && i >= pts.length - 1) return;
      if (d < 0 && i <= 0) return;
      e.preventDefault();
      if (mode !== 'follow' || budget * d < 0) budget = 0;
      budget += d;
      if (budget >= wheelStep && i < pts.length - 1) i += 1;
      else if (budget <= -wheelStep && i > 0) i -= 1;
      else {
        target = pts[i];
        return;
      }
      budget = 0;
      target = pts[i];
      follow();
    };

    /* click-drag with a mouse; touch already drags natively */
    let dragging = false;
    let pid = -1;
    let startX = 0;
    let startP = 0;
    let lastX = 0;
    let lastT = 0;
    let v = 0;

    const onPointerDown = (e) => {
      if (e.pointerType === 'touch' || e.button !== 0) return;
      readGap();
      stop();
      driving = false; // parked until the pointer actually moves the row
      dragging = true;
      pid = e.pointerId;
      startX = e.clientX;
      startP = norm();
      lastX = e.clientX;
      lastT = performance.now();
      v = 0;
      dragMoved.current = false;
    };

    const endDrag = () => {
      if (!dragging) return;
      dragging = false;
      el.classList.remove('is-dragging');
      if (pid >= 0 && el.hasPointerCapture?.(pid)) el.releasePointerCapture(pid);
      pid = -1;
      if (!dragMoved.current) return; // a plain click — let it pick the card
      cur = norm();
      /* carry the flick, then settle on the card that lands nearest */
      const kick = (isRtl ? v : -v) * 170;
      glide(nearest(clamp(cur + kick)), 460);
    };

    const onPointerMove = (e) => {
      if (!dragging || e.pointerId !== pid) return;
      const now = performance.now();
      const dt = now - lastT;
      if (dt > 0) {
        v = (e.clientX - lastX) / dt;
        lastX = e.clientX;
        lastT = now;
      }
      const dx = e.clientX - startX;
      if (!dragMoved.current) {
        if (Math.abs(dx) < 5) return; // ignore the tremor of a click
        dragMoved.current = true;
        el.classList.add('is-dragging');
        /* Capture only once the row is really being dragged. Capturing on
           pointerdown retargets the pointerup — and the click that follows —
           to the row, so the card itself never heard the click and picking a
           division did nothing. */
        try {
          el.setPointerCapture(e.pointerId);
        } catch {
          /* capture is a nicety, not a requirement */
        }
      }
      cur = clamp(startP + (isRtl ? dx : -dx));
      driving = true; // the hand is on the row — the page keeps up with it
      draw();
    };

    const onKeyDown = (e) => {
      if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;
      const forward = isRtl ? e.key === 'ArrowLeft' : e.key === 'ArrowRight';
      const pts = snapPoints();
      const to = forward ? pts.find((q) => q > cur + 1) : [...pts].reverse().find((q) => q < cur - 1);
      if (to === undefined) return; // nothing left — let the key scroll the page
      e.preventDefault();
      readGap();
      glide(to, 380);
    };

    /* a card clicked from rest is brought to the middle of the row */
    api.current.center = (i) => {
      const card = cardRefs.current[i];
      if (!card) return;
      readGap();
      const trackRect = el.getBoundingClientRect();
      const start = cardStart(card, trackRect);
      const width = card.getBoundingClientRect().width;
      glide(clamp(start - Math.max(0, (el.clientWidth - width) / 2)), 460);
    };

    /* anything that scrolls the row without us — a touch swipe, a resize —
       still has to keep the fades and the progress line truthful */
    const onScroll = () => {
      if (locked || mode) return;
      cur = norm();
      draw();
    };

    /* the row's position while the section is pinned is simply how far the page
       has scrolled past the stage — the page is the input, the row is the
       output, and the row's own scrolling no longer moves it */
    const onPageScroll = () => {
      if (!locked) return;
      const total = maxPos();
      if (total <= 0 || travel <= 0) return;
      const done = window.scrollY - (stageTop() - pinTop());
      const p = Math.min(total, Math.max(0, (done / travel) * total));
      if (Math.abs(p - cur) < 1) return; // our own mirror, or already in step
      if (mode) {
        /* a real page scroll takes over from any animation in flight */
        mode = null;
        if (raf) cancelAnimationFrame(raf);
        raf = 0;
      }
      cur = p;
      fromPage = true;
      draw();
      fromPage = false;
    };

    cur = norm();
    readGap();
    measure();
    draw();
    el.addEventListener('wheel', onWheel, { passive: false });
    el.addEventListener('pointerdown', onPointerDown);
    el.addEventListener('pointermove', onPointerMove);
    el.addEventListener('pointerup', endDrag);
    el.addEventListener('pointercancel', endDrag);
    el.addEventListener('pointerleave', endDrag);
    el.addEventListener('keydown', onKeyDown);
    el.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('scroll', onPageScroll, { passive: true });
    const onResize = () => {
      const wasLocked = locked;
      measure();
      readGap();
      if (!mode) {
        /* still pinned: the page is the input, so re-read the row from it
           instead of pushing the page to wherever the old row was */
        const fromScroll = wasLocked && locked ? pagePos() : null;
        cur = fromScroll === null ? norm() : fromScroll;
      }
      draw();
    };
    window.addEventListener('resize', onResize);
    /* the row, and the block that gets pinned around it, can both change size:
       a different language, a narrower window, a late font */
    const ro = new ResizeObserver(onResize);
    ro.observe(el);
    ro.observe(pin);

    return () => {
      if (raf) cancelAnimationFrame(raf);
      ro.disconnect();
      window.removeEventListener('scroll', onPageScroll);
      window.removeEventListener('resize', onResize);
      stage.style.removeProperty('height');
      el.style.removeProperty('--div-photo');
      el.removeEventListener('wheel', onWheel);
      el.removeEventListener('pointerdown', onPointerDown);
      el.removeEventListener('pointermove', onPointerMove);
      el.removeEventListener('pointerup', endDrag);
      el.removeEventListener('pointercancel', endDrag);
      el.removeEventListener('pointerleave', endDrag);
      el.removeEventListener('keydown', onKeyDown);
      el.removeEventListener('scroll', onScroll);
    };
  }, [dir]);

  return (
    <div className="div-stage" ref={stageRef}>
      <div className="div-pin" ref={pinRef}>
        {children}
        <div className={`div-carousel reveal${fits ? ' is-fit' : ''}`}>
          <div
            className="div-track"
            ref={trackRef}
            role="region"
            aria-label={t('div_title')}
            tabIndex={0}
            onMouseLeave={() => setHovered(null)}
          >
            {divisions.map((d, i) => (
              <article
                key={d.key}
                ref={(node) => {
                  cardRefs.current[i] = node;
                }}
                className={`div-card${open === i ? ' is-open' : ''}`}
                onMouseEnter={() => setHovered(i)}
                onClick={() => {
                  if (dragMoved.current) return; // a drag must not also pick a card
                  setActive(i);
                  api.current.center(i);
                }}
              >
                <span className="div-index">{String(i + 1).padStart(2, '0')}</span>
                <div className="div-icon">
                  <img
                    src={d.img}
                    alt=""
                    loading="lazy"
                    draggable="false"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                </div>
                <h3>{t(`div_${d.key}`)}</h3>
                <p className="div-desc">{t(`div_${d.key}d`)}</p>
              </article>
            ))}
          </div>
          <div className="div-progress" aria-hidden="true">
            <span ref={barRef} />
          </div>
        </div>
      </div>
    </div>
  );
}
