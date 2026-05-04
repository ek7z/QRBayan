import { Suspense, lazy } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import ProtectedRoute from "../components/ProtectedRoute";

const DashboardLayout = lazy(() => import("../layouts/DashboardLayout"));
const LoginPage = lazy(() => import("../pages/LoginPage"));
const RegisterPage = lazy(() => import("../pages/RegisterPage"));
const DashboardPage = lazy(() => import("../pages/DashboardPage"));
const BuyCreditsPage = lazy(() => import("../pages/BuyCreditsPage"));
const AdminPanel = lazy(() => import("../pages/AdminPanel"));
const HistoryPage = lazy(() => import("../pages/HistoryPage"));
const UtilityQrPage = lazy(() => import("../pages/UtilityQrPage"));
const TaskPage = lazy(() => import("../pages/TaskPage"));

const AppRoutes = () => {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-slate-950 text-sm text-slate-400">
          Loading...
        </div>
      }
    >
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route element={<DashboardLayout />}>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/utility-qr" element={<UtilityQrPage />} />

          {/* Protected Dashboard Routes */}
          <Route element={<ProtectedRoute />}>
            <Route path="/history" element={<HistoryPage />} />
            <Route path="/buy-credits" element={<BuyCreditsPage />} />
            <Route path="/tasks" element={<TaskPage />} />
          </Route>

          {/* Admin Routes */}
          <Route element={<ProtectedRoute adminOnly={true} />}>
            <Route path="/admin" element={<AdminPanel />} />
          </Route>
        </Route>

        {/* 404 Redirect */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Suspense>
  );
};

export default AppRoutes;
