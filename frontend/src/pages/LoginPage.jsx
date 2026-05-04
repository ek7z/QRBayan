import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Link, useNavigate } from "react-router-dom";
import api from "../api/axios";
import useAuthStore from "../store/useAuthStore";
import { LogIn, Loader2, AlertCircle, Mail, Lock } from "lucide-react";

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

const LoginPage = () => {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const setAuth = useAuthStore((state) => state.setAuth);
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data) => {
    setLoading(true);
    setError("");
    try {
      const response = await api.post("/auth/login", data);
      const { user, token } = response.data.data;
      setAuth(user, token);
      navigate("/dashboard");
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Login failed. Please check your credentials.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="mb-10 flex justify-center">
          <div className="flex h-24 w-full max-w-sm items-center justify-center overflow-hidden rounded-2xl bg-white px-4 shadow-lg shadow-blue-950/20">
            <img
              src="/1.png"
              alt="QRBayan"
              className="h-full w-full object-contain"
            />
          </div>
        </div>

        {/* Card */}
        <div className="bg-slate-900/50 border border-slate-800/50 rounded-2xl p-8">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-white mb-1">Welcome back</h1>
            <p className="text-slate-400 text-sm">Sign in to your account</p>
          </div>

          {error && (
            <div className="mb-6 p-3 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl flex items-center text-sm">
              <AlertCircle className="w-4 h-4 mr-2 shrink-0" />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div className="space-y-1.5">
              <label className="text-sm text-slate-300 font-medium">
                Email
              </label>
              <div className="relative">
                <input
                  type="email"
                  {...register("email")}
                  className={`w-full pl-10 pr-4 py-3 bg-slate-800/50 border rounded-xl text-white placeholder:text-slate-500 focus:ring-2 focus:ring-blue-500/40 outline-none transition-all ${
                    errors.email
                      ? "border-red-500/50"
                      : "border-slate-700/50 focus:border-blue-500"
                  }`}
                  placeholder="you@example.com"
                />
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              </div>
              {errors.email && (
                <p className="text-xs text-red-400">{errors.email.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <label className="text-sm text-slate-300 font-medium">
                Password
              </label>
              <div className="relative">
                <input
                  type="password"
                  {...register("password")}
                  className={`w-full pl-10 pr-4 py-3 bg-slate-800/50 border rounded-xl text-white placeholder:text-slate-500 focus:ring-2 focus:ring-blue-500/40 outline-none transition-all ${
                    errors.password
                      ? "border-red-500/50"
                      : "border-slate-700/50 focus:border-blue-500"
                  }`}
                  placeholder="••••••••"
                />
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              </div>
              {errors.password && (
                <p className="text-xs text-red-400">
                  {errors.password.message}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-500 text-white font-semibold py-3 rounded-xl transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <LogIn className="w-4 h-4" />
                  Sign In
                </>
              )}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-400">
            Don't have an account?{" "}
            <Link
              to="/register"
              className="text-blue-400 hover:text-blue-300 font-medium"
            >
              Register
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
