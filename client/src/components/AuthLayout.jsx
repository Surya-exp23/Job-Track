import { Link } from "react-router-dom";
import mascot from "../assets/mascot.webp";

const AuthLayout = ({ title, subtitle, children, footer }) => {
  return (
    <div className="flex min-h-screen flex-col bg-zinc-950 font-sans">
      <div className="bg-grid pointer-events-none absolute inset-0 opacity-60" />
      <header className="relative mx-auto flex h-16 w-full max-w-7xl items-center px-4 sm:px-6 lg:px-8">
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
      </header>

      <main className="relative flex flex-1 items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/80 p-8 shadow-2xl shadow-black/50 backdrop-blur">
            <h1 className="font-display text-2xl font-bold tracking-tight text-white">
              {title}
            </h1>
            {subtitle && (
              <p className="mt-2 text-sm text-zinc-400">{subtitle}</p>
            )}
            <div className="mt-6">{children}</div>
          </div>
          {footer && (
            <p className="mt-6 text-center text-sm text-zinc-500">{footer}</p>
          )}
        </div>
      </main>
    </div>
  );
};

export default AuthLayout;
