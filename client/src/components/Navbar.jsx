import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import mascot from "../assets/mascot.webp";

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  return (
    <header className="fixed inset-x-0 top-0 z-50 px-4 pt-4 sm:px-6">
      <nav
        className={`mx-auto flex h-14 max-w-5xl items-center justify-between rounded-2xl border px-4 transition-all duration-300 ${
          scrolled
            ? "border-white/10 bg-zinc-950/70 shadow-2xl shadow-black/50 backdrop-blur-xl"
            : "border-white/5 bg-zinc-900/40 shadow-lg shadow-black/20 backdrop-blur-md"
        }`}
      >
        <Link to="/" className="flex items-center gap-2.5">
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
          <Link
            to="/jobs"
            className="rounded-xl px-3 py-2 text-sm font-medium text-zinc-300 transition hover:bg-white/5 hover:text-white sm:px-4">
            Find jobs
          </Link>
          {user ? (
            <>
              {user.role === "CANDIDATE" && (
             <>
                <Link
                  to="/applications"
                  className="rounded-xl px-3 py-2 text-sm font-medium text-zinc-300 transition hover:bg-white/5 hover:text-white sm:px-4">
                  Applications
                </Link>
                <Link
                  to="/saved-jobs"
                  className="rounded-xl px-3 py-2 text-sm font-medium text-zinc-300 transition hover:bg-white/5 hover:text-white sm:px-4"
                >
                  Saved
                </Link>
            </>
        )}
        {user.role === "RECRUITER" && (
            <Link
              to="/companies"
              className="rounded-xl px-3 py-2 text-sm font-medium text-zinc-300 transition hover:bg-white/5 hover:text-white sm:px-4"
            >
              Companies
            </Link>
          )}


              <Link
                to="/dashboard"
                className="rounded-xl px-3 py-2 text-sm font-medium text-zinc-300 transition hover:bg-white/5 hover:text-white sm:px-4"
              >
                Dashboard
              </Link>
              <Link
                  to="/profile"
                  className="rounded-xl px-3 py-2 text-sm font-medium text-zinc-300 transition hover:bg-white/5 hover:text-white sm:px-4"
                >
                  Profile
                </Link>
                {user.role === "CANDIDATE" && (
                    <Link
                      to="/resumes"
                      className="rounded-xl px-3 py-2 text-sm font-medium text-zinc-300 transition hover:bg-white/5 hover:text-white sm:px-4"
                    >
                      Resumes
                    </Link>
                  )}
              <button
                onClick={handleLogout}
                className="rounded-xl bg-white/10 px-3 py-2 text-sm font-medium text-white transition hover:bg-white/15 sm:px-4"
              >
                Log out
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="rounded-xl px-3 py-2 text-sm font-medium text-zinc-300 transition hover:bg-white/5 hover:text-white sm:px-4"
              >
                Log in
              </Link>
              <Link
                to="/register"
                className=" beam-hover rounded-xl bg-lime-400 px-3 py-2 text-sm font-bold text-zinc-950 shadow-[0_0_14px_rgba(163,230,53,0.35)] transition hover:bg-lime-400 sm:px-4"
              >
                Get started
              </Link>
            </>
          )}
        </div>
      </nav>
    </header>
  );
};

export default Navbar;
