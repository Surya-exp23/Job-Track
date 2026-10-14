import { useEffect, useState } from "react";
import { savedJobsApi } from "../api/savedJobs";
import { useAuth } from "../context/AuthContext";


const SaveButton = ({ jobId, className = "" }) => {
  const { user, authFetch } = useAuth();
  const [saved, setSaved] = useState(false);
  const [busy, setBusy] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    if (!user || user.role !== "CANDIDATE") {
      setChecking(false);
      return;
    }

    savedJobsApi
      .listSavedJobs(authFetch, { limit: 100 })
      .then((body) => {
        const ids = (body.data.savedJobs || []).map((s) => s.jobId?._id || s.jobId);
        setSaved(ids.includes(jobId));
      })
      .catch(() => {})
      .finally(() => setChecking(false));
  }, [authFetch, user, jobId]);

  if (!user || user.role !== "CANDIDATE" || checking) return null;

  const toggle = async () => {
    setBusy(true);
    try {
      if (saved) {
        await savedJobsApi.unsaveJob(authFetch, jobId);
        setSaved(false);
      } else {
        await savedJobsApi.saveJob(authFetch, jobId);
        setSaved(true);
      }
    } catch (err) {
      
      if (err.status === 409) setSaved(true);
    } finally {
      setBusy(false);
    }
  };

  return (
    <button
      onClick={toggle}
      disabled={busy}
      className={`rounded-xl border px-4 py-3 text-sm font-semibold transition disabled:opacity-50 ${
        saved
          ? "border-blue-300 bg-blue-50 text-blue-600 hover:bg-blue-50"
          : "border-slate-300 text-slate-600 hover:border-slate-300 hover:text-slate-900"
      } ${className}`}
    >
      {busy ? "…" : saved ? "Saved" : "Save job"}
    </button>
  );
};

export default SaveButton;
