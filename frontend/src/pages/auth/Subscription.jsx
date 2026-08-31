// frontend/src/pages/Subscription.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import Sidebar from "../../components/Sidebar";
import Navbar from "../../components/Navbar";
import api from "../../services/api";
import toast from "react-hot-toast";
import {
  Crown,
  CheckCircle,
  Calendar,
  CreditCard,
  Package,
  Sparkles,
  Zap,
  Shield,
  TrendingUp,
  Users,
  Rocket,
  Settings,
  Headphones,
  Check,
  ArrowRight,
  Clock,
  XCircle,
  RefreshCw,
  AlertCircle,
  ChevronRight,
  Tag,
  Hash,
  CalendarDays,
  Info,
  Eye,
  Download,
  Share2,
  ExternalLink,
  Layers,
  BadgeCheck,
} from "lucide-react";

const Subscription = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [subscription, setSubscription] = useState(null);

  useEffect(() => {
    fetchSubscription();
  }, []);

  const fetchSubscription = async () => {
    try {
      setLoading(true);
      const response = await api.get("/subscription/my-subscription");
      if (response.data?.success) {
        setSubscription(response.data.data);
        console.log("📋 Subscription data:", response.data.data);
      }
    } catch (error) {
      console.error("Error fetching subscription:", error);
      toast.error("Failed to load subscription details");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount || 0);
  };

  // ✅ Get plan icon based on plan ID
  const getPlanIcon = (planId) => {
    const icons = {
      1: "🆓",
      2: "🚀",
      3: "⚡",
      4: "💎",
      5: "👑",
      10: "🤖",
    };
    return icons[planId] || "📦";
  };

  // ✅ Get plan color based on plan ID
  const getPlanColor = (planId) => {
    const colors = {
      1: "bg-gray-100 border-gray-200",
      2: "bg-blue-100 border-blue-200",
      3: "bg-indigo-100 border-indigo-200",
      4: "bg-purple-100 border-purple-200",
      5: "bg-amber-100 border-amber-200",
      10: "bg-rose-100 border-rose-200",
    };
    return colors[planId] || "bg-gray-100 border-gray-200";
  };

  // ✅ Get plan display name from database
  const getPlanDisplayName = (plan) => {
    return plan?.name || `Plan ${plan?.planId || 1}`;
  };

  // ✅ Get status color
  const getStatusColor = (status) => {
    const colors = {
      active: "bg-green-100 text-green-700 border-green-200",
      cancelled: "bg-red-100 text-red-700 border-red-200",
      refunded: "bg-yellow-100 text-yellow-700 border-yellow-200",
      pending: "bg-blue-100 text-blue-700 border-blue-200",
    };
    return colors[status] || colors.active;
  };

  // ✅ Get status icon
  const getStatusIcon = (status) => {
    const icons = {
      active: <CheckCircle size={12} className="text-green-600" />,
      cancelled: <XCircle size={12} className="text-red-600" />,
      refunded: <RefreshCw size={12} className="text-yellow-600" />,
      pending: <Clock size={12} className="text-blue-600" />,
    };
    return icons[status] || icons.active;
  };

  // ✅ Get status message
  const getStatusMessage = (status) => {
    const messages = {
      active: "This plan is currently providing access to your account.",
      cancelled: "This plan has been cancelled and is no longer active.",
      refunded: "This plan has been refunded.",
      pending: "This plan is pending activation.",
    };
    return messages[status] || messages.active;
  };

  // Stats
  const totalSubscriptions = subscription?.allPlans?.length || 0;
  const activeSubscriptions =
    subscription?.allPlans?.filter((p) => p.status === "active").length || 0;
  const cancelledSubscriptions =
    subscription?.allPlans?.filter((p) => p.status === "cancelled").length || 0;
  const refundedSubscriptions =
    subscription?.allPlans?.filter((p) => p.status === "refunded").length || 0;

  if (loading) {
    return (
      <div className="flex h-screen bg-[#f5f6f8]">
        <Sidebar />
        <div className="flex-1 ml-0 md:ml-[18rem] flex flex-col min-h-screen">
          <Navbar />
          <main className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="relative w-16 h-16 mx-auto mb-4">
                <div className="absolute inset-0 border-4 border-[#FACC15]/20 rounded-full"></div>
                <div className="absolute inset-0 border-4 border-[#FACC15] border-t-transparent rounded-full animate-spin"></div>
              </div>
              <p className="text-[#6B7280] text-sm font-medium">
                Loading your subscriptions...
              </p>
            </div>
          </main>
        </div>
      </div>
    );
  }

  if (!subscription) {
    return (
      <div className="flex h-screen bg-[#f5f6f8]">
        <Sidebar />
        <div className="flex-1 ml-0 md:ml-[18rem] flex flex-col min-h-screen">
          <Navbar />
          <main className="flex-1 flex items-center justify-center p-6">
            <div className="text-center max-w-md">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-white border border-[#E5E7EB] shadow-sm mb-6">
                <Package size={36} className="text-[#9CA3AF]" strokeWidth={1.5} />
              </div>
              <h3 className="text-2xl font-bold text-[#111111] mb-3">
                No Subscriptions Found
              </h3>
              <p className="text-[#6B7280] text-sm mb-6 leading-relaxed">
                You don't have any active subscriptions. Choose a plan to get
                started.
              </p>
              <button
                onClick={() => navigate("/upgrades")}
                className="inline-flex items-center gap-2 bg-[#111827] text-white px-6 py-3 rounded-xl font-semibold hover:bg-black transition-all shadow-lg shadow-[#111827]/20 hover:-translate-y-0.5"
              >
                View Plans
                <ArrowRight size={16} />
              </button>
            </div>
          </main>
        </div>
      </div>
    );
  }

  const {
    user: userInfo,
    currentPlan,
    allPlans,
    payments,
    totalPurchased,
    isActive,
  } = subscription;

  return (
    <div className="flex h-screen bg-[#f5f6f8]">
      <Sidebar />
      <div className="flex-1 ml-0 md:ml-[18rem] flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          <div className="max-w-5xl mx-auto">
            {/* ===== HEADER ===== */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-2xl font-bold text-[#111111] tracking-tight">
                  My Subscriptions
                </h1>
                <p className="text-sm text-[#6B7280] mt-1">
                  View all plans connected to your account and their current
                  status.
                </p>
              </div>
              <button
                onClick={() => navigate("/upgrades")}
                className="hidden sm:inline-flex items-center gap-2 text-sm font-semibold text-[#111827] bg-white border border-[#E5E7EB] px-4 py-2.5 rounded-xl hover:border-[#FACC15]/50 hover:shadow-sm transition-all"
              >
                <Layers size={15} className="text-[#B45309]" />
                Compare Plans
              </button>
            </div>

            {/* ===== CURRENT PLAN HERO ===== */}
            {currentPlan && (
              <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#111827] via-[#161b28] to-[#1a1a1a] p-6 md:p-8 mb-6 border border-[#FACC15]/20 shadow-[0_20px_50px_-15px_rgba(0,0,0,0.45)]">
                <div className="absolute top-0 right-0 w-72 h-72 bg-[#FACC15]/10 rounded-full blur-3xl -mr-24 -mt-24"></div>
                <div
                  className="absolute inset-0 opacity-[0.03]"
                  style={{
                    backgroundImage:
                      'linear-gradient(#FACC15 1px, transparent 1px), linear-gradient(90deg, #FACC15 1px, transparent 1px)',
                    backgroundSize: '32px 32px',
                  }}
                ></div>

                <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-2xl bg-white/[0.06] backdrop-blur-sm border border-white/10 flex items-center justify-center text-3xl flex-shrink-0">
                      {getPlanIcon(currentPlan.planId)}
                    </div>
                    <div>
                      <div className="inline-flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-[#FACC15] mb-1.5">
                        <BadgeCheck size={12} />
                        Current Plan
                      </div>
                      <h2 className="text-2xl font-bold text-white">
                        {getPlanDisplayName(currentPlan)}
                      </h2>
                      <p className="text-sm text-gray-400 mt-1">
                        {isActive ? "Active and providing access to your account" : "Not currently active"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-6 md:gap-8 md:pl-6 md:border-l md:border-white/10">
                    <div>
                      <p className="text-[10px] uppercase tracking-wider text-gray-500 font-medium mb-1">
                        Total Purchased
                      </p>
                      <p className="text-xl font-bold text-white tabular-nums">
                        {formatCurrency(totalPurchased)}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] uppercase tracking-wider text-gray-500 font-medium mb-1">
                        Status
                      </p>
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${
                          isActive
                            ? "bg-green-500/10 text-green-400 border-green-500/20"
                            : "bg-gray-500/10 text-gray-400 border-gray-500/20"
                        }`}
                      >
                        {isActive ? <CheckCircle size={12} /> : <Clock size={12} />}
                        {isActive ? "Active" : "Inactive"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ===== STATS ROW ===== */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
              <div className="bg-white rounded-xl border border-[#E5E7EB] p-4 shadow-sm hover:shadow-md transition-all">
                <div className="flex items-center justify-between mb-2">
                  <span className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center">
                    <Package size={14} className="text-gray-500" />
                  </span>
                </div>
                <p className="text-2xl font-bold text-[#111111] tabular-nums">
                  {totalSubscriptions}
                </p>
                <p className="text-xs text-[#6B7280] font-medium mt-0.5">
                  Total Subscriptions
                </p>
              </div>

              <div className="bg-white rounded-xl border border-[#22c55e]/20 p-4 shadow-sm hover:shadow-md transition-all relative overflow-hidden">
                <div className="absolute -right-4 -top-4 w-16 h-16 bg-[#22c55e]/5 rounded-full blur-xl"></div>
                <div className="relative flex items-center justify-between mb-2">
                  <span className="w-8 h-8 rounded-lg bg-[#22c55e]/10 flex items-center justify-center">
                    <CheckCircle size={14} className="text-[#22c55e]" />
                  </span>
                </div>
                <p className="relative text-2xl font-bold text-[#22c55e] tabular-nums">
                  {activeSubscriptions}
                </p>
                <p className="relative text-xs text-[#6B7280] font-medium mt-0.5">Active</p>
              </div>

              <div className="bg-white rounded-xl border border-[#E5E7EB] p-4 shadow-sm hover:shadow-md transition-all">
                <div className="flex items-center justify-between mb-2">
                  <span className="w-8 h-8 rounded-lg bg-red-50 flex items-center justify-center">
                    <XCircle size={14} className="text-[#ef4444]" />
                  </span>
                </div>
                <p className="text-2xl font-bold text-[#ef4444] tabular-nums">
                  {cancelledSubscriptions}
                </p>
                <p className="text-xs text-[#6B7280] font-medium mt-0.5">Cancelled</p>
              </div>

              <div className="bg-white rounded-xl border border-[#E5E7EB] p-4 shadow-sm hover:shadow-md transition-all">
                <div className="flex items-center justify-between mb-2">
                  <span className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center">
                    <RefreshCw size={14} className="text-[#f59e0b]" />
                  </span>
                </div>
                <p className="text-2xl font-bold text-[#f59e0b] tabular-nums">
                  {refundedSubscriptions}
                </p>
                <p className="text-xs text-[#6B7280] font-medium mt-0.5">Refunded</p>
              </div>
            </div>

            {/* ===== SUBSCRIPTION LIST ===== */}
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-[#111111] uppercase tracking-wider">
                Plan History
              </h2>
              <span className="text-xs text-[#6B7280]">{totalSubscriptions} total</span>
            </div>

            <div className="space-y-4">
              {allPlans && allPlans.length > 0 ? (
                allPlans.map((plan, index) => {
                  const statusColor = getStatusColor(plan.status);
                  const statusIcon = getStatusIcon(plan.status);
                  const statusMessage = getStatusMessage(plan.status);
                  const planIcon = getPlanIcon(plan.planId);
                  const planName = getPlanDisplayName(plan);
                  const planColor = getPlanColor(plan.planId);
                  const isCurrent = plan.planId === currentPlan?.planId;

                  // ✅ USE ACTUAL DATES FROM DATABASE
                  const startDate = plan.purchaseDate || plan.createdAt || new Date();
                  const endDate = plan.expiryDate || new Date(new Date(startDate).getTime() + 365 * 24 * 60 * 60 * 1000);

                  // ✅ Use actual source and transaction from database
                  const source = plan.source || "Launchpad";
                  const transactionId =
                    plan.transactionId ||
                    `TXN-${String(plan.planId).padStart(4, "0")}-${String(Date.now() + index).slice(-6)}`;

                  return (
                    <div
                      key={plan.planId}
                      className={`bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-200 ${
                        isCurrent
                          ? "border-2 border-[#FACC15]/50 ring-4 ring-[#FACC15]/10"
                          : "border border-[#E5E7EB] opacity-90 hover:opacity-100"
                      }`}
                    >
                      {/* ===== PLAN HEADER ===== */}
                      <div className="px-6 py-4 border-b border-[#E5E7EB] flex items-center justify-between bg-gradient-to-r from-white to-[#F8F9FA]">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg border ${planColor}`}>
                            {planIcon}
                          </div>
                          <div>
                            <h3 className="text-base font-semibold text-[#111111] flex items-center gap-2">
                              {planName}
                              {isCurrent && (
                                <span className="px-2 py-0.5 bg-[#FACC15] text-[#111820] text-[10px] font-bold rounded-full flex items-center gap-1">
                                  <Zap size={10} className="fill-current" />
                                  Current
                                </span>
                              )}
                            </h3>
                            <div className="flex items-center gap-3 mt-0.5">
                              <p className="text-xs text-[#6B7280] flex items-center gap-1">
                                <Hash size={10} className="text-[#6B7280]" />
                                Plan ID: {plan.planId}
                              </p>
                              <span className="w-1 h-1 rounded-full bg-[#E5E7EB]"></span>
                              <p className="text-xs text-[#6B7280] flex items-center gap-1">
                                <Package size={10} className="text-[#6B7280]" />
                                {plan.validityDays || 365} days
                              </p>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-medium border flex items-center gap-1.5 ${statusColor}`}
                          >
                            {statusIcon}
                            {plan.status || "Active"}
                          </span>
                        </div>
                      </div>

                      {/* ===== PLAN DETAILS ===== */}
                      <div className="px-6 py-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {/* Left Column - Dates */}
                          <div className="space-y-2.5">
                            <div className="flex items-center gap-2.5 p-2 rounded-lg bg-[#F8F9FA] hover:bg-[#F3F4F6] transition">
                              <div className="w-7 h-7 rounded-lg bg-[#FACC15]/10 flex items-center justify-center flex-shrink-0">
                                <Calendar size={13} className="text-[#B45309]" />
                              </div>
                              <div>
                                <p className="text-[10px] text-[#6B7280] font-medium uppercase tracking-wider">
                                  Started
                                </p>
                                <p className="text-xs font-medium text-[#111111]">
                                  {formatDate(startDate)}
                                </p>
                              </div>
                            </div>

                            <div className="flex items-center gap-2.5 p-2 rounded-lg bg-[#F8F9FA] hover:bg-[#F3F4F6] transition">
                              <div className="w-7 h-7 rounded-lg bg-[#22c55e]/10 flex items-center justify-center flex-shrink-0">
                                <CalendarDays size={13} className="text-[#22c55e]" />
                              </div>
                              <div>
                                <p className="text-[10px] text-[#6B7280] font-medium uppercase tracking-wider">
                                  Valid Until
                                </p>
                                <p className="text-xs font-medium text-[#111111]">
                                  {formatDate(endDate)}
                                </p>
                              </div>
                            </div>
                          </div>

                          {/* Right Column - Source & Transaction */}
                          <div className="space-y-2.5">
                            <div className="flex items-center gap-2.5 p-2 rounded-lg bg-[#F8F9FA] hover:bg-[#F3F4F6] transition">
                              <div className="w-7 h-7 rounded-lg bg-[#8b5cf6]/10 flex items-center justify-center flex-shrink-0">
                                <Tag size={13} className="text-[#8b5cf6]" />
                              </div>
                              <div>
                                <p className="text-[10px] text-[#6B7280] font-medium uppercase tracking-wider">
                                  Source
                                </p>
                                <p className="text-xs font-medium text-[#111111]">
                                  {source}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2.5 p-2 rounded-lg bg-[#F8F9FA] hover:bg-[#F3F4F6] transition">
                              <div className="w-7 h-7 rounded-lg bg-[#f59e0b]/10 flex items-center justify-center flex-shrink-0">
                                <Hash size={13} className="text-[#f59e0b]" />
                              </div>
                              <div>
                                <p className="text-[10px] text-[#6B7280] font-medium uppercase tracking-wider">
                                  Transaction
                                </p>
                                <p className="text-xs font-medium text-[#111111] font-mono">
                                  {transactionId}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* ===== STATUS MESSAGE ===== */}
                        <div className="mt-4 pt-4 border-t border-[#E5E7EB]">
                          <div className="flex items-start gap-2.5 p-3 rounded-xl bg-gradient-to-r from-[#F8F9FA] to-white border border-[#E5E7EB]">
                            <div className="w-7 h-7 rounded-lg bg-[#3b82f6]/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                              <Info size={13} className="text-[#3b82f6]" />
                            </div>
                            <div>
                              <p className="text-[10px] text-[#6B7280] font-medium uppercase tracking-wider">
                                Status Message
                              </p>
                              <p className="text-xs text-[#6B7280] leading-relaxed">
                                {statusMessage}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="bg-white rounded-xl border border-[#E5E7EB] p-12 text-center">
                  <Package
                    size={48}
                    className="mx-auto text-[#6B7280] opacity-20 mb-4"
                  />
                  <p className="text-[#6B7280] text-sm">
                    No subscriptions found
                  </p>
                </div>
              )}
            </div>

            {/* ===== FOOTER ===== */}
            <div className="mt-8 flex items-center justify-center gap-2 text-center">
              <Headphones size={14} className="text-[#B45309]" />
              <p className="text-xs text-[#6B7280]">
                Need help with your subscriptions?{" "}
                <a href="/support" className="text-[#B45309] font-medium hover:underline">
                  Contact Support
                </a>
              </p>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Subscription;