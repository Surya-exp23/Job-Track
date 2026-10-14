import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { jobsApi } from "../api/jobs";
import { applicationsApi } from "../api/applications";
import { resumesApi } from "../api/resumes";
import { useAuth } from "../context/AuthContext";
import LoadingButton from "../components/LoadingButton";
import SaveButton from "../components/SaveButton";



const formatSalary = (salary) => {
  if (!salary || (salary.min == null && salary.max == null)) return null;
  const lakh = (n) => `₹${parseFloat((n / 100000).toFixed(2))}L`;
  let range;
  if (salary.min != null && salary.max != null) range = `${lakh(salary.min)} – ${lakh(salary.max)}`;
  else if (salary.max != null) range = `Up to ${lakh(salary.max)}`;
  else range = `${lakh(salary.min)}+`;
  return salary.period ? `${range} ${salary.period.toLowerCase()}` : range;
};

const formatFileSize = (bytes) => {
  if (bytes == null) return "";
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const timeAgo = (value) => {
  const s = Math.floor((Date.now() - new Date(value).getTime()) / 1000);
  if (s < 3600) return `${Math.max(1, Math.floor(s / 60))}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  const d = Math.floor(s / 86400);
  return d === 1 ? "Yesterday" : `${d}d ago`;
};

const ApplyModal = ({ jobId, onClose, onSuccess }) => {
  const { authFetch } = useAuth();
  const [resumes, setResumes] = useState([]);
  const [selected, setSelected] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    resumesApi
      .listResumes(authFetch)
      .then((body) => {
        const list = body.data.resumes || [];
        setResumes(list);
        const def = list.find((r) => r.isDefault) || list[0];
        if (def) setSelected(def._id);
      })
      .catch((err) => setError(err.message || "Could not load resumes"))
      .finally(() => setLoading(false));
  }, [authFetch]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selected) {
      setError("Choose a resume to apply with");
      return;
    }
    setSubmitting(true);
    setError("");
    try {
      await applicationsApi.applyJob(authFetch, { jobId, resumeId: selected, notes });
      onSuccess();
    } catch (err) {
      setError(err.message || "Could not submit your application");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-blue-100 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <h2 className="font-display text-lg font-bold text-slate-900">Apply for this role</h2>
          <button
            onClick={onClose}
            className="rounded-lg px-2 py-1 text-xl leading-none text-slate-400 transition hover:bg-slate-100 hover:text-slate-900"
            aria-label="Close"
          >
            ×
          </button>
        </div>

        {loading ? (
          <div className="mt-6 space-y-3">
            {[0, 1].map((i) => (
              <div key={i} className="h-16 animate-pulse rounded-xl bg-slate-200" />
            ))}
          </div>
        ) : resumes.length === 0 ? (
          <p className="mt-6 rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-500">
            You need a resume to apply.{" "}
                <Link to="/resumes" className="text-blue-600 underline-offset-2 hover:underline">
                Upload one here
                </Link>{" "}
                first.
          </p>
        ) : (
          <form onSubmit={handleSubmit} className="mt-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Choose a resume
            </p>
            <div className="mt-2 max-h-56 space-y-2 overflow-y-auto">
              {resumes.map((r) => (
                <label
                  key={r._id}
                  className={`flex cursor-pointer items-center gap-3 rounded-xl border p-3 transition ${
                    selected === r._id
                      ? "border-blue-400 bg-blue-50"
                      : "border-slate-200 bg-slate-50 hover:border-slate-300"
                  }`}
                >
                  <input
                    type="radio"
                    name="resume"
                    checked={selected === r._id}
                    onChange={() => setSelected(r._id)}
                    className="h-4 w-4 accent-blue-600"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-slate-900">{r.fileName}</p>
                    <p className="text-xs text-slate-400">
                      {r.fileType} · {formatFileSize(r.fileSize)}
                    </p>
                  </div>
                  {r.isDefault && (
                    <span className="shrink-0 rounded-lg bg-blue-50 px-2 py-1 text-xs font-semibold text-blue-600">
                      Default
                    </span>
                  )}
                </label>
              ))}
            </div>

            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add a note for the recruiter (optional)"
              rows={3}
              className="mt-4 w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-500 focus:border-blue-600"
            />

            {error && <p className="mt-3 text-sm text-red-600">{error}</p>}

            <LoadingButton loading={submitting} loadingText="Submitting" className="mt-4">
              Submit application
            </LoadingButton>
          </form>
        )}
      </div>
    </div>
  );
};

const JobDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [applied, setApplied] = useState(false);

  const fetchJob = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const body = await jobsApi.getJob(id);
      setJob(body.data.job);
    } catch (err) {
      setError(err.status === 404 ? "This job doesn't exist or is no longer open." : err.message);
      setJob(null);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchJob();
  }, [fetchJob]);

  const handleApplyClick = () => {
    if (!user) {
      navigate("/login");
      return;
    }
    setModalOpen(true);
  };

  const canApply = !user || user.role === "CANDIDATE";
  const company = job?.companyId || {};
  const salary = job ? formatSalary(job.salary) : null;

  return (
    <div className="min-h-screen bg-slate-50 px-4 pb-16 pt-28 sm:px-6">
      <div className="mx-auto max-w-5xl">
        <Link to="/jobs" className="text-sm text-slate-500 transition hover:text-slate-900">
          ← All jobs
        </Link>

        {loading ? (
          <div className="mt-6 animate-pulse rounded-2xl border border-slate-200 bg-white p-8">
            <div className="h-8 w-2/3 rounded bg-slate-100" />
            <div className="mt-4 h-4 w-1/3 rounded bg-slate-100" />
            <div className="mt-8 space-y-3">
              {[0, 1, 2, 3].map((i) => (
                <div key={i} className="h-4 rounded bg-slate-200" />
              ))}
            </div>
          </div>
        ) : error || !job ? (
          <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-12 text-center">
            <p className="text-lg font-semibold text-slate-900">{error || "Job not found"}</p>
            <Link
              to="/jobs"
              className="mt-4 inline-block rounded-xl bg-blue-600 px-6 py-2 text-sm font-bold text-white"
            >
              Browse jobs
            </Link>
          </div>
        ) : (
          <>
            <div className="mt-6 flex items-start gap-4">
              {company.logoUrl ? (
                <img src={company.logoUrl} alt="" className="h-16 w-16 rounded-2xl object-cover" />
              ) : (
                <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-blue-50 font-display text-2xl font-bold text-blue-600">
                  {(company.name || job.title || "?")[0].toUpperCase()}
                </div>
              )}
              <div>
                <h1 className="font-display text-2xl font-bold text-slate-900 sm:text-3xl">{job.title}</h1>
                <p className="mt-1 text-slate-500">
                  {company.name}
                  {company.location ? ` · ${company.location}` : ""}
                  {company.industry ? ` · ${company.industry}` : ""}
                </p>
              </div>
            </div>

            <div className="mt-8 grid gap-6 lg:grid-cols-3">
              <div className="lg:col-span-2">
                <div className="rounded-2xl border border-slate-200 bg-white p-6">
                  <h2 className="font-display text-base font-bold text-slate-900">About the role</h2>
                  <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-slate-600">
                    {job.description}
                  </p>
                </div>

                {job.skills?.length > 0 && (
                  <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-6">
                    <h2 className="font-display text-base font-bold text-slate-900">Skills</h2>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {job.skills.map((s) => (
                        <span key={s} className="rounded-lg bg-slate-100 px-3 py-1.5 text-sm text-slate-700">
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div>
                <div className="rounded-2xl border border-slate-200 bg-white p-6 lg:sticky lg:top-28">
                  {salary && (
                    <p className="font-display text-xl font-bold text-blue-600">{salary}</p>
                  )}
                  <dl className="mt-4 space-y-3 text-sm">
                    {job.location && (
                      <div className="flex justify-between gap-4">
                        <dt className="text-slate-400">Location</dt>
                        <dd className="text-right text-slate-700">{job.location}</dd>
                      </div>
                    )}
                    {job.remoteType && (
                      <div className="flex justify-between gap-4">
                        <dt className="text-slate-400">Workplace</dt>
                        <dd className="text-right text-slate-700">{job.remoteType}</dd>
                      </div>
                    )}
                    {job.employmentType && (
                      <div className="flex justify-between gap-4">
                        <dt className="text-slate-400">Employment</dt>
                        <dd className="text-right text-slate-700">{job.employmentType}</dd>
                      </div>
                    )}
                    {job.experienceLevel && (
                      <div className="flex justify-between gap-4">
                        <dt className="text-slate-400">Experience</dt>
                        <dd className="text-right text-slate-700">{job.experienceLevel}</dd>
                      </div>
                    )}
                    <div className="flex justify-between gap-4">
                      <dt className="text-slate-400">Posted</dt>
                      <dd className="text-right text-slate-700">{timeAgo(job.postedAt || job.createdAt)}</dd>
                    </div>
                  </dl>

                  {canApply &&
                    (applied ? (
                      <div className="mt-6 rounded-xl border border-blue-200 bg-blue-50 p-4 text-center">
                        <p className="text-sm font-bold text-blue-600">Application submitted</p>
                        <p className="mt-1 text-xs text-slate-500">
                            <Link to="/applications" className="text-blue-600 underline-offset-2 hover:underline">
                            Track it in My Applications
                            </Link>
                        </p>
                      </div>
                    ) : (
                      <button
                        onClick={handleApplyClick}
                        className="beam-hover mt-6 w-full rounded-xl bg-blue-600 px-4 py-3 text-sm font-bold text-white shadow-[0_0_24px_rgba(37,99,235,0.25)]"
                      >
                        {user ? "Apply now" : "Log in to apply"}
                      </button>
                    ))}
                    <SaveButton jobId={id} className="mt-3 w-full" />
                </div>
              </div>
            </div>
          </>
        )}

        {modalOpen && (
          <ApplyModal
            jobId={id}
            onClose={() => setModalOpen(false)}
            onSuccess={() => {
              setModalOpen(false);
              setApplied(true);
            }}
          />
        )}
      </div>
    </div>
  );
};

export default JobDetail;
