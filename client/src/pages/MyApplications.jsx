import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { applicationsApi } from "../api/applications";
import { useAuth } from "../context/AuthContext";

const STATUSES = [
  "APPLIED",
  "SCREENING",
  "SHORTLISTED",
  "INTERVIEW",
  "SELECTED",
  "REJECTED",
  "WITHDRAWN",
];

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

const ApplicationCard = ({ application, onWithdraw, withdrawing }) => {
  const job = application.jobId || {};
  const company = job.companyId || {};
  const resume = application.resumeId || {};
  const [confirming, setConfirming] = useState(false);
  const canWithdraw = !TERMINAL.includes(application.status);

  const handleWithdraw = async () => {
    if (!confirming) {
      setConfirming(true);
      return;
    }
    await onWithdraw(application._id);
    setConfirming(false);
  };

  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-5">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <Link
            to={job._id ? `/jobs/${job._id}` : "#"}
            className="font-display text-base font-bold text-white transition hover:text-lime-300"
          >
            {job.title || "Job"}
          </Link>
          <p className="mt-0.5 truncate text-sm text-zinc-400">
            {company.name || "Company"}
            {job.location ? ` · ${job.location}` : ""}
          </p>
        </div>
        <span
          className={`shrink-0 rounded-lg px-2.5 py-1 text-xs font-semibold ${STATUS_STYLES[application.status]}`}
        >
          {formatStatus(application.status)}
        </span>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-zinc-500">
        <span>Applied {formatDate(application.appliedAt || application.createdAt)}</span>
        {resume.fileName && <span>Resume: {resume.fileName}</span>}
      </div>

      {canWithdraw && (
        <div className="mt-4">
          <button
            onClick={handleWithdraw}
            disabled={withdrawing}
            className={`rounded-xl px-4 py-2 text-xs font-semibold transition ${
              confirming
                ? "bg-red-500/15 text-red-300 hover:bg-red-500/25"
                : "border border-zinc-700 text-zinc-400 hover:border-zinc-500 hover:text-white"
            } disabled:opacity-50`}
          >
            {withdrawing ? "Withdrawing…" : confirming ? "Confirm withdraw?" : "Withdraw"}
          </button>
          {confirming && !withdrawing && (
            <button
              onClick={() => setConfirming(false)}
              className="ml-2 rounded-xl px-4 py-2 text-xs text-zinc-500 transition hover:text-white"
            >
              Cancel
            </button>
          )}
        </div>
      )}
    </div>
  );
};

const MyApplications = () => {
  const { user, authFetch } = useAuth();
  const navigate = useNavigate();
  const [applications, setApplications] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [withdrawingId, setWithdrawingId] = useState(null);

  useEffect(() => {
    if (user && user.role !== "CANDIDATE") navigate("/dashboard", { replace: true });
  }, [user, navigate]);

  const fetchApplications = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const body = await applicationsApi.listMyApplications(authFetch, {
        status: status || undefined,
        page,
        limit: PAGE_SIZE,
      });
      setApplications(body.data.applications || []);
      setPagination(body.data.pagination || null);
    } catch (err) {
      setError(err.message || "Could not load applications");
      setApplications([]);
      setPagination(null);
    } finally {
      setLoading(false);
    }
  }, [authFetch, status, page]);

  useEffect(() => {
    fetchApplications();
  }, [fetchApplications]);

  const handleWithdraw = async (id) => {
    setWithdrawingId(id);
    try {
      await applicationsApi.withdrawApplication(authFetch, id);
      setApplications((apps) =>
        apps.map((a) => (a._id === id ? { ...a, status: "WITHDRAWN" } : a))
      );
    } catch (err) {
      setError(err.message || "Could not withdraw application");
    } finally {
      setWithdrawingId(null);
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
        <h1 className="font-display text-3xl font-bold text-white sm:text-4xl">My applications</h1>
        <p className="mt-2 text-sm text-zinc-400">
          {pagination ? `${pagination.total} application${pagination.total === 1 ? "" : "s"}` : "Track your job applications"}
        </p>

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
          {STATUSES.map((s) => (
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
              <div key={i} className="h-36 animate-pulse rounded-2xl border border-zinc-800 bg-zinc-900/60" />
            ))}
          </div>
        ) : error ? (
          <div className="mt-6 rounded-2xl border border-red-900/50 bg-red-950/20 p-8 text-center">
            <p className="text-sm text-red-300">{error}</p>
            <button
              onClick={fetchApplications}
              className="mt-4 rounded-xl bg-white/10 px-6 py-2 text-sm font-medium text-white transition hover:bg-white/15"
            >
              Retry
            </button>
          </div>
        ) : applications.length === 0 ? (
          <div className="mt-6 rounded-2xl border border-zinc-800 bg-zinc-900/60 p-12 text-center">
            <p className="text-lg font-semibold text-white">
              {status ? `No ${formatStatus(status).toLowerCase()} applications` : "No applications yet"}
            </p>
            <p className="mt-1 text-sm text-zinc-400">
              {status ? "Try a different status filter." : "Find a role you like and hit Apply."}
            </p>
            {!status && (
              <Link
                to="/jobs"
                className="mt-4 inline-block rounded-xl bg-lime-400 px-6 py-2 text-sm font-bold text-zinc-950"
              >
                Browse jobs
              </Link>
            )}
          </div>
        ) : (
          <div className="mt-6 space-y-4">
            {applications.map((a) => (
              <ApplicationCard
                key={a._id}
                application={a}
                onWithdraw={handleWithdraw}
                withdrawing={withdrawingId === a._id}
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

export default MyApplications;
