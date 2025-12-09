import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuthContext } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { Mail, Lock } from "lucide-react";

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

type LoginFormData = z.infer<typeof loginSchema>;

export function LoginPage() {
  const [error, setError] = useState<string | null>(null);
  const { login, isLoading } = useAuthContext();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    setError(null);
    try {
      await login(data.email, data.password);
      navigate("/");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed. Please try again.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-l-bg-1 dark:bg-d-bg-1 px-4">
      <div className="w-full max-w-md">
        <div className="bg-l-bg-2 dark:bg-d-bg-2 p-8 rounded-xl border border-border-l dark:border-border-d shadow-lg">
          <h1 className="text-3xl font-bold mb-2 text-l-text-1 dark:text-d-text-1 text-center">
            Welcome Back
          </h1>
          <p className="text-l-text-2 dark:text-d-text-2 text-center mb-8">
            Sign in to your account
          </p>

          {error && (
            <div className="mb-4 p-4 bg-accent-danger/10 border border-accent-danger rounded-lg">
              <p className="text-accent-danger text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-l-text-1 dark:text-d-text-1 mb-2">
                Email
              </label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-l-text-3 dark:text-d-text-3">
                  <Mail size={20} />
                </div>
                <input
                  type="email"
                  placeholder="Enter your email"
                  className={`w-full bg-l-bg-1 dark:bg-d-bg-1 text-l-text-1 dark:text-d-text-1 border border-border-l dark:border-border-d rounded-lg px-4 py-3 pl-12 focus:border-accent-1 transition-colors outline-none placeholder:text-l-text-3 dark:placeholder:text-d-text-3 ${
                    errors.email
                      ? "border-accent-danger focus:border-accent-danger"
                      : ""
                  }`}
                  {...register("email")}
                />
              </div>
              {errors.email && (
                <p className="mt-2 text-sm text-accent-danger">{errors.email.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-l-text-1 dark:text-d-text-1 mb-2">
                Password
              </label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-l-text-3 dark:text-d-text-3">
                  <Lock size={20} />
                </div>
                <input
                  type="password"
                  placeholder="Enter your password"
                  className={`w-full bg-l-bg-1 dark:bg-d-bg-1 text-l-text-1 dark:text-d-text-1 border border-border-l dark:border-border-d rounded-lg px-4 py-3 pl-12 focus:border-accent-1 transition-colors outline-none placeholder:text-l-text-3 dark:placeholder:text-d-text-3 ${
                    errors.password
                      ? "border-accent-danger focus:border-accent-danger"
                      : ""
                  }`}
                  {...register("password")}
                />
              </div>
              {errors.password && (
                <p className="mt-2 text-sm text-accent-danger">{errors.password.message}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={isSubmitting || isLoading}
              className={`w-full bg-accent-1 hover:bg-accent-2 text-white py-3 rounded-lg font-semibold transition-all duration-300 transform hover:scale-105 ${
                isSubmitting || isLoading
                  ? "opacity-50 cursor-not-allowed transform-none"
                  : ""
              }`}
            >
              {isSubmitting || isLoading ? "Signing in..." : "Sign In"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

