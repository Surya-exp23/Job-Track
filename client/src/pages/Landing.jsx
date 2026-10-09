import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import { MascotVideo, MascotWave } from "../components/Mascot";
import RotatingText from "../components/RotatingText";
import CompanyMarquee from "../components/CompanyMarquee";
import mascot from "../assets/mascot.webp";

const pipeline = [
  {
    title: "Applied",
    count: 12,
    cards: [
      { company: "Razorpay", role: "Frontend Engineer", tag: "2d ago" },
      { company: "Zeta", role: "React Developer", tag: "4d ago" },
    ],
  },
  {
    title: "Interview",
    count: 4,
    accent: true,
    cards: [
      { company: "CRED", role: "SDE-1", tag: "Tomorrow" },
      { company: "Groww", role: "UI Engineer", tag: "Fri" },
    ],
  },
  {
    title: "Offer",
    count: 1,
    cards: [{ company: "PhonePe", role: "Frontend Dev", tag: "New" }],
  },
];

const features = [
  {
    title: "Application pipeline",
    description:
      "Every application in one kanban — applied, screening, interview, offer. Never wonder where you stand again.",
  },
  {
    title: "Resume analysis",
    description:
      "Your resume scored against real job descriptions, with concrete fixes that raise your match rate.",
  },
  {
    title: "Smart matching",
    description:
      "Roles matched to your skills and experience level, from recruiter postings and external boards.",
  },
  {
    title: "Full timeline",
    description:
      "An audit trail of every status change on each application. Your hunt tells its own story.",
  },
  {
    title: "Saved jobs",
    description:
      "Bookmark roles worth a second look. Your shortlist, always one click away.",
  },
  {
    title: "Recruiter suite",
    description:
      "Post jobs and move candidates through your hiring pipeline without the spreadsheet chaos.",
  },
];

const Landing = () => {
  return (
    <div className="min-h-screen bg-zinc-950 font-sans text-white">
      <Navbar />

      {/* Hero */}
      <section className="relative overflow-hidden pt-16">
        <div className="bg-grid absolute inset-0" />
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(50% 40% at 50% 0%, rgba(163,230,53,0.14), transparent 70%)",
          }}
        />
        <div className="relative mx-auto max-w-7xl px-4 pb-16 pt-20 text-center sm:px-6 lg:px-8 lg:pt-28">
          {/* <span className="inline-flex items-center gap-2 rounded-full border border-lime-400/30 bg-lime-400/10 px-4 py-1.5 text-sm font-medium text-lime-300">
            <span className="h-2 w-2 animate-pulse rounded-full bg-lime-400" />
            The job hunt, engineered
          </span> */}
          <h1 className="mx-auto mt-6 max-w-4xl font-display text-5xl font-bold leading-[1.05] tracking-tight sm:text-6xl lg:text-7xl">
            TRACK{" "}
            <MascotWave className="h-[0.9em] w-[0.9em] align-[-0.12em]" />{" "}
            EVERY
            <br />
            APPLICATION.{" "}
            <MascotVideo className="h-[0.9em] w-[0.9em] align-[-0.12em]" />{" "}
            <RotatingText className="text-lime-400" />
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-zinc-400">
            JobTrack turns your chaotic job search into a pipeline —
            applications, resumes, saved jobs and recruiter conversations in
            one ruthless system.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              to="/register"
              className="w-full rounded-xl bg-lime-400 px-8 py-4 text-base font-bold text-zinc-950 transition hover:bg-lime-300 sm:w-auto"
            >
              Start tracking 
            </Link>
            <Link
              to="/login"
              className="w-full rounded-xl border border-zinc-700 bg-zinc-900 px-8 py-4 text-base font-semibold text-white transition hover:border-zinc-500 sm:w-auto"
            >
              Log in
            </Link>
          </div>

          {/* Pipeline mockup */}
          <div className="relative mx-auto mt-16 max-w-5xl">
            <div
              className="pointer-events-none absolute -inset-8 rounded-[32px] blur-3xl"
              style={{ background: "rgba(163,230,53,0.08)" }}
            />
            <div className="relative rounded-2xl border border-zinc-800 bg-zinc-900/70 p-4 text-left shadow-2xl backdrop-blur sm:p-6">
              <div className="mb-4 flex items-center justify-between">
                <div className="flex gap-1.5">
                  <span className="h-3 w-3 rounded-full bg-zinc-700" />
                  <span className="h-3 w-3 rounded-full bg-zinc-700" />
                  <span className="h-3 w-3 rounded-full bg-lime-400" />
                </div>
                <span className="text-xs font-medium text-zinc-500">
                  My applications
                </span>
              </div>
              <div className="grid gap-4 sm:grid-cols-3">
                {pipeline.map((col) => (
                  <div
                    key={col.title}
                    className={`rounded-xl border p-3 ${
                      col.accent
                        ? "border-lime-400/40 bg-lime-400/5"
                        : "border-zinc-800 bg-zinc-950/60"
                    }`}
                  >
                    <div className="mb-3 flex items-center justify-between">
                      <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                        {col.title}
                      </span>
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs font-bold ${
                          col.accent
                            ? "bg-lime-400 text-zinc-950"
                            : "bg-zinc-800 text-zinc-300"
                        }`}
                      >
                        {col.count}
                      </span>
                    </div>
                    <div className="space-y-2">
                      {col.cards.map((c) => (
                        <div
                          key={c.company}
                          className="rounded-lg border border-zinc-800 bg-zinc-900 p-3"
                        >
                          <div className="text-sm font-semibold text-white">
                            {c.company}
                          </div>
                          <div className="text-xs text-zinc-500">{c.role}</div>
                          <div className="mt-2 inline-block rounded bg-zinc-800 px-2 py-0.5 text-[11px] font-medium text-zinc-400">
                            {c.tag}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="mx-auto mt-16 grid max-w-3xl grid-cols-3 gap-6 border-t border-zinc-800 pt-10">
            {[
              ["Applications tracked", "10K+"],
              ["Response rate lift", "2.4X"],
              ["Resumes analysed", "25K+"],
            ].map(([label, value]) => (
              <div key={label}>
                <div className="font-display text-3xl font-bold text-lime-400 sm:text-4xl">
                  {value}
                </div>
                <div className="mt-1 text-sm text-zinc-500">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="border-t border-zinc-900 py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <p className="text-center text-sm font-bold uppercase tracking-[0.2em] text-lime-400">
            Arsenal
          </p>
          <h2 className="mx-auto mt-4 max-w-2xl text-center font-display text-3xl font-bold tracking-tight sm:text-4xl">
            Everything your hunt needs. Nothing it doesn't.
          </h2>
          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((f, i) => (
              <div
                key={f.title}
                className="group rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6 transition hover:border-lime-400/40 hover:bg-zinc-900"
              >
                <div className="font-display text-sm font-bold text-zinc-600 transition group-hover:text-lime-400">
                  {String(i + 1).padStart(2, "0")}
                </div>
                <h3 className="mt-3 font-display text-lg font-bold text-white">
                  {f.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-zinc-400">
                  {f.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Companies hiring */}
      <section className="overflow-hidden border-t border-zinc-900 py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <p className="text-center text-sm font-bold uppercase tracking-[0.2em] text-lime-400">
            Hired through JobTrack
          </p>
          <h2 className="mx-auto mt-4 max-w-2xl text-center font-display text-3xl font-bold tracking-tight sm:text-4xl">
            Top companies hire here.
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-center text-zinc-400">
            From FAANG giants to India's fastest-growing startups.
          </p>
        </div>
        <div className="mt-12">
          <CompanyMarquee />
        </div>
      </section>

      {/* CTA */}
      <section className="px-4 pb-20 sm:px-6 lg:px-8">
        <div className="relative mx-auto max-w-7xl overflow-hidden rounded-3xl border border-lime-400/30 bg-gradient-to-br from-zinc-900 to-zinc-950 px-6 py-16 text-center sm:px-12">
          <div
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                "radial-gradient(60% 80% at 50% 100%, rgba(163,230,53,0.15), transparent 70%)",
            }}
          />
          <h2 className="relative mx-auto max-w-2xl font-display text-3xl font-bold tracking-tight sm:text-5xl">
            STOP SPRAYING. <span className="text-lime-400">START TRACKING.</span>
          </h2>
          <p className="relative mx-auto mt-4 max-w-xl text-zinc-400">
            Join JobTrack free and run your job search like a system, not a
            lottery.
          </p>
          <Link
            to="/register"
            className="relative mt-8 inline-block rounded-xl bg-lime-400 px-10 py-4 text-base font-bold text-zinc-950  transition hover:bg-lime-300"
          >
            Create your free account
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-zinc-900 py-8">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 sm:flex-row sm:px-6 lg:px-8">
          <div className="flex items-center gap-2.5">
            <img
              src={mascot}
              alt="JobTrack"
              className="h-7 w-7 rounded-lg object-cover"
            />
            <span className="font-display font-bold text-white">JobTrack</span>
          </div>
          <p className="text-sm text-zinc-600">
            © 2026 JobTrack. Get your dream job.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
