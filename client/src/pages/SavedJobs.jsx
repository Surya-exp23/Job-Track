import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { savedJobsApi } from "../api/savedJobs";
import { useAuth } from "../context/AuthContext";

const PAGE_SIZE = 10;

const SavedJobCard = ({ savedJob, onRemove, removing }) => {
  const job = savedJob.jobId || {};
  const company = job.companyId || {};

  return (
    <div className="flex items-start justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-5">
      <div className="flex min-w-0 items-start gap-3">
        {company.logoUrl ? (
          <img src={company.logoUrl} alt="" className="h-11 w-11 shrink-0 rounded-xl object-cover" />
        ) : (
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 font-display text-lg font-bold text-blue-600">
            {(company.name || job.title || "?")[0].toUpperCase()}
          </div>
        )}
        <div className="min-w-0">
          <Link
            to={job._id ? `/jobs/${job._id}` : "#"}
            className="font-display text-base font-bold text-slate-900 transition hover:text-blue-600"
          >
            {job.title || "Job"}
          </Link>
          <p className="mt-0.5 truncate text-sm text-slate-500">
            {company.name || "Company"}
            {job.location ? ` · ${job.location}` : ""}
            {job.remoteType ? ` · ${job.remoteType}` : ""}
            {job.employmentType ? ` · ${job.employmentType}` : ""}
          </p>
        </div>
      </div>
      <button
        onClick={() => onRemove(savedJob)}
        disabled={removing}
        className="shrink-0 rounded-xl border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-500 transition hover:border-red-300 hover:text-red-600 disabled:opacity-50"
      >
        {removing ? "Removing…" : "Remove"}
      </button>
    </div>
  );
};

const SavedJobs = () => {
  const { user, authFetch } = useAuth();
  const navigate = useNavigate();
  const [savedJobs, setSavedJobs] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [removingId, setRemovingId] = useState(null);

  useEffect(() => {
    if (user && user.role !== "CANDIDATE") navigate("/dashboard", { replace: true });
  }, [user, navigate]);

  const fetchSaved = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const body = await savedJobsApi.listSavedJobs(authFetch, { page, limit: PAGE_SIZE });
      setSavedJobs(body.data.savedJobs || []);
      setPagination(body.data.pagination || null);
    } catch (err) {
      setError(err.message || "Could not load saved jobs");
      setSavedJobs([]);
      setPagination(null);
    } finally {
      setLoading(false);
    }
  }, [authFetch, page]);

  useEffect(() => {
    fetchSaved();
  }, [fetchSaved]);

  const handleRemove = async (savedJob) => {
    const jobId = savedJob.jobId?._id || savedJob.jobId;
    setRemovingId(savedJob._id);
    try {
      await savedJobsApi.unsaveJob(authFetch, jobId);
      setSavedJobs((list) => list.filter((s) => s._id !== savedJob._id));
    } catch (err) {
      setError(err.message || "Could not remove saved job");
    } finally {
      setRemovingId(null);
    }
  };

  const totalPages = pagination?.totalPages || 0;

  return (
    <div className="min-h-screen bg-slate-50 px-4 pb-16 pt-28 sm:px-6">
      <div className="mx-auto max-w-4xl">
        <h1 className="font-display text-3xl font-bold text-slate-900 sm:text-4xl">Saved jobs</h1>
        <p className="mt-2 text-sm text-slate-500">
          {pagination ? `${pagination.total} saved` : "Jobs you bookmarked for later"}
        </p>

        {loading ? (
          <div className="mt-6 space-y-4">
            {[0, 1, 2].map((i) => (
              <div key={i} className="h-24 animate-pulse rounded-2xl border border-slate-200 bg-white" />
            ))}
          </div>
        ) : error ? (
          <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-8 text-center">
            <p className="text-sm text-red-600">{error}</p>
            <button
              onClick={fetchSaved}
              className="mt-4 rounded-xl bg-slate-100 px-6 py-2 text-sm font-medium text-slate-900 transition hover:bg-slate-200"
            >
              Retry
            </button>
          </div>
        ) : savedJobs.length === 0 ? (
          <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-12 text-center">
            <p className="text-lg font-semibold text-slate-900">No saved jobs yet</p>
            <p className="mt-1 text-sm text-slate-500">
              Bookmark roles while browsing and they'll wait for you here.
            </p>
            <Link
              to="/jobs"
              className="mt-4 inline-block rounded-xl bg-blue-600 px-6 py-2 text-sm font-bold text-white"
            >
              Browse jobs
            </Link>
          </div>
        ) : (
          <div className="mt-6 space-y-4">
            {savedJobs.map((s) => (
              <SavedJobCard
                key={s._id}
                savedJob={s}
                onRemove={handleRemove}
                removing={removingId === s._id}
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

export default SavedJobs;
