import { useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import mascot from "../assets/mascot.webp";

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

  const isRecruiter = user?.role === "RECRUITER";
  const home = !user ? "/" : isRecruiter ? "/dashboard" : "/jobs";
  const menuLinks = isRecruiter ? recruiterLinks : candidateLinks;
  const initial = (user?.email?.[0] || "?").toUpperCase();

  return (
    <header className="fixed inset-x-0 top-0 z-50 px-4 pt-4 sm:px-6">
      <nav
        className={`mx-auto flex h-14 max-w-5xl items-center justify-between rounded-2xl border px-4 transition-all duration-300 ${
          scrolled
            ? "border-white/10 bg-zinc-950/70 shadow-2xl shadow-black/50 backdrop-blur-xl"
            : "border-white/5 bg-zinc-900/40 shadow-lg shadow-black/20 backdrop-blur-md"
        }`}
      >
        <Link to={home} className="flex items-center gap-2.5">
          <img
            src={mascot}
            alt="JobTrack"
            className="h-8 w-8 rounded-lg object-cover"
          />
          <span className="font-display text-lg font-bold tracking-tight text-white">
            JobTrack
          </span>
        </Link>

        <div className="flex items-center gap-2 sm:gap-3">
          {!user ? (
            <>
              <Link
                to="/login"
                className="beam-hover rounded-xl px-3 py-2 text-sm font-medium text-zinc-300 transition sm:px-4"
              >
                Log in
              </Link>
              <Link
                to="/register"
                className="beam-hover rounded-xl bg-lime-400 px-3 py-2 text-sm font-bold text-zinc-950 shadow-[0_0_24px_rgba(163,230,53,0.35)] transition sm:px-4"
              >
                Get started
              </Link>
            </>
          ) : (
            <>
              <Link
                to={home}
                className="rounded-xl px-3 py-2 text-sm font-medium text-zinc-300 transition hover:bg-white/5 hover:text-white sm:px-4"
              >
                Dashboard
              </Link>
              <div className="relative" ref={menuRef}>
                <button
                  onClick={() => setOpen((o) => !o)}
                  aria-label="Account menu"
                  aria-expanded={open}
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-lime-400 font-display text-sm font-bold text-zinc-950 transition hover:brightness-110"
                >
                  {initial}
                </button>
                {open && (
                  <div className="absolute right-0 top-12 w-52 overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900 shadow-2xl shadow-black/60">
                    <p className="truncate border-b border-zinc-800 px-4 py-3 text-xs text-zinc-500">
                      {user.email}
                    </p>
                    {menuLinks.map((l) => (
                      <Link
                        key={l.to}
                        to={l.to}
                        className="block px-4 py-2.5 text-sm text-zinc-300 transition hover:bg-white/5 hover:text-white"
                      >
                        {l.label}
                      </Link>
                    ))}
                    <button
                      onClick={handleLogout}
                      className="block w-full border-t border-zinc-800 px-4 py-2.5 text-left text-sm text-red-400 transition hover:bg-white/5"
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
