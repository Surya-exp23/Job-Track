import { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { jobsApi } from "../api/jobs";
import { profileApi } from "../api/profile";
import { useAuth } from "../context/AuthContext";
import roboHero from "../assets/robo-hero-v1.webp";
import roboSad from "../assets/robo-sad.webp";


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
  "h-11 rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm text-slate-900 outline-none transition focus:border-blue-600";



const JobCard = ({ job }) => {
  const company = job.companyId || {};
  const salary = formatSalary(job.salary);

  return (
    <Link
      to={`/jobs/${job._id}`}
      className="group flex flex-col rounded-2xl border border-slate-200 bg-white p-5 transition hover:border-blue-300 hover:bg-white/90"
    >
      <div className="flex items-start gap-3">
        {company.logoUrl ? (
          <img src={company.logoUrl} alt="" className="h-11 w-11 rounded-xl object-cover" />
        ) : (
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 font-display text-lg font-bold text-blue-600">
            {(company.name || job.title || "?")[0].toUpperCase()}
          </div>
        )}
        <div className="min-w-0">
          <h3 className="truncate font-display text-base font-bold text-slate-900 group-hover:text-blue-600">
            {job.title}
          </h3>
          <p className="truncate text-sm text-slate-500">{company.name || "Company"}</p>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap gap-x-3 gap-y-1 text-xs text-slate-500">
        {job.location && <span>{job.location}</span>}
        {job.remoteType && <span>{job.remoteType}</span>}
        {job.employmentType && <span>{job.employmentType}</span>}
        {job.experienceLevel && <span>{job.experienceLevel}</span>}
      </div>

      {salary && <p className="mt-2 text-sm font-semibold text-blue-600">{salary}</p>}

      {job.skills?.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {job.skills.slice(0, 4).map((s) => (
            <span key={s} className="rounded-lg bg-slate-100 px-2 py-1 text-xs text-slate-600">
              {s}
            </span>
          ))}
          {job.skills.length > 4 && (
            <span className="px-1 py-1 text-xs text-slate-400">+{job.skills.length - 4}</span>
          )}
        </div>
      )}

      <p className="mt-3 text-xs text-slate-400">{timeAgo(job.postedAt || job.createdAt)}</p>
    </Link>
  );
};


const FilterSelect = ({ value, onChange, placeholder, options }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const onClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    const onKey = (e) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  const pick = (v) => {
    onChange(v);
    setOpen(false);
  };

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="listbox"
        aria-expanded={open}
        className={`flex h-11 w-full cursor-pointer items-center justify-between gap-2 rounded-xl border bg-white px-3 text-sm outline-none transition hover:border-slate-300 ${
          open ? "border-blue-600" : "border-slate-200"
        } ${value ? "text-slate-800" : "text-slate-500"}`}
      >
        <span className="truncate">{value || placeholder}</span>
        <svg
          className={`h-4 w-4 shrink-0 text-slate-400 transition-transform ${open ? "rotate-180" : ""}`}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="M6 9l6 6 6-6" />
        </svg>
      </button>

      {open && (
        <div className="absolute left-0 right-0 top-full z-30 mt-2 overflow-hidden rounded-xl border border-slate-300 bg-white shadow-2xl shadow-slate-300">
          <button
            type="button"
            onClick={() => pick("")}
            className={`block w-full px-3 py-2.5 text-left text-sm transition hover:bg-slate-100 ${
              !value ? "font-semibold text-blue-600" : "text-slate-500"
            }`}
          >
            {placeholder}
          </button>
          {options.map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => pick(t)}
              className={`block w-full px-3 py-2.5 text-left text-sm transition hover:bg-slate-100 ${
                value === t ? "font-semibold text-blue-600" : "text-slate-700"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};


const EmptyState = ({ title, message, actionLabel, onAction }) => (
  <div className="mx-auto mt-8 flex max-w-2xl flex-col items-center justify-center gap-8 p-8 sm:flex-row sm:gap-12">
    <div className="text-center sm:text-left">
      <p className="font-display text-xl font-bold text-slate-900">{title}</p>
      <p className="mt-2 text-sm text-slate-500">{message}</p>
      {actionLabel && (
        <button
          onClick={onAction}
          className="mt-5 rounded-xl bg-blue-600 px-6 py-2 text-sm font-bold text-white transition hover:brightness-110"
        >
          {actionLabel}
        </button>
      )}
    </div>
    <img
      src={roboSad}
      alt="No jobs found"
      className="w-24 shrink-0 mix-blend-multiply sm:w-56"
      loading="lazy"
    />
  </div>
);

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
    <div className="min-h-screen bg-slate-50 px-4 pb-16 pt-28 sm:px-6">
      <div className="mx-auto max-w-6xl">
        {isCandidate ? (
          <section className="grid items-center gap-10 py-6 lg:grid-cols-2 lg:py-10">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.2em] text-blue-600">
                Welcome back{firstName ? `, ${firstName}` : ""}
              </p>
              <h1 className="mt-3 font-display text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
                Your dream role is
                <br />
                <span className="text-blue-600">one application</span> away.
              </h1>
              <p className="mt-4 max-w-md text-slate-500">
                Search open roles below, track every application, and let AI sharpen your resume.
              </p>
              <p className="mt-4 text-sm text-slate-400">
                {pagination
                  ? `${pagination.total} open role${pagination.total === 1 ? "" : "s"} right now`
                  : "Finding open roles…"}
              </p>
            </div>
            <div className="relative mx-auto w-full max-w-56 sm:max-w-64">
              <div className="absolute -inset-8 bg-[radial-gradient(closest-side,rgba(37,99,235,0.22),transparent)] blur-2xl" />
              <img
                src={roboHero}
                alt="JobTrack robo taking off"
                className="relative w-full mix-blend-multiply"
                loading="lazy"
              />
            </div>

          </section>
        ) : (
          <>
            <h1 className="font-display text-3xl font-bold text-slate-900 sm:text-4xl">Find your next role</h1>
            <p className="mt-2 text-sm text-slate-500">
              {pagination ? `${pagination.total} open role${pagination.total === 1 ? "" : "s"}` : "Browse open roles"}
            </p>
          </>
        )}

        <form
          onSubmit={handleSearch}
          className="mt-6 rounded-2xl border border-slate-200 bg-white p-4 backdrop-blur"
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
              className="beam-hover h-10 rounded-xl bg-blue-600 px-8 text-sm font-bold text-white cursor-pointer"
            >
              Search
            </button>
          </div>

          <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
            <FilterSelect
              value={query.remoteType}
              onChange={(v) => handleSelect("remoteType", v)}
              placeholder="Remote type"
              options={REMOTE_TYPES}
            />
            <FilterSelect
              value={query.employmentType}
              onChange={(v) => handleSelect("employmentType", v)}
              placeholder="Employment"
              options={EMPLOYMENT_TYPES}
            />
            <FilterSelect
              value={query.experienceLevel}
              onChange={(v) => handleSelect("experienceLevel", v)}
              placeholder="Experience"
              options={EXPERIENCE_LEVELS}
            />

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
              className="mt-3 text-xs text-slate-500 underline-offset-2 hover:text-slate-900 hover:underline"
            >
              Clear all filters
            </button>
          )}
        </form>

        {loading ? (
          <div className="mt-8 grid gap-4 md:grid-cols-2">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="h-44 animate-pulse rounded-2xl border border-slate-200 bg-white" />
            ))}
          </div>
        ) : error ? (
          <EmptyState
            title="We couldn't load jobs"
            message="Something went wrong on our end. Give it a moment and try again."
            actionLabel="Retry"
            onAction={() => fetchJobs(applied, page)}
          />
        ) : jobs.length === 0 ? (
          <EmptyState
            title={hasFilters ? "No roles match your search" : "No jobs posted right now"}
            message={
              hasFilters
                ? "Try different keywords or clear your filters to see everything."
                : "Keep an eye on this space — fresh roles land here every day."
            }
            actionLabel={hasFilters ? "Clear filters" : undefined}
            onAction={hasFilters ? clearFilters : undefined}
          />
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
              className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-600 transition enabled:hover:border-slate-300 disabled:opacity-40"
            >
              Prev
            </button>
            {pageNumbers().map((n) => (
              <button
                key={n}
                onClick={() => setPage(n)}
                className={`h-10 w-10 rounded-xl text-sm font-medium transition ${
                  n === page
                    ? "bg-blue-600 font-bold text-white"
                    : "border border-slate-200 bg-white text-slate-600 hover:border-slate-300"
                }`}
              >
                {n}
              </button>
            ))}
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

export default Jobs;
