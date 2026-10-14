import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { companiesApi } from "../api/companies";
import { useAuth } from "../context/AuthContext";
import LoadingButton from "../components/LoadingButton";

const COMPANY_SIZES = [
  "1-10",
  "11-50",
  "51-200",
  "201-500",
  "501-1000",
  "1001-5000",
  "5001-10000",
  "10001+",
];

const emptyForm = {
  name: "",
  description: "",
  website: "",
  logoUrl: "",
  industry: "",
  size: "",
  location: "",
};

const inputClass =
  "w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-500 focus:border-blue-600";

const labelClass = "mb-1 block text-xs font-semibold uppercase tracking-wider text-slate-400";

const CompanyModal = ({ company, onClose, onSaved }) => {
  const { authFetch } = useAuth();
  const [form, setForm] = useState(() =>
    company ? { ...emptyForm, ...Object.fromEntries(Object.entries(company).filter(([k]) => k in emptyForm)) } : emptyForm
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const set = (field, value) => setForm((f) => ({ ...f, [field]: value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) {
      setError("Company name is required");
      return;
    }
    setSaving(true);
    setError("");
    try {
      const payload = Object.fromEntries(
        Object.entries(form).map(([k, v]) => [k, typeof v === "string" ? v.trim() : v])
      );
      const body = company
        ? await companiesApi.updateCompany(authFetch, company._id, payload)
        : await companiesApi.createCompany(authFetch, payload);
      onSaved(body.data.company, !!company);
    } catch (err) {
      setError(err.message || "Could not save company");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-blue-100 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-slate-200 bg-white p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <h2 className="font-display text-lg font-bold text-slate-900">
            {company ? "Edit company" : "New company"}
          </h2>
          <button
            onClick={onClose}
            className="rounded-lg px-2 py-1 text-xl leading-none text-slate-400 transition hover:bg-slate-100 hover:text-slate-900"
            aria-label="Close"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div>
            <label className={labelClass}>Company name *</label>
            <input
              value={form.name}
              onChange={(e) => set("name", e.target.value)}
              className={inputClass}
              placeholder="Acme Inc."
            />
          </div>
          <div>
            <label className={labelClass}>Description</label>
            <textarea
              value={form.description}
              onChange={(e) => set("description", e.target.value)}
              rows={3}
              className={`${inputClass} resize-none`}
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className={labelClass}>Website</label>
              <input
                value={form.website}
                onChange={(e) => set("website", e.target.value)}
                className={inputClass}
                placeholder="https://"
              />
            </div>
            <div>
              <label className={labelClass}>Logo URL</label>
              <input
                value={form.logoUrl}
                onChange={(e) => set("logoUrl", e.target.value)}
                className={inputClass}
                placeholder="https://"
              />
            </div>
            <div>
              <label className={labelClass}>Industry</label>
              <input
                value={form.industry}
                onChange={(e) => set("industry", e.target.value)}
                className={inputClass}
                placeholder="e.g. Fintech"
              />
            </div>
            <div>
              <label className={labelClass}>Company size</label>
              <select
                value={form.size}
                onChange={(e) => set("size", e.target.value)}
                className={`${inputClass} ${form.size ? "" : "text-slate-500"}`}
              >
                <option value="">Select size</option>
                {COMPANY_SIZES.map((s) => (
                  <option key={s} value={s}>{s} employees</option>
                ))}
              </select>
            </div>
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

          {error && <p className="text-sm text-red-600">{error}</p>}

          <LoadingButton loading={saving} loadingText="Saving">
            {company ? "Save changes" : "Create company"}
          </LoadingButton>
        </form>
      </div>
    </div>
  );
};

const Companies = () => {
  const { user, authFetch } = useAuth();
  const navigate = useNavigate();
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [confirmId, setConfirmId] = useState(null);

  useEffect(() => {
    if (user && user.role !== "RECRUITER") navigate("/dashboard", { replace: true });
  }, [user, navigate]);

  const fetchCompanies = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const body = await companiesApi.listCompanies({ limit: 100 });
      const mine = (body.data.companies || []).filter(
        (c) => String(c.createdBy) === String(user?.id)
      );
      setCompanies(mine);
    } catch (err) {
      setError(err.message || "Could not load companies");
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchCompanies();
  }, [fetchCompanies]);

  const handleSaved = (company, isEdit) => {
    setCompanies((list) =>
      isEdit ? list.map((c) => (c._id === company._id ? company : c)) : [company, ...list]
    );
    setModalOpen(false);
    setEditing(null);
  };

  const handleDelete = async (id) => {
    if (confirmId !== id) {
      setConfirmId(id);
      return;
    }
    setDeletingId(id);
    try {
      await companiesApi.deleteCompany(authFetch, id);
      setCompanies((list) => list.filter((c) => c._id !== id));
    } catch (err) {
      setError(err.message || "Could not delete company");
    } finally {
      setDeletingId(null);
      setConfirmId(null);
    }
  };

  const openCreate = () => {
    setEditing(null);
    setModalOpen(true);
  };

  const openEdit = (company) => {
    setEditing(company);
    setModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-slate-50 px-4 pb-16 pt-28 sm:px-6">
      <div className="mx-auto max-w-5xl">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="font-display text-3xl font-bold text-slate-900 sm:text-4xl">My companies</h1>
            <p className="mt-2 text-sm text-slate-500">
              Companies you post jobs under.
            </p>
          </div>
          <button
            onClick={openCreate}
            className="beam-hover shrink-0 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-bold text-white shadow-[0_0_24px_rgba(37,99,235,0.25)]"
          >
            New company
          </button>
        </div>

        {error && (
          <p className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-600">
            {error}
          </p>
        )}

        {loading ? (
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            {[0, 1].map((i) => (
              <div key={i} className="h-40 animate-pulse rounded-2xl border border-slate-200 bg-white" />
            ))}
          </div>
        ) : companies.length === 0 ? (
          <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-12 text-center">
            <p className="text-lg font-semibold text-slate-900">No companies yet</p>
            <p className="mt-1 text-sm text-slate-500">
              Create your first company, then post jobs under it.
            </p>
          </div>
        ) : (
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            {companies.map((c) => (
              <div key={c._id} className="rounded-2xl border border-slate-200 bg-white p-5">
                <div className="flex items-start gap-3">
                  {c.logoUrl ? (
                    <img src={c.logoUrl} alt="" className="h-12 w-12 rounded-xl object-cover" />
                  ) : (
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-50 font-display text-xl font-bold text-blue-600">
                      {(c.name || "?")[0].toUpperCase()}
                    </div>
                  )}
                  <div className="min-w-0">
                    <h3 className="truncate font-display text-base font-bold text-slate-900">{c.name}</h3>
                    <p className="truncate text-sm text-slate-500">
                      {[c.industry, c.location].filter(Boolean).join(" · ") || "—"}
                    </p>
                    {c.size && <p className="mt-0.5 text-xs text-slate-400">{c.size} employees</p>}
                  </div>
                </div>
                {c.description && (
                  <p className="mt-3 line-clamp-2 text-sm text-slate-500">{c.description}</p>
                )}
                <div className="mt-4 flex gap-2">
                  <button
                    onClick={() => openEdit(c)}
                    className="rounded-xl border border-slate-300 px-4 py-2 text-xs font-semibold text-slate-600 transition hover:border-slate-300 hover:text-slate-900"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(c._id)}
                    disabled={deletingId === c._id}
                    className={`rounded-xl border px-4 py-2 text-xs font-semibold transition disabled:opacity-50 ${
                      confirmId === c._id
                        ? "border-red-300 bg-red-50 text-red-600 hover:bg-red-100"
                        : "border-slate-200 text-slate-400 hover:border-red-300 hover:text-red-600"
                    }`}
                  >
                    {deletingId === c._id
                      ? "Deleting…"
                      : confirmId === c._id
                        ? "Confirm delete?"
                        : "Delete"}
                  </button>
                  {confirmId === c._id && deletingId !== c._id && (
                    <button
                      onClick={() => setConfirmId(null)}
                      className="rounded-xl px-3 py-2 text-xs text-slate-400 transition hover:text-slate-900"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {modalOpen && (
          <CompanyModal
            company={editing}
            onClose={() => {
              setModalOpen(false);
              setEditing(null);
            }}
            onSaved={handleSaved}
          />
        )}
      </div>
    </div>
  );
};

export default Companies;
