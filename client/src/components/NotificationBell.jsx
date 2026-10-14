import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { notificationsApi } from "../api/notifications";

const POLL_MS = 30000;

const iconSvg = {
  applicant: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M19 8v6M22 11h-6" />
    </svg>
  ),
  shortlisted: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 6 9 17l-5-5" />
    </svg>
  ),
  interview: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <path d="M16 2v4M8 2v4M3 10h18" />
    </svg>
  ),
  rejected: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
      <path d="M18 6 6 18M6 6l12 12" />
    </svg>
  ),
  viewed: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  ),
  info: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <circle cx="12" cy="12" r="10" />
      <path d="M12 16v-4M12 8h.01" />
    </svg>
  ),
};

const iconStyle = {
  applicant: "bg-blue-50 text-blue-600",
  shortlisted: "bg-blue-50 text-blue-600",
  interview: "bg-violet-50 text-violet-600",
  rejected: "bg-red-50 text-red-500",
  viewed: "bg-slate-100 text-slate-500",
  info: "bg-slate-100 text-slate-500",
};

const timeAgo = (iso) => {
  const s = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (s < 60) return "Just now";
  const m = Math.floor(s / 60);
  if (m < 60) return `${m} min ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h} hr${h > 1 ? "s" : ""} ago`;
  const d = Math.floor(h / 24);
  if (d < 7) return `${d} day${d > 1 ? "s" : ""} ago`;
  return new Date(iso).toLocaleDateString();
};

const NotificationBell = () => {
  const { authFetch } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState([]);
  const [unread, setUnread] = useState(0);
  const wrapRef = useRef(null);

  const fetchNotifs = useCallback(async () => {
    try {
      const body = await notificationsApi.listNotifications(authFetch, { limit: 20 });
      setItems(body.data.notifications || []);
      setUnread(body.data.unreadCount ?? 0);
    } catch {
      // Bell stays quiet on failure; next poll retries
    }
  }, [authFetch]);

  useEffect(() => {
    fetchNotifs();
    const id = setInterval(fetchNotifs, POLL_MS);
    const onFocus = () => fetchNotifs();
    window.addEventListener("focus", onFocus);
    return () => {
      clearInterval(id);
      window.removeEventListener("focus", onFocus);
    };
  }, [fetchNotifs]);

  useEffect(() => {
    if (!open) return;
    const onClick = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false);
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
  }, [open ]);

  const openItem = async (n) => {
    setOpen(false);
    if (!n.isRead) {
      setItems((list) => list.map((x) => (x._id === n._id ? { ...x, isRead: true } : x)));
      setUnread((u) => Math.max(0, u - 1));
      try {
        await notificationsApi.markAsRead(authFetch, n._id);
      } catch {
        // Count self-corrects on next poll
      }
    }
    if (n.link) navigate(n.link);
  };

  const markAll = async () => {
    setItems((list) => list.map((x) => ({ ...x, isRead: true })));
    setUnread(0);
    try {
      await notificationsApi.markAllAsRead(authFetch);
    } catch {
      // Count self-corrects on next poll
    }
  };

  return (
    <div className="relative" ref={wrapRef}>
      <button
        onClick={() => setOpen((o) => !o)}
        aria-label="Notifications"
        aria-expanded={open}
        className="relative flex h-9 w-9 items-center justify-center rounded-xl text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
      >
        <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
          <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
        </svg>
        {unread > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-blue-600 px-1 text-[10px] font-bold text-white">
            {unread > 99 ? "99+" : unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-12 z-50 w-[352px] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl shadow-slate-300">
          <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
            <p className="font-display text-sm font-bold text-slate-900">Notifications</p>
            {unread > 0 && (
              <button onClick={markAll} className="text-xs font-semibold text-blue-600 hover:underline">
                Mark all read
              </button>
            )}
          </div>
          <div className="max-h-96 overflow-y-auto">
            {items.length === 0 ? (
              <p className="px-4 py-10 text-center text-sm text-slate-400">You&apos;re all caught up.</p>
            ) : (
              items.map((n) => (
                <button
                  key={n._id}
                  onClick={() => openItem(n)}
                  className={`flex w-full items-start gap-3 px-4 py-3 text-left transition hover:bg-slate-50 ${
                    n.isRead ? "" : "bg-blue-50/50"
                  }`}
                >
                  <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${iconStyle[n.icon] || iconStyle.info}`}>
                    {iconSvg[n.icon] || iconSvg.info}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="flex items-center gap-2">
                      <span className="truncate text-sm font-semibold text-slate-900">{n.title}</span>
                      {!n.isRead && <span className="h-2 w-2 shrink-0 rounded-full bg-blue-600" />}
                    </span>
                    <span className="mt-0.5 block text-[13px] leading-snug text-slate-500">{n.message}</span>
                    <span className="mt-1 block text-xs text-slate-400">{timeAgo(n.createdAt)}</span>
                  </span>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
