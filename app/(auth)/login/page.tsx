"use client";

import { motion } from "framer-motion";
import { signIn } from "next-auth/react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const t = useTranslations("auth");
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError(t("loginError"));
      } else {
        router.push("/admin");
        router.refresh();
      }
    } catch {
      setError(t("loginError"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen mesh-gradient flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="text-4xl font-black bg-gradient-to-r from-blue-400 to-purple-500
              bg-clip-text text-transparent inline-block"
          >
            KEPT
          </motion.div>
          <p className="text-gray-400 mt-2">Admin Panel</p>
        </div>

        {/* Login Form */}
        <div className="glass-card rounded-2xl p-8">
          <h1 className="text-2xl font-bold text-white mb-6 text-center">
            {t("loginTitle")}
          </h1>

          {error && (
            <div className="mb-4 p-4 rounded-lg bg-rose-500/20 border border-rose-500/50 text-rose-400">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                {t("email")}
              </label>
              <input
                type="email"
                name="email"
                required
                className="w-full px-4 py-3 rounded-lg
                  bg-white/10 border border-white/20
                  text-white placeholder-gray-500
                  focus:bg-white/20 focus:border-blue-500
                  transition-all outline-none"
                placeholder="admin@kept.lv"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                {t("password")}
              </label>
              <input
                type="password"
                name="password"
                required
                className="w-full px-4 py-3 rounded-lg
                  bg-white/10 border border-white/20
                  text-white placeholder-gray-500
                  focus:bg-white/20 focus:border-blue-500
                  transition-all outline-none"
                placeholder="••••••••"
              />
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={loading}
              className="w-full px-6 py-3 rounded-lg
                bg-gradient-to-r from-blue-500 to-purple-600
                text-white font-bold
                hover:shadow-lg transition-all
                disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "..." : t("loginButton")}
            </motion.button>
          </form>
        </div>
      </motion.div>
    </div>
  );
}
