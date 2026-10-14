import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AuthLayout from "../components/AuthLayout";
import { useAuth } from "../context/AuthContext";
import LoadingButton from "../components/loadingbutton.jsx";

const inputClass =
  "w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-900 placeholder-slate-400 outline-none transition focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20";

const Register = () => {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    role: "CANDIDATE",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const set = (key) => (e) =>
    setForm((f) => ({ ...f, [key]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await register({
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        email: form.email.trim(),
        password: form.password,
        role: form.role,
      });
      // No session yet — the backend emailed an OTP
      navigate("/verify-email", {
        replace: true,
        state: { email: form.email.trim() },
      });
    } catch (err) {
      setError(err.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Join the hunt"
      subtitle="Free for candidates. Verify your email to enter."
      footer={
        <>
          Already have an account?{" "}
          <Link
            to="/login"
            className="font-semibold text-blue-600 hover:text-blue-600"
          >
            Log in
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
            {error}
          </div>
        )}

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-600">
              First name
            </label>
            <input
              required
              value={form.firstName}
              onChange={set("firstName")}
              placeholder="Sam"
              className={inputClass}
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-600">
              Last name
            </label>
            <input
              required
              value={form.lastName}
              onChange={set("lastName")}
              placeholder="Smith"
              className={inputClass}
            />
          </div>
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-600">
            Email
          </label>
          <input
            type="email"
            required
            value={form.email}
            onChange={set("email")}
            placeholder="you@example.com"
            className={inputClass}
          />
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-600">
            Password
          </label>
          <input
            type="password"
            required
            minLength={8}
            value={form.password}
            onChange={set("password")}
            placeholder="At least 8 characters"
            className={inputClass}
          />
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-600">
            I am a
          </label>
          <div className="grid grid-cols-2 gap-3">
            {["CANDIDATE", "RECRUITER"].map((role) => (
              <button
                key={role}
                type="button"
                onClick={() => setForm((f) => ({ ...f, role }))}
                className={`rounded-xl border px-4 py-3 text-sm font-semibold transition ${
                  form.role === role
                    ? "border-blue-600 bg-blue-50 text-blue-600"
                    : "border-slate-300 bg-slate-50 text-slate-500 hover:border-slate-300"
                }`}
              >
                {role === "CANDIDATE" ? "Candidate" : "Recruiter"}
              </button>
            ))}
          </div>
        </div>

        <LoadingButton loading={loading} loadingText="Creating account">
          Create account
        </LoadingButton>
      </form>
    </AuthLayout>
  );
};

export default Register;
