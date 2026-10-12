import { useCallback, useEffect, useState } from "react";
import { profileApi } from "../api/profile";
import { useAuth } from "../context/AuthContext";
import LoadingButton from "../components/LoadingButton";

const emptyExperience = { company: "", title: "", startDate: "", endDate: "", description: "" };
const emptyEducation = { institution: "", degree: "", field: "", startDate: "", endDate: "" };
const emptyProject = { name: "", description: "", technologies: "", url: "" };

const inputClass =
  "w-full rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-2.5 text-sm text-white outline-none transition placeholder:text-zinc-600 focus:border-lime-400";

const labelClass = "mb-1 block text-xs font-semibold uppercase tracking-wider text-zinc-500";

const splitComma = (s) =>
  String(s || "")
    .split(",")
    .map((x) => x.trim())
    .filter(Boolean);

const toDateInput = (value) => (value ? String(value).slice(0, 10) : "");

const formatDate = (value) => {
  if (!value) return "Present";
  return new Date(value).toLocaleDateString("en-IN", { month: "short", year: "numeric" });
};

const profileToForm = (p) => ({
  firstName: p.firstName || "",
  lastName: p.lastName || "",
  phone: p.phone || "",
  location: p.location || "",
  headline: p.headline || "",
  bio: p.bio || "",
  designation: p.designation || "",
  skillsText: (p.skills || []).join(", "),
  links: {
    github: p.links?.github || "",
    linkedin: p.links?.linkedin || "",
    portfolio: p.links?.portfolio || "",
  },
  experience: (p.experience || []).map((e) => ({
    company: e.company || "",
    title: e.title || "",
    startDate: toDateInput(e.startDate),
    endDate: toDateInput(e.endDate),
    description: e.description || "",
  })),
  education: (p.education || []).map((e) => ({
    institution: e.institution || "",
    degree: e.degree || "",
    field: e.field || "",
    startDate: toDateInput(e.startDate),
    endDate: toDateInput(e.endDate),
  })),
  projects: (p.projects || []).map((pr) => ({
    name: pr.name || "",
    description: pr.description || "",
    technologies: (pr.technologies || []).join(", "),
    url: pr.url || "",
  })),
});

const Section = ({ title, children, action }) => (
  <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-6">
    <div className="mb-4 flex items-center justify-between">
      <h2 className="font-display text-base font-bold text-white">{title}</h2>
      {action}
    </div>
    {children}
  </div>
);

const Profile = () => {
  const { user, authFetch } = useAuth();
  const [profile, setProfile] = useState(null);
  const [form, setForm] = useState(null);
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const fetchProfile = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const body = await profileApi.getMyProfile(authFetch);
      setProfile(body.data.profile);
      setForm(profileToForm(body.data.profile));
    } catch (err) {
      setError(err.message || "Could not load profile");
    } finally {
      setLoading(false);
    }
  }, [authFetch]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const set = (field, value) => setForm((f) => ({ ...f, [field]: value }));
  const setLink = (field, value) =>
    setForm((f) => ({ ...f, links: { ...f.links, [field]: value } }));

  const setEntry = (list, index, field, value) =>
    setForm((f) => ({
      ...f,
      [list]: f[list].map((e, i) => (i === index ? { ...e, [field]: value } : e)),
    }));

  const addEntry = (list, empty) => setForm((f) => ({ ...f, [list]: [...f[list], { ...empty }] }));

  const removeEntry = (list, index) =>
    setForm((f) => ({ ...f, [list]: f[list].filter((_, i) => i !== index) }));

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      const payload = {
        firstName: form.firstName,
        lastName: form.lastName,
        phone: form.phone,
        location: form.location,
        headline: form.headline,
        bio: form.bio,
        designation: form.designation,
        skills: splitComma(form.skillsText),
        links: {
          github: form.links.github,
          linkedin: form.links.linkedin,
          portfolio: form.links.portfolio,
        },
        experience: form.experience,
        education: form.education,
        projects: form.projects.map((p) => ({
          name: p.name,
          description: p.description,
          url: p.url,
          technologies: splitComma(p.technologies),
        })),
      };
      const body = await profileApi.updateMyProfile(authFetch, payload);
      setProfile(body.data.profile);
      setForm(profileToForm(body.data.profile));
      setEditing(false);
    } catch (err) {
      setError(err.message || "Could not save profile");
    } finally {
      setSaving(false);
    }
  };

  const startEdit = () => {
    setForm(profileToForm(profile));
    setError("");
    setEditing(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 px-4 pb-16 pt-28 sm:px-6">
        <div className="mx-auto max-w-4xl animate-pulse space-y-4">
          <div className="h-10 w-1/3 rounded bg-zinc-800" />
          <div className="h-48 rounded-2xl border border-zinc-800 bg-zinc-900/60" />
          <div className="h-48 rounded-2xl border border-zinc-800 bg-zinc-900/60" />
        </div>
      </div>
    );
  }

  if (error && !profile) {
    return (
      <div className="min-h-screen bg-zinc-950 px-4 pb-16 pt-28 sm:px-6">
        <div className="mx-auto max-w-4xl rounded-2xl border border-red-900/50 bg-red-950/20 p-8 text-center">
          <p className="text-sm text-red-300">{error}</p>
          <button
            onClick={fetchProfile}
            className="mt-4 rounded-xl bg-white/10 px-6 py-2 text-sm font-medium text-white transition hover:bg-white/15"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const company = profile.companyId || {};

  return (
    <div className="min-h-screen bg-zinc-950 px-4 pb-16 pt-28 sm:px-6">
      <div className="mx-auto max-w-4xl">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="font-display text-3xl font-bold text-white sm:text-4xl">
              {profile.firstName} {profile.lastName}
            </h1>
            {profile.headline && <p className="mt-1 text-lime-300">{profile.headline}</p>}
            <p className="mt-1 text-sm text-zinc-500">
              {user?.email} · {user?.role === "CANDIDATE" ? "Candidate" : "Recruiter"}
              {profile.location ? ` · ${profile.location}` : ""}
            </p>
          </div>
          {!editing ? (
            <button
              onClick={startEdit}
              className="shrink-0 rounded-xl border border-zinc-700 px-5 py-2.5 text-sm font-semibold text-zinc-200 transition hover:border-zinc-500 hover:text-white"
            >
              Edit profile
            </button>
          ) : (
            <button
              onClick={() => setEditing(false)}
              className="shrink-0 rounded-xl px-5 py-2.5 text-sm text-zinc-400 transition hover:text-white"
            >
              Cancel
            </button>
          )}
        </div>

        {error && <p className="mt-4 rounded-xl border border-red-900/50 bg-red-950/20 p-3 text-sm text-red-300">{error}</p>}

        {editing ? (
          <form onSubmit={handleSave} className="mt-6 space-y-6">
            <Section title="Basics">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className={labelClass}>First name</label>
                  <input value={form.firstName} onChange={(e) => set("firstName", e.target.value)} className={inputClass} required />
                </div>
                <div>
                  <label className={labelClass}>Last name</label>
                  <input value={form.lastName} onChange={(e) => set("lastName", e.target.value)} className={inputClass} required />
                </div>
                <div>
                  <label className={labelClass}>Phone</label>
                  <input value={form.phone} onChange={(e) => set("phone", e.target.value)} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Location</label>
                  <input value={form.location} onChange={(e) => set("location", e.target.value)} className={inputClass} placeholder="City, Country" />
                </div>
                <div className="sm:col-span-2">
                  <label className={labelClass}>Headline</label>
                  <input value={form.headline} onChange={(e) => set("headline", e.target.value)} className={inputClass} placeholder="e.g. Frontend Developer | React" />
                </div>
                <div className="sm:col-span-2">
                  <label className={labelClass}>Designation</label>
                  <input value={form.designation} onChange={(e) => set("designation", e.target.value)} className={inputClass} />
                </div>
                <div className="sm:col-span-2">
                  <label className={labelClass}>Bio</label>
                  <textarea value={form.bio} onChange={(e) => set("bio", e.target.value)} rows={4} className={`${inputClass} resize-none`} />
                </div>
              </div>
            </Section>

            <Section title="Skills & links">
              <div>
                <label className={labelClass}>Skills (comma separated)</label>
                <input value={form.skillsText} onChange={(e) => set("skillsText", e.target.value)} className={inputClass} placeholder="React, Node.js, MongoDB" />
              </div>
              <div className="mt-4 grid gap-4 sm:grid-cols-3">
                <div>
                  <label className={labelClass}>GitHub</label>
                  <input value={form.links.github} onChange={(e) => setLink("github", e.target.value)} className={inputClass} placeholder="https://" />
                </div>
                <div>
                  <label className={labelClass}>LinkedIn</label>
                  <input value={form.links.linkedin} onChange={(e) => setLink("linkedin", e.target.value)} className={inputClass} placeholder="https://" />
                </div>
                <div>
                  <label className={labelClass}>Portfolio</label>
                  <input value={form.links.portfolio} onChange={(e) => setLink("portfolio", e.target.value)} className={inputClass} placeholder="https://" />
                </div>
              </div>
            </Section>

            <Section
              title="Experience"
              action={
                <button type="button" onClick={() => addEntry("experience", emptyExperience)} className="text-xs font-semibold text-lime-300 hover:text-lime-200">
                  + Add
                </button>
              }
            >
              {form.experience.length === 0 && <p className="text-sm text-zinc-500">No experience added yet.</p>}
              <div className="space-y-4">
                {form.experience.map((exp, i) => (
                  <div key={i} className="rounded-xl border border-zinc-800 bg-zinc-950 p-4">
                    <div className="grid gap-3 sm:grid-cols-2">
                      <input value={exp.title} onChange={(e) => setEntry("experience", i, "title", e.target.value)} placeholder="Job title" className={inputClass} />
                      <input value={exp.company} onChange={(e) => setEntry("experience", i, "company", e.target.value)} placeholder="Company" className={inputClass} />
                      <input value={exp.startDate} onChange={(e) => setEntry("experience", i, "startDate", e.target.value)} type="date" className={inputClass} />
                      <input value={exp.endDate} onChange={(e) => setEntry("experience", i, "endDate", e.target.value)} type="date" className={inputClass} />
                      <textarea value={exp.description} onChange={(e) => setEntry("experience", i, "description", e.target.value)} placeholder="What you did" rows={2} className={`${inputClass} resize-none sm:col-span-2`} />
                    </div>
                    <button type="button" onClick={() => removeEntry("experience", i)} className="mt-3 text-xs text-red-400 hover:text-red-300">
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            </Section>

            <Section
              title="Education"
              action={
                <button type="button" onClick={() => addEntry("education", emptyEducation)} className="text-xs font-semibold text-lime-300 hover:text-lime-200">
                  + Add
                </button>
              }
            >
              {form.education.length === 0 && <p className="text-sm text-zinc-500">No education added yet.</p>}
              <div className="space-y-4">
                {form.education.map((edu, i) => (
                  <div key={i} className="rounded-xl border border-zinc-800 bg-zinc-950 p-4">
                    <div className="grid gap-3 sm:grid-cols-2">
                      <input value={edu.institution} onChange={(e) => setEntry("education", i, "institution", e.target.value)} placeholder="Institution" className={inputClass} />
                      <input value={edu.degree} onChange={(e) => setEntry("education", i, "degree", e.target.value)} placeholder="Degree" className={inputClass} />
                      <input value={edu.field} onChange={(e) => setEntry("education", i, "field", e.target.value)} placeholder="Field of study" className={inputClass} />
                      <div className="grid grid-cols-2 gap-3">
                        <input value={edu.startDate} onChange={(e) => setEntry("education", i, "startDate", e.target.value)} type="date" className={inputClass} />
                        <input value={edu.endDate} onChange={(e) => setEntry("education", i, "endDate", e.target.value)} type="date" className={inputClass} />
                      </div>
                    </div>
                    <button type="button" onClick={() => removeEntry("education", i)} className="mt-3 text-xs text-red-400 hover:text-red-300">
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            </Section>

            <Section
              title="Projects"
              action={
                <button type="button" onClick={() => addEntry("projects", emptyProject)} className="text-xs font-semibold text-lime-300 hover:text-lime-200">
                  + Add
                </button>
              }
            >
              {form.projects.length === 0 && <p className="text-sm text-zinc-500">No projects added yet.</p>}
              <div className="space-y-4">
                {form.projects.map((pr, i) => (
                  <div key={i} className="rounded-xl border border-zinc-800 bg-zinc-950 p-4">
                    <div className="grid gap-3 sm:grid-cols-2">
                      <input value={pr.name} onChange={(e) => setEntry("projects", i, "name", e.target.value)} placeholder="Project name" className={inputClass} />
                      <input value={pr.url} onChange={(e) => setEntry("projects", i, "url", e.target.value)} placeholder="Project URL" className={inputClass} />
                      <textarea value={pr.description} onChange={(e) => setEntry("projects", i, "description", e.target.value)} placeholder="What it does" rows={2} className={`${inputClass} resize-none sm:col-span-2`} />
                      <input value={pr.technologies} onChange={(e) => setEntry("projects", i, "technologies", e.target.value)} placeholder="Technologies, comma separated" className={`${inputClass} sm:col-span-2`} />
                    </div>
                    <button type="button" onClick={() => removeEntry("projects", i)} className="mt-3 text-xs text-red-400 hover:text-red-300">
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            </Section>

            <LoadingButton loading={saving} loadingText="Saving" className="w-full sm:w-auto sm:px-10">
              Save profile
            </LoadingButton>
          </form>
        ) : (
          <div className="mt-6 space-y-6">
            {profile.bio && (
              <Section title="About">
                <p className="whitespace-pre-wrap text-sm leading-relaxed text-zinc-300">{profile.bio}</p>
                {profile.designation && <p className="mt-2 text-sm text-zinc-500">{profile.designation}</p>}
              </Section>
            )}

            {profile.skills?.length > 0 && (
              <Section title="Skills">
                <div className="flex flex-wrap gap-2">
                  {profile.skills.map((s) => (
                    <span key={s} className="rounded-lg bg-zinc-800 px-3 py-1.5 text-sm text-zinc-200">{s}</span>
                  ))}
                </div>
              </Section>
            )}

            {profile.experience?.length > 0 && (
              <Section title="Experience">
                <div className="space-y-4">
                  {profile.experience.map((exp, i) => (
                    <div key={i} className="border-l-2 border-zinc-800 pl-4">
                      <p className="text-sm font-bold text-white">{exp.title || "Role"}</p>
                      <p className="text-sm text-zinc-400">{exp.company}</p>
                      <p className="text-xs text-zinc-500">
                        {formatDate(exp.startDate)} – {formatDate(exp.endDate)}
                      </p>
                      {exp.description && <p className="mt-1 whitespace-pre-wrap text-sm text-zinc-300">{exp.description}</p>}
                    </div>
                  ))}
                </div>
              </Section>
            )}

            {profile.education?.length > 0 && (
              <Section title="Education">
                <div className="space-y-4">
                  {profile.education.map((edu, i) => (
                    <div key={i} className="border-l-2 border-zinc-800 pl-4">
                      <p className="text-sm font-bold text-white">{edu.institution}</p>
                      <p className="text-sm text-zinc-400">
                        {[edu.degree, edu.field].filter(Boolean).join(" · ")}
                      </p>
                      <p className="text-xs text-zinc-500">
                        {formatDate(edu.startDate)} – {formatDate(edu.endDate)}
                      </p>
                    </div>
                  ))}
                </div>
              </Section>
            )}

            {profile.projects?.length > 0 && (
              <Section title="Projects">
                <div className="space-y-4">
                  {profile.projects.map((pr, i) => (
                    <div key={i} className="rounded-xl border border-zinc-800 bg-zinc-950 p-4">
                      <div className="flex items-center justify-between gap-3">
                        <p className="text-sm font-bold text-white">{pr.name}</p>
                        {pr.url && (
                          <a href={pr.url} target="_blank" rel="noreferrer" className="shrink-0 text-xs text-lime-300 hover:underline">
                            View →
                          </a>
                        )}
                      </div>
                      {pr.description && <p className="mt-1 text-sm text-zinc-300">{pr.description}</p>}
                      {pr.technologies?.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-1.5">
                          {pr.technologies.map((t) => (
                            <span key={t} className="rounded-lg bg-zinc-800 px-2 py-1 text-xs text-zinc-300">{t}</span>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </Section>
            )}

            {(profile.links?.github || profile.links?.linkedin || profile.links?.portfolio) && (
              <Section title="Links">
                <div className="flex flex-wrap gap-3">
                  {profile.links.github && (
                    <a href={profile.links.github} target="_blank" rel="noreferrer" className="rounded-xl border border-zinc-800 px-4 py-2 text-sm text-zinc-300 transition hover:border-zinc-600 hover:text-white">
                      GitHub
                    </a>
                  )}
                  {profile.links.linkedin && (
                    <a href={profile.links.linkedin} target="_blank" rel="noreferrer" className="rounded-xl border border-zinc-800 px-4 py-2 text-sm text-zinc-300 transition hover:border-zinc-600 hover:text-white">
                      LinkedIn
                    </a>
                  )}
                  {profile.links.portfolio && (
                    <a href={profile.links.portfolio} target="_blank" rel="noreferrer" className="rounded-xl border border-zinc-800 px-4 py-2 text-sm text-zinc-300 transition hover:border-zinc-600 hover:text-white">
                      Portfolio
                    </a>
                  )}
                </div>
              </Section>
            )}

            {company.name && (
              <Section title="Company">
                <div className="flex items-center gap-3">
                  {company.logoUrl && <img src={company.logoUrl} alt="" className="h-10 w-10 rounded-xl object-cover" />}
                  <p className="text-sm font-medium text-white">{company.name}</p>
                </div>
              </Section>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;
