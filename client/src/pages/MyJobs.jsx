import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { jobsApi } from "../api/jobs";
import { useAuth } from "../context/AuthContext";

const PAGE_SIZE = 10;

const STATUS_STYLES = {
  Open: "bg-blue-50 text-blue-600",
  Paused: "bg-amber-100 text-amber-700",
  Closed: "bg-slate-100 text-slate-500",
  Expired: "bg-red-100 text-red-600",
};

const formatSalary = (salary) => {
  if (!salary || (salary.min == null && salary.max == null)) return null;
  const lakh = (n) => `₹${parseFloat((n / 100000).toFixed(2))}L`;
  if (salary.min != null && salary.max != null) return `${lakh(salary.min)} – ${lakh(salary.max)}`;
  if (salary.max != null) return `Up to ${lakh(salary.max)}`;
  return `${lakh(salary.min)}+`;
};

const MyJobs = () => {
  const { user, authFetch } = useAuth();
  const navigate = useNavigate();
  const [jobs, setJobs] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deletingId, setDeletingId] = useState(null);
  const [confirmId, setConfirmId] = useState(null);

  useEffect(() => {
    if (user && user.role !== "RECRUITER") navigate("/dashboard", { replace: true });
  }, [user, navigate]);

  const fetchJobs = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const body = await jobsApi.listMyJobs(authFetch, { page, limit: PAGE_SIZE });
      setJobs(body.data.jobs || []);
      setPagination(body.data.pagination || null);
    } catch (err) {
      setError(err.message || "Could not load jobs");
      setJobs([]);
      setPagination(null);
    } finally {
      setLoading(false);
    }
  }, [authFetch, page]);

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  const handleDelete = async (id) => {
    if (confirmId !== id) {
      setConfirmId(id);
      return;
    }
    setDeletingId(id);
    try {
      await jobsApi.deleteJob(authFetch, id);
      setJobs((list) => list.filter((j) => j._id !== id));
    } catch (err) {
      setError(err.message || "Could not delete job");
    } finally {
      setDeletingId(null);
      setConfirmId(null);
    }
  };

  const totalPages = pagination?.totalPages || 0;

  return (
    <div className="min-h-screen bg-slate-50 px-4 pb-16 pt-28 sm:px-6">
      <div className="mx-auto max-w-5xl">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="font-display text-3xl font-bold text-slate-900 sm:text-4xl">My jobs</h1>
            <p className="mt-2 text-sm text-slate-500">
              {pagination ? `${pagination.total} posting${pagination.total === 1 ? "" : "s"}` : "Roles you've posted"}
            </p>
          </div>
          <Link
            to="/jobs/new"
            className="beam-hover shrink-0 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-bold text-white shadow-[0_0_24px_rgba(37,99,235,0.25)]"
          >
            Post a job
          </Link>
        </div>

        {error && (
          <p className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-600">
            {error}
          </p>
        )}

        {loading ? (
          <div className="mt-6 space-y-4">
            {[0, 1, 2].map((i) => (
              <div key={i} className="h-28 animate-pulse rounded-2xl border border-slate-200 bg-white" />
            ))}
          </div>
        ) : jobs.length === 0 ? (
          <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-12 text-center">
            <p className="text-lg font-semibold text-slate-900">No jobs posted yet</p>
            <p className="mt-1 text-sm text-slate-500">Post your first role to start receiving applications.</p>
            <Link
              to="/jobs/new"
              className="mt-4 inline-block rounded-xl bg-blue-600 px-6 py-2 text-sm font-bold text-white"
            >
              Post a job
            </Link>
          </div>
        ) : (
          <div className="mt-6 space-y-4">
            {jobs.map((job) => {
              const company = job.companyId || {};
              const salary = formatSalary(job.salary);
              return (
                <div key={job._id} className="rounded-2xl border border-slate-200 bg-white p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <Link
                        to={`/jobs/${job._id}`}
                        className="font-display text-base font-bold text-slate-900 transition hover:text-blue-600"
                      >
                        {job.title}
                      </Link>
                      <p className="mt-0.5 truncate text-sm text-slate-500">
                        {company.name || ""}
                        {salary ? ` · ${salary}` : ""}
                      </p>
                    </div>
                    <span
                      className={`shrink-0 rounded-lg px-2.5 py-1 text-xs font-semibold ${STATUS_STYLES[job.status] || STATUS_STYLES.Closed}`}
                    >
                      {job.status}
                    </span>
                  </div>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <Link
                      to={`/jobs/${job._id}/applicants`}
                      className="rounded-xl bg-blue-50 px-4 py-2 text-xs font-bold text-blue-600 transition hover:bg-blue-600/25"
                    >
                      Applicants
                    </Link>
                    <Link
                      to={`/jobs/${job._id}/edit`}
                      className="rounded-xl border border-slate-300 px-4 py-2 text-xs font-semibold text-slate-600 transition hover:border-slate-300 hover:text-slate-900"
                    >
                      Edit
                    </Link>
                    <button
                      onClick={() => handleDelete(job._id)}
                      disabled={deletingId === job._id}
                      className={`rounded-xl border px-4 py-2 text-xs font-semibold transition disabled:opacity-50 ${
                        confirmId === job._id
                          ? "border-red-300 bg-red-50 text-red-600 hover:bg-red-100"
                          : "border-slate-200 text-slate-400 hover:border-red-300 hover:text-red-600"
                      }`}
                    >
                      {deletingId === job._id
                        ? "Deleting…"
                        : confirmId === job._id
                          ? "Confirm delete?"
                          : "Delete"}
                    </button>
                    {confirmId === job._id && deletingId !== job._id && (
                      <button
                        onClick={() => setConfirmId(null)}
                        className="rounded-xl px-3 py-2 text-xs text-slate-400 transition hover:text-slate-900"
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
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

export default MyJobs;
