"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { FaFacebook, FaGoogle, FaMicrosoft } from "react-icons/fa";

export default function Register() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState("");

  const validateForm = () => {
    const tempErrors = {};
    let isValid = true;

    if (!formData.fullName.trim()) {
      tempErrors.fullName = "Full Name is required";
      isValid = false;
    }

    if (!formData.email.trim()) {
      tempErrors.email = "Email is required";
      isValid = false;
    } else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(formData.email)) {
      tempErrors.email = "Invalid email address";
      isValid = false;
    }

    if (!formData.password) {
      tempErrors.password = "Password is required";
      isValid = false;
    } else if (formData.password.length < 6) {
      tempErrors.password = "Password must be at least 6 characters";
      isValid = false;
    }

    if (formData.password !== formData.confirmPassword) {
      tempErrors.confirmPassword = "Passwords do not match";
      isValid = false;
    }

    setErrors(tempErrors);
    return isValid;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    setServerError("");

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fullName: formData.fullName,
          email: formData.email,
          password: formData.password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Registration failed");
      }

      // Redirect to Sign In page on success
      router.push("/signin");
    } catch (error) {
      console.error(error);
      setServerError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="w-full max-w-md p-8 bg-gray-100 rounded-3xl shadow-2xl flex flex-col items-center space-y-6 transition-transform hover:scale-105 duration-300">
        <h1 className="text-4xl font-bold text-gray-900">Create Account</h1>
        <p className="text-gray-500 text-sm text-center">Join us to get started</p>

        {serverError && (
          <div className="w-full p-3 text-center bg-red-100 text-red-600 rounded-lg">
            {serverError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="w-full space-y-4">
          {/* Full Name */}
          <div>
            <label htmlFor="fullName" className="block text-gray-700 font-semibold mb-1">
              Full Name
            </label>
            <input
              id="fullName"
              name="fullName"
              type="text"
              value={formData.fullName}
              onChange={handleChange}
              required
              className="w-full p-3 rounded-lg border border-gray-300 bg-gray-50 focus:ring-[#fdc501] focus:border-[#fdc501]"
              placeholder="Your full name"
            />
            {errors.fullName && <p className="text-red-500 text-xs mt-1">{errors.fullName}</p>}
          </div>

          {/* Email */}
          <div>
            <label htmlFor="email" className="block text-gray-700 font-semibold mb-1">
              Email Address
            </label>
            <input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full p-3 rounded-lg border border-gray-300 bg-gray-50 focus:ring-[#fdc501] focus:border-[#fdc501]"
              placeholder="Your email address"
            />
            {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
          </div>

          {/* Password */}
          <div>
            <label htmlFor="password" className="block text-gray-700 font-semibold mb-1">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              required
              className="w-full p-3 rounded-lg border border-gray-300 bg-gray-50 focus:ring-[#fdc501] focus:border-[#fdc501]"
              placeholder="Create a password"
            />
            {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
          </div>

          {/* Confirm Password */}
          <div>
            <label htmlFor="confirmPassword" className="block text-gray-700 font-semibold mb-1">
              Confirm Password
            </label>
            <input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
              className="w-full p-3 rounded-lg border border-gray-300 bg-gray-50 focus:ring-[#fdc501] focus:border-[#fdc501]"
              placeholder="Confirm your password"
            />
            {errors.confirmPassword && <p className="text-red-500 text-xs mt-1">{errors.confirmPassword}</p>}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full p-3 text-white font-bold bg-gradient-to-r from-yellow-400 to-black rounded-lg hover:from-yellow-500 hover:to-gray-800 transition"
          >
            {loading ? "Creating Account..." : "Sign Up"}
          </button>
        </form>

        {/* Other Sign-in Methods */}
        <div className="w-full space-y-4 text-center">
          <p className="text-gray-400">Or continue with</p>
          <div className="flex justify-center gap-4">
            <button className="p-3 bg-white rounded-full border shadow hover:bg-gray-100">
              <FaGoogle className="text-xl text-gray-600" />
            </button>
            <button className="p-3 bg-white rounded-full border shadow hover:bg-gray-100">
              <FaFacebook className="text-xl text-blue-600" />
            </button>
            <button className="p-3 bg-white rounded-full border shadow hover:bg-gray-100">
              <FaMicrosoft className="text-xl text-gray-700" />
            </button>
          </div>
        </div>

        {/* Link to Sign In */}
        <div className="text-sm text-gray-600 mt-4">
          Already have an account?{" "}
          <Link href="/signin" className="text-[#fdc501] font-semibold hover:underline">
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}
