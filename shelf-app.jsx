/* ══════════════════════════════════════════════════════════════════
   KNEURALABS · Policy Library — the shelf app
   Self-contained (IIFE). Reuses window.POLICY_DATA + .prose styles.
   ══════════════════════════════════════════════════════════════════ */
(function () {
  const { useState, useEffect, useRef, useCallback } = React;
  const DATA = window.POLICY_DATA || [];

  /* matched cloth-bound set — one jewel hue per volume (oklch, even chroma) */
  const CLOTH = [
    "oklch(0.45 0.085 256)", "oklch(0.46 0.082 195)", "oklch(0.44 0.082 150)",
    "oklch(0.45 0.078 232)", "oklch(0.45 0.085 292)", "oklch(0.46 0.085 330)",
    "oklch(0.52 0.090 72)",  "oklch(0.46 0.080 248)", "oklch(0.45 0.082 312)",
    "oklch(0.47 0.110 28)",
  ];
  const CATEGORY = {
    overview: "The Company", hr: "People", finance: "Finance", it: "Security",
    legal: "Legal & AI", conduct: "Conduct", safety: "Safety",
    workplace: "Workplace", privacy: "Data", acknowledge: "Sign-off",
  };
  const cloth = (i) => CLOTH[i % CLOTH.length];
  const NN = (i) => String(i + 1).padStart(2, "0");
  /* proper book-title capitalization, preserving acronyms (HR, AI, IT) */
  const titleCase = (s) => String(s).replace(/\b([a-z])/g, (m, c) => c.toUpperCase());

  /* a matched cloth set is uniform in size; only the dye lot drifts a hair */
  const seed = (i, n) => { const x = Math.sin((i + 1) * 12.9898 + n * 78.233) * 43758.5453; return x - Math.floor(x); };
  const clothFor = (i) => {
    const b = CLOTH[i % CLOTH.length];
    const d = (seed(i, 3) - 0.5) * 7;             // ±3.5% lightness — subtle sun-fade
    return d >= 0
      ? `color-mix(in oklch, ${b}, #fff ${d.toFixed(1)}%)`
      : `color-mix(in oklch, ${b}, #000 ${(-d).toFixed(1)}%)`;
  };

  function Chevron({ className }) {
    return (<svg className={className} viewBox="0 0 32 32" aria-hidden="true"><polygon points="6,16 24,7 24,11 13,16 24,21 24,25" fill="currentColor"></polygon></svg>);
  }
  function CloseIcon() { return (<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><path d="M6 6l12 12M18 6L6 18"></path></svg>); }
  function Arrow({ dir }) { return (<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ transform: dir === "prev" ? "scaleX(-1)" : "none" }}><path d="M5 12h13M12 6l6 6-6 6"></path></svg>); }
  function Check({ size = 15 }) { return (<svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5"></path></svg>); }

  /* ════════════════════════════════════════════════════════════
     COVER FACE — 10 unique, left-aligned designs, each with the logo
     ════════════════════════════════════════════════════════════ */
  function Logo({ size }) { return (<span className={"cv-logo " + size}><img src="LOGO.png" alt="" /></span>); }
  function Foot({ p, idx }) { return (<div className="cv-foot"><span>{p.code}</span><span className="vol">Vol.{NN(idx)}</span></div>); }

  function CoverArt({ p, idx }) {
    const cat = CATEGORY[p.slug] || "Policy";
    // unified design (the "HR & people" layout): big volume numeral,
    // left-aligned category + title, logo + code along the foot.
    // Each volume keeps its own cloth colour via cloth(idx).
    return (
      <div className="cv-pad cv-v1">
        <span className="cv-numeral" aria-hidden="true">{NN(idx)}</span>
        <div className="cv-eyebrow">{cat}</div>
        <div className="cv-title">{titleCase(p.navLabel)}</div>
        <span className="cv-grow"></span>
        <div className="cv-row"><Logo size="sm" /><Foot p={p} idx={idx} /></div>
      </div>
    );
  }

  function Cover({ p, idx, withBack }) {
    return (
      <div className="cover" style={{ "--cloth": clothFor(idx) }}>
        <CoverArt p={p} idx={idx} />
        {withBack && (
          <div className="cover-back">
            <span className="cb-emboss" aria-hidden="true"></span>
            <img className="cb-mark" src="LOGO.png" alt="" />
            <div className="cb-note">KNEURALABS<br />POLICY LIBRARY · v2.0<br />— confidential —</div>
          </div>
        )}
      </div>
    );
  }

  /* responsive shelf column count — self-correcting (no reliance on a
     resize event firing after mount, which iframes don't always deliver) */
  function useCols(desktop) {
    const calc = () => {
      const w = window.innerWidth;
      if (w <= 430) return 2;
      if (w <= 680) return 3;
      if (w <= 980) return 4;
      return desktop;
    };
    const [cols, setCols] = useState(calc);
    useEffect(() => {
      const on = () => setCols(calc());
      on();                                   // re-measure immediately
      const raf = requestAnimationFrame(on);  // and again after first paint
      const ti = setTimeout(on, 250);         // and once more once settled
      window.addEventListener("resize", on);
      window.addEventListener("orientationchange", on);
      let ro;
      if (window.ResizeObserver) { ro = new ResizeObserver(on); ro.observe(document.documentElement); }
      return () => {
        cancelAnimationFrame(raf); clearTimeout(ti);
        window.removeEventListener("resize", on);
        window.removeEventListener("orientationchange", on);
        if (ro) ro.disconnect();
      };
    }, [desktop]);
    return cols;
  }

  /* ════════════════════════════════════════════════════════════
     PAGE CONTENT — shared by the live page + the turning leaf
     ════════════════════════════════════════════════════════════ */
  function PageInner({ p, idx, total, bodyRef, onNav }) {
    const prev = DATA[idx - 1], next = DATA[idx + 1];
    const reviewed = (p.meta || "").replace(/^Last reviewed\s*/i, "");
    return (
      <React.Fragment>
        <div className="page-head">
          <div className="ph-code"><Chevron className="pmark" />{p.code} · {CATEGORY[p.slug]}</div>
          <h2>{titleCase(p.title)}</h2>
          <div className="ph-meta">
            <span>Reviewed <b>{reviewed}</b></span>
            <span>Vol. <b>{NN(idx)} / {NN(total - 1)}</b></span>
            <span><b>Confidential</b></span>
          </div>
        </div>
        <div className="page-body" ref={bodyRef}>
          <div className="prose">
            <div dangerouslySetInnerHTML={{ __html: p.html }} />
            {p.slug === "acknowledge" && <AckForm />}
            <div className="page-foot-pager">
              <button disabled={!prev} onClick={() => prev && onNav(-1)}>
                <span className="pf-dir">← previous</span>
                <span className="pf-ttl">{prev ? prev.navLabel : "—"}</span>
              </button>
              <button className="np" disabled={!next} onClick={() => next && onNav(1)}>
                <span className="pf-dir">next →</span>
                <span className="pf-ttl">{next ? next.navLabel : "—"}</span>
              </button>
            </div>
          </div>
        </div>
      </React.Fragment>
    );
  }

  /* ════════════════════════════════════════════════════════════
     READER — lifts the book off the shelf, swings it open, flips pages
     ════════════════════════════════════════════════════════════ */
  function Reader({ idx, total, originRect, onClose, onNav }) {
    const stageRef = useRef(null), bookRef = useRef(null), bodyRef = useRef(null), leafRef = useRef(null);
    const [open, setOpen] = useState(false);
    const [shown, setShown] = useState(false);
    const [flip, setFlip] = useState(null); // { dir, from, to }

    // fly the book up off the shelf, then settle to centre
    useEffect(() => {
      const book = bookRef.current, stage = stageRef.current;
      if (!book || !stage) return;
      const fr = stage.getBoundingClientRect();
      const o = originRect || fr;
      const sc = o.width / fr.width || 1;
      const tx = (o.left + o.width / 2) - (fr.left + fr.width / 2);
      const ty = (o.top + o.height / 2) - (fr.top + fr.height / 2);
      book.style.transition = "none";
      book.style.transform = `translate(${tx}px,${ty}px) scale(${sc})`;
      void book.offsetWidth;
      const t1 = setTimeout(() => { book.style.transition = ""; book.style.transform = ""; setShown(true); }, 30);
      const t2 = setTimeout(() => setOpen(true), 380);
      return () => { clearTimeout(t1); clearTimeout(t2); };
    }, []);

    // run a leaf turn whenever a flip is queued
    useEffect(() => {
      if (!flip) return;
      const leaf = leafRef.current;
      if (!leaf) { onNav(flip.dir); setFlip(null); return; }
      const start = flip.dir > 0 ? 0 : -178, end = flip.dir > 0 ? -178 : 0;
      leaf.style.transition = "none";
      leaf.style.transform = `rotateY(${start}deg)`;
      void leaf.offsetWidth;
      const t1 = setTimeout(() => { leaf.style.transition = ""; leaf.style.transform = `rotateY(${end}deg)`; }, 20);
      const t2 = setTimeout(() => { onNav(flip.dir); setFlip(null); }, 660);
      return () => { clearTimeout(t1); clearTimeout(t2); };
    }, [flip]);

    const baseIdx = flip ? (flip.dir > 0 ? flip.to : idx) : idx;
    useEffect(() => { if (bodyRef.current) bodyRef.current.scrollTop = 0; }, [baseIdx]);

    const doNav = useCallback((dir) => {
      setFlip((f) => { if (f) return f; const to = idx + dir; if (to < 0 || to >= total) return f; return { dir, from: idx, to }; });
    }, [idx, total]);

    const close = useCallback(() => {
      const book = bookRef.current;
      setOpen(false);
      setTimeout(() => {
        const el = document.querySelector('.book[data-idx="' + idx + '"]');
        const fr = stageRef.current && stageRef.current.getBoundingClientRect();
        if (book && el && fr) {
          const o = el.getBoundingClientRect();
          const sc = o.width / fr.width || 1;
          const tx = (o.left + o.width / 2) - (fr.left + fr.width / 2);
          const ty = (o.top + o.height / 2) - (fr.top + fr.height / 2);
          book.style.transform = `translate(${tx}px,${ty}px) scale(${sc})`;
        }
        setShown(false);
        setTimeout(onClose, 440);
      }, 360);
    }, [idx, onClose]);

    useEffect(() => {
      const onKey = (e) => {
        if (e.key === "Escape") close();
        else if (e.key === "ArrowLeft") doNav(-1);
        else if (e.key === "ArrowRight") doNav(1);
      };
      window.addEventListener("keydown", onKey);
      return () => window.removeEventListener("keydown", onKey);
    }, [close, doNav]);

    // touch swipe to flip
    const touch = useRef(null);
    const onTS = (e) => { const t = e.touches[0]; touch.current = { x: t.clientX, y: t.clientY }; };
    const onTE = (e) => {
      const s = touch.current; if (!s) return;
      const t = e.changedTouches[0]; const dx = t.clientX - s.x, dy = t.clientY - s.y;
      if (Math.abs(dx) > 48 && Math.abs(dx) > Math.abs(dy) * 1.3) doNav(dx < 0 ? 1 : -1);
      touch.current = null;
    };

    const p = DATA[idx];
    if (!p) return null;
    const baseP = DATA[baseIdx];
    const leafIdx = flip ? (flip.dir > 0 ? flip.from : flip.to) : 0;
    const leafP = flip ? DATA[leafIdx] : null;

    return (
      <div className={"reader" + (shown ? " in" : "")} onMouseDown={(e) => { if (e.target === e.currentTarget) close(); }}>
        <button className="reader-close" onClick={close} aria-label="Close book"><CloseIcon /></button>
        <button className="reader-paddle prev" disabled={idx === 0 || !!flip} onClick={() => doNav(-1)} aria-label="Previous volume"><Arrow dir="prev" /></button>
        <button className="reader-paddle next" disabled={idx === total - 1 || !!flip} onClick={() => doNav(1)} aria-label="Next volume"><Arrow dir="next" /></button>

        <div className="stage" ref={stageRef} onTouchStart={onTS} onTouchEnd={onTE}>
          <div className={"book3d" + (open ? " open" : "")} ref={bookRef}>
            <div className="page">
              <PageInner p={baseP} idx={baseIdx} total={total} bodyRef={bodyRef} onNav={doNav} />
            </div>
            {flip && (
              <div className="leaf" ref={leafRef}>
                <div className="leaf-face front"><PageInner p={leafP} idx={leafIdx} total={total} onNav={() => {}} /></div>
                <div className="leaf-face back" aria-hidden="true"></div>
              </div>
            )}
            <Cover p={p} idx={idx} withBack />
          </div>
        </div>

        <div className="reader-hint">Press <kbd>Esc</kbd> to shelve · swipe or <kbd>←</kbd> <kbd>→</kbd> to turn pages</div>
      </div>
    );
  }

  /* ── acknowledgment sign-off ── */
  function AckForm() {
    const [name, setName] = useState(""); const [role, setRole] = useState(""); const [done, setDone] = useState(false);
    const ready = name.trim() && role.trim();
    if (done) {
      return (
        <div className="ack-done">
          <div className="ack-done-mark"><Check size={26} /></div>
          <div className="ack-done-title">Acknowledgment recorded</div>
          <div className="ack-done-body">Thank you, <b>{name}</b>. Your acknowledgment of the Kneuralabs policy handbook (v2.0) has been logged as <span className="mono">{new Date().toLocaleString()}</span>.</div>
        </div>
      );
    }
    return (
      <div className="ack-form">
        <div className="ack-form-label">Sign-off</div>
        <p className="ack-form-intro">Confirm you have read and understood every section above.</p>
        <div className="ack-fields">
          <label><span>Full name</span><input value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" /></label>
          <label><span>Role</span><input value={role} onChange={(e) => setRole(e.target.value)} placeholder="Your role" /></label>
        </div>
        <button className="ack-submit" disabled={!ready} onClick={() => setDone(true)}>I acknowledge &amp; agree to comply <Check /></button>
      </div>
    );
  }

  /* ════════════════════════════════════════════════════════════
     APP
     ════════════════════════════════════════════════════════════ */
  const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
    "accent": "#2e6bd6",
    "perShelf": "4"
  }/*EDITMODE-END*/;

  function App() {
    const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);
    const cols = useCols(parseInt(t.perShelf, 10) || 4);
    const [reader, setReader] = useState(null); // { idx, rect } | null

    useEffect(() => {
      document.documentElement.style.setProperty("--accent", t.accent);
    }, [t.accent]);

    useEffect(() => {
      document.body.style.overflow = reader ? "hidden" : "";
      return () => { document.body.style.overflow = ""; };
    }, [reader]);

    const openBook = (i, el) => setReader({ idx: i, rect: el.getBoundingClientRect() });
    const navTo = (d) => setReader((r) => r && ({ idx: Math.min(DATA.length - 1, Math.max(0, r.idx + d)), rect: r.rect }));

    const shelves = [];
    for (let i = 0; i < DATA.length; i += cols) shelves.push(DATA.slice(i, i + cols));

    return (
      <div className="lib">
        <div className="lib-top">
          <div className="lib-brand">
            <img src="LOGO.png" alt="Kneuralabs" />
            <div><div className="wm">Kneuralabs</div><div className="tag">~/policy-library</div></div>
          </div>
          <span className="spacer"></span>
          <span className="count">{DATA.length} VOLUMES · v2.0</span>
        </div>

        <div className="lib-head">
          <h1>The policy <em>library</em></h1>
          <p>Every Kneuralabs policy, bound and shelved. Tap a cover to take it down and read it cover to cover.</p>
        </div>

        <div className="bookcase">
          {shelves.map((row, si) => (
            <div className="shelf" key={si}>
              <div className="shelf-row" style={{ "--per": cols }}>
                {row.map((p, li) => {
                  const gi = si * cols + li;
                  return (
                    <button
                      key={p.slug}
                      className={"book" + (reader && reader.idx === gi ? " is-reading" : "")}
                      data-idx={gi}
                      style={{ "--cloth": clothFor(gi) }}
                      onClick={(e) => openBook(gi, e.currentTarget)}
                      title={"Open " + p.title}
                    >
                      <span className="vol3d">
                        <span className="book-spine" aria-hidden="true">
                          <span className="sp-band"></span>
                          <span className="sp-title">{titleCase(p.navLabel)}</span>
                          <span className="sp-band"></span>
                        </span>
                        <Cover p={p} idx={gi} />
                      </span>
                    </button>
                  );
                })}
              </div>
              <div className="shelf-plank" aria-hidden="true"></div>
            </div>
          ))}
        </div>

        {reader && (
          <Reader idx={reader.idx} total={DATA.length} originRect={reader.rect}
            onClose={() => setReader(null)} onNav={navTo} />
        )}

        <TweaksPanel title="Tweaks">
          <TweakSection label="Binding" />
          <TweakColor label="Foil accent" value={t.accent}
            options={["#2e6bd6", "#1f4f8f", "#d4452e", "#3f7d63", "#6b57d6", "#b08428"]}
            onChange={(v) => setTweak("accent", v)} />
          <TweakSection label="Shelving" />
          <TweakRadio label="Per shelf" value={t.perShelf} options={["3", "4", "5"]}
            onChange={(v) => setTweak("perShelf", v)} />
        </TweaksPanel>
      </div>
    );
  }

  ReactDOM.createRoot(document.getElementById("root")).render(<App />);
})();
