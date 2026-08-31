// frontend/src/pages/auth/ResetPassword.jsx
import React, { useState, useEffect } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import api from "../../services/api";
import logo from "../../assets/nav-logo.png";
import toast from "react-hot-toast";
import loginBg from "../../assets/login-img.jpg";
import {
  ArrowRight,
  Check,
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
  Sparkles,
  Star,
  Users,
  XCircle,
} from "lucide-react";

// ================================================================
// ICON COMPONENTS
// ================================================================

function FeatureIcon({ children }) {
  return (
    <div className="flex h-[48px] w-[48px] shrink-0 items-center justify-center rounded-full bg-[#f5dc8c] text-[#11161a] shadow-[0_1px_3px_rgba(0,0,0,.025)]">
      {children}
    </div>
  );
}

function Logo() {
  return (
    <div className="flex items-center gap-4">
      <img
        src={logo}
        alt="AI Digital Product Factory"
        className="h-[70px] w-auto object-contain"
      />
    </div>
  );
}

// ================================================================
// LEFT HERO
// ================================================================

function LeftHero() {
  const features = [
    {
      title: "Secure Password Reset",
      description: "Create a new strong password for your account.",
      icon: <LockKeyhole size={21} strokeWidth={1.8} />,
    },
    {
      title: "Min 6 Characters",
      description: "Your new password must be at least 6 characters long.",
      icon: <Sparkles size={21} strokeWidth={1.8} />,
    },
    {
      title: "Account Secured",
      description: "Your account will be protected with your new password.",
      icon: <Users size={21} strokeWidth={1.8} />,
    },
  ];

  return (
    <section className="relative h-full min-h-screen overflow-hidden">
      {/* BACKGROUND IMAGE - Full cover */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url(${loginBg})`,
        }}
      />

      {/* Decorative yellow gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#FACC15]/10 to-transparent" />

      <div className="relative z-10 flex flex-col justify-between h-full min-h-screen px-[68px] py-[42px]">
        <div>
          <Logo />
        </div>

        <div className="flex-1 flex flex-col justify-center max-w-[610px]">
          <h1 className="text-[42px] font-bold leading-[1.2] tracking-[-.035em] text-dark">
            Create New
            <br />
            <span className="bg-gradient-to-r from-[#f4b900] to-[#ffcf24] bg-clip-text text-transparent">
              Password
            </span>
          </h1>

          <p className="mt-[19px] max-w-[540px] text-[17px] leading-[1.6] text-dark/80">
            Enter your new password below to secure your account.
          </p>

          <div className="mt-[32px] space-y-[14px]">
            {features.map((feature) => (
              <div key={feature.title} className="flex items-center">
                <FeatureIcon>{feature.icon}</FeatureIcon>
                <div className="ml-[16px]">
                  <h3 className="text-[16px] font-bold text-dark">
                    {feature.title}
                  </h3>
                  <p className="mt-[2px] text-[13px] text-black/70">
                    {feature.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-6 text-white/40 text-sm py-4">
          <p>© 2024 AI Product Factory</p>
          <span className="w-1 h-1 bg-white/20 rounded-full"></span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 bg-[#FACC15] rounded-full animate-ping"></span>
            <span className="text-white/30">AI System Online</span>
          </span>
        </div>
      </div>
    </section>
  );
}

// ================================================================
// RESET PASSWORD CARD
// ================================================================

function ResetPasswordCard({
  password,
  setPassword,
  loading,
  handleSubmit,
  valid,
  checking,
}) {
  const [showPassword, setShowPassword] = useState(false);

  if (checking) {
    return (
      <div className="w-full max-w-[480px] rounded-[16px] border border-[#e9ebee] bg-white px-[44px] py-[56px] shadow-[0_8px_40px_rgba(20,25,30,.08)] text-center">
        <div className="flex h-[80px] w-[80px] items-center justify-center rounded-full bg-[#fff9e6] mx-auto">
          <div className="animate-spin h-8 w-8 border-4 border-[#ffc400] border-t-transparent rounded-full"></div>
        </div>
        <h2 className="mt-[20px] text-center text-[20px] font-bold text-[#111419]">
          Verifying Link...
        </h2>
        <p className="mt-[8px] text-center text-[14px] text-[#59616b]">
          Please wait while we verify your reset link.
        </p>
      </div>
    );
  }

  if (!valid) {
    return (
      <div className="w-full max-w-[480px] rounded-[16px] border border-[#e9ebee] bg-white px-[44px] py-[56px] shadow-[0_8px_40px_rgba(20,25,30,.08)] text-center">
        <div className="flex h-[80px] w-[80px] items-center justify-center rounded-full bg-red-50 mx-auto">
          <XCircle size={40} className="text-red-500" />
        </div>
        <h2 className="mt-[20px] text-center text-[24px] font-bold text-[#111419]">
          Invalid Link
        </h2>
        <p className="mt-[8px] text-center text-[14px] text-[#59616b]">
          This password reset link has expired or is invalid.
        </p>
        <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
          <p className="text-xs text-amber-700 flex items-center justify-center gap-2">
            <span>⏰</span>
            Reset links expire after 1 hour
          </p>
        </div>
        <Link
          to="/forgot-password"
          className="mt-6 inline-flex items-center gap-2 text-[14px] font-medium text-[#3f3bdd] hover:underline"
        >
          <span>←</span> Request New Link
        </Link>
      </div>
    );
  }

  return (
    <div className="w-full max-w-[480px] rounded-[16px] border border-[#e9ebee] bg-white px-[44px] py-[56px] shadow-[0_8px_40px_rgba(20,25,30,.08)]">
      {/* Icon */}
      <div className="flex h-[80px] w-[80px] items-center justify-center rounded-full bg-[#fff9e6] mx-auto">
        <div className="relative flex h-[42px] w-[34px] items-center justify-center rounded-[8px] border-[3px] border-[#11161b]">
          <div className="absolute -top-[18px] left-[4px] h-[20px] w-[22px] rounded-t-full border-[3px] border-b-0 border-[#11161b]" />
          <div className="absolute top-[16px] h-[8px] w-[5px] rounded-full bg-[#ffc400]" />
          <div className="absolute top-[22px] h-[4px] w-[2px] bg-[#11161b]" />
        </div>
      </div>

      <h2 className="mt-[20px] text-center text-[28px] font-bold tracking-[-.035em]">
        Set New Password
      </h2>
      <p className="mt-[8px] text-center text-[15px] text-[#59616b]">
        Enter your new password below
      </p>

      <form className="mt-[30px]" onSubmit={handleSubmit}>
        {/* Password */}
        <div>
          <label className="block text-[13px] font-medium text-[#1d2329]">
            New Password
          </label>
          <div className="mt-[6px] flex h-[48px] items-center rounded-[10px] border border-[#d9dee4] bg-white px-[14px] focus-within:border-[#a5a1e4] focus-within:ring-2 focus-within:ring-[#efeffb]">
            <LockKeyhole
              size={19}
              strokeWidth={1.7}
              className="text-[#6b737d]"
            />
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your new password"
              className="ml-[12px] h-full w-full border-0 bg-transparent text-[14px] outline-none placeholder:text-[#959da8]"
              required
              minLength={6}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="ml-auto text-[#6b737d] hover:text-[#1d2329] transition"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          <p className="mt-[6px] text-[11px] text-[#8a929e]">
            Password must be at least 6 characters long
          </p>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className="mt-[24px] flex h-[50px] w-full items-center justify-center rounded-[10px] bg-[#ffc400] text-[15px] font-semibold text-[#12161a] shadow-[0_4px_12px_rgba(255,193,0,.25)] transition-all duration-200 hover:bg-[#f5b900] hover:shadow-[0_6px_20px_rgba(255,193,0,.35)] hover:-translate-y-[1px] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:-translate-y-0 disabled:hover:shadow-[0_4px_12px_rgba(255,193,0,.25)]"
        >
          {loading ? (
            <span className="flex items-center justify-center gap-3">
              <svg
                className="animate-spin h-5 w-5 text-[#12161a]"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                  fill="none"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              <span>Resetting...</span>
            </span>
          ) : (
            <span className="flex items-center justify-center w-full gap-2">
              <span>Reset Password</span>
              <ArrowRight size={20} className="shrink-0" />
            </span>
          )}
        </button>
      </form>

      {/* Back to Login */}
      <div className="mt-[20px] text-center">
        <Link
          to="/login"
          className="text-[14px] font-medium text-[#3f3bdd] hover:underline flex items-center justify-center gap-1"
        >
          <span>←</span> Back to Sign In
        </Link>
      </div>

      {/* Trust Badges */}
      <div className="mt-[28px] flex items-center justify-center gap-6 text-xs text-[#8a929e]">
        <span className="flex items-center gap-1">
          <span className="text-[#FACC15]">✓</span> SSL Secured
        </span>
        <span className="flex items-center gap-1">
          <span className="text-[#FACC15]">✓</span> 24/7 Support
        </span>
        <span className="flex items-center gap-1">
          <span className="text-[#FACC15]">✓</span> Free Trial
        </span>
      </div>
    </div>
  );
}

// ================================================================
// MAIN COMPONENT
// ================================================================

const ResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [valid, setValid] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const verifyToken = async () => {
      try {
        await api.get(`/password/verify/${token}`);
        setValid(true);
      } catch {
        setValid(false);
      } finally {
        setChecking(false);
      }
    };
    verifyToken();
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post("/password/reset", { token, password });
      toast.success("Password reset successful!");
      navigate("/login");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white font-sans text-[#101419]">
      <div className="grid min-h-screen grid-cols-1 lg:grid-cols-[50%_50%]">
        <LeftHero />
        <section className="flex min-h-screen items-center justify-center bg-[#fafbfc] px-[30px] md:px-[50px] py-[64px]">
          <ResetPasswordCard
            password={password}
            setPassword={setPassword}
            loading={loading}
            handleSubmit={handleSubmit}
            valid={valid}
            checking={checking}
          />
        </section>
      </div>
    </div>
  );
};

export default ResetPassword;
