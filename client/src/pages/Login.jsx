import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import AuthLayout from "../components/AuthLayout";
import { useAuth } from "../context/AuthContext";
import LoadingButton from "../components/loadingbutton.jsx";

const inputClass =
  "w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-sm text-white placeholder-zinc-600 outline-none transition focus:border-lime-400 focus:ring-2 focus:ring-lime-400/20";

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await login(email.trim(), password);
      navigate(location.state?.from || "/dashboard", { replace: true });
    } catch (err) {
      // Unverified accounts get a 403 — send them to the OTP screen
      if (err.status === 403) {
        navigate("/verify-email", {
          replace: true,
          state: { email: email.trim(), notice: err.message },
        });
        return;
      }
      setError(err.message || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Log in to get back to the pipeline."
      footer={
        <>
          Don't have an account?{" "}
          <Link
            to="/register"
            className="font-semibold text-lime-400 hover:text-lime-300"
          >
            Sign up
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
            {error}
          </div>
        )}

        <div>
          <label className="mb-1.5 block text-sm font-medium text-zinc-300">
            Email
          </label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className={inputClass}
          />
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-zinc-300">
            Password
          </label>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            className={inputClass}
          />
        </div>

        <LoadingButton loading={loading} loadingText="Logging in">
        Log in
      </LoadingButton>

      </form>
    </AuthLayout>
  );
};

export default Login;
