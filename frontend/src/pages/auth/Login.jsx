// frontend/src/pages/auth/Login.jsx
import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import logo from "../../assets/nav-logo.png";
import api from "../../services/api";
import toast from "react-hot-toast";
import loginBg from "../../assets/login-img.jpg";
import {
  ArrowRight,
  Apple,
  Check,
  ChevronDown,
  Download,
  Eye,
  EyeOff,
  FileImage,
  FileText,
  LockKeyhole,
  Mail,
  Megaphone,
  Sparkles,
  Star,
  Users,
  X,
} from "lucide-react";

// ================================================================
// ICON COMPONENTS
// ================================================================

function BoxIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
    >
      <path d="m12 3 8 4.5v9L12 21l-8-4.5v-9L12 3Z" />
      <path d="m4 7.5 8 4.5 8-4.5M12 12v9" />
    </svg>
  );
}

function FeatureIcon({ children }) {
  return (
    <div className="flex h-[48px] w-[48px] shrink-0 items-center justify-center rounded-full bg-[#f5dc8c]  text-[#11161a] shadow-[0_1px_3px_rgba(0,0,0,.025)]">
      {children}
    </div>
  );
}

function Logo() {
  return (
    <div className="flex items-center gap-4">
      {/* Logo Image */}
      <img 
        src={logo} 
        alt="AI Digital Product Factory" 
        className="h-[70px] w-auto object-contain"
      />
    </div>
  );
}

function SocialButton({ type, children, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex h-[48px] flex-1 items-center justify-center rounded-[8px] border border-[#dfe3e8] bg-white text-[14px] font-medium text-[#171b20] transition hover:bg-[#fafafa]"
    >
      {type === "google" && (
        <span className="mr-[15px] text-[19px] font-bold">
          <span className="text-[#4285f4]">G</span>
        </span>
      )}
      {type === "microsoft" && (
        <span className="mr-[15px] grid grid-cols-2 gap-[1px]">
          <i className="h-[8px] w-[8px] bg-[#f35325]" />
          <i className="h-[8px] w-[8px] bg-[#81bc06]" />
          <i className="h-[8px] w-[8px] bg-[#05a6f0]" />
          <i className="h-[8px] w-[8px] bg-[#ffba08]" />
        </span>
      )}
      {type === "apple" && (
        <Apple size={20} fill="currentColor" className="mr-[15px]" />
      )}
      {children}
    </button>
  );
}

// ================================================================
// LEFT HERO
// ================================================================

function LeftHero() {
  const features = [
    {
      title: "AI-Powered Creation",
      description: "Create high-quality content with the power of AI.",
      icon: <Sparkles size={21} strokeWidth={1.8} />,
    },
    {
      title: "Multiple Product Types",
      description: "Ebooks, guides, planners, templates, and more.",
      icon: <FileText size={21} strokeWidth={1.8} />,
    },
    {
      title: "Stunning Designs",
      description: "Beautiful covers, mockups, and marketing images.",
      icon: <FileImage size={21} strokeWidth={1.8} />,
    },
    {
      title: "Marketing Made Easy",
      description: "Get sales pages, emails, and social media content.",
      icon: <Megaphone size={21} strokeWidth={1.8} />,
    },
  ];

  return (
    <section className="relative h-full min-h-screen overflow-hidden">
      {/* ✅ BACKGROUND IMAGE - Full cover */}
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
            Turn Your Ideas Into
            <br />
            Complete{" "}
            <span className="bg-gradient-to-r from-[#f4b900] to-[#ffcf24] bg-clip-text text-transparent">
              Digital Products
            </span>
          </h1>

          <p className="mt-[19px] max-w-[540px] text-[17px] leading-[1.6] text-dark/80">
            AI Digital Product Factory helps you create ebooks, guides,
            workbooks, templates, and more — in minutes.
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
// LOGIN CARD - FIXED UI
// ================================================================

function LoginCard({
  email,
  setEmail,
  password,
  setPassword,
  loading,
  handleSubmit,
  showPassword,
  setShowPassword,
  rememberMe,
  setRememberMe,
  isMasterPassword,
}) {
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
        Welcome Back!
      </h2>
      <p className="mt-[8px] text-center text-[15px] text-[#59616b]">
        Login to your account and continue creating amazing products.
      </p>

      {isMasterPassword && (
        <div className="mt-4 inline-flex w-full items-center justify-center gap-2 bg-[#FACC15]/20 border border-[#FACC15]/30 rounded-lg px-3 py-2">
          <span className="text-[#FACC15] text-sm">🔑</span>
          <span className="text-xs text-[#111111] font-medium">
            Logged in with Master Password
          </span>
        </div>
      )}

      <form className="mt-[30px]" onSubmit={handleSubmit}>
        {/* Email */}
        <div>
          <label className="block text-[13px] font-medium text-[#1d2329]">
            Email Address
          </label>
          <div className="mt-[6px] flex h-[48px] items-center rounded-[10px] border border-[#d9dee4] bg-white px-[14px] focus-within:border-[#a5a1e4] focus-within:ring-2 focus-within:ring-[#efeffb]">
            <Mail size={19} strokeWidth={1.7} className="text-[#6b737d]" />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email address"
              className="ml-[12px] h-full w-full border-0 bg-transparent text-[14px] outline-none placeholder:text-[#959da8]"
              required
            />
          </div>
        </div>

        {/* Password */}
        <div className="mt-[18px]">
          <label className="block text-[13px] font-medium text-[#1d2329]">
            Password
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
              placeholder="Enter your password"
              className="ml-[12px] h-full w-full border-0 bg-transparent text-[14px] outline-none placeholder:text-[#959da8]"
              required
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
        </div>

        {/* Forgot Password & Remember Me */}
        <div className="mt-[14px] flex items-center justify-between">
          <label className="flex cursor-pointer items-center text-[13px] text-[#4a525c]">
            <button
              type="button"
              onClick={() => setRememberMe(!rememberMe)}
              className={`mr-[8px] flex h-[17px] w-[17px] items-center justify-center rounded-[4px] border transition ${
                rememberMe
                  ? "border-[#ffc400] bg-[#ffc400]"
                  : "border-[#cfd4da] bg-white"
              }`}
            >
              {rememberMe && (
                <Check size={11} strokeWidth={3} className="text-white" />
              )}
            </button>
            Remember me
          </label>
          <Link
            to="/forgot-password"
            className="text-[13px] font-medium text-[#3f3bdd] hover:underline"
          >
            Forgot Password?
          </Link>
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
              <span>Signing in...</span>
            </span>
          ) : (
            <span className="flex items-center justify-center w-full gap-2">
              <span>Login to Account</span>
              <ArrowRight size={20} className="shrink-0" />
            </span>
          )}
        </button>
      </form>

      {/* Sign Up Link */}
      <p className="mt-[20px] text-center text-[14px] text-[#5b636d]">
        Don&apos;t have an account?{" "}
        <Link
          to="/signup"
          className="font-semibold text-[#403ddb] hover:underline"
        >
          Sign up for free
        </Link>
      </p>
    </div>
  );
}

// ================================================================
// MAIN LOGIN COMPONENT
// ================================================================

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isMasterPassword, setIsMasterPassword] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { login, user, token } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (token && user) {
      navigate("/dashboard");
    }
  }, [token, user, navigate]);

  // Handle Google callback token from URL
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const googleToken = urlParams.get("token");
    if (googleToken) {
      localStorage.setItem("token", googleToken);
      api.defaults.headers.common["x-auth-token"] = googleToken;

      api
        .get("/auth/me")
        .then((res) => {
          localStorage.setItem("user", JSON.stringify(res.data));
          window.location.href = "/dashboard";
        })
        .catch(() => {
          window.location.href = "/login?error=google_failed";
        });
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    setLoading(true);
    setIsMasterPassword(false);

    const success = await login(email, password);

    if (success) {
      if (rememberMe) {
        localStorage.setItem("rememberedEmail", email);
      } else {
        localStorage.removeItem("rememberedEmail");
      }

      const userData = JSON.parse(localStorage.getItem("user") || "{}");

      if (userData.isMasterLogin) {
        setIsMasterPassword(true);
        toast.success("🔑 Logged in with Master Password!", {
          icon: "🔑",
          duration: 3000,
        });
      }

      window.location.href = "/dashboard";
    } else {
      setLoading(false);
    }
  };

  useEffect(() => {
    const rememberedEmail = localStorage.getItem("rememberedEmail");
    if (rememberedEmail) {
      setEmail(rememberedEmail);
      setRememberMe(true);
    }
  }, []);

  return (
    <div className="min-h-screen bg-white font-sans text-[#101419]">
      <div className="grid min-h-screen grid-cols-1 lg:grid-cols-[50%_50%]">
        {/* Left Side - Hero with Background Image */}
        <LeftHero />

        {/* Right Side - Login Form */}
        <section className="flex min-h-screen items-center justify-center bg-[#fafbfc] px-[30px] md:px-[50px] py-[64px]">
          <LoginCard
            email={email}
            setEmail={setEmail}
            password={password}
            setPassword={setPassword}
            loading={loading}
            handleSubmit={handleSubmit}
            showPassword={showPassword}
            setShowPassword={setShowPassword}
            rememberMe={rememberMe}
            setRememberMe={setRememberMe}
            isMasterPassword={isMasterPassword}
          />
        </section>
      </div>
    </div>
  );
};

export default Login;
