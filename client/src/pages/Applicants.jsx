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
  APPLIED: "bg-slate-200 text-slate-600",
  SCREENING: "bg-amber-100 text-amber-700",
  SHORTLISTED: "bg-sky-100 text-sky-700",
  INTERVIEW: "bg-violet-100 text-violet-700",
  SELECTED: "bg-blue-50 text-blue-600",
  REJECTED: "bg-red-100 text-red-600",
  WITHDRAWN: "bg-slate-100 text-slate-400",
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
    <div className="rounded-2xl border border-slate-200 bg-white p-5">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="truncate font-display text-base font-bold text-slate-900">
            {candidate.email || "Candidate"}
          </p>
          <p className="mt-0.5 text-xs text-slate-400">
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
          className="mt-3 inline-block rounded-xl border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-600 transition hover:border-slate-300 hover:text-slate-900"
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
            className="h-10 rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm text-slate-700 outline-none transition focus:border-blue-600 disabled:opacity-50"
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
            className="h-10 flex-1 rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-500 focus:border-blue-600 disabled:opacity-50"
          />
        </div>
      ) : (
        <p className="mt-3 text-xs text-slate-500">
          {application.status === "WITHDRAWN"
            ? "The candidate withdrew this application."
            : "This application is closed."}
        </p>
      )}
      {moving && <p className="mt-2 text-xs text-slate-400">Updating…</p>}
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
    <div className="min-h-screen bg-slate-50 px-4 pb-16 pt-28 sm:px-6">
      <div className="mx-auto max-w-4xl">
        <Link to="/my-jobs" className="text-sm text-slate-500 transition hover:text-slate-900">
          ← My jobs
        </Link>
        <h1 className="mt-4 font-display text-3xl font-bold text-slate-900 sm:text-4xl">
          {job ? `Applicants — ${job.title}` : "Applicants"}
        </h1>
        <p className="mt-2 text-sm text-slate-500">
          {pagination ? `${pagination.total} applicant${pagination.total === 1 ? "" : "s"}` : "Review applications"}
        </p>

        {error && (
          <p className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-600">
            {error}
          </p>
        )}

        <div className="mt-6 flex flex-wrap gap-2">
          <button
            onClick={() => changeStatus("")}
            className={`rounded-xl px-4 py-2 text-xs font-semibold transition ${
              status === ""
                ? "bg-blue-600 text-white"
                : "border border-slate-200 bg-white text-slate-500 hover:border-slate-300 hover:text-slate-900"
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
                  ? "bg-blue-600 text-white"
                  : "border border-slate-200 bg-white text-slate-500 hover:border-slate-300 hover:text-slate-900"
              }`}
            >
              {formatStatus(s)}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="mt-6 space-y-4">
            {[0, 1, 2].map((i) => (
              <div key={i} className="h-40 animate-pulse rounded-2xl border border-slate-200 bg-white" />
            ))}
          </div>
        ) : applications.length === 0 ? (
          <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-12 text-center">
            <p className="text-lg font-semibold text-slate-900">No applicants yet</p>
            <p className="mt-1 text-sm text-slate-500">
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
              className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-600 transition enabled:hover:border-slate-300 disabled:opacity-40"
            >
              Prev
            </button>
            <span className="text-sm text-slate-400">
              Page {page} of {totalPages}
            </span>
            <button
              disabled={page === totalPages}
              onClick={() => setPage(page + 1)}
              className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-600 transition enabled:hover:border-slate-300 disabled:opacity-40"
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
