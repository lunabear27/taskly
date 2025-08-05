import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/auth";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Eye, EyeOff, Mail } from "lucide-react";
import { toast } from "sonner";

export const Register: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");
  const [countdown, setCountdown] = useState(0);

  const { signUp, loading } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email || !password || !confirmPassword) {
      setError("Please fill in all fields");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters long");
      return;
    }

    console.log("Submitting signup form...");
    console.log("Email:", email);
    console.log("Password length:", password.length);

    try {
      const { error: signUpError } = await signUp(email, password);
      console.log("Signup response:", { signUpError });

      if (signUpError) {
        console.log("Signup error:", signUpError);

        // Handle rate limiting error specifically
        if (
          signUpError.message?.includes("18 seconds") ||
          signUpError.code === "over_email_send_rate_limit"
        ) {
          setError(
            "Please wait 18 seconds before trying again. This helps prevent spam."
          );
          setCountdown(18);

          // Start countdown timer
          const timer = setInterval(() => {
            setCountdown((prev) => {
              if (prev <= 1) {
                clearInterval(timer);
                return 0;
              }
              return prev - 1;
            });
          }, 1000);
        } else {
          setError(signUpError.message);
        }
      } else {
        console.log("Signup successful, showing verification notification");

        // Show success toast notification
        toast.success(
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Mail className="w-5 h-5 text-green-600" />
              <span className="font-medium">Email Verification Sent!</span>
            </div>
            <p className="text-sm text-gray-600">
              We've sent a verification link to <strong>{email}</strong>
            </p>
            <p className="text-xs text-gray-500">
              Please check your email and click the verification link to
              activate your account.
            </p>
          </div>,
          {
            duration: 8000,
            action: {
              label: "Go to Login",
              onClick: () => navigate("/login"),
            },
          }
        );

        // Clear form
        setEmail("");
        setPassword("");
        setConfirmPassword("");
        setError("");
      }
    } catch (error) {
      console.log("Signup caught error:", error);
      setError("An unexpected error occurred during signup");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Create Account
            </h1>
            <p className="text-gray-600 dark:text-gray-400 text-lg">
              Join Taskly to organize your projects
            </p>
          </div>

          {/* Email verification notice */}
          <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
            <div className="flex items-start gap-3">
              <Mail className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
              <div className="text-sm">
                <p className="font-medium text-blue-900 dark:text-blue-100 mb-1">
                  Email Verification Required
                </p>
                <p className="text-blue-700 dark:text-blue-300">
                  After creating your account, you'll need to verify your email
                  address before you can log in and access your account.
                </p>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Create a password"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
              >
                {showPassword ? "Hide" : "Show"} password
              </button>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                id="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm your password"
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
              >
                {showConfirmPassword ? "Hide" : "Show"} password
              </button>
            </div>

            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                <p className="text-sm text-red-600 dark:text-red-400">
                  {error}
                </p>
                {countdown > 0 && (
                  <p className="text-xs text-red-500 dark:text-red-400 mt-2">
                    You can try again in {countdown} seconds
                  </p>
                )}
              </div>
            )}

            <Button
              type="submit"
              className="w-full py-3 text-base font-medium"
              disabled={loading || countdown > 0}
            >
              {loading
                ? "Creating Account..."
                : countdown > 0
                ? `Wait ${countdown}s`
                : "Create Account"}
            </Button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              Already have an account?{" "}
              <Link
                to="/login"
                className="text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 font-medium"
              >
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
