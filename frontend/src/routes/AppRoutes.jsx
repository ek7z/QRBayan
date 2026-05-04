import { Routes, Route, Navigate } from "react-router-dom";
import ProtectedRoute from "../components/ProtectedRoute";
import DashboardLayout from "../layouts/DashboardLayout";
import LoginPage from "../pages/LoginPage";
import RegisterPage from "../pages/RegisterPage";
import DashboardPage from "../pages/DashboardPage";
import BuyCreditsPage from "../pages/BuyCreditsPage";
import AdminPanel from "../pages/AdminPanel";
import HistoryPage from "../pages/HistoryPage";
import UtilityQrPage from "../pages/UtilityQrPage";
import TaskPage from "../pages/TaskPage";

const AppRoutes = () => {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      {/* Protected Dashboard Routes */}
      <Route element={<ProtectedRoute />}>
        <Route element={<DashboardLayout />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/history" element={<HistoryPage />} />
          <Route path="/buy-credits" element={<BuyCreditsPage />} />
          <Route path="/utility-qr" element={<UtilityQrPage />} />
          <Route path="/tasks" element={<TaskPage />} />
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
        </Route>
      </Route>

      {/* Admin Routes */}
      <Route element={<ProtectedRoute adminOnly={true} />}>
        <Route element={<DashboardLayout />}>
          <Route path="/admin" element={<AdminPanel />} />
        </Route>
      </Route>

      {/* 404 Redirect */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
};

export default AppRoutes;
