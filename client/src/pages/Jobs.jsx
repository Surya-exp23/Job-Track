import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { jobsApi } from "../api/jobs";
import { profileApi } from "../api/profile";
import { useAuth } from "../context/AuthContext";
import roboHero from "../assets/robo-hero-v1.webp";

// Must match the enums GET /api/jobs validates on the backend
const REMOTE_TYPES = ["Remote", "On-site", "Hybrid"];
const EMPLOYMENT_TYPES = ["Full-time", "Part-time", "Contract", "Internship"];
const EXPERIENCE_LEVELS = ["Entry-level", "Junior", "Mid-level", "Senior-level", "Lead"];

const PAGE_SIZE = 9;

const emptyFilters = {
  q: "",
  location: "",
  remoteType: "",
  employmentType: "",
  experienceLevel: "",
  skills: "",
  minSalary: "",
};

const formatSalary = (salary) => {
  if (!salary || (salary.min == null && salary.max == null)) return null;
  const lakh = (n) => `₹${parseFloat((n / 100000).toFixed(2))}L`;
  let range;
  if (salary.min != null && salary.max != null) range = `${lakh(salary.min)} – ${lakh(salary.max)}`;
  else if (salary.max != null) range = `Up to ${lakh(salary.max)}`;
  else range = `${lakh(salary.min)}+`;
  return salary.period ? `${range} ${salary.period.toLowerCase()}` : range;
};

const timeAgo = (value) => {
  const s = Math.floor((Date.now() - new Date(value).getTime()) / 1000);
  if (s < 3600) return `${Math.max(1, Math.floor(s / 60))}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  const d = Math.floor(s / 86400);
  return d === 1 ? "Yesterday" : `${d}d ago`;
};

const inputClass =
  "h-11 rounded-xl border border-zinc-800 bg-zinc-950 px-4 text-sm text-white outline-none transition focus:border-lime-400";

const selectClass =
  "h-11 rounded-xl border border-zinc-800 bg-zinc-900 px-3 text-sm text-zinc-200 outline-none transition focus:border-lime-400";

const JobCard = ({ job }) => {
  const company = job.companyId || {};
  const salary = formatSalary(job.salary);

  return (
    <Link
      to={`/jobs/${job._id}`}
      className="group flex flex-col rounded-2xl border border-zinc-800 bg-zinc-900/60 p-5 transition hover:border-lime-400/40 hover:bg-zinc-900/90"
    >
      <div className="flex items-start gap-3">
        {company.logoUrl ? (
          <img src={company.logoUrl} alt="" className="h-11 w-11 rounded-xl object-cover" />
        ) : (
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-lime-400/10 font-display text-lg font-bold text-lime-300">
            {(company.name || job.title || "?")[0].toUpperCase()}
          </div>
        )}
        <div className="min-w-0">
          <h3 className="truncate font-display text-base font-bold text-white group-hover:text-lime-300">
            {job.title}
          </h3>
          <p className="truncate text-sm text-zinc-400">{company.name || "Company"}</p>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap gap-x-3 gap-y-1 text-xs text-zinc-400">
        {job.location && <span>{job.location}</span>}
        {job.remoteType && <span>{job.remoteType}</span>}
        {job.employmentType && <span>{job.employmentType}</span>}
        {job.experienceLevel && <span>{job.experienceLevel}</span>}
      </div>

      {salary && <p className="mt-2 text-sm font-semibold text-lime-300">{salary}</p>}

      {job.skills?.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {job.skills.slice(0, 4).map((s) => (
            <span key={s} className="rounded-lg bg-zinc-800 px-2 py-1 text-xs text-zinc-300">
              {s}
            </span>
          ))}
          {job.skills.length > 4 && (
            <span className="px-1 py-1 text-xs text-zinc-500">+{job.skills.length - 4}</span>
          )}
        </div>
      )}

      <p className="mt-3 text-xs text-zinc-500">{timeAgo(job.postedAt || job.createdAt)}</p>
    </Link>
  );
};

const Jobs = () => {
  const { user, authFetch } = useAuth();
  const [query, setQuery] = useState(emptyFilters);
  const [applied, setApplied] = useState(emptyFilters);
  const [page, setPage] = useState(1);
  const [jobs, setJobs] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [firstName, setFirstName] = useState("");

  const isCandidate = user?.role === "CANDIDATE";

  // Greet the candidate by name in the hero
  useEffect(() => {
    if (!isCandidate) return;
    profileApi
      .getMyProfile(authFetch)
      .then((body) => setFirstName(body?.data?.profile?.firstName || ""))
      .catch(() => {});
  }, [isCandidate, authFetch]);

  const fetchJobs = useCallback(async (filters, pageNum) => {
    setLoading(true);
    setError("");
    try {
      const body = await jobsApi.listJobs({ ...filters, page: pageNum, limit: PAGE_SIZE });
      setJobs(body.data.jobs || []);
      setPagination(body.data.pagination || null);
    } catch (err) {
      setError(err.message || "Could not load jobs");
      setJobs([]);
      setPagination(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchJobs(applied, page);
  }, [fetchJobs, applied, page]);

  const updateQuery = (key, value) => setQuery((q) => ({ ...q, [key]: value }));

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    setApplied({ ...query });
  };

  // Dropdowns apply instantly; text inputs apply on Search
  const handleSelect = (key, value) => {
    const next = { ...query, [key]: value };
    setQuery(next);
    setPage(1);
    setApplied(next);
  };

  const clearFilters = () => {
    setQuery(emptyFilters);
    setPage(1);
    setApplied(emptyFilters);
  };

  const hasFilters = Object.values(applied).some(Boolean);
  const totalPages = pagination?.totalPages || 0;

  const pageNumbers = () => {
    const start = Math.max(1, Math.min(page - 2, totalPages - 4));
    const pages = [];
    for (let i = start; i <= Math.min(totalPages, start + 4); i++) pages.push(i);
    return pages;
  };

  return (
    <div className="min-h-screen bg-zinc-950 px-4 pb-16 pt-28 sm:px-6">
      <div className="mx-auto max-w-6xl">
        {isCandidate ? (
          <section className="grid items-center gap-10 py-6 lg:grid-cols-2 lg:py-10">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.2em] text-lime-400">
                Welcome back{firstName ? `, ${firstName}` : ""}
              </p>
              <h1 className="mt-3 font-display text-4xl font-bold tracking-tight text-white sm:text-5xl">
                Your dream role is
                <br />
                <span className="text-lime-300">one application</span> away.
              </h1>
              <p className="mt-4 max-w-md text-zinc-400">
                Search open roles below, track every application, and let AI sharpen your resume.
              </p>
              <p className="mt-4 text-sm text-zinc-500">
                {pagination
                  ? `${pagination.total} open role${pagination.total === 1 ? "" : "s"} right now`
                  : "Finding open roles…"}
              </p>
            </div>
            <div className="relative mx-auto w-full max-w-56 sm:max-w-64">
              <div className="absolute inset-6 rounded-full bg-lime-400/15 blur-3xl" />
              <img
                    src={roboHero}
                    alt="JobTrack robo taking off"
                    className="w-full"
                    loading="lazy"
                />
            </div>
          </section>
        ) : (
          <>
            <h1 className="font-display text-3xl font-bold text-white sm:text-4xl">Find your next role</h1>
            <p className="mt-2 text-sm text-zinc-400">
              {pagination ? `${pagination.total} open role${pagination.total === 1 ? "" : "s"}` : "Browse open roles"}
            </p>
          </>
        )}

        <form
          onSubmit={handleSearch}
          className="mt-6 rounded-2xl border border-zinc-800 bg-zinc-900/60 p-4 backdrop-blur"
        >
          <div className="flex flex-col gap-3 sm:flex-row">
            <input
              value={query.q}
              onChange={(e) => updateQuery("q", e.target.value)}
              placeholder="Job title or keyword"
              className={`${inputClass} flex-1`}
            />
            <input
              value={query.location}
              onChange={(e) => updateQuery("location", e.target.value)}
              placeholder="Location"
              className={`${inputClass} flex-1`}
            />
            <button
              type="submit"
              className="beam-hover h-10 rounded-xl bg-lime-400 px-8 text-sm font-bold text-zinc-950 cursor-pointer"
            >
              Search
            </button>
          </div>

          <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
            <select
              value={query.remoteType}
              onChange={(e) => handleSelect("remoteType", e.target.value)}
              className={selectClass}
            >
              <option value="">Remote type</option>
              {REMOTE_TYPES.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
            <select
              value={query.employmentType}
              onChange={(e) => handleSelect("employmentType", e.target.value)}
              className={selectClass}
            >
              <option value="">Employment</option>
              {EMPLOYMENT_TYPES.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
            <select
              value={query.experienceLevel}
              onChange={(e) => handleSelect("experienceLevel", e.target.value)}
              className={selectClass}
            >
              <option value="">Experience</option>
              {EXPERIENCE_LEVELS.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
            <input
              value={query.skills}
              onChange={(e) => updateQuery("skills", e.target.value)}
              placeholder="Skills, comma separated"
              className={inputClass}
            />
            <input
              value={query.minSalary}
              onChange={(e) => updateQuery("minSalary", e.target.value)}
              placeholder="Min salary ₹/yr"
              type="number"
              min="0"
              className={inputClass}
            />
          </div>

          {hasFilters && (
            <button
              type="button"
              onClick={clearFilters}
              className="mt-3 text-xs text-zinc-400 underline-offset-2 hover:text-white hover:underline"
            >
              Clear all filters
            </button>
          )}
        </form>

        {loading ? (
          <div className="mt-8 grid gap-4 md:grid-cols-2">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="h-44 animate-pulse rounded-2xl border border-zinc-800 bg-zinc-900/60" />
            ))}
          </div>
        ) : error ? (
          <div className="mt-8 rounded-2xl border border-red-900/50 bg-red-950/20 p-8 text-center">
            <p className="text-sm text-red-300">{error}</p>
            <button
              onClick={() => fetchJobs(applied, page)}
              className="mt-4 rounded-xl bg-white/10 px-6 py-2 text-sm font-medium text-white transition hover:bg-white/15"
            >
              Retry
            </button>
          </div>
        ) : jobs.length === 0 ? (
          <div className="mt-8 rounded-2xl border border-zinc-800 bg-zinc-900/60 p-12 text-center">
            <p className="text-lg font-semibold text-white">No roles match your filters</p>
            <p className="mt-1 text-sm text-zinc-400">Try widening the search or clearing filters.</p>
            {hasFilters && (
              <button
                onClick={clearFilters}
                className="mt-4 rounded-xl bg-lime-400 px-6 py-2 text-sm font-bold text-zinc-950"
              >
                Clear filters
              </button>
            )}
          </div>
        ) : (
          <div className="mt-8 grid gap-4 md:grid-cols-2">
            {jobs.map((job) => (
              <JobCard key={job._id} job={job} />
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
            {pageNumbers().map((n) => (
              <button
                key={n}
                onClick={() => setPage(n)}
                className={`h-10 w-10 rounded-xl text-sm font-medium transition ${
                  n === page
                    ? "bg-lime-400 font-bold text-zinc-950"
                    : "border border-zinc-800 bg-zinc-900 text-zinc-300 hover:border-zinc-600"
                }`}
              >
                {n}
              </button>
            ))}
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

export default Jobs;
