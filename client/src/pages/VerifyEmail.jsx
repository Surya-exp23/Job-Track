import { useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import AuthLayout from "../components/AuthLayout";
import { useAuth } from "../context/AuthContext";
import LoadingButton from "../components/loadingbutton.jsx";

const RESEND_COOLDOWN = 60;

const VerifyEmail = () => {
  const { verifyEmail, resendOtp } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState(location.state?.email || "");
  const [otp, setOtp] = useState(Array(6).fill(""));
  const [error, setError] = useState("");
  const [notice, setNotice] = useState(location.state?.notice || "");
  const [loading, setLoading] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const inputs = useRef([]);

  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [cooldown]);

  const handleChange = (i, val) => {
    if (!/^\d*$/.test(val)) return;
    const next = [...otp];
    next[i] = val.slice(-1);
    setOtp(next);
    if (val && i < 5) inputs.current[i + 1]?.focus();
  };

  const handleKeyDown = (i, e) => {
    if (e.key === "Backspace" && !otp[i] && i > 0) {
      inputs.current[i - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    const text = e.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, 6);
    if (!text) return;
    e.preventDefault();
    const next = Array(6).fill("");
    text.split("").forEach((d, idx) => {
      next[idx] = d;
    });
    setOtp(next);
    inputs.current[Math.min(text.length, 5)]?.focus();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const code = otp.join("");
    if (code.length !== 6) {
      setError("Enter the full 6-digit code.");
      return;
    }
    setError("");
    setLoading(true);

    try {
      await verifyEmail(email.trim(), code);
      navigate("/dashboard", { replace: true });
    } catch (err) {
      setError(err.message || "Verification failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!email.trim() || cooldown > 0) return;
    setError("");
    setNotice("");

    try {
      await resendOtp(email.trim());
      setNotice("A fresh code is on its way to your inbox.");
      setCooldown(RESEND_COOLDOWN);
      setOtp(Array(6).fill(""));
      inputs.current[0]?.focus();
    } catch (err) {
      setError(err.message || "Could not resend the code.");
    }
  };

  return (
    <AuthLayout
      title="Check your inbox"
      subtitle={
        email
          ? `We sent a 6-digit code to ${email}. It expires in 10 minutes.`
          : "Enter your email and the 6-digit code we sent you."
      }
      footer={
        <>
          Wrong email?{" "}
          <Link
            to="/register"
            className="font-semibold text-lime-400 hover:text-lime-300"
          >
            Start over
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {notice && (
          <div className="rounded-xl border border-lime-400/30 bg-lime-400/10 px-4 py-3 text-sm text-lime-300">
            {notice}
          </div>
        )}
        {error && (
          <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
            {error}
          </div>
        )}

        {!location.state?.email && (
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
              className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-sm text-white placeholder-zinc-600 outline-none transition focus:border-lime-400 focus:ring-2 focus:ring-lime-400/20"
            />
          </div>
        )}

        <div>
          <label className="mb-1.5 block text-sm font-medium text-zinc-300">
            Verification code
          </label>
          <div className="flex justify-between gap-2" onPaste={handlePaste}>
            {otp.map((digit, i) => (
              <input
                key={i}
                ref={(el) => (inputs.current[i] = el)}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleChange(i, e.target.value)}
                onKeyDown={(e) => handleKeyDown(i, e)}
                className="h-14 w-full rounded-xl border border-zinc-700 bg-zinc-950 text-center font-display text-xl font-bold text-white outline-none transition focus:border-lime-400 focus:ring-2 focus:ring-lime-400/20"
              />
            ))}
          </div>
        </div>

        <LoadingButton loading={loading} loadingText="Verifying">
          Verify and enter
        </LoadingButton>


        <p className="text-center text-sm text-zinc-500">
          No code?{" "}
          <button
            type="button"
            onClick={handleResend}
            disabled={cooldown > 0 || !email.trim()}
            className="font-semibold text-lime-400 hover:text-lime-300 disabled:cursor-not-allowed disabled:text-zinc-600"
          >
            {cooldown > 0 ? `Resend in ${cooldown}s` : "Resend code"}
          </button>
        </p>
      </form>
    </AuthLayout>
  );
};

export default VerifyEmail;
