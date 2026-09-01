// App.jsx
import React from "react";
import { Routes, Route, useLocation, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "./context/AuthContext";
import { AIProfitProvider } from "./context/AIProfitContext";
import PrivateRoute from "./components/PrivateRoute";
import HomeNavbar from "./components/HomeNavbar";
import Footer from "./components/Footer";

// Auth
import Login from "./pages/auth/Login";
import Signup from "./pages/auth/Signup";
import ForgotPassword from "./pages/auth/ForgotPassword";
import ResetPassword from "./pages/auth/ResetPassword";
import Subscription from "./pages/auth/Subscription";

//Pages
import Dashboard from "./pages/Dashboard";
import TopicFinder from './pages/TopicFinder';
import ProductList from "./pages/ProductList";
import CreateProduct from "./pages/CreateProduct";
import ProductEditor from "./pages/ProductEditor";

//Admin
import AdminDashboard from "./pages/admin/Dashboard";

//oto's//
import Unlimited from "./pages/otos/Unlimited";
import AIProfitMachine from "./pages/profit/AIProfitMachine";
import AIProfitChat from "./pages/profit/AIProfitChat";
import AIRanker from "./pages/ranker/AIRanker";
import AIRankerChat from "./pages/ranker/AIRankerChat";
import CoverDesign from "./pages/otos/CoverDesign";
import AISealsMachine from "./pages/otos/AISealsMachine";
import Reseller from "./pages/otos/Reseller";

// ots's dfy
import DfyTemplates from "./pages/otos/DfyTemplates";

//Support
import Training from "./pages/support/Training";
import Support from "./pages/support/Support";
import Settings from "./pages/Settings";

// ✅ Layout component
const Layout = ({ children }) => {
  const location = useLocation();

  // ✅ Pages that should NOT show HomeNavbar and Footer
  const dashboardPages = [
    "/dashboard",
    "/products",
    "/create",
    "/create-product", // ✅ ADD THIS
    "/products/:productId",
    "/admin/dashboard",
    "/ai-profit-machine",
    "/dfy-templates",
    "/ai-ranker",
    "/unlimited",
    "/training",
    "/support",
    "/cover-design",
    "/aiseals",
    "/settings",
    "/subscription",
    "/reseller",
    "/topic-finder",
  ];

  // ✅ Check if current path is a dashboard page
  const isDashboardPage =
    dashboardPages.includes(location.pathname) ||
    location.pathname.startsWith("/ai-profit-machine/chat/") ||
    location.pathname.startsWith("/ai-ranker/chat/") ||
    location.pathname.startsWith("/products/");

  // ✅ Pages that should NOT show any navbar
  const authPages = [
    "/login",
    "/signup",
    "/forgot-password",
    "/reset-password",
  ];
  const isAuthPage =
    authPages.includes(location.pathname) ||
    location.pathname.startsWith("/reset-password/");

  return (
    <>
      {!isDashboardPage && !isAuthPage && <HomeNavbar />}
      <div className={!isDashboardPage && !isAuthPage ? "pt-14" : ""}>
        {children}
      </div>
      {!isDashboardPage && !isAuthPage && <Footer />}
    </>
  );
};

function App() {
  return (
    <AuthProvider>
      <AIProfitProvider>
        <Toaster position="top-right" />
        <Layout>
          <Routes>
            {/* ✅ REDIRECT root (/) to /login */}
            <Route path="/" element={<Navigate to="/login" replace />} />

            {/* Auth Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password/:token" element={<ResetPassword />} />
            <Route path="/support" element={<Support />} />

            {/* Protected Dashboard Routes */}
            <Route
              path="/dashboard"
              element={
                <PrivateRoute>
                  <Dashboard />
                </PrivateRoute>
              }
            />

            <Route
             path="/topic-finder" 
             element={
              <PrivateRoute>
                <TopicFinder/>
              </PrivateRoute>
            } />

            <Route
              path="/products"
              element={
                <PrivateRoute>
                  <ProductList />
                </PrivateRoute>
              }
            />

            {/* ✅ Keep both /create and /create-product */}
            <Route
              path="/create"
              element={
                <PrivateRoute>
                  <CreateProduct />
                </PrivateRoute>
              }
            />

            {/* ✅ ADD THIS ROUTE */}
            <Route
              path="/create-product"
              element={
                <PrivateRoute>
                  <CreateProduct />
                </PrivateRoute>
              }
            />

            <Route
              path="/products/:productId"
              element={
                <PrivateRoute>
                  <ProductEditor />
                </PrivateRoute>
              }
            />

            <Route
              path="/unlimited"
              element={
                <PrivateRoute>
                  <Unlimited />
                </PrivateRoute>
              }
            />
            <Route
              path="/ai-ranker"
              element={
                <PrivateRoute>
                  <AIRanker />
                </PrivateRoute>
              }
            />
            <Route
              path="/ai-ranker/chat/:chatId"
              element={
                <PrivateRoute>
                  <AIRankerChat />
                </PrivateRoute>
              }
            />
            <Route
              path="/cover-design"
              element={
                <PrivateRoute>
                  <CoverDesign />
                </PrivateRoute>
              }
            />
            <Route
              path="/aiseals"
              element={
                <PrivateRoute>
                  <AISealsMachine />
                </PrivateRoute>
              }
            />
            <Route
              path="/admin/dashboard"
              element={
                <PrivateRoute>
                  <AdminDashboard />
                </PrivateRoute>
              }
            />
            <Route
              path="/ai-profit-machine"
              element={
                <PrivateRoute>
                  <AIProfitMachine />
                </PrivateRoute>
              }
            />
            <Route
              path="/ai-profit-machine/chat/:chatId"
              element={
                <PrivateRoute>
                  <AIProfitChat />
                </PrivateRoute>
              }
            />

            {/* ✅ DFY Visual Library Route */}
            <Route
              path="/dfy-templates"
              element={
                <PrivateRoute>
                  <DfyTemplates />
                </PrivateRoute>
              }
            />

            <Route
              path="/reseller"
              element={
                <PrivateRoute>
                  <Reseller />
                </PrivateRoute>
              }
            />

            <Route
              path="/subscription"
              element={
                <PrivateRoute>
                  <Subscription />
                </PrivateRoute>
              }
            />

            <Route
              path="/training"
              element={
                <PrivateRoute>
                  <Training />
                </PrivateRoute>
              }
            />
            <Route
              path="/settings"
              element={
                <PrivateRoute>
                  <Settings />
                </PrivateRoute>
              }
            />
          </Routes>
        </Layout>
      </AIProfitProvider>
    </AuthProvider>
  );
}

export default App;
