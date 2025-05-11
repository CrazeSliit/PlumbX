"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { FaFacebook, FaGoogle, FaMicrosoft } from "react-icons/fa";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl');

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        // Clear old cookies
        ["token", "role", "userName", "userId", "employeeData"].forEach(name => {
          document.cookie = `${name}=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT`;
        });

        // Set new cookies
        document.cookie = `token=demo-token; path=/`;
        document.cookie = `role=${encodeURIComponent(data.role)}; path=/`;
        document.cookie = `userName=${encodeURIComponent(data.fullName)}; path=/`;
        document.cookie = `userId=${encodeURIComponent(data._id)}; path=/`;

        if (data.employeeData) {
          document.cookie = `employeeData=${encodeURIComponent(JSON.stringify(data.employeeData))}; path=/`;
        }

        // Redirect user based on role
        setTimeout(() => {
          const roleRedirects = {
            inventory: "/inventory/inventory_management",
            employee: "/employees/employee_manager_dashboard",
            delivery: "/delivery/delivery_home",
            finance: "/finance/dashboard",
            customer: "/homepage",
            admin: "/admin/dashboard",
            empuser: "/employeeuser/emp_dashboard",
          };

          if (callbackUrl && !callbackUrl.startsWith("/signin")) {
            router.push(callbackUrl);
          } else if (data.role && roleRedirects[data.role]) {
            router.push(roleRedirects[data.role]);
          } else {
            setError("Invalid user role");
          }
        }, 100);
      } else {
        // Handle backend errors
        switch (data.message) {
          case "User not found":
            setError("No account found with this email");
            break;
          case "Invalid password":
            setError("Incorrect password");
            break;
          case "Employee record not found":
            setError("Employee record not found");
            break;
          case "Employee account is not active":
            setError("Your employee account is not active");
            break;
          case "Employee password does not match":
            setError("Employee password does not match");
            break;
          default:
            setError(data.message || "Invalid email or password");
        }
      }
    } catch (err) {
      console.error("Login error:", err);
      setError("An error occurred during login. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white relative overflow-hidden">
      <div className="relative z-10 w-full max-w-md md:max-w-lg bg-gray-100 rounded-3xl shadow-2xl p-10 flex flex-col items-center transition-transform duration-300 hover:scale-105">
        <h2 className="text-4xl font-extrabold text-gray-900 text-center tracking-wide">
          Welcome Back
        </h2>
        <p className="text-gray-500 text-sm text-center mt-2">Login to access your account</p>

        {error && (
          <div className="w-full mt-4 p-4 text-red-500 bg-red-100 rounded-lg text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-8 w-full space-y-6">
          <div>
            <label className="block text-gray-700 font-semibold mb-2" htmlFor="email">
              Email Address
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 rounded-lg bg-gray-50 border border-gray-300 focus:ring-[#fdc501] focus:border-[#fdc501]"
              placeholder="Enter your email"
            />
          </div>

          <div>
            <label className="block text-gray-700 font-semibold mb-2" htmlFor="password">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-lg bg-gray-50 border border-gray-300 focus:ring-[#fdc501] focus:border-[#fdc501]"
              placeholder="Enter your password"
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                className="h-4 w-4 text-yellow-500 focus:ring-yellow-400 border-gray-300 rounded"
              />
              <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-600">
                Remember me
              </label>
            </div>

            <div className="text-sm">
              <Link href="/reset-password" className="font-medium text-yellow-600 hover:text-yellow-800">
                Forgot password?
              </Link>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 text-white font-semibold rounded-lg bg-gradient-to-r from-yellow-400 to-black hover:from-yellow-500 hover:to-gray-900 focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 shadow-md"
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <div className="mt-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-gray-100 text-gray-500">Or continue with</span>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-3 gap-3">
            <button className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-500 hover:bg-gray-50">
              <FaGoogle className="text-xl" />
            </button>
            <button className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-500 hover:bg-gray-50">
              <FaFacebook className="text-xl" />
            </button>
            <button className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-500 hover:bg-gray-50">
              <FaMicrosoft className="text-xl" />
            </button>
          </div>
        </div>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Don't have an account?{" "}
            <Link href="/register" className="font-medium text-yellow-600 hover:text-yellow-800">
              Register
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
