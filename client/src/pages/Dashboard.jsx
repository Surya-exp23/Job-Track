import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import { useAuth } from "../context/AuthContext";
import { applicationsApi } from "../api/applications";
import { savedJobsApi } from "../api/savedJobs";
import { resumesApi } from "../api/resumes";
import { jobsApi } from "../api/jobs";
import { companiesApi } from "../api/companies";
import { profileApi } from "../api/profile";

const STATUS_STYLES = {
  APPLIED: "bg-zinc-700/40 text-zinc-300",
  SCREENING: "bg-amber-400/15 text-amber-300",
  SHORTLISTED: "bg-sky-400/15 text-sky-300",
  INTERVIEW: "bg-violet-400/15 text-violet-300",
  SELECTED: "bg-lime-400/15 text-lime-300",
  REJECTED: "bg-red-400/15 text-red-300",
  WITHDRAWN: "bg-zinc-800 text-zinc-500",
  Open: "bg-lime-400/15 text-lime-300",
  Paused: "bg-amber-400/15 text-amber-300",
  Closed: "bg-zinc-800 text-zinc-400",
  Expired: "bg-red-400/15 text-red-300",
};

const formatStatus = (s) => s.charAt(0) + s.slice(1).toLowerCase();

const StatCard = ({ label, value, to }) => (
  <Link
    to={to}
    className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-5 transition hover:border-zinc-700"
  >
    <p className="font-display text-3xl font-bold text-white">{value}</p>
    <p className="mt-1 text-sm text-zinc-400">{label}</p>
  </Link>
);

const QuickAction = ({ to, title, description }) => (
  <Link
    to={to}
    className="group rounded-2xl border border-zinc-800 bg-zinc-900/60 p-5 transition hover:border-lime-400/40"
  >
    <h3 className="font-display text-base font-bold text-white group-hover:text-lime-300">
      {title}
    </h3>
    <p className="mt-1 text-sm text-zinc-500">{description}</p>
  </Link>
);

const CandidateDashboard = ({ data }) => (
  <>
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      <StatCard label="Applications" value={data.totalApplications} to="/applications" />
      <StatCard label="Interviews" value={data.interviews} to="/applications" />
      <StatCard label="Saved jobs" value={data.savedTotal} to="/saved-jobs" />
      <StatCard label="Resumes" value={data.resumeCount} to="/resumes" />
    </div>

    <div className="mt-8 grid gap-6 lg:grid-cols-2">
      <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-display text-base font-bold text-white">Recent applications</h2>
          <Link to="/applications" className="text-xs font-semibold text-lime-300 hover:underline">
            View all
          </Link>
        </div>
        {data.recentApplications.length === 0 ? (
          <p className="text-sm text-zinc-500">
            Nothing yet. <Link to="/jobs" className="text-lime-300 hover:underline">Browse jobs</Link> and apply.
          </p>
        ) : (
          <div className="space-y-3">
            {data.recentApplications.map((a) => (
              <div key={a._id} className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-white">
                    {a.jobId?.title || "Job"}
                  </p>
                  <p className="truncate text-xs text-zinc-500">{a.jobId?.companyId?.name || ""}</p>
                </div>
                <span
                  className={`shrink-0 rounded-lg px-2 py-1 text-xs font-semibold ${STATUS_STYLES[a.status]}`}
                >
                  {formatStatus(a.status)}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="grid content-start gap-4">
        <QuickAction
          to="/jobs"
          title="Browse jobs"
          description="Search open roles and apply in one click."
        />
        <QuickAction
          to="/resumes"
          title="Improve your resume"
          description="Upload a resume and get an AI score with fixes."
        />
        <QuickAction
          to="/profile"
          title="Complete your profile"
          description="Recruiters see this when you apply."
        />
      </div>
    </div>
  </>
);

const RecruiterDashboard = ({ data }) => (
  <>
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
      <StatCard label="Job postings" value={data.totalJobs} to="/my-jobs" />
      <StatCard label="Companies" value={data.companyCount} to="/companies" />
      <StatCard label="Applicants waiting" value={data.applicantsWaiting} to="/my-jobs" />
    </div>

    <div className="mt-8 grid gap-6 lg:grid-cols-2">
      <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-display text-base font-bold text-white">Recent postings</h2>
          <Link to="/my-jobs" className="text-xs font-semibold text-lime-300 hover:underline">
            View all
          </Link>
        </div>
        {data.recentJobs.length === 0 ? (
          <p className="text-sm text-zinc-500">
            Nothing posted yet. <Link to="/jobs/new" className="text-lime-300 hover:underline">Post your first job</Link>.
          </p>
        ) : (
          <div className="space-y-3">
            {data.recentJobs.map((j) => (
              <div key={j._id} className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <Link
                    to={`/jobs/${j._id}/applicants`}
                    className="truncate text-sm font-medium text-white transition hover:text-lime-300"
                  >
                    {j.title}
                  </Link>
                  <p className="truncate text-xs text-zinc-500">{j.companyId?.name || ""}</p>
                </div>
                <span
                  className={`shrink-0 rounded-lg px-2 py-1 text-xs font-semibold ${STATUS_STYLES[j.status] || STATUS_STYLES.Closed}`}
                >
                  {j.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="grid content-start gap-4">
        <QuickAction
          to="/jobs/new"
          title="Post a job"
          description="Publish a new role in under a minute."
        />
        <QuickAction
          to="/companies"
          title="Manage companies"
          description="Add or edit the companies you hire for."
        />
        <QuickAction
          to="/profile"
          title="Your profile"
          description="Keep your recruiter details up to date."
        />
      </div>
    </div>
  </>
);

const Dashboard = () => {
  const { user, authFetch } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const isRecruiter = user?.role === "RECRUITER";

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const profileBody = await profileApi.getMyProfile(authFetch).catch(() => null);
      const firstName = profileBody?.data?.profile?.firstName || "";

      if (user?.role === "RECRUITER") {
        const [jobsBody, companiesBody] = await Promise.all([
          jobsApi.listMyJobs(authFetch, { limit: 5 }),
          companiesApi.listCompanies({ limit: 100 }),
        ]);
        const jobs = jobsBody.data.jobs || [];
        const companies = (companiesBody.data.companies || []).filter(
          (c) => String(c.createdBy) === String(user?.id)
        );

        // Applicants still in an active (non-terminal) stage across recent jobs
        const counts = await Promise.all(
          jobs.map((j) =>
            applicationsApi
              .listJobApplications(authFetch, j._id, { limit: 100 })
              .then((b) => b.data.applications || [])
              .catch(() => [])
          )
        );
        const waiting = counts
          .flat()
          .filter((a) => !["SELECTED", "REJECTED", "WITHDRAWN"].includes(a.status)).length;

        setData({
          firstName,
          totalJobs: jobsBody.data.pagination?.total ?? jobs.length,
          companyCount: companies.length,
          applicantsWaiting: waiting,
          recentJobs: jobs,
        });
      } else {
        const [appsBody, interviewsBody, savedBody, resumesBody] = await Promise.all([
          applicationsApi.listMyApplications(authFetch, { limit: 5 }),
          applicationsApi.listMyApplications(authFetch, { status: "INTERVIEW", limit: 1 }),
          savedJobsApi.listSavedJobs(authFetch, { limit: 1 }),
          resumesApi.listResumes(authFetch),
        ]);

        setData({
          firstName,
          totalApplications: appsBody.data.pagination?.total ?? 0,
          interviews: interviewsBody.data.pagination?.total ?? 0,
          savedTotal: savedBody.data.pagination?.total ?? 0,
          resumeCount: (resumesBody.data.resumes || []).length,
          recentApplications: appsBody.data.applications || [],
        });
      }
    } finally {
      setLoading(false);
    }
  }, [authFetch, user]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return (
    <div className="min-h-screen bg-zinc-950 font-sans text-white">
      <Navbar />

      <main className="mx-auto max-w-7xl px-4 pb-16 pt-24 sm:px-6 lg:px-8">
        <p className="text-sm font-bold uppercase tracking-[0.2em] text-lime-400">
          {isRecruiter ? "Recruiter" : "Candidate"} command center
        </p>
        <h1 className="mt-3 font-display text-3xl font-bold tracking-tight sm:text-4xl">
          Welcome{data?.firstName ? `, ${data.firstName}` : ""}.
        </h1>
        <p className="mt-2 max-w-xl text-zinc-400">
          {isRecruiter
            ? "Your postings, companies and applicant pipeline at a glance."
            : "Your applications, saved jobs and resume scores at a glance."}
        </p>

        {loading ? (
          <div className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="h-24 animate-pulse rounded-2xl border border-zinc-800 bg-zinc-900/60" />
            ))}
          </div>
        ) : (
          <div className="mt-8">
            {isRecruiter ? <RecruiterDashboard data={data} /> : <CandidateDashboard data={data} />}
          </div>
        )}
      </main>
    </div>
  );
};

export default Dashboard;
