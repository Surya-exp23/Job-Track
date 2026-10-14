import { useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import mascot from "../assets/mascot.webp";
import NotificationBell from "./NotificationBell";

const candidateLinks = [
  { to: "/profile", label: "My Profile" },
  { to: "/resumes", label: "My Resumes" },
  { to: "/applications", label: "My Applications" },
  { to: "/saved-jobs", label: "Saved Jobs" },
];

const recruiterLinks = [
  { to: "/profile", label: "My Profile" },
  { to: "/companies", label: "My Companies" },
  { to: "/my-jobs", label: "My Jobs" },
];

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close the menu on outside click, Escape, or route change
  useEffect(() => {
    const onClick = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setOpen(false);
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

  useEffect(() => {
    setOpen(false);
  }, [location.pathname]);

  const handleLogout = async () => {
    setOpen(false);
    await logout();
    navigate("/");
  };



const handleSamePageClick = (target) => (e) => {
  if (location.pathname === target) {
    e.preventDefault();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
};



  const isRecruiter = user?.role === "RECRUITER";
  const home = !user ? "/" : isRecruiter ? "/dashboard" : "/jobs";
  const dashboardLink = "/dashboard";
  const menuLinks = isRecruiter ? recruiterLinks : candidateLinks;
  const initial = (user?.email?.[0] || "?").toUpperCase();

  return (
    <header className="fixed inset-x-0 top-0 z-50 px-4 pt-4 sm:px-6">
      <nav
        className={`mx-auto flex h-14 max-w-5xl items-center justify-between rounded-2xl border px-4 transition-all duration-300 ${
          scrolled
            ? "border-slate-200 bg-slate-50/70 shadow-2xl shadow-slate-300 backdrop-blur-xl"
            : "border-slate-200 bg-white/80 shadow-lg shadow-slate-200 backdrop-blur-md"
        }`}
      >
        <Link to={home} onClick={handleSamePageClick(home)} className="flex items-center gap-2.5">
          <img
            src={mascot}
            alt="JobTrack"
            className="h-8 w-8 rounded-lg object-cover"
          />
          <span className="font-display text-lg font-bold tracking-tight text-slate-900">
            JobTrack
          </span>
        </Link>

        <div className="flex items-center gap-2 sm:gap-3">
          {!user ? (
            <>
              <Link
                to="/login"
                className="beam-hover rounded-xl px-3 py-2 text-sm font-medium text-slate-600 transition sm:px-4"
              >
                Log in
              </Link>
              <Link
                to="/register"
                className="beam-hover rounded-xl bg-blue-600 px-3 py-2 text-sm font-bold text-white  transition sm:px-4"
              >
                Get started
              </Link>
            </>
          ) : (
            <>
              <Link
                to={dashboardLink}
                onClick={handleSamePageClick(dashboardLink)}
                className="rounded-xl px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100 hover:text-slate-900 sm:px-4"
              >
                Dashboard
              </Link>
              <NotificationBell/>
              <div className="relative" ref={menuRef}>
                <button
                  onClick={() => setOpen((o) => !o)}
                  aria-label="Account menu"
                  aria-expanded={open}
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-600 font-display text-sm font-bold text-white transition hover:brightness-110"
                >
                  {initial}
                </button>
                {open && (
                  <div className="absolute right-0 top-12 w-52 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl shadow-slate-300">
                    <p className="truncate border-b border-slate-200 px-4 py-3 text-xs text-slate-400">
                      {user.email}
                    </p>
                    {menuLinks.map((l) => (
                      <Link
                        key={l.to}
                        to={l.to}
                        className="block px-4 py-2.5 text-sm text-slate-600 transition hover:bg-slate-100 hover:text-slate-900"
                      >
                        {l.label}
                      </Link>
                    ))}
                    <button
                      onClick={handleLogout}
                      className="block w-full border-t border-slate-200 px-4 py-2.5 text-left text-sm text-red-600 transition hover:bg-slate-100"
                    >
                      Log out
                    </button>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </nav>
    </header>
  );
};

export default Navbar;
