import { useState } from "react";
import { useNavigate } from "react-router-dom";
import React from "react";
import toast from "react-hot-toast";
import jwtDecode from "jwt-decode";
import api from "./api";

function Login() {
  const navigate = useNavigate();

  const [phoneNo, setPhoneNo] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  console.log("ENV URL:", import.meta.env.VITE_API_URL);
console.log("AXIOS BASE URL:", api.defaults.baseURL);
  const handleLogin = async (e) => {
    e.preventDefault();

    const phoneRegex = /^[6-9]\d{9}$/;
    if (!phoneRegex.test(phoneNo)) {
      toast.error("Enter valid 10-digit Indian mobile number");
      return;
    }

    try {
      setLoading(true);

      localStorage.removeItem("token");
      localStorage.removeItem("roles");
      localStorage.removeItem("expiresAt");

      const response = await api.post("/api/auth/login", {
        phoneNo,
        password,
      });

      const data = response.data;

      localStorage.setItem("token", data.token);
      localStorage.setItem("expiresAt", data.expiresAt);

      const decoded = jwtDecode(data.token);

      const roleClaim =
        decoded.role ||
        decoded["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"];

      const roles = Array.isArray(roleClaim) ? roleClaim : [roleClaim];

      localStorage.setItem("roles", JSON.stringify(roles));

      toast.success("Login successful 🎉");

      if (roles.includes("Admin")) {
        navigate("/dashboard");
      } else if (roles.includes("Staff")) {
        navigate("/staff");
      } else if (roles.includes("Customer")) {
        navigate("/customer/dashboard");
      } else {
        navigate("/unauthorized");
      }
    } catch (err) {
      if (err.response?.status === 401) {
        toast.error("Invalid phone number or password");
      } else {
        toast.error(err.response?.data?.message || "Login failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
      <div className="hidden md:block md:w-1/2">
        <img
          src="https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9"
          alt="Salon"
          className="w-full h-full object-cover"
        />
      </div>

      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          <h1 className="text-4xl font-bold text-center text-slate-800 dark:text-slate-100 mb-8">
            Salon App
          </h1>

          <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm rounded-2xl p-8 transition-colors duration-300">
            <h2 className="text-2xl font-semibold text-center text-slate-800 dark:text-slate-100 mb-6">
              Login
            </h2>

            <form onSubmit={handleLogin} className="space-y-4">
              <input
                type="text"
                placeholder="Phone Number"
                value={phoneNo}
                onChange={(e) => setPhoneNo(e.target.value)}
                className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                required
              />

              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                required
              />

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-semibold transition duration-300 disabled:opacity-50"
              >
                {loading ? "Logging in..." : "Login"}
              </button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Don’t have an account?{" "}
                <span
                  onClick={() => navigate("/register")}
                  className="text-blue-600 hover:text-blue-700 font-medium cursor-pointer transition"
                >
                  Register here
                </span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;