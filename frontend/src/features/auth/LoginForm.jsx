import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router-dom";
import { loginSchema } from "./authSchema.js";
import { motion } from "framer-motion";
import { Lock, User, Loader2, AlertCircle, BadgeCheck } from "lucide-react";

import { useLoginMutation } from "../../hooks/mutations/useAuthMutations";
import { useAuth } from "../../context/AuthContext";
import toast from "react-hot-toast";
import { getDashboardPath } from "../../utils/authRoutes";

export default function LoginForm() {
  const navigate = useNavigate();
  const { login } = useAuth();

  // State to track server-side wrong password errors
  const [showForgot, setShowForgot] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(loginSchema),
  });

  const loginMutation = useLoginMutation();
  const apiBaseUrl = import.meta.env.VITE_API_URL || (import.meta.env.PROD ? "" : "http://localhost:5000");

  const onSubmit = (data) => {
    setShowForgot(false);

    loginMutation.mutate(
      {
        rollNumber: data.identifier,
        password: data.password,
      },
      {
        onSuccess: (responseData) => {
          const { user } = responseData;
          login(user);
          toast.success(`Welcome back, ${user.name}!`);
          navigate(getDashboardPath(user.role));
        },
        onError: (error) => {
          if (error.response?.status === 401) {
            setShowForgot(true);
          }
          toast.error(
            error.response?.data?.message ||
            "Login failed. Please check your credentials.",
          );
        },
      }
    );
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-white dark:bg-[#050505] transition-colors duration-300 relative overflow-hidden">


      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="w-full max-w-md relative z-10"
      >
        {/* Header Section */}
        <div className="text-center mb-10">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{
              type: "spring",
              stiffness: 200,
              damping: 15,
              delay: 0.1,
            }}
            className="relative w-20 h-20 mx-auto mb-6 hover:scale-105 transition-transform"
          >
            <div className="absolute inset-0 bg-[#e0e0e0] dark:bg-[#1a1a1a] rounded-3xl blur-lg opacity-50" />
            <img
              src="/pwa-512x512.png"
              alt="MessPro Logo"
              className="relative w-full h-full object-contain drop-shadow-sm dark:drop-shadow-[0_0_15px_rgba(255,255,255,0.1)] dark:brightness-180"
            />
          </motion.div>

          <h1 className="text-4xl font-black tracking-tight font-display text-[#111111] dark:text-white mb-2">
            MessPro
          </h1>
          <p className="text-[#737373] dark:text-[#888888] font-medium">
            Login to your account
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-white dark:bg-[#0a0a0a] backdrop-blur-2xl rounded-3xl p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.5)] border border-[#f5f5f5] dark:border-[#222222] relative overflow-hidden">
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="space-y-5 relative z-10"
          >
            {/* Identifier Input */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#737373] dark:text-[#888888] uppercase tracking-wider ml-1">
                Roll Number / Email
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <User className="w-5 h-5 text-[#a3a3a3] dark:text-[#555555] group-focus-within:text-[#111111] dark:group-focus-within:text-white transition-colors" />
                </div>
                <input
                  type="text"
                  placeholder="e.g. 2021-CS-123"
                  {...register("identifier")}
                  className="w-full pl-11 pr-4 py-4 bg-[#fafafa] dark:bg-[#111111] border border-[#e0e0e0]/80 dark:border-[#222222] rounded-2xl text-sm font-semibold text-[#111111] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#111111]/10 dark:focus:ring-white/20 focus:border-[#111111] dark:focus:border-white focus:bg-white dark:focus:bg-[#1a1a1a] transition-all placeholder:text-[#a3a3a3] dark:placeholder:text-[#555555]"
                />
              </div>
              {errors.identifier && (
                <p className="text-xs font-bold text-rose-500 dark:text-rose-400 ml-1 mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />{" "}
                  {errors.identifier.message}
                </p>
              )}
            </div>

            {/* Password Input */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#737373] dark:text-[#888888] uppercase tracking-wider ml-1">
                Password
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="w-5 h-5 text-[#a3a3a3] dark:text-[#555555] group-focus-within:text-[#111111] dark:group-focus-within:text-white transition-colors" />
                </div>
                <input
                  type="password"
                  placeholder="••••••••"
                  {...register("password")}
                  className="w-full pl-11 pr-4 py-4 bg-[#fafafa] dark:bg-[#111111] border border-[#e0e0e0]/80 dark:border-[#222222] rounded-2xl text-sm font-semibold text-[#111111] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#111111]/10 dark:focus:ring-white/20 focus:border-[#111111] dark:focus:border-white focus:bg-white dark:focus:bg-[#1a1a1a] transition-all placeholder:text-[#a3a3a3] dark:placeholder:text-[#555555]"
                />
              </div>

              {/* Combined Error & Forgot Password Section */}
              <div className="flex flex-col gap-1.5 mt-1.5 ml-1">
                {errors.password && (
                  <p className="text-xs font-bold text-rose-500 dark:text-rose-400 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />{" "}
                    {errors.password.message}
                  </p>
                )}

                {(errors.password || showForgot) && (
                  <motion.a
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    href="#"
                    className="text-xs font-bold text-[#111111] dark:text-white hover:underline transition-colors w-fit"
                  >
                    Forgot password?
                  </motion.a>
                )}
              </div>
            </div>

            <div className="pt-2 space-y-3">
              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={loginMutation.isPending}
                className="w-full flex items-center justify-center gap-2 py-4 font-bold text-white dark:text-black uppercase tracking-widest bg-[#111111] dark:bg-white hover:bg-[#171717] dark:hover:bg-slate-200 rounded-2xl transition-all disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {loginMutation.isPending ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  "Sign In"
                )}
              </motion.button>

              <a
                href={`${apiBaseUrl}/api/auth/google`}
                className="w-full flex items-center justify-center gap-2 py-4 font-bold text-[#111111] dark:text-white border border-[#e0e0e0]/80 dark:border-[#222222] rounded-2xl transition-all hover:bg-[#fafafa] dark:hover:bg-[#111111] hover:border-[#d4d4d4] dark:hover:border-[#333333] shadow-sm"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#111111]/5 dark:bg-white/10">
                  <BadgeCheck className="w-5 h-5" />
                </div>
                Continue with Google
              </a>
            </div>
          </form>
        </div>

        {/* Contact Us Footer */}
        <div className="mt-8 text-center">
          <p className="text-sm font-medium text-[#737373] dark:text-[#888888]">
            Having trouble?{" "}
            <a
              href="https://docs.google.com/forms/d/e/1FAIpQLSdCLlfVcyCuvTwrpQrQ3HPtd6FHsYQ4iZu_OXOlDLtmMjwlPw/viewform?usp=dialog"
              target="_blank"
              rel="noopener noreferrer"
              className="font-bold text-[#111111] dark:text-white hover:underline transition-colors"
            >
              Contact Us
            </a>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
