import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { resumesApi } from "../api/resumes";
import { resumeAnalysisApi } from "../api/resumeAnalysis";
import { useAuth } from "../context/AuthContext";
import LoadingButton from "../components/LoadingButton";

const formatFileSize = (bytes) => {
  if (bytes == null) return "";
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const formatDate = (value) =>
  new Date(value).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

const SCORE_LABELS = {
  skillsMatch: "Skills match",
  experienceMatch: "Experience match",
  keywordMatch: "Keyword match",
  formatting: "Formatting",
};

const ScoreBar = ({ label, value }) => (
  <div>
    <div className="flex items-center justify-between text-xs">
      <span className="text-slate-500">{label}</span>
      <span className="font-semibold text-slate-700">{value ?? "–"}</span>
    </div>
    <div className="mt-1 h-2 overflow-hidden rounded-full bg-slate-100">
      <div
        className="h-full rounded-full bg-blue-600 transition-all"
        style={{ width: `${value || 0}%` }}
      />
    </div>
  </div>
);

const AnalysisResult = ({ analysis, onClose, onDelete, deleting }) => (
  <div className="mt-6 rounded-2xl border border-blue-200 bg-white/90 p-6">
    <div className="flex items-start justify-between gap-4">
      <h2 className="font-display text-lg font-bold text-slate-900">AI analysis</h2>
      <div className="flex gap-2">
        <button
          onClick={onDelete}
          disabled={deleting}
          className="rounded-lg px-3 py-1.5 text-xs text-slate-400 transition hover:text-red-600 disabled:opacity-50"
        >
          {deleting ? "Deleting…" : "Delete"}
        </button>
        <button
          onClick={onClose}
          className="rounded-lg px-2 py-1 text-xl leading-none text-slate-400 transition hover:bg-slate-100 hover:text-slate-900"
          aria-label="Close"
        >
          ×
        </button>
      </div>
    </div>

    <div className="mt-4 flex items-center gap-5">
      <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-blue-50">
        <span className="font-display text-2xl font-bold text-blue-600">
          {analysis.overallScore}
        </span>
      </div>
      <div className="flex-1 space-y-2.5">
        {Object.entries(SCORE_LABELS).map(([key, label]) => (
          <ScoreBar key={key} label={label} value={analysis.scores?.[key]} />
        ))}
      </div>
    </div>

    {analysis.strengths?.length > 0 && (
      <div className="mt-5">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">Strengths</h3>
        <ul className="mt-2 space-y-1.5">
          {analysis.strengths.map((s, i) => (
            <li key={i} className="text-sm text-slate-600">· {s}</li>
          ))}
        </ul>
      </div>
    )}

    {analysis.weaknesses?.length > 0 && (
      <div className="mt-5">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">Weaknesses</h3>
        <ul className="mt-2 space-y-1.5">
          {analysis.weaknesses.map((s, i) => (
            <li key={i} className="text-sm text-slate-600">· {s}</li>
          ))}
        </ul>
      </div>
    )}

    {analysis.suggestions?.length > 0 && (
      <div className="mt-5">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">Suggestions</h3>
        <ul className="mt-2 space-y-1.5">
          {analysis.suggestions.map((s, i) => (
            <li key={i} className="text-sm text-blue-600/90">· {s}</li>
          ))}
        </ul>
      </div>
    )}
  </div>
);

const Resumes = () => {
  const { user, authFetch } = useAuth();
  const navigate = useNavigate();
  const fileRef = useRef(null);
  const [resumes, setResumes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [analyzingId, setAnalyzingId] = useState(null);
  const [jobIdInput, setJobIdInput] = useState("");
  const [analysis, setAnalysis] = useState(null);
  const [analyses, setAnalyses] = useState([]);
  const [deletingAnalysis, setDeletingAnalysis] = useState(false);

  useEffect(() => {
    if (user && user.role !== "CANDIDATE") navigate("/dashboard", { replace: true });
  }, [user, navigate]);

  const fetchResumes = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [resumesBody, analysesBody] = await Promise.all([
        resumesApi.listResumes(authFetch),
        resumeAnalysisApi.listAnalyses(authFetch),
      ]);
      setResumes(resumesBody.data.resumes || []);
      setAnalyses(analysesBody.data.analyses || []);
    } catch (err) {
      setError(err.message || "Could not load resumes");
    } finally {
      setLoading(false);
    }
  }, [authFetch]);

  useEffect(() => {
    fetchResumes();
  }, [fetchResumes]);

  const handleUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setUploadError("");
    try {
      const body = await resumesApi.uploadResume(authFetch, file);
      setResumes((list) => [body.data.resume, ...list]);
    } catch (err) {
      setUploadError(err.message || "Upload failed");
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const handleSetDefault = async (id) => {
    try {
      await resumesApi.setDefaultResume(authFetch, id);
      setResumes((list) => list.map((r) => ({ ...r, isDefault: r._id === id })));
    } catch (err) {
      setError(err.message || "Could not set default resume");
    }
  };

  const handleDelete = async (id) => {
    try {
      await resumesApi.deleteResume(authFetch, id);
      setResumes((list) => list.filter((r) => r._id !== id));
    } catch (err) {
      setError(err.message || "Could not delete resume");
    }
  };

  const handleAnalyze = async (resumeId) => {
    setAnalyzingId(resumeId);
    setError("");
    try {
      const body = await resumeAnalysisApi.createAnalysis(authFetch, {
        resumeId,
        jobId: jobIdInput,
      });
      setAnalysis(body.data.analysis);
      setAnalyses((list) => [body.data.analysis, ...list]);
    } catch (err) {
      setError(err.message || "Analysis failed");
    } finally {
      setAnalyzingId(null);
    }
  };

  const handleViewAnalysis = async (id) => {
    try {
      const body = await resumeAnalysisApi.getAnalysis(authFetch, id);
      setAnalysis(body.data.analysis);
    } catch (err) {
      setError(err.message || "Could not load analysis");
    }
  };

  const handleDeleteAnalysis = async (id) => {
    setDeletingAnalysis(true);
    try {
      await resumeAnalysisApi.deleteAnalysis(authFetch, id);
      setAnalyses((list) => list.filter((a) => a._id !== id));
      if (analysis?._id === id) setAnalysis(null);
    } catch (err) {
      setError(err.message || "Could not delete analysis");
    } finally {
      setDeletingAnalysis(false);
    }
  };

  const resumeName = (resumeId) =>
    resumes.find((r) => r._id === String(resumeId))?.fileName || "Resume";

  return (
    <div className="min-h-screen bg-slate-50 px-4 pb-16 pt-28 sm:px-6">
      <div className="mx-auto max-w-4xl">
        <h1 className="font-display text-3xl font-bold text-slate-900 sm:text-4xl">Resumes</h1>
        <p className="mt-2 text-sm text-slate-500">
          Upload resumes, pick a default for quick applies, and get AI feedback.
        </p>

        {error && (
          <p className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-600">
            {error}
          </p>
        )}

        <div className="mt-6 rounded-2xl border border-dashed border-slate-300 bg-white/80 p-6 text-center">
          <input
            ref={fileRef}
            type="file"
            accept=".pdf,.doc,.docx"
            onChange={handleUpload}
            className="hidden"
            id="resume-upload"
          />
          <p className="text-sm text-slate-600">PDF, DOC or DOCX · max 5MB</p>
          <div className="mx-auto mt-4 max-w-xs">
            <LoadingButton
              loading={uploading}
              loadingText="Uploading"
              onClick={() => fileRef.current?.click()}
              className="beam-hover"
            >
              Upload resume
            </LoadingButton>
          </div>
          {uploadError && <p className="mt-3 text-sm text-red-600">{uploadError}</p>}
        </div>

        {loading ? (
          <div className="mt-6 space-y-4">
            {[0, 1].map((i) => (
              <div key={i} className="h-28 animate-pulse rounded-2xl border border-slate-200 bg-white" />
            ))}
          </div>
        ) : resumes.length === 0 ? (
          <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-12 text-center">
            <p className="text-lg font-semibold text-slate-900">No resumes yet</p>
            <p className="mt-1 text-sm text-slate-500">Upload your first resume to start applying.</p>
          </div>
        ) : (
          <div className="mt-6 space-y-4">
            {resumes.map((r) => (
              <div key={r._id} className="rounded-2xl border border-slate-200 bg-white p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="truncate font-display text-base font-bold text-slate-900">
                        {r.fileName}
                      </p>
                      {r.isDefault && (
                        <span className="shrink-0 rounded-lg bg-blue-50 px-2 py-0.5 text-xs font-semibold text-blue-600">
                          Default
                        </span>
                      )}
                    </div>
                    <p className="mt-1 text-xs text-slate-400">
                      {r.fileType} · {formatFileSize(r.fileSize)} · uploaded {formatDate(r.createdAt)}
                    </p>
                  </div>
                  <a
                    href={r.fileUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="shrink-0 rounded-xl border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-600 transition hover:border-slate-300 hover:text-slate-900"
                  >
                    Open
                  </a>
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  {!r.isDefault && (
                    <button
                      onClick={() => handleSetDefault(r._id)}
                      className="rounded-xl border border-slate-300 px-4 py-2 text-xs font-semibold text-slate-600 transition hover:border-slate-300 hover:text-slate-900"
                    >
                      Set as default
                    </button>
                  )}
                  <button
                    onClick={() => handleAnalyze(r._id)}
                    disabled={analyzingId !== null}
                    className="rounded-xl bg-blue-50 px-4 py-2 text-xs font-bold text-blue-600 transition hover:bg-blue-600/25 disabled:opacity-50"
                  >
                    {analyzingId === r._id ? "Analyzing…" : "Analyze with AI"}
                  </button>
                  <button
                    onClick={() => handleDelete(r._id)}
                    className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-400 transition hover:border-red-300 hover:text-red-600"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {analysis && (
          <AnalysisResult
            analysis={analysis}
            onClose={() => setAnalysis(null)}
            onDelete={() => handleDeleteAnalysis(analysis._id)}
            deleting={deletingAnalysis}
          />
        )}

        {analyses.length > 0 && (
          <div className="mt-8">
            <h2 className="font-display text-lg font-bold text-slate-900">Previous analyses</h2>
            <div className="mt-3 space-y-2">
              {analyses.map((a) => (
                <button
                  key={a._id}
                  onClick={() => handleViewAnalysis(a._id)}
                  className="flex w-full items-center justify-between gap-4 rounded-xl border border-slate-200 bg-white px-4 py-3 text-left transition hover:border-slate-300"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-slate-900">
                      {resumeName(a.resumeId)}
                      {a.jobId ? " · job-specific" : ""}
                    </p>
                    <p className="text-xs text-slate-400">{formatDate(a.createdAt)}</p>
                  </div>
                  <span className="shrink-0 rounded-lg bg-blue-50 px-2.5 py-1 font-display text-sm font-bold text-blue-600">
                    {a.overallScore}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="mt-8 rounded-2xl border border-slate-200 bg-white/80 p-5">
          <h2 className="text-sm font-bold text-slate-900">Score against a specific job (optional)</h2>
          <p className="mt-1 text-xs text-slate-400">
            Paste a job ID before hitting "Analyze with AI" to get a match score for that role.
          </p>
          <input
            value={jobIdInput}
            onChange={(e) => setJobIdInput(e.target.value)}
            placeholder="Job ID — leave empty for a general review"
            className="mt-3 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-500 focus:border-blue-600"
          />
        </div>
      </div>
    </div>
  );
};

export default Resumes;
