import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { applicationsApi } from "../api/applications";
import { jobsApi } from "../api/jobs";
import { useAuth } from "../context/AuthContext";

const ALL_STATUSES = [
  "APPLIED",
  "SCREENING",
  "SHORTLISTED",
  "INTERVIEW",
  "SELECTED",
  "REJECTED",
  "WITHDRAWN",
];

// What the backend lets a recruiter move an application to
const RECRUITER_STATUSES = ["SCREENING", "SHORTLISTED", "INTERVIEW", "SELECTED", "REJECTED"];

const TERMINAL = ["SELECTED", "REJECTED", "WITHDRAWN"];

const STATUS_STYLES = {
  APPLIED: "bg-zinc-700/40 text-zinc-300",
  SCREENING: "bg-amber-400/15 text-amber-300",
  SHORTLISTED: "bg-sky-400/15 text-sky-300",
  INTERVIEW: "bg-violet-400/15 text-violet-300",
  SELECTED: "bg-lime-400/15 text-lime-300",
  REJECTED: "bg-red-400/15 text-red-300",
  WITHDRAWN: "bg-zinc-800 text-zinc-500",
};

const PAGE_SIZE = 10;

const formatStatus = (s) => s.charAt(0) + s.slice(1).toLowerCase();

const formatDate = (value) =>
  new Date(value).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

const ApplicantCard = ({ application, onMoveStatus, moving }) => {
  const candidate = application.candidateId || {};
  const resume = application.resumeId || {};
  const [status, setStatus] = useState(application.status);
  const [note, setNote] = useState("");
  const locked = TERMINAL.includes(application.status);

  const handleChange = async (next) => {
    setStatus(next);
    await onMoveStatus(application._id, next, note);
    setNote("");
  };

  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-5">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="truncate font-display text-base font-bold text-white">
            {candidate.email || "Candidate"}
          </p>
          <p className="mt-0.5 text-xs text-zinc-500">
            Applied {formatDate(application.appliedAt || application.createdAt)}
          </p>
        </div>
        <span
          className={`shrink-0 rounded-lg px-2.5 py-1 text-xs font-semibold ${STATUS_STYLES[application.status]}`}
        >
          {formatStatus(application.status)}
        </span>
      </div>

      {resume.fileName && (
        <a
          href={resume.fileUrl}
          target="_blank"
          rel="noreferrer"
          className="mt-3 inline-block rounded-xl border border-zinc-700 px-3 py-2 text-xs font-semibold text-zinc-300 transition hover:border-zinc-500 hover:text-white"
        >
          View resume: {resume.fileName}
        </a>
      )}

      {!locked ? (
        <div className="mt-4 flex flex-col gap-2 sm:flex-row">
          <select
            value={status}
            onChange={(e) => handleChange(e.target.value)}
            disabled={moving}
            className="h-10 rounded-xl border border-zinc-800 bg-zinc-950 px-3 text-sm text-zinc-200 outline-none transition focus:border-lime-400 disabled:opacity-50"
          >
            {RECRUITER_STATUSES.map((s) => (
              <option key={s} value={s}>
                Move to {formatStatus(s)}
              </option>
            ))}
          </select>
          <input
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Note for the timeline (optional)"
            disabled={moving}
            className="h-10 flex-1 rounded-xl border border-zinc-800 bg-zinc-950 px-3 text-sm text-white outline-none transition placeholder:text-zinc-600 focus:border-lime-400 disabled:opacity-50"
          />
        </div>
      ) : (
        <p className="mt-3 text-xs text-zinc-600">
          {application.status === "WITHDRAWN"
            ? "The candidate withdrew this application."
            : "This application is closed."}
        </p>
      )}
      {moving && <p className="mt-2 text-xs text-zinc-500">Updating…</p>}
    </div>
  );
};

const Applicants = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, authFetch } = useAuth();
  const [job, setJob] = useState(null);
  const [applications, setApplications] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [movingId, setMovingId] = useState(null);

  useEffect(() => {
    if (user && user.role !== "RECRUITER") navigate("/dashboard", { replace: true });
  }, [user, navigate]);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [jobBody, appsBody] = await Promise.all([
        jobsApi.getMyJob(authFetch, id),
        applicationsApi.listJobApplications(authFetch, id, {
          status: status || undefined,
          page,
          limit: PAGE_SIZE,
        }),
      ]);
      setJob(jobBody.data.job);
      setApplications(appsBody.data.applications || []);
      setPagination(appsBody.data.pagination || null);
    } catch (err) {
      setError(err.message || "Could not load applicants");
      setApplications([]);
      setPagination(null);
    } finally {
      setLoading(false);
    }
  }, [authFetch, id, status, page]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleMoveStatus = async (appId, nextStatus, note) => {
    setMovingId(appId);
    try {
      await applicationsApi.updateApplicationStatus(authFetch, appId, {
        status: nextStatus,
        note,
      });
      setApplications((list) =>
        list.map((a) => (a._id === appId ? { ...a, status: nextStatus } : a))
      );
    } catch (err) {
      setError(err.message || "Could not update status");
    } finally {
      setMovingId(null);
    }
  };

  const changeStatus = (s) => {
    setStatus(s);
    setPage(1);
  };

  const totalPages = pagination?.totalPages || 0;

  return (
    <div className="min-h-screen bg-zinc-950 px-4 pb-16 pt-28 sm:px-6">
      <div className="mx-auto max-w-4xl">
        <Link to="/my-jobs" className="text-sm text-zinc-400 transition hover:text-white">
          ← My jobs
        </Link>
        <h1 className="mt-4 font-display text-3xl font-bold text-white sm:text-4xl">
          {job ? `Applicants — ${job.title}` : "Applicants"}
        </h1>
        <p className="mt-2 text-sm text-zinc-400">
          {pagination ? `${pagination.total} applicant${pagination.total === 1 ? "" : "s"}` : "Review applications"}
        </p>

        {error && (
          <p className="mt-4 rounded-xl border border-red-900/50 bg-red-950/20 p-3 text-sm text-red-300">
            {error}
          </p>
        )}

        <div className="mt-6 flex flex-wrap gap-2">
          <button
            onClick={() => changeStatus("")}
            className={`rounded-xl px-4 py-2 text-xs font-semibold transition ${
              status === ""
                ? "bg-lime-400 text-zinc-950"
                : "border border-zinc-800 bg-zinc-900 text-zinc-400 hover:border-zinc-600 hover:text-white"
            }`}
          >
            All
          </button>
          {ALL_STATUSES.map((s) => (
            <button
              key={s}
              onClick={() => changeStatus(s)}
              className={`rounded-xl px-4 py-2 text-xs font-semibold transition ${
                status === s
                  ? "bg-lime-400 text-zinc-950"
                  : "border border-zinc-800 bg-zinc-900 text-zinc-400 hover:border-zinc-600 hover:text-white"
              }`}
            >
              {formatStatus(s)}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="mt-6 space-y-4">
            {[0, 1, 2].map((i) => (
              <div key={i} className="h-40 animate-pulse rounded-2xl border border-zinc-800 bg-zinc-900/60" />
            ))}
          </div>
        ) : applications.length === 0 ? (
          <div className="mt-6 rounded-2xl border border-zinc-800 bg-zinc-900/60 p-12 text-center">
            <p className="text-lg font-semibold text-white">No applicants yet</p>
            <p className="mt-1 text-sm text-zinc-400">
              {status ? "Try a different status filter." : "Share the job link to get applications."}
            </p>
          </div>
        ) : (
          <div className="mt-6 space-y-4">
            {applications.map((a) => (
              <ApplicantCard
                key={a._id}
                application={a}
                onMoveStatus={handleMoveStatus}
                moving={movingId === a._id}
              />
            ))}
          </div>
        )}

        {totalPages > 1 && (
          <div className="mt-8 flex items-center justify-center gap-2">
            <button
              disabled={page === 1}
              onClick={() => setPage(page - 1)}
              className="rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-2 text-sm text-zinc-300 transition enabled:hover:border-zinc-600 disabled:opacity-40"
            >
              Prev
            </button>
            <span className="text-sm text-zinc-500">
              Page {page} of {totalPages}
            </span>
            <button
              disabled={page === totalPages}
              onClick={() => setPage(page + 1)}
              className="rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-2 text-sm text-zinc-300 transition enabled:hover:border-zinc-600 disabled:opacity-40"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Applicants;
