import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { jobsApi } from "../api/jobs";
import { companiesApi } from "../api/companies";
import { useAuth } from "../context/AuthContext";
import LoadingButton from "../components/LoadingButton";

// Values must match what the backend validates on POST/PATCH /api/jobs
const REMOTE_TYPES = ["Remote", "On-site", "Hybrid"];
const EMPLOYMENT_TYPES = ["Full-time", "Part-time", "Contract", "Internship"];
const EXPERIENCE_LEVELS = ["Entry-level", "Junior", "Mid-level", "Senior-level", "Lead"];
const SALARY_PERIODS = ["Yearly", "Monthly", "Weekly", "Hourly"];
const JOB_STATUSES = ["Open", "Closed", "Paused", "Expired"];

const emptyForm = {
  title: "",
  companyId: "",
  description: "",
  location: "",
  remoteType: "",
  employmentType: "",
  experienceLevel: "",
  skillsText: "",
  salaryMin: "",
  salaryMax: "",
  salaryPeriod: "Yearly",
  status: "Open",
  expiresAt: "",
};

const inputClass =
  "w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-500 focus:border-blue-600";

const labelClass = "mb-1 block text-xs font-semibold uppercase tracking-wider text-slate-400";

const toDateInput = (value) => (value ? String(value).slice(0, 10) : "");

const JobForm = () => {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const { user, authFetch } = useAuth();
  const [form, setForm] = useState(emptyForm);
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (user && user.role !== "RECRUITER") navigate("/dashboard", { replace: true });
  }, [user, navigate]);

  const load = useCallback(async () => {
    try {
      const [companiesBody, jobBody] = await Promise.all([
        companiesApi.listCompanies({ limit: 100 }),
        isEdit ? jobsApi.getMyJob(authFetch, id) : Promise.resolve(null),
      ]);

      const mine = (companiesBody.data.companies || []).filter(
        (c) => String(c.createdBy) === String(user?._id)
      );
      setCompanies(mine);

      if (jobBody) {
        const job = jobBody.data.job;
        setForm({
          title: job.title || "",
          companyId: job.companyId?._id || job.companyId || "",
          description: job.description || "",
          location: job.location || "",
          remoteType: job.remoteType || "",
          employmentType: job.employmentType || "",
          experienceLevel: job.experienceLevel || "",
          skillsText: (job.skills || []).join(", "),
          salaryMin: job.salary?.min ?? "",
          salaryMax: job.salary?.max ?? "",
          salaryPeriod: job.salary?.period || "Yearly",
          status: job.status || "Open",
          expiresAt: toDateInput(job.expiresAt),
        });
      } else if (mine.length === 1) {
        setForm((f) => ({ ...f, companyId: mine[0]._id }));
      }
    } catch (err) {
      setError(err.message || "Could not load job");
    } finally {
      setLoading(false);
    }
  }, [authFetch, id, isEdit, user]);

  useEffect(() => {
    load();
  }, [load]);

  const set = (field, value) => setForm((f) => ({ ...f, [field]: value }));

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.title.trim() || !form.description.trim()) {
      setError("Title and description are required");
      return;
    }
    if (!form.companyId) {
      setError("Choose a company for this job");
      return;
    }
    if (!form.employmentType) {
      setError("Choose an employment type");
      return;
    }

    setSaving(true);
    setError("");

    try {
      const skills = form.skillsText
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
      const min = form.salaryMin === "" ? undefined : Number(form.salaryMin);
      const max = form.salaryMax === "" ? undefined : Number(form.salaryMax);

      const payload = {
        title: form.title.trim(),
        description: form.description.trim(),
        companyId: form.companyId,
        employmentType: form.employmentType,
        ...(form.location.trim() && { location: form.location.trim() }),
        ...(form.remoteType && { remoteType: form.remoteType }),
        ...(form.experienceLevel && { experienceLevel: form.experienceLevel }),
        ...(skills.length > 0 && { skills }),
        ...((min !== undefined || max !== undefined) && {
          salary: {
            ...(min !== undefined && { min }),
            ...(max !== undefined && { max }),
            period: form.salaryPeriod,
          },
        }),
        ...(form.status && { status: form.status }),
        ...(form.expiresAt && { expiresAt: form.expiresAt }),
      };

      const body = isEdit
        ? await jobsApi.updateJob(authFetch, id, payload)
        : await jobsApi.createJob(authFetch, payload);

      navigate(`/jobs/${body.data.job._id}`);
    } catch (err) {
      setError(err.message || "Could not save job");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 px-4 pb-16 pt-28 sm:px-6">
        <div className="mx-auto max-w-3xl animate-pulse space-y-4">
          <div className="h-10 w-1/3 rounded bg-slate-100" />
          <div className="h-96 rounded-2xl border border-slate-200 bg-white" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 px-4 pb-16 pt-28 sm:px-6">
      <div className="mx-auto max-w-3xl">
        <Link to="/my-jobs" className="text-sm text-slate-500 transition hover:text-slate-900">
          ← My jobs
        </Link>
        <h1 className="mt-4 font-display text-3xl font-bold text-slate-900 sm:text-4xl">
          {isEdit ? "Edit job" : "Post a job"}
        </h1>

        {companies.length === 0 && !isEdit && (
          <p className="mt-4 rounded-xl border border-amber-400/30 bg-amber-400/10 p-4 text-sm text-amber-700">
            You need a company before posting a job.{" "}
            <Link to="/companies" className="font-semibold underline underline-offset-2">
              Create one here
            </Link>
            .
          </p>
        )}

        <form onSubmit={handleSubmit} className="mt-6 space-y-6">
          <div className="rounded-2xl border border-slate-200 bg-white p-6">
            <h2 className="font-display text-base font-bold text-slate-900">Role</h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label className={labelClass}>Job title *</label>
                <input
                  value={form.title}
                  onChange={(e) => set("title", e.target.value)}
                  className={inputClass}
                  placeholder="e.g. Senior Frontend Developer"
                />
              </div>
              <div>
                <label className={labelClass}>Company *</label>
                <select
                  value={form.companyId}
                  onChange={(e) => set("companyId", e.target.value)}
                  className={`${inputClass} ${form.companyId ? "" : "text-slate-500"}`}
                >
                  <option value="">Select company</option>
                  {companies.map((c) => (
                    <option key={c._id} value={c._id}>{c.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className={labelClass}>Location</label>
                <input
                  value={form.location}
                  onChange={(e) => set("location", e.target.value)}
                  className={inputClass}
                  placeholder="City, Country"
                />
              </div>
              <div className="sm:col-span-2">
                <label className={labelClass}>Description *</label>
                <textarea
                  value={form.description}
                  onChange={(e) => set("description", e.target.value)}
                  rows={8}
                  className={`${inputClass} resize-none`}
                  placeholder="What the role is about, responsibilities, requirements…"
                />
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6">
            <h2 className="font-display text-base font-bold text-slate-900">Details</h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div>
                <label className={labelClass}>Employment type *</label>
                <select
                  value={form.employmentType}
                  onChange={(e) => set("employmentType", e.target.value)}
                  className={`${inputClass} ${form.employmentType ? "" : "text-slate-500"}`}
                >
                  <option value="">Select type</option>
                  {EMPLOYMENT_TYPES.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className={labelClass}>Workplace</label>
                <select
                  value={form.remoteType}
                  onChange={(e) => set("remoteType", e.target.value)}
                  className={`${inputClass} ${form.remoteType ? "" : "text-slate-500"}`}
                >
                  <option value="">Select workplace</option>
                  {REMOTE_TYPES.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className={labelClass}>Experience level</label>
                <select
                  value={form.experienceLevel}
                  onChange={(e) => set("experienceLevel", e.target.value)}
                  className={`${inputClass} ${form.experienceLevel ? "" : "text-slate-500"}`}
                >
                  <option value="">Select level</option>
                  {EXPERIENCE_LEVELS.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className={labelClass}>Status</label>
                <select
                  value={form.status}
                  onChange={(e) => set("status", e.target.value)}
                  className={inputClass}
                >
                  {JOB_STATUSES.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>
              <div className="sm:col-span-2">
                <label className={labelClass}>Skills (comma separated)</label>
                <input
                  value={form.skillsText}
                  onChange={(e) => set("skillsText", e.target.value)}
                  className={inputClass}
                  placeholder="React, Node.js, MongoDB"
                />
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6">
            <h2 className="font-display text-base font-bold text-slate-900">Compensation & expiry</h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-3">
              <div>
                <label className={labelClass}>Min salary (₹)</label>
                <input
                  value={form.salaryMin}
                  onChange={(e) => set("salaryMin", e.target.value)}
                  type="number"
                  min="0"
                  className={inputClass}
                  placeholder="800000"
                />
              </div>
              <div>
                <label className={labelClass}>Max salary (₹)</label>
                <input
                  value={form.salaryMax}
                  onChange={(e) => set("salaryMax", e.target.value)}
                  type="number"
                  min="0"
                  className={inputClass}
                  placeholder="1200000"
                />
              </div>
              <div>
                <label className={labelClass}>Period</label>
                <select
                  value={form.salaryPeriod}
                  onChange={(e) => set("salaryPeriod", e.target.value)}
                  className={inputClass}
                >
                  {SALARY_PERIODS.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className={labelClass}>Expires on</label>
                <input
                  value={form.expiresAt}
                  onChange={(e) => set("expiresAt", e.target.value)}
                  type="date"
                  className={inputClass}
                />
              </div>
            </div>
          </div>

          {error && <p className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-600">{error}</p>}

          <LoadingButton loading={saving} loadingText="Saving" className="w-full sm:w-auto sm:px-10">
            {isEdit ? "Save changes" : "Post job"}
          </LoadingButton>
        </form>
      </div>
    </div>
  );
};

export default JobForm;
