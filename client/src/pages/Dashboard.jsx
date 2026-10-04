import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import { useAuth } from "../context/AuthContext";

const upcoming = [
  {
    title: "Applications",
    description: "Your pipeline — applied, screening, interview, offer.",
    n: "01",
  },
  {
    title: "Saved jobs",
    description: "Roles you've bookmarked for later.",
    n: "02",
  },
  {
    title: "Resume analysis",
    description: "Instant match scores against real roles.",
    n: "03",
  },
];

const Dashboard = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-zinc-950 font-sans text-white">
      <Navbar />

      <main className="mx-auto max-w-7xl px-4 pb-16 pt-24 sm:px-6 lg:px-8">
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-8">
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-lime-400">
            {user?.role === "RECRUITER" ? "Recruiter" : "Candidate"} command
            center
          </p>
          <h1 className="mt-3 font-display text-3xl font-bold tracking-tight sm:text-4xl">
            Welcome{user?.email ? `, ${user.email.split("@")[0]}` : ""}.
          </h1>
          <p className="mt-2 max-w-xl text-zinc-400">
            Email verified, session live. This is where your pipeline will
            run — applications, saved jobs and resume scores.
          </p>
          <div className="mt-5 flex flex-wrap gap-2 text-xs">
            <span className="rounded-full border border-lime-400/30 bg-lime-400/10 px-3 py-1 font-semibold text-lime-300">
              ✓ Email verified
            </span>
            <span className="rounded-full border border-zinc-700 bg-zinc-800 px-3 py-1 font-semibold text-zinc-300">
              {user?.role}
            </span>
          </div>
        </div>

        <h2 className="mt-10 font-display text-xl font-bold">
          Deploying soon
        </h2>
        <div className="mt-4 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {upcoming.map((c) => (
            <div
              key={c.title}
              className="rounded-2xl border border-dashed border-zinc-700 bg-zinc-900/40 p-6"
            >
              <div className="font-display text-sm font-bold text-zinc-600">
                {c.n}
              </div>
              <h3 className="mt-2 font-display text-lg font-bold text-white">
                {c.title}
              </h3>
              <p className="mt-1 text-sm text-zinc-500">{c.description}</p>
              <span className="mt-4 inline-block rounded-full bg-zinc-800 px-3 py-1 text-xs font-medium text-zinc-500">
                Coming soon
              </span>
            </div>
          ))}
        </div>

        <p className="mt-10 text-center text-sm text-zinc-600">
          Back to the{" "}
          <Link
            to="/"
            className="font-semibold text-lime-400 hover:text-lime-300"
          >
            landing page
          </Link>
        </p>
      </main>
    </div>
  );
};

export default Dashboard;
