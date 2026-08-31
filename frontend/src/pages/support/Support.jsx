// pages/Support.jsx
import React, { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import toast from "react-hot-toast";
import Sidebar from "../../components/Sidebar";
import Navbar from "../../components/Navbar";
import {
  Search,
  Mail,
  MessageSquare,
  HelpCircle,
  BookOpen,
  Key,
  Lock,
  User,
  LogIn,
  Shield,
  Sparkles,
  CheckCircle,
  XCircle,
  Copy,
  ExternalLink,
  Headphones,
  Clock,
  ArrowRight,
  Star,
  Users,
  FileText,
  Globe,
  Phone,
  Mail as MailIcon,
  Send,
  MessageCircle,
  ThumbsUp,
  Award,
  TrendingUp,
  Zap,
  ChevronDown,
  CreditCard,
} from "lucide-react";

const Support = () => {
  const { user } = useAuth();
  const [copied, setCopied] = useState(null);
  const [expandedFaq, setExpandedFaq] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("credentials");

  const APP_URL = "https://aidigitalproduct.albinolabs.com";
  const SUPPORT_DESK_URL = "https://supportalbinolabs.tawk.help/";

  const userCredentials = {
    appUrl: APP_URL,
    loginEmail: user?.email || "Your purchase email",
    defaultPassword: user?.email || "Your purchase email (default password)",
  };

  const copyToClipboard = (text, label) => {
    navigator.clipboard
      .writeText(text)
      .then(() => {
        setCopied(label);
        toast.success(`${label} copied to clipboard!`);
        setTimeout(() => setCopied(null), 2000);
      })
      .catch(() => {
        toast.error("Failed to copy");
      });
  };

  const loginFaqs = [
    {
      id: 1,
      question: "What is my login email?",
      answer:
        "Your login email is the email address you used to purchase AI Digital Product Factory. This is the email where you received your purchase confirmation and login credentials.",
      icon: "📧",
    },
    {
      id: 2,
      question: "What is my default password?",
      answer:
        "Your default password is exactly the same as your purchase email. For example, if you purchased with 'john@example.com', your default password is also 'john@example.com'. We recommend changing this after your first login for security.",
      icon: "🔑",
    },
    {
      id: 3,
      question: "How do I login to my account?",
      answer:
        "1. Go to aidigitalproduct.albinolabs.com\n2. Enter your purchase email as your login email\n3. Enter your purchase email as your password (same as login email)\n4. Click 'Login' to access your dashboard",
      icon: "🚀",
    },
    {
      id: 4,
      question: "I forgot my password. What should I do?",
      answer:
        "If you've forgotten your password, click the 'Forgot Password' link on the login page. Enter your purchase email, and we'll send you a password reset link. You can then create a new password.",
      icon: "🔄",
    },
    {
      id: 5,
      question: "Can I change my password?",
      answer:
        "Yes! Once logged in, go to Settings > Security > Change Password. Enter your current password and your new password. Make sure to save your new password in a safe place.",
      icon: "🔐",
    },
    {
      id: 6,
      question: "Why is my password the same as my email?",
      answer:
        "For security and convenience, we automatically set your password to match your purchase email. This ensures you can login immediately after purchase. You can change this anytime from your settings.",
      icon: "💡",
    },
    {
      id: 7,
      question: "I'm having trouble logging in. What should I do?",
      answer:
        "If you're having trouble logging in, try these steps:\n1. Make sure you're using the correct email (the one you purchased with)\n2. Your password is the same as your email (case sensitive)\n3. Clear your browser cache and cookies\n4. Try a different browser or device\n5. If still having issues, contact our support team via Support Ticket or email.",
      icon: "🆘",
    },
  ];

  const tabs = [
    { id: "credentials", label: "Login Credentials", icon: Key },
    { id: "faq", label: "FAQ", icon: HelpCircle },
  ];

  const toggleFaq = (id) => {
    setExpandedFaq(expandedFaq === id ? null : id);
  };

  const filteredFaqs = loginFaqs.filter(
    (faq) =>
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <div className="flex min-h-screen bg-[#f5f6f8]">
      <Sidebar />
      <div className="flex-1 ml-0 md:ml-[18rem] flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          <div className="max-w-7xl mx-auto">
            {/* ===== HERO ===== */}
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#111827] to-[#1a2332] p-8 md:p-12 mb-8 border border-gray-800/50 shadow-2xl">
              <div className="absolute top-0 right-0 w-96 h-96 bg-[#FACC15]/5 rounded-full blur-3xl"></div>
              <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#FACC15]/5 rounded-full blur-3xl"></div>
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#FACC15]/3 rounded-full blur-3xl"></div>

              <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
                <div className="flex-1 text-center md:text-left">
                  <div className="inline-flex items-center gap-2 bg-[#FACC15]/20 backdrop-blur-sm text-[#FACC15] px-4 py-2 rounded-full text-sm font-medium mb-6 border border-[#FACC15]/30">
                    <span className="w-2 h-2 bg-[#FACC15] rounded-full animate-pulse"></span>
                    24/7 Support Available
                  </div>
                  <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 leading-tight">
                    How can we{" "}
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FACC15] to-[#F59E0B]">
                      support
                    </span>{" "}
                    you?
                  </h1>
                  <p className="text-lg text-gray-400 max-w-2xl">
                    Get instant answers, find solutions, and connect with our
                    support team.
                  </p>

                  <div className="max-w-xl mt-6">
                    <div className="relative bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10">
                      <div className="flex items-center px-5">
                        <Search size={20} className="text-gray-500" />
                        <input
                          type="text"
                          placeholder="Search for help..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="w-full px-4 py-3 text-white bg-transparent border-0 focus:outline-none focus:ring-0 placeholder-gray-500 text-sm"
                        />
                        {searchQuery && (
                          <button
                            onClick={() => setSearchQuery("")}
                            className="text-gray-500 hover:text-white transition"
                          >
                            <XCircle size={18} />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Quick Stats */}
                <div className="flex flex-wrap justify-center md:justify-end gap-4">
                  <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-4 border border-white/10 text-center min-w-[100px]">
                    <div className="text-3xl font-bold text-[#FACC15]">24/7</div>
                    <div className="text-xs text-gray-400">Support Available</div>
                  </div>
                  <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-4 border border-white/10 text-center min-w-[100px]">
                    <div className="text-3xl font-bold text-[#FACC15]">100%</div>
                    <div className="text-xs text-gray-400">Satisfaction Rate</div>
                  </div>
                  <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-4 border border-white/10 text-center min-w-[100px]">
                    <div className="text-3xl font-bold text-[#FACC15]">5★</div>
                    <div className="text-xs text-gray-400">User Rating</div>
                  </div>
                </div>
              </div>
            </div>

            {/* ===== TWO COLUMN LAYOUT ===== */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* ===== LEFT COLUMN - Tabs (1/3) ===== */}
              <div className="lg:col-span-1">
                <div className="bg-white rounded-2xl border border-[#E5E7EB] p-4 shadow-sm sticky top-4">
                  <h3 className="text-sm font-semibold text-[#6B7280] uppercase tracking-wider mb-4 px-2">
                    Support Topics
                  </h3>
                  <div className="space-y-1">
                    {tabs.map((tab) => {
                      const Icon = tab.icon;
                      const isActive = activeTab === tab.id;
                      return (
                        <button
                          key={tab.id}
                          onClick={() => setActiveTab(tab.id)}
                          className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                            isActive
                              ? "bg-[#FACC15] text-[#111820] shadow-lg shadow-[#FACC15]/25"
                              : "text-[#6B7280] hover:bg-[#F8F8F6] hover:text-[#111111]"
                          }`}
                        >
                          <div
                            className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                              isActive
                                ? "bg-[#111820]/10"
                                : "bg-[#F8F8F6]"
                            }`}
                          >
                            <Icon
                              size={18}
                              className={
                                isActive ? "text-[#111820]" : "text-[#6B7280]"
                              }
                            />
                          </div>
                          <span className="flex-1 text-left">{tab.label}</span>
                          {isActive && (
                            <div className="w-1.5 h-6 bg-[#111820] rounded-full" />
                          )}
                        </button>
                      );
                    })}
                  </div>

                  {/* Quick Contact */}
                  <div className="mt-6 pt-6 border-t border-[#E5E7EB]">
                    <h4 className="text-xs font-medium text-[#6B7280] uppercase tracking-wider mb-3">
                      Quick Contact
                    </h4>
                    <div className="space-y-2">
                      <a
                        href={SUPPORT_DESK_URL}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 px-4 py-2.5 bg-[#FACC15]/10 text-[#111820] rounded-xl text-sm font-medium hover:bg-[#FACC15]/20 transition"
                      >
                        <MessageCircle size={18} className="text-[#FACC15]" />
                        Support
                        <ExternalLink size={14} className="ml-auto text-[#6B7280]" />
                      </a>
                    </div>
                  </div>

                  {/* Support Hours */}
                  <div className="mt-4 p-4 bg-gradient-to-br from-[#FFFBEB] to-[#FEF3C7] rounded-xl border border-[#FACC15]/30">
                    <div className="flex items-center gap-2 mb-2">
                      <Clock size={16} className="text-[#FACC15]" />
                      <span className="text-sm font-semibold text-[#111820]">Support Hours</span>
                    </div>
                    <div className="space-y-1 text-xs text-[#6B7280]">
                      <p>Mon-Fri: 9:00 AM - 9:00 PM EST</p>
                      <p>Sat-Sun: 10:00 AM - 6:00 PM EST</p>
                      <p className="text-[#FACC15] font-medium mt-1">
                        ⚡ Average response: &lt; 2 hours
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* ===== RIGHT COLUMN - Content (2/3) ===== */}
              <div className="lg:col-span-2">
                <div className="bg-white rounded-2xl border border-[#E5E7EB] overflow-hidden shadow-sm">
                  
                  {/* ===== CREDENTIALS TAB ===== */}
                  {activeTab === "credentials" && (
                    <div>
                      <div className="bg-gradient-to-r from-[#FACC15] to-[#F59E0B] px-6 py-5">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                            <Key size={20} className="text-[#111820]" />
                          </div>
                          <div>
                            <h2 className="text-xl font-bold text-[#111820]">
                              Login Credentials
                            </h2>
                            <p className="text-[#111820]/70 text-sm">
                              Use these credentials to login to your account
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="p-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                          {/* Email */}
                          <div className="bg-[#F8F9FA] rounded-xl p-5 border border-[#E5E7EB] hover:shadow-md transition">
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="text-xs text-[#6B7280] font-medium uppercase tracking-wider flex items-center gap-2">
                                  <User size={14} className="text-[#6B7280]" />
                                  Login Email
                                </p>
                                <p className="text-base font-bold text-[#111111] mt-2 font-mono break-all">
                                  {userCredentials.loginEmail}
                                </p>
                                <p className="text-xs text-[#6B7280] mt-1">
                                  Your purchase email is your login email
                                </p>
                              </div>
                              <button
                                onClick={() =>
                                  copyToClipboard(
                                    userCredentials.loginEmail,
                                    "Login Email"
                                  )
                                }
                                className="p-2.5 text-[#6B7280] hover:text-[#FACC15] hover:bg-[#FACC15]/10 rounded-xl transition"
                              >
                                <Copy size={18} />
                              </button>
                            </div>
                          </div>

                          {/* Password */}
                          <div className="bg-[#FACC15]/5 rounded-xl p-5 border border-[#FACC15]/20 hover:shadow-md transition">
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="text-xs text-[#6B7280] font-medium uppercase tracking-wider flex items-center gap-2">
                                  <Lock size={14} className="text-[#6B7280]" />
                                  Default Password
                                </p>
                                <p className="text-base font-bold text-[#111111] mt-2 font-mono break-all">
                                  {userCredentials.defaultPassword}
                                </p>
                                <p className="text-xs text-[#6B7280] mt-1">
                                  ⚠️ Your purchase email is your default password
                                </p>
                              </div>
                              <button
                                onClick={() =>
                                  copyToClipboard(
                                    userCredentials.defaultPassword,
                                    "Default Password"
                                  )
                                }
                                className="p-2.5 text-[#6B7280] hover:text-[#FACC15] hover:bg-[#FACC15]/10 rounded-xl transition"
                              >
                                <Copy size={18} />
                              </button>
                            </div>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {/* How to Login */}
                          <div className="bg-[#F8F9FA] rounded-xl p-5 border border-[#E5E7EB]">
                            <div className="flex items-start gap-3">
                              <div className="w-8 h-8 rounded-lg bg-[#FACC15]/20 flex items-center justify-center flex-shrink-0">
                                <LogIn size={16} className="text-[#FACC15]" />
                              </div>
                              <div>
                                <p className="text-sm font-semibold text-[#111111]">
                                  How to Login
                                </p>
                                <ol className="text-sm text-[#6B7280] mt-2 space-y-1.5 list-decimal list-inside">
                                  <li>
                                    Go to{" "}
                                    <strong className="text-[#111111]">
                                      {userCredentials.appUrl}
                                    </strong>
                                  </li>
                                  <li>
                                    Enter your <strong>Login Email</strong>
                                  </li>
                                  <li>
                                    Enter your <strong>Default Password</strong>
                                  </li>
                                  <li>
                                    Click <strong>Login</strong> to access your
                                    dashboard
                                  </li>
                                </ol>
                              </div>
                            </div>
                          </div>

                          {/* Security Tip */}
                          <div className="bg-[#FACC15]/5 rounded-xl p-5 border border-[#FACC15]/20">
                            <div className="flex items-start gap-3">
                              <div className="w-8 h-8 rounded-lg bg-[#FACC15]/20 flex items-center justify-center flex-shrink-0">
                                <Shield size={16} className="text-[#FACC15]" />
                              </div>
                              <div>
                                <p className="text-sm font-semibold text-[#111111]">
                                  Security Tip
                                </p>
                                <p className="text-sm text-[#6B7280] mt-2 leading-relaxed">
                                  For better security, we recommend changing your
                                  password after first login. Go to{" "}
                                  <strong className="text-[#111111]">
                                    Settings → Security → Change Password
                                  </strong>
                                  .
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* ===== FAQ TAB ===== */}
                  {activeTab === "faq" && (
                    <div>
                      <div className="bg-gradient-to-r from-[#FACC15] to-[#F59E0B] px-6 py-5">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                            <HelpCircle size={20} className="text-[#111820]" />
                          </div>
                          <div>
                            <h2 className="text-xl font-bold text-[#111820]">
                              Frequently Asked Questions
                            </h2>
                            <p className="text-[#111820]/70 text-sm">
                              Common questions about logging into your account
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="p-6">
                        {filteredFaqs.length > 0 ? (
                          <div className="space-y-3">
                            {filteredFaqs.map((faq) => (
                              <div
                                key={faq.id}
                                className={`border rounded-xl overflow-hidden transition-all duration-200 ${
                                  expandedFaq === faq.id
                                    ? "border-[#FACC15] shadow-md bg-[#FACC15]/5"
                                    : "border-[#E5E7EB] hover:border-[#FACC15]/50"
                                }`}
                              >
                                <button
                                  onClick={() => toggleFaq(faq.id)}
                                  className="w-full px-5 py-4 text-left flex items-start gap-3 hover:bg-[#F8F8F6]/50 transition"
                                >
                                  <span className="text-2xl mt-0.5 flex-shrink-0">
                                    {faq.icon}
                                  </span>
                                  <span className="text-sm font-medium text-[#111111] pr-4 flex-1">
                                    {faq.question}
                                  </span>
                                  <span
                                    className={`text-[#6B7280] transition-transform duration-300 flex-shrink-0 mt-1 ${
                                      expandedFaq === faq.id
                                        ? "rotate-180 text-[#FACC15]"
                                        : ""
                                    }`}
                                  >
                                    <ChevronDown size={18} />
                                  </span>
                                </button>

                                {expandedFaq === faq.id && (
                                  <div className="px-5 pb-4 pt-0 border-t border-[#E5E7EB]">
                                    <p className="text-sm text-[#6B7280] leading-relaxed whitespace-pre-line">
                                      {faq.answer}
                                    </p>
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-center py-12">
                            <div className="text-5xl mb-4">🔍</div>
                            <p className="text-[#6B7280]">
                              No results found for "<strong>{searchQuery}</strong>"
                            </p>
                            <button
                              onClick={() => setSearchQuery("")}
                              className="mt-3 text-sm text-[#FACC15] hover:text-[#F59E0B] font-medium"
                            >
                              Clear search
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* ===== HELP TOPICS TAB ===== */}
                  {activeTab === "help" && (
                    <div>
                      <div className="bg-gradient-to-r from-[#FACC15] to-[#F59E0B] px-6 py-5">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                            <BookOpen size={20} className="text-[#111820]" />
                          </div>
                          <div>
                            <h2 className="text-xl font-bold text-[#111820]">
                              Help Topics
                            </h2>
                            <p className="text-[#111820]/70 text-sm">
                              Browse through our help articles and guides
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="p-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="p-4 bg-[#F8F9FA] rounded-xl border border-[#E5E7EB] hover:shadow-md transition group cursor-pointer">
                            <div className="flex items-start gap-3">
                              <div className="w-10 h-10 rounded-lg bg-[#FACC15]/20 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition">
                                <User size={18} className="text-[#FACC15]" />
                              </div>
                              <div>
                                <h4 className="text-sm font-semibold text-[#111111]">Account Management</h4>
                                <p className="text-xs text-[#6B7280] mt-1">
                                  Manage your account settings and preferences
                                </p>
                              </div>
                            </div>
                          </div>

                          <div className="p-4 bg-[#F8F9FA] rounded-xl border border-[#E5E7EB] hover:shadow-md transition group cursor-pointer">
                            <div className="flex items-start gap-3">
                              <div className="w-10 h-10 rounded-lg bg-[#FACC15]/20 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition">
                                <Shield size={18} className="text-[#FACC15]" />
                              </div>
                              <div>
                                <h4 className="text-sm font-semibold text-[#111111]">Security & Privacy</h4>
                                <p className="text-xs text-[#6B7280] mt-1">
                                  Learn about security features and data privacy
                                </p>
                              </div>
                            </div>
                          </div>

                          <div className="p-4 bg-[#F8F9FA] rounded-xl border border-[#E5E7EB] hover:shadow-md transition group cursor-pointer">
                            <div className="flex items-start gap-3">
                              <div className="w-10 h-10 rounded-lg bg-[#FACC15]/20 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition">
                                <CreditCard size={18} className="text-[#FACC15]" />
                              </div>
                              <div>
                                <h4 className="text-sm font-semibold text-[#111111]">Billing & Subscriptions</h4>
                                <p className="text-xs text-[#6B7280] mt-1">
                                  Manage your billing and subscription plans
                                </p>
                              </div>
                            </div>
                          </div>

                          <div className="p-4 bg-[#F8F9FA] rounded-xl border border-[#E5E7EB] hover:shadow-md transition group cursor-pointer">
                            <div className="flex items-start gap-3">
                              <div className="w-10 h-10 rounded-lg bg-[#FACC15]/20 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition">
                                <FileText size={18} className="text-[#FACC15]" />
                              </div>
                              <div>
                                <h4 className="text-sm font-semibold text-[#111111]">Product Features</h4>
                                <p className="text-xs text-[#6B7280] mt-1">
                                  Learn about all the features and how to use them
                                </p>
                              </div>
                            </div>
                          </div>

                          <div className="p-4 bg-[#F8F9FA] rounded-xl border border-[#E5E7EB] hover:shadow-md transition group cursor-pointer">
                            <div className="flex items-start gap-3">
                              <div className="w-10 h-10 rounded-lg bg-[#FACC15]/20 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition">
                                <Globe size={18} className="text-[#FACC15]" />
                              </div>
                              <div>
                                <h4 className="text-sm font-semibold text-[#111111]">Integrations</h4>
                                <p className="text-xs text-[#6B7280] mt-1">
                                  Connect with your favorite tools and platforms
                                </p>
                              </div>
                            </div>
                          </div>

                          <div className="p-4 bg-[#F8F9FA] rounded-xl border border-[#E5E7EB] hover:shadow-md transition group cursor-pointer">
                            <div className="flex items-start gap-3">
                              <div className="w-10 h-10 rounded-lg bg-[#FACC15]/20 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition">
                                <Headphones size={18} className="text-[#FACC15]" />
                              </div>
                              <div>
                                <h4 className="text-sm font-semibold text-[#111111]">Getting Started</h4>
                                <p className="text-xs text-[#6B7280] mt-1">
                                  Quick start guides and tutorials for new users
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* ===== CTA ===== */}
                <div className="mt-6 relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#111827] to-[#1a2332] p-8 text-center border border-gray-800/50 shadow-xl">
                  <div className="absolute top-0 right-0 w-48 h-48 bg-[#FACC15]/5 rounded-full blur-2xl"></div>
                  <div className="absolute bottom-0 left-0 w-48 h-48 bg-[#FACC15]/5 rounded-full blur-2xl"></div>

                  <div className="relative z-10">
                    <div className="w-16 h-16 mx-auto bg-[#FACC15]/10 rounded-2xl flex items-center justify-center mb-4">
                      <MessageCircle size={28} className="text-[#FACC15]" />
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-3">
                      Still Need Help?
                    </h3>
                    <p className="text-gray-400 mb-6 max-w-md mx-auto">
                      Our support team is ready to assist you with any questions.
                    </p>
                    <div className="flex flex-wrap gap-4 justify-center">
                      <a
                        href={SUPPORT_DESK_URL}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 bg-[#FACC15] text-[#111820] px-6 py-3 rounded-xl font-bold hover:bg-[#F59E0B] transition shadow-lg hover:shadow-xl"
                      >
                        <MessageCircle size={18} />
                        Support
                        <ArrowRight size={16} />
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Support;