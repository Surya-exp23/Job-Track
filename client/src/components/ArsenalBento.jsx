import { Fragment, useEffect, useRef, useState } from "react";

// Fires once when the element scrolls into view
const useReveal = (threshold = 0.15) => {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          obs.disconnect();
        }
      },
      { threshold }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);

  return [ref, inView];
};

// Keeps reporting while the element moves in and out of view
const useInViewToggle = (threshold = 0.3) => {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => setInView(entry.isIntersecting),
      { threshold }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);

  return [ref, inView];
};

const shellClass = (inView) =>
  `rounded-3xl border border-slate-200 bg-white p-[18px] shadow-sm transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-0.5 hover:border-blue-300 ${
    inView ? "translate-y-0 opacity-100" : "translate-y-7 opacity-0"
  }`;

const Card = ({ className = "", delay = 0, children }) => {
  const [ref, inView] = useReveal();
  return (
    <div
      ref={ref}
      style={{ transitionDelay: inView ? "0ms" : `${delay}ms` }}
      className={`${shellClass(inView)} ${className}`}
    >
      {children}
    </div>
  );
};

const Title = ({ children }) => (
  <h3 className="font-display text-lg font-bold text-slate-900">{children}</h3>
);

const Desc = ({ children }) => (
  <p className="mt-1 text-sm leading-relaxed text-slate-500">{children}</p>
);

/* ---------------- 01 · Application pipeline ---------------- */

const pipelineCols = [
  {
    label: "Applied",
    count: 12,
    accent: false,
    cards: [
      { role: "Frontend Engineer", meta: "Razorpay", delay: "0.2s" },
      { role: "React Developer", meta: "Zeta", delay: "1.4s" },
    ],
  },
  {
    label: "Screening",
    count: 5,
    accent: false,
    cards: [{ role: "SDE-1", meta: "CRED", delay: "0.8s" }],
  },
  {
    label: "Interview",
    count: 4,
    accent: true,
    cards: [{ role: "UI Engineer", meta: "Groww · Fri", delay: "2s" }],
    note: "Tomorrow, 11:00",
  },
  {
    label: "Offer",
    count: 1,
    accent: false,
    cards: [{ role: "Frontend Dev", meta: "PhonePe · New", delay: "2.8s" }],
  },
];

const PipelineCard = () => (
  <Card className="hidden md:col-span-4 md:block" delay={0}>
    <Title>Application pipeline</Title>
    <div className="mt-3.5 grid grid-cols-2 gap-2.5 sm:grid-cols-4">
      {pipelineCols.map((col) => (
        <div
          key={col.label}
          className={`rounded-xl border p-2.5 ${
            col.accent
              ? "border-blue-200 bg-blue-50/60"
              : "border-slate-200 bg-slate-50/70"
          }`}
        >
          <p
            className={`text-[11px] font-bold uppercase tracking-wider ${
              col.accent ? "text-blue-600" : "text-slate-400"
            }`}
          >
            {col.label}{" "}
            <span
              className={`ml-1 rounded-full px-1.5 ${
                col.accent
                  ? "bg-blue-600 text-white"
                  : "bg-slate-200 text-slate-600"
              }`}
            >
              {col.count}
            </span>
          </p>
          {col.cards.map((c) => (
            <div
              key={c.role}
              style={{ animationDelay: c.delay }}
              className={`animate-floaty mt-2 rounded-lg border bg-white p-2 shadow-sm ${
                col.accent ? "border-blue-200" : "border-slate-200"
              }`}
            >
              <p className="text-xs font-semibold text-slate-900">{c.role}</p>
              <p className="mt-0.5 text-[10px] text-slate-400">{c.meta}</p>
            </div>
          ))}
          {col.note && (
            <div className="mt-2 flex items-center gap-1.5 text-[10px] font-semibold text-blue-600">
              <span className="animate-pulse-dot inline-block h-1.5 w-1.5 rounded-full bg-blue-600" />
              {col.note}
            </div>
          )}
        </div>
      ))}
    </div>
  </Card>
);

/* ---------------- 02 · Resume analysis ---------------- */

const RING_C = 2 * Math.PI * 54;
const SCORE_TARGET = 87;
const UPLOAD_MS = 2400;

const ResumeCard = () => {
  const [ref, inView] = useReveal();
  const [watchRef, watching] = useInViewToggle(0.3);
  const [phase, setPhase] = useState("upload");
  const [progress, setProgress] = useState(0);
  const [score, setScore] = useState(0);
  const timers = useRef([]);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setPhase("score");
      setScore(SCORE_TARGET);
      return;
    }
    timers.current.forEach(clearTimeout);
    timers.current = [];
    if (!watching) {
      setPhase("upload");
      setProgress(0);
      setScore(0);
      return;
    }
    let raf;
    const t0 = performance.now();
    const tick = (t) => {
      const p = Math.min(1, (t - t0) / UPLOAD_MS);
      setProgress(Math.round(p * 100));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    let scoreRaf;
    timers.current.push(
      setTimeout(() => {
        setPhase("score");
        const s0 = performance.now();
        const stick = (t) => {
          const p = Math.min(1, (t - s0) / 1600);
          setScore(Math.round(SCORE_TARGET * (1 - Math.pow(1 - p, 3))));
          if (p < 1) scoreRaf = requestAnimationFrame(stick);
        };
        scoreRaf = requestAnimationFrame(stick);
      }, UPLOAD_MS + 500)
    );
    return () => {
      cancelAnimationFrame(raf);
      cancelAnimationFrame(scoreRaf);
      timers.current.forEach(clearTimeout);
    };
  }, [watching]);

  const status =
    progress < 45
      ? "Uploading resume…"
      : progress < 80
        ? "Reading 2 pages…"
        : "Scoring against job description…";

  return (
    <div
      ref={ref}
      style={{ transitionDelay: inView ? "0ms" : "120ms" }}
      className={`${shellClass(inView)} md:col-span-2`}
    >
      <Title>Resume analysis</Title>
      <Desc>Your resume, uploaded and scored against real roles.</Desc>
      <div ref={watchRef} className="mt-3 grid">
        <div
          className={`[grid-area:1/1] self-center transition-[opacity,visibility] duration-500 ${
            phase === "upload" ? "opacity-100" : "invisible opacity-0"
          }`}
        >
          <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-100">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-5 w-5 text-blue-600"
              >
                <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z" />
                <path d="M14 3v5h5" />
                <path d="M9 13h6M9 17h4" />
              </svg>
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-[13px] font-semibold text-slate-900">
                arjun_resume.pdf
              </p>
              <p className="mt-0.5 text-[11px] text-slate-500">{status}</p>
            </div>
            <span className="text-xs font-bold tabular-nums text-blue-600">
              {progress}%
            </span>
          </div>
          <div className="mt-2.5 h-1.5 overflow-hidden rounded-full bg-slate-200">
            <div
              className="h-full rounded-full bg-blue-600"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
        <div
          className={`[grid-area:1/1] transition-[opacity,visibility] duration-500 ${
            phase === "score" ? "opacity-100" : "invisible opacity-0"
          }`}
        >
          <div className="flex justify-center">
            <div className="relative h-[118px] w-[118px]">
              <svg viewBox="0 0 120 120" className="h-full w-full -rotate-90">
                <circle cx="60" cy="60" r="54" fill="none" stroke="#e2e8f0" strokeWidth="10" />
                <circle
                  cx="60"
                  cy="60"
                  r="54"
                  fill="none"
                  stroke="#2563eb"
                  strokeWidth="10"
                  strokeLinecap="round"
                  strokeDasharray={RING_C}
                  strokeDashoffset={RING_C * (1 - score / 100)}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="font-display text-[26px] font-bold text-slate-900">
                  {score}
                </span>
                <span className="text-[11px] text-slate-400">match score</span>
              </div>
            </div>
          </div>
          <ul className="mt-2.5 space-y-2">
            {["Add metrics to 3 bullet points", "Match keywords: React, TypeScript"].map(
              (t) => (
                <li key={t} className="flex items-start gap-2 text-xs text-slate-500">
                  <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-blue-100 text-[10px] font-bold text-blue-700">
                    ✓
                  </span>
                  {t}
                </li>
              )
            )}
          </ul>
        </div>
      </div>
    </div>
  );
};

/* ---------------- 03 · Smart matching ---------------- */

const skills = [
  { name: "React", pct: 92, bar: "bg-blue-600" },
  { name: "TypeScript", pct: 85, bar: "bg-blue-600" },
  { name: "Node.js", pct: 78, bar: "bg-blue-300" },
];

const MatchingCard = () => {
  const [ref, inView] = useReveal();
  return (
    <div ref={ref} className={`${shellClass(inView)} md:col-span-2`}>
      <Title>Smart matching</Title>
      <Desc>Roles matched to your skills.</Desc>
      <div className="mt-3.5 flex h-[150px] items-stretch justify-around gap-2">
        {skills.map((s) => (
          <div key={s.name} className="flex min-h-0 flex-col items-center">
            <div className="flex min-h-0 w-12 flex-1 items-end overflow-hidden rounded-xl bg-slate-100">
              <div
                className={`w-full rounded-xl ${s.bar} transition-[height] duration-[1400ms] ease-[cubic-bezier(0.22,1,0.36,1)]`}
                style={{ height: inView ? `${s.pct}%` : "0%" }}
              />
            </div>
            <p className="mt-2 text-center text-[11px] font-semibold leading-relaxed text-slate-900">
              {s.name}
              <span className="block font-bold text-blue-600">{s.pct}%</span>
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

/* ---------------- 04 · Full timeline ---------------- */

const timeline = [
  { title: "Interview scheduled", meta: "Groww · 2h ago", dot: "bg-blue-600", line: true },
  { title: "Moved to screening", meta: "CRED · 1d ago", dot: "bg-blue-300", line: true },
  { title: "Application sent", meta: "Razorpay · 4d ago", dot: "bg-slate-300", line: false },
];

const TimelineCard = () => (
  <Card className="md:col-span-2" delay={120}>
    <Title>Full timeline</Title>
    <Desc>An audit trail of every status change.</Desc>
    <div className="mt-3.5">
      {timeline.map((t) => (
        <div key={t.title} className="flex gap-3">
          <div className="flex flex-col items-center">
            <span className={`h-2.5 w-2.5 shrink-0 rounded-full ${t.dot}`} />
            {t.line && <span className="w-px flex-1 bg-slate-200" />}
          </div>
          <div className={t.line ? "pb-3" : ""}>
            <p className="text-xs font-semibold text-slate-900">{t.title}</p>
            <p className="mt-0.5 text-[11px] text-slate-400">{t.meta}</p>
          </div>
        </div>
      ))}
    </div>
  </Card>
);

/* ---------------- 05 · Saved jobs ---------------- */

const savedJobs = [
  { role: "Backend Developer", meta: "Razorpay · Remote" },
  { role: "SDE-1", meta: "CRED · Bengaluru" },
  { role: "UI Engineer", meta: "Groww · Hybrid" },
];

const stackPos = [
  "top-0 z-[1] border-slate-200 bg-slate-50 shadow-none",
  "top-[30px] z-[2] border-slate-200 bg-white shadow-[0_4px_12px_rgba(15,23,42,0.08)]",
  "top-[62px] z-[3] border-blue-200 bg-blue-50 shadow-[0_4px_12px_rgba(15,23,42,0.08)]",
];

const SavedCard = () => {
  const [ref, inView] = useReveal();
  const [stackRef, stackInView] = useInViewToggle(0.3);
  const [order, setOrder] = useState([0, 1, 2]);

  useEffect(() => {
    if (
      !stackInView ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    )
      return;
    const id = setInterval(
      () => setOrder(([a, b, c]) => [(a + 1) % 3, (b + 1) % 3, (c + 1) % 3]),
      3000
    );
    return () => clearInterval(id);
  }, [stackInView]);

  return (
    <div
      ref={ref}
      style={{ transitionDelay: inView ? "0ms" : "240ms" }}
      className={`${shellClass(inView)} hidden md:col-span-2 md:block`}
    >
      <Title>Saved jobs</Title>
      <Desc>Your shortlist, one click away.</Desc>
      <div ref={stackRef} className="relative mt-3.5 h-28">
        {savedJobs.map((j, i) => (
          <div
            key={j.role}
            className={`absolute inset-x-0 rounded-xl border p-2.5 transition-[top,background-color,border-color,box-shadow] duration-[900ms] ease-[cubic-bezier(0.22,1,0.36,1)] ${stackPos[order[i]]}`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-900">{j.role}</p>
                <p className="mt-0.5 text-[10px] text-slate-400">{j.meta}</p>
              </div>
              <svg viewBox="0 0 24 24" className="h-4 w-4 shrink-0 fill-blue-600">
                <path d="M6 3h12a1 1 0 0 1 1 1v17l-7-4-7 4V4a1 1 0 0 1 1-1z" />
              </svg>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

/* ---------------- 06 · Recruiter suite ---------------- */

const funnel = [
  { n: "48", label: "Applied", box: "bg-slate-50", nCls: "", lCls: "text-slate-400" },
  { n: "21", label: "Screening", box: "bg-slate-50", nCls: "", lCls: "text-slate-400" },
  { n: "9", label: "Interview", box: "bg-blue-50 ring-1 ring-blue-200", nCls: "text-blue-700", lCls: "text-blue-600" },
  { n: "3", label: "Offer", box: "bg-slate-50", nCls: "", lCls: "text-slate-400" },
  { n: "2", label: "Hired", box: "bg-blue-600", nCls: "text-white", lCls: "text-blue-100" },
];

const FlowArrow = ({ delay }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    style={{ animationDelay: delay }}
    className="animate-flow-arrow h-4 w-4 shrink-0 text-blue-400"
  >
    <path d="M5 12h14M13 6l6 6-6 6" />
  </svg>
);

const RecruiterCard = () => (
  <Card className="hidden md:col-span-6 md:block" delay={0}>
    <div className="flex flex-col gap-4 md:flex-row md:items-center">
      <div className="md:max-w-xs">
        <Title>Recruiter suite</Title>
        <Desc>
          Post jobs and move candidates through your hiring pipeline without
          the spreadsheet chaos.
        </Desc>
      </div>
      <div className="flex flex-1 items-center justify-between gap-1 overflow-x-auto py-2">
        {funnel.map((s, i) => (
          <Fragment key={s.label}>
            <div
              className={`min-w-[5.5rem] flex-1 rounded-xl px-2 py-2.5 text-center ${s.box}`}
            >
              <div className={`font-display text-lg font-bold text-slate-900 ${s.nCls}`}>
                {s.n}
              </div>
              <div className={`mt-0.5 text-[11px] ${s.lCls}`}>{s.label}</div>
            </div>
            {i < funnel.length - 1 && <FlowArrow delay={`${i * 0.3}s`} />}
          </Fragment>
        ))}
      </div>
    </div>
  </Card>
);

/* ---------------- Grid ---------------- */

const ArsenalBento = () => (
  <div className="grid grid-cols-1 gap-4 md:grid-cols-6">
    <PipelineCard />
    <ResumeCard />
    <MatchingCard />
    <TimelineCard />
    <SavedCard />
    <RecruiterCard />
  </div>
);

export default ArsenalBento;
