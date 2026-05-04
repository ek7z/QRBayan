import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Link, useNavigate } from "react-router-dom";
import api from "../api/axios";
import {
  UserPlus,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Mail,
  Lock,
} from "lucide-react";

const registerSchema = z
  .object({
    email: z.string().email("Invalid email address"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

const RegisterPage = () => {
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data) => {
    setLoading(true);
    setError("");
    try {
      await api.post("/auth/register", {
        email: data.email,
        password: data.password,
      });
      setSuccess(true);
      setTimeout(() => navigate("/login"), 2000);
    } catch (err) {
      setError(
        err.response?.data?.message || "Registration failed. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="mb-10 flex justify-center">
          <div className="flex h-24 w-full max-w-sm items-center justify-center overflow-hidden rounded-2xl bg-white px-4 shadow-lg shadow-indigo-950/20">
            <img
              src="/1.png"
              alt="QRBayan"
              className="h-full w-full object-contain"
            />
          </div>
        </div>

        <div className="bg-slate-900/50 border border-slate-800/50 rounded-2xl p-8">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-white mb-1">
              Create your account
            </h1>
            <p className="text-sm text-slate-400">
              Register to start customizing your QRPH display name.
            </p>
          </div>

          {error && (
            <div className="mb-6 p-3 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl flex items-center text-sm">
              <AlertCircle className="w-4 h-4 mr-2 shrink-0" />
              {error}
            </div>
          )}

          {success && (
            <div className="mb-6 p-3 bg-green-500/10 border border-green-500/20 text-green-400 rounded-xl flex items-center text-sm">
              <CheckCircle2 className="w-4 h-4 mr-2 shrink-0" />
              Account created successfully. Redirecting to sign in...
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
                  className={`w-full pl-10 pr-4 py-3 bg-slate-800/50 border rounded-xl text-white placeholder:text-slate-500 focus:ring-2 focus:ring-indigo-500/40 outline-none transition-all ${
                    errors.email
                      ? "border-red-500/50"
                      : "border-slate-700/50 focus:border-indigo-500"
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
                  className={`w-full pl-10 pr-4 py-3 bg-slate-800/50 border rounded-xl text-white placeholder:text-slate-500 focus:ring-2 focus:ring-indigo-500/40 outline-none transition-all ${
                    errors.password
                      ? "border-red-500/50"
                      : "border-slate-700/50 focus:border-indigo-500"
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

            <div className="space-y-1.5">
              <label className="text-sm text-slate-300 font-medium">
                Confirm password
              </label>
              <div className="relative">
                <input
                  type="password"
                  {...register("confirmPassword")}
                  className={`w-full pl-10 pr-4 py-3 bg-slate-800/50 border rounded-xl text-white placeholder:text-slate-500 focus:ring-2 focus:ring-indigo-500/40 outline-none transition-all ${
                    errors.confirmPassword
                      ? "border-red-500/50"
                      : "border-slate-700/50 focus:border-indigo-500"
                  }`}
                  placeholder="••••••••"
                />
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              </div>
              {errors.confirmPassword && (
                <p className="text-xs text-red-400">
                  {errors.confirmPassword.message}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading || success}
              className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-3 rounded-xl transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <UserPlus className="w-4 h-4" />
                  Create Account
                </>
              )}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-400">
            Already have an account?{" "}
            <Link
              to="/login"
              className="text-indigo-400 hover:text-indigo-300 font-medium"
            >
              Sign in
            </Link>
          </p>
          <p className="mt-3 text-center text-sm text-slate-400">
            Need a quick QR without an account?{" "}
            <Link
              to="/utility-qr"
              className="text-emerald-400 hover:text-emerald-300 font-medium"
            >
              Open Utility QR
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
