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
          ? "border-lime-400/50 bg-lime-400/10 text-lime-300 hover:bg-lime-400/15"
          : "border-zinc-700 text-zinc-300 hover:border-zinc-500 hover:text-white"
      } ${className}`}
    >
      {busy ? "…" : saved ? "Saved" : "Save job"}
    </button>
  );
};

export default SaveButton;
