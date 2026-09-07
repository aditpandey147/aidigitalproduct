// frontend/src/components/Sidebar.jsx
import React, { useState, useEffect, useRef } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import logo from "../assets/nav-logo.png";
import api from "../services/api";
import {
  LayoutDashboard,
  Plus,
  Box,
  Crown,
  ArrowRightLeft,
  ChartLine,
  Images,
  Video,
  DollarSign,
  GraduationCap,
  Rocket,
  Headset,
  Shield,
  Settings,
  LogOut,
  ChevronDown,
  Sparkles,
  Menu,
  X,
  FolderOpen,
  Gift,
  Lightbulb,
} from "lucide-react";

const Sidebar = () => {
  const { logout, user, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [planName, setPlanName] = useState(user?.planName || "Free");
  const [planLoading, setPlanLoading] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const dropdownRef = useRef(null);
  const sidebarRef = useRef(null);

  // ✅ Check if user is reseller (has plan 13)
  const isReseller = () => {
    const userPlans = user?.planId || [1];
    return userPlans.some((plan) => plan === 13);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Close mobile sidebar when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        isMobileOpen &&
        sidebarRef.current &&
        !sidebarRef.current.contains(event.target)
      ) {
        setIsMobileOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isMobileOpen]);

  // Prevent body scroll when mobile sidebar is open
  useEffect(() => {
    if (isMobileOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isMobileOpen]);

  // Fetch plan name
  useEffect(() => {
    const fetchPlanName = async () => {
      if (!user?.planId) return;

      try {
        setPlanLoading(true);
        const response = await api.get("/plans");
        if (response.data && response.data.length > 0) {
          const planIds = user.planId || [1];
          const highestPlanId = Math.max(...planIds);
          const plan = response.data.find((p) => p.planId === highestPlanId);
          if (plan) {
            setPlanName(plan.name);
          } else {
            setPlanName(user?.planName || "Free");
          }
        }
      } catch (error) {
        console.error("Failed to fetch plan name:", error);
        setPlanName(user?.planName || "Free");
      } finally {
        setPlanLoading(false);
      }
    };

    fetchPlanName();
  }, [user?.planId]);

  // ✅ Get user's plans array
  const userPlans = user?.planId || [1];
  const highestPlanId = Math.max(...userPlans);

  // ✅ Helper: Check if user has purchased a specific plan
  const hasPlan = (planId) => {
    if (isAdmin) return true;
    return userPlans.includes(planId);
  };

  // ✅ Helper: Check if user has ANY of these plans
  const hasAnyPlan = (planIds) => {
    if (isAdmin) return true;
    return planIds.some((id) => userPlans.includes(id));
  };

  // ✅ Helper: Check if user has plan OR higher
  const hasPlanOrHigher = (minPlanId) => {
    if (isAdmin) return true;
    return userPlans.some((id) => id >= minPlanId);
  };

  // ✅ NAVIGATION ITEMS - Based on purchased plans
  const navItems = [
    // ===== ✅ ALL PLANS - Always show =====
    {
      path: "/dashboard",
      label: "Dashboard",
      icon: LayoutDashboard,
      show: true,
    },
    {
      path: "/topic-finder",
      label: "Topic Finder",
      icon: Lightbulb,
      show: true,
    },
    {
      path: "/create",
      label: "Create Product",
      icon: Plus,
      show: true,
    },
    {
      path: "/products",
      label: "My Products",
      icon: Box,
      show: true,
    },
    {
      path: "/unlimited",
      icon: Crown,
      label: "Unlimited",
      show: hasAnyPlan([3,4]),
    },
    {
      path: "/cover-design",
      label: "Cover Design",
      icon: Images,
      show: hasAnyPlan([5]),
    },
    {
      path: "/aiseals",
      label: "AI Seals Machine",
      icon: Sparkles,
      show: hasAnyPlan([6,7]),
    },
    {
      path: "/dfy-templates",
      label: "DFY Templates",
      icon: FolderOpen,
      show: hasAnyPlan([8,9]),
    },

    {
      path: "/ai-ranker",
      icon: ChartLine,
      label: "AI Ranker",
      show: hasAnyPlan([10]),
    },
    {
      path: "/ai-profit-machine",
      label: "AI Profit Machine",
      icon: DollarSign,
      show: hasPlan(11,12),
    },
    // ✅ RESELLER - Show for plan 13 or admin
    {
      path: "/reseller",
      label: "Reseller",
      icon: Gift,
      show: hasPlan(13) || isAdmin,
    },
    {
      path: "/training",
      icon: GraduationCap,
      label: "Training",
      show: true,
      target: "_blank",
    },
    {
      path: "/upgrades",
      icon: Rocket,
      label: "Upgrades",
      show: true,
      target: "_blank",
      external: true,
      href: "https://www.aidigitalproduct.live/upgrades",
    },
    {
      path: "/support",
      icon: Headset,
      label: "Support",
      show: true,
      target: "_blank",
    },
  ];

  const adminNavItem = {
    path: "/admin/dashboard",
    label: "Admin Panel",
    icon: Shield,
  };

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const toggleMobileSidebar = () => {
    setIsMobileOpen(!isMobileOpen);
  };

  const closeMobileSidebar = () => {
    setIsMobileOpen(false);
  };

  const getPlanColor = (planName) => {
    const planColors = {
      Free: "bg-gray-100 text-gray-600",
      FE: "bg-blue-100 text-blue-600",
      "FE + TURBO": "bg-indigo-100 text-indigo-600",
      "Unlimited Silver": "bg-gray-200 text-gray-700",
      "Unlimited Gold": "bg-amber-100 text-amber-700",
      "Cover Design Suite": "bg-purple-100 text-purple-600",
      "AI Sales Machine Silver": "bg-purple-200 text-purple-700",
      "AI Sales Machine Gold": "bg-purple-300 text-purple-800",
      "DFY Silver": "bg-gray-300 text-gray-800",
      "DFY Gold": "bg-yellow-100 text-yellow-700",
      "AI Ranker": "bg-emerald-100 text-emerald-600",
      "AI Profit Macker Lite": "bg-rose-100 text-rose-600",
      "AI Profit Macker Pro": "bg-rose-200 text-rose-700",
      RESELLER: "bg-amber-200 text-amber-800",
    };
    return planColors[planName] || "bg-gray-100 text-gray-600";
  };

  const getPlanIcon = (planName) => {
    const planIcons = {
      Free: "fa-box",
      FE: "fa-rocket",
      "FE + TURBO": "fa-bolt",
      "Unlimited Silver": "fa-infinity",
      "Unlimited Gold": "fa-crown",
      "Cover Design Suite": "fa-palette",
      "AI Sales Machine Silver": "fa-robot",
      "AI Sales Machine Gold": "fa-robot",
      "DFY Silver": "fa-wrench",
      "DFY Gold": "fa-wrench",
      "AI Ranker": "fa-chart-line",
      "AI Profit Macker Lite": "fa-money-bill-wave",
      "AI Profit Macker Pro": "fa-money-bill-wave",
      RESELLER: "fa-gift",
    };
    return planIcons[planName] || "fa-box";
  };

  const visibleNavItems = navItems.filter((item) => item.show);

  const isExternalLink = (item) => {
    return item.external === true;
  };

  return (
    <>
      {/* ✅ Mobile Hamburger Button */}
      <button
        onClick={toggleMobileSidebar}
        className="fixed top-4 left-4 z-50 md:hidden p-2 rounded-xl bg-white shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-200"
        aria-label="Toggle menu"
      >
        {isMobileOpen ? (
          <X size={22} className="text-[#111827]" />
        ) : (
          <Menu size={22} className="text-[#111827]" />
        )}
      </button>

      {/* ✅ Mobile Overlay */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm md:hidden animate-fade-in"
          onClick={closeMobileSidebar}
        />
      )}

      {/* ✅ Desktop Sidebar - Fixed */}
      <aside
        ref={sidebarRef}
        className={`
          hidden md:flex md:flex-col md:w-72 bg-white shadow-2xl h-screen fixed left-0 top-0 border-r border-gray-100/80
          ${isMobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
          shadow-xl md:shadow-none
        `}
      >
        {/* Logo Section */}
        <div className="flex h-[72px] md:h-[96px] items-center justify-between border-b border-[#e7e9ed] px-4 md:px-7">
          <img
            src={logo}
            alt="AI Digital Product Factory"
            className="h-[50px] md:h-[75px] w-auto object-contain"
          />

          {/* Mobile Close Button inside sidebar */}
          <button
            onClick={closeMobileSidebar}
            className="md:hidden p-1.5 rounded-lg hover:bg-gray-100 transition"
            aria-label="Close menu"
          >
            <X size={20} className="text-[#6B7280]" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-3 md:px-5 pt-3 md:pt-4 pb-4">
          {/* Admin Panel Link */}
          {user?.role === "admin" && (
            <>
              <NavLink
                to={adminNavItem.path}
                className={({ isActive }) =>
                  `flex h-[44px] md:h-[48px] w-full items-center rounded-[8px] px-2.5 text-left transition-all duration-200 ${
                    isActive
                      ? "bg-[#fff1c9] text-[#15191e]"
                      : "text-[#252b33] hover:bg-[#f7f8fa]"
                  }`
                }
              >
                <Shield
                  size={20}
                  strokeWidth={1.8}
                  className="mr-3 md:mr-4 shrink-0 transition-colors duration-200"
                />
                <span className="text-[13px] md:text-[14px] font-medium">
                  {adminNavItem.label}
                </span>
              </NavLink>
            </>
          )}

          {/* Main Navigation */}
          <div className="space-y-0.5">
            {visibleNavItems.map((item) => {
              const Icon = item.icon;

              if (isExternalLink(item)) {
                return (
                  <a
                    key={item.path}
                    href={item.href}
                    target={item.target || "_blank"}
                    rel="noopener noreferrer"
                    className="flex h-[44px] md:h-[48px] w-full items-center rounded-[8px] px-2.5 text-left transition text-[#252b33] hover:bg-[#f7f8fa]"
                  >
                    <Icon
                      size={20}
                      strokeWidth={1.8}
                      className="mr-3 md:mr-4 shrink-0"
                    />
                    <span className="text-[13px] md:text-[14px] font-medium">
                      {item.label}
                    </span>
                  </a>
                );
              }

              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={closeMobileSidebar}
                  className={({ isActive }) =>
                    `flex h-[44px] md:h-[48px] w-full items-center rounded-[8px] px-2.5 text-left transition ${
                      isActive
                        ? "bg-[#fff1c9] text-[#15191e]"
                        : "text-[#252b33] hover:bg-[#f7f8fa]"
                    }`
                  }
                >
                  <Icon
                    size={20}
                    strokeWidth={1.8}
                    className="mr-3 md:mr-4 shrink-0"
                  />
                  <span className="text-[13px] md:text-[14px] font-medium">
                    {item.label}
                  </span>
                </NavLink>
              );
            })}
          </div>
        </nav>

        {/* User Info */}
        <div className="px-3 md:px-5 pb-4 md:pb-5 border-t border-[#e7e9ed]">
          {/* User Profile */}
          <div
            className="relative mt-4 md:mt-6 flex items-center px-1 py-1.5 rounded-xl cursor-pointer hover:bg-gray-50/50 transition-all duration-200 shadow-sm hover:shadow-md"
            onClick={toggleDropdown}
          >
            <div className="relative">
              <div className="h-9 w-9 md:h-10 md:w-10 overflow-hidden rounded-full bg-gradient-to-br from-[#FACC15]/20 to-[#F59E0B]/10 shadow-md ring-2 ring-[#FACC15]/30">
                <div className="flex h-full items-center justify-center text-[16px] md:text-[18px] font-bold text-[#111827]">
                  {user?.name?.charAt(0)?.toUpperCase() || "U"}
                </div>
              </div>
              <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 md:w-3.5 md:h-3.5 bg-green-400 border-2 border-white rounded-full shadow-md"></span>
            </div>
            <div className="ml-2.5 md:ml-3 flex-1 min-w-0">
              <div className="text-[12px] md:text-[13px] font-semibold text-[#11151a] truncate">
                {user?.name || "User"}
              </div>
              <div className="mt-1 flex items-center gap-1">
                {planLoading ? (
                  <span className="text-[9px] md:text-[10px] text-gray-400">
                    Loading plan...
                  </span>
                ) : (
                  <>
                    <span
                      className={`inline-flex items-center gap-1.5 text-[9px] md:text-[10px] font-medium px-2 md:px-2.5 py-0.5 md:py-1 rounded-full ${getPlanColor(planName)} shadow-sm truncate max-w-[120px] md:max-w-none`}
                    >
                      <i
                        className={`fas ${getPlanIcon(planName)} text-[7px] md:text-[8px] flex-shrink-0`}
                      ></i>
                      <span className="truncate">
                        {planName?.replace(/^Complyzo\s+/, "") ||
                          planName ||
                          "Free"}
                      </span>
                    </span>
                    {isReseller() && (
                      <span className="text-[8px] md:text-[9px] font-semibold text-amber-700 bg-amber-100 px-1.5 py-0.5 rounded-full border border-amber-200 whitespace-nowrap">
                        🚀 Reseller
                      </span>
                    )}
                    {isAdmin && (
                      <span className="text-[8px] md:text-[9px] font-semibold text-red-600 bg-red-50 px-1.5 py-0.5 rounded-full border border-red-200 whitespace-nowrap">
                        Admin
                      </span>
                    )}
                  </>
                )}
              </div>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleDropdown();
              }}
              className="ml-auto p-1 md:p-1.5 rounded-lg hover:bg-gray-100/70 transition-all duration-200 flex-shrink-0"
            >
              <ChevronDown
                size={15}
                className={`text-[#161a20] transition-transform duration-200 ${isDropdownOpen ? "rotate-180" : ""}`}
              />
            </button>
          </div>

          {/* Dropdown Menu */}
          {isDropdownOpen && (
            <div
              ref={dropdownRef}
              className="absolute bottom-[160px] md:bottom-[180px] left-3 md:left-5 right-3 md:right-5 bg-white rounded-xl shadow-2xl border border-gray-100 overflow-hidden animate-slide-up z-50"
            >
              <div className="p-1.5 md:p-2">
                <NavLink
                  to="/settings"
                  onClick={() => {
                    setIsDropdownOpen(false);
                    closeMobileSidebar();
                  }}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-gray-600 hover:bg-[#FACC15]/10 hover:text-[#111827] transition-all duration-200"
                >
                  <Settings size={18} className="text-[#6B7280]" />
                  <span className="font-medium">Settings</span>
                </NavLink>

                <NavLink
                  to="/subscription"
                  onClick={() => {
                    setIsDropdownOpen(false);
                    closeMobileSidebar();
                  }}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-gray-600 hover:bg-[#FACC15]/10 hover:text-[#111827] transition-all duration-200"
                >
                  <Crown size={18} className="text-[#6B7280]" />
                  <span className="font-medium">Subscription</span>
                </NavLink>

                <NavLink
                  to="/support"
                  onClick={() => {
                    setIsDropdownOpen(false);
                    closeMobileSidebar();
                  }}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-gray-600 hover:bg-[#FACC15]/10 hover:text-[#111827] transition-all duration-200"
                >
                  <Headset size={18} className="text-[#6B7280]" />
                  <span className="font-medium">Support</span>
                </NavLink>

                <div className="h-px bg-gray-100 my-1"></div>

                <button
                  onClick={() => {
                    handleLogout();
                    closeMobileSidebar();
                  }}
                  className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm text-red-600 hover:bg-red-50 transition-all duration-200"
                >
                  <LogOut size={18} />
                  <span className="font-medium">Logout</span>
                  <span className="ml-auto text-[10px] text-red-400">→</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </aside>

      {/* ✅ Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-lg border-t border-gray-200/80 shadow-lg z-30">
        <div className="flex justify-around items-center py-1.5 px-2">
          {visibleNavItems.slice(0, 5).map((item) => {
            const Icon = item.icon;
            if (isExternalLink(item)) {
              return (
                <a
                  key={item.path}
                  href={item.href}
                  target={item.target || "_blank"}
                  rel="noopener noreferrer"
                  className="flex flex-col items-center py-1.5 px-2 rounded-xl transition-all duration-200 text-gray-400 hover:text-[#FACC15] active:scale-95 min-w-[50px]"
                >
                  <Icon size={20} strokeWidth={1.8} />
                  <span className="text-[8px] font-medium mt-0.5 truncate max-w-[50px]">
                    {item.label.split(" ")[0]}
                  </span>
                </a>
              );
            }
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex flex-col items-center py-1.5 px-2 rounded-xl transition-all duration-200 active:scale-95 min-w-[50px] ${
                    isActive
                      ? "text-[#FACC15] bg-[#FACC15]/10"
                      : "text-gray-400 hover:text-[#FACC15]"
                  }`
                }
              >
                <Icon size={20} strokeWidth={1.8} />
                <span className="text-[8px] font-medium mt-0.5 truncate max-w-[50px]">
                  {item.label.split(" ")[0]}
                </span>
              </NavLink>
            );
          })}
        </div>
      </nav>

      <style>{`
        @keyframes slide-up {
          from {
            opacity: 0;
            transform: translateY(10px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
        .animate-slide-up {
          animation: slide-up 0.2s ease-out forwards;
        }
        @keyframes fade-in {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        .animate-fade-in {
          animation: fade-in 0.25s ease-out forwards;
        }
      `}</style>
    </>
  );
};

export default Sidebar;
