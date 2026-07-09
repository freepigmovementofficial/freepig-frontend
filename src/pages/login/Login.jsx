import useDocumentTitle from "../../hooks/useDocumentTitle";
import React, { useState, useEffect } from "react";
import { useNavigate, Link, useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { FiEye, FiEyeOff } from "react-icons/fi";
import { authService } from "../../api/auth";
import logotr from "../../assets/logoPutihh.webp";
import videoLandingPage from "../../assets/videoLandingPage.mp4";
import { toast } from "react-hot-toast";
import { heroService } from "../../api/hero";

const inputClass =
  "w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-white/40 focus:bg-white/8 transition duration-300";

const labelClass =
  "block text-[10px] font-bold text-gray-400 tracking-[0.18em] uppercase mb-2";

export default function Login() {
  useDocumentTitle("Login | FreePigMovement");
  const [mode, setMode] = useState("LOGIN"); // 'LOGIN' | 'REGISTER' | 'VERIFY_OTP'
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [hero, setHero] = useState(null);

  useEffect(() => {
    if (searchParams.get("expired") === "true") {
      const msg = "Sesi Anda sudah habis. Harap login kembali.";
      setError(msg);
      toast.error(msg, {
        duration: 5000,
        style: { background: "#333", color: "#fff" },
      });
    }
  }, [searchParams]);

  useEffect(() => {
    const fetchHero = async () => {
      try {
        const res = await heroService.getActive();
        if (res?.data) {
          setHero(res.data);
        }
      } catch (err) {
        // Silently ignore if no active hero is found
      }
    };
    fetchHero();
  }, []);

  const handleAuthSuccess = (res) => {
    const { user, token } = res.data;
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(user));
    if (user.role === "ADMIN") navigate("/admin/dashboard");
    else navigate("/");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccessMsg("");
    setIsLoading(true);
    try {
      if (mode === "LOGIN") {
        const res = await authService.login(email, password);
        handleAuthSuccess(res);
      } else if (mode === "REGISTER") {
        const res = await authService.register(name, email, password);
        setSuccessMsg(res.message || "OTP sent! Please check your email.");
        setMode("VERIFY_OTP");
      } else if (mode === "VERIFY_OTP") {
        const res = await authService.verifyOtp(email, otp);
        handleAuthSuccess(res);
      }
    } catch (err) {
      setError(
        err.response?.data?.message || "Action failed. Please try again.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  const switchMode = (next) => {
    setError("");
    setSuccessMsg("");
    setMode(next);
  };

  /* ─── FORM TITLE / SUBTITLE ─── */
  const title =
    mode === "LOGIN"
      ? "Welcome Back"
      : mode === "REGISTER"
        ? "Join The Movement"
        : "Verify Email";
  const subtitle =
    mode === "VERIFY_OTP"
      ? `We sent a 6-digit code to ${email}`
      : mode === "LOGIN"
        ? "Sign in to your account"
        : "Create your free account";

  return (
    <div className="min-h-screen flex font-poppins overflow-hidden bg-[#0d0d0d]">
      {/* ══════════ LEFT PANEL — Brand Visual ══════════ */}
      <div className="hidden lg:flex relative w-[52%] flex-shrink-0 flex-col items-start justify-end p-16 overflow-hidden">
        {/* Video background */}
        <video
          key={hero?.videoUrl || "default"}
          src={hero?.videoUrl || videoLandingPage}
          autoPlay
          muted
          loop
          playsInline
          className="absolute inset-0 w-full h-full object-cover"
        />
        {/* Gradient overlays */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-black/10" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20" />

        {/* Logo top-left */}
        <Link
          to="/"
          className="absolute top-10 left-10 z-10 hover:opacity-75 transition"
        >
          <img
            loading="lazy"
            src={logotr}
            alt="FreePigMovement"
            className="h-14 w-auto object-contain"
          />
        </Link>

        {/* Brand copy bottom-left */}
        <div className="relative z-10 max-w-md">
          <p className="text-[11px] font-bold tracking-[0.35em] text-gray-400 uppercase mb-3">
            FreePigMovement
          </p>
          <h1 className="font-road-rage font-normal leading-none mb-5">
            {hero?.titlePrimary || hero?.titleSecondary ? (
              <>
                {hero.titlePrimary && (
                  <span className="block text-[#35BDBD] uppercase text-[28px] lg:text-[36px] drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
                    {hero.titlePrimary}
                  </span>
                )}
                {hero.titleSecondary && (
                  <span className="block text-white uppercase mt-1 text-[48px] lg:text-[64px] drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
                    {hero.titleSecondary}
                  </span>
                )}
              </>
            ) : (
              <span className="text-white">
                FREE PIG ,<br /> MOVEMENT
              </span>
            )}
          </h1>
          <p className="text-gray-300 text-base leading-relaxed font-light">
            {hero?.subtitle ||
              "Handcrafted surfboards shaped for your identity. Quality since 2001."}
          </p>

          {/* Decorative divider */}
          <div className="flex items-center gap-4 mt-8">
            <div className="w-12 h-px bg-white/30" />
            <span className="text-gray-500 text-[10px] tracking-[0.3em] uppercase">
              Est. 2001
            </span>
          </div>
        </div>
      </div>

      {/* ══════════ RIGHT PANEL — Form ══════════ */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12 relative overflow-y-auto">
        {/* Subtle radial glow */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-white/3 rounded-full blur-[120px]" />
        </div>

        {/* Mobile logo */}
        <Link to="/" className="lg:hidden mb-10 hover:opacity-75 transition">
          <img
            loading="lazy"
            src={logotr}
            alt="FreePigMovement"
            className="h-12 w-auto object-contain"
          />
        </Link>

        <div className="w-full max-w-[400px] relative z-10">
          {/* ── Tab switcher (LOGIN / REGISTER) ── */}
          {mode !== "VERIFY_OTP" && (
            <div className="flex bg-white/5 rounded-xl p-1 mb-10 border border-white/8">
              {["LOGIN", "REGISTER"].map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => switchMode(m)}
                  className={`flex-1 py-2.5 text-[11px] font-bold tracking-[0.18em] rounded-lg transition-all duration-300 ${
                    mode === m
                      ? "bg-white text-black shadow-lg"
                      : "text-gray-500 hover:text-gray-300"
                  }`}
                >
                  {m}
                </button>
              ))}
            </div>
          )}

          {/* ── Heading ── */}
          <AnimatePresence mode="wait">
            <motion.div
              key={mode}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.3 }}
              className="mb-8"
            >
              <h2 className="font-road-rage font-normal text-4xl text-white tracking-wide mb-1.5">
                {title}
              </h2>
              <p className="text-gray-500 text-sm tracking-wide">{subtitle}</p>
            </motion.div>
          </AnimatePresence>

          {/* ── Alert messages ── */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-5 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs tracking-wide"
              >
                {error}
              </motion.div>
            )}
            {successMsg && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-5 px-4 py-3 rounded-xl bg-green-500/10 border border-green-500/20 text-green-400 text-xs tracking-wide"
              >
                {successMsg}
              </motion.div>
            )}
          </AnimatePresence>

          {/* ── Form ── */}
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <AnimatePresence mode="popLayout">
              {/* Name — register only */}
              {mode === "REGISTER" && (
                <motion.div
                  key="name"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.25 }}
                >
                  <label className={labelClass}>Full Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    minLength={2}
                    placeholder="Your name"
                    className={inputClass}
                  />
                </motion.div>
              )}

              {/* Email + Password */}
              {mode !== "VERIFY_OTP" && (
                <motion.div
                  key="email-pass"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex flex-col gap-5"
                >
                  <div>
                    <label className={labelClass}>Email</label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      placeholder="you@example.com"
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Password</label>
                    <div className="relative">
                      <input
                        type={showPass ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        minLength={mode === "REGISTER" ? 8 : 1}
                        placeholder="••••••••"
                        className={`${inputClass} pr-12`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPass(!showPass)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition"
                      >
                        {showPass ? (
                          <FiEyeOff size={18} />
                        ) : (
                          <FiEye size={18} />
                        )}
                      </button>
                    </div>
                    {mode === "REGISTER" && (
                      <p className="text-[10px] text-gray-600 mt-1.5 tracking-wide">
                        Minimum 8 characters
                      </p>
                    )}
                  </div>
                </motion.div>
              )}

              {/* OTP */}
              {mode === "VERIFY_OTP" && (
                <motion.div
                  key="otp"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                >
                  <label className={labelClass}>6-Digit Code</label>
                  <input
                    type="text"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    required
                    maxLength={6}
                    placeholder="· · · · · ·"
                    className={`${inputClass} text-center text-2xl tracking-[0.6em] font-bold`}
                  />
                  <p className="text-[10px] text-gray-600 mt-2 text-center tracking-wide">
                    Didn't receive it? Check your spam folder.
                  </p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Submit button */}
            <motion.button
              type="submit"
              disabled={isLoading}
              whileHover={{ scale: isLoading ? 1 : 1.02 }}
              whileTap={{ scale: isLoading ? 1 : 0.97 }}
              className="mt-2 w-full py-3.5 bg-white text-black text-[12px] font-black tracking-[0.2em] uppercase rounded-xl hover:bg-gray-200 transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <span className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin inline-block" />
                  PROCESSING...
                </>
              ) : mode === "LOGIN" ? (
                "SIGN IN"
              ) : mode === "REGISTER" ? (
                "CREATE ACCOUNT"
              ) : (
                "VERIFY"
              )}
            </motion.button>
          </form>

          {/* ── Back link for OTP step ── */}
          {mode === "VERIFY_OTP" && (
            <button
              type="button"
              onClick={() => switchMode("REGISTER")}
              className="mt-5 w-full text-center text-xs text-gray-600 hover:text-gray-400 transition tracking-widest"
            >
              ← Back to Register
            </button>
          )}

          {/* ── Back to home ── */}
          <div className="mt-8 pt-6 border-t border-white/8 text-center">
            <Link
              to="/"
              className="text-[11px] text-gray-600 hover:text-gray-400 transition tracking-widest uppercase"
            >
              ← Back to Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
