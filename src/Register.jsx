import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";


function Register() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    fullName: "",
    email: "",
    password: "",
    phoneNo: ""
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  };

  const validate = () => {

  if (!form.fullName.trim()) {
    toast.error("Full name is required");
    return false;
  }

  if (!form.phoneNo.trim()) {
    toast.error("Phone number is required");
    return false;
  }

  // ✅ Indian 10 digit validation
  const phoneRegex = /^[6-9]\d{9}$/;

  if (!phoneRegex.test(form.phoneNo)) {
    toast.error("Enter valid 10-digit Indian mobile number");
    return false;
  }

  if (form.email && !/\S+@\S+\.\S+/.test(form.email)) {
    toast.error("Invalid email format");
    return false;
  }

  if (!form.password.trim()) {
    toast.error("Password is required");
    return false;
  }

  if (form.password.length < 6) {
    toast.error("Password must be at least 6 characters");
    return false;
  }

  return true;
};

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) return;

    try {
      setLoading(true);

      const res = await fetch("http://localhost:5007/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
      body: JSON.stringify({
  ...form,
  role: "Customer"
})
      });

      const message = await res.text();

      if (!res.ok) {
        toast.error(message || "Registration failed");
        return;
      }

      toast.success("Registered successfully 🎉");
      navigate("/login");

    } catch (err) {
      console.error(err);
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 p-6">
      <div className="w-full max-w-md bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-lg border dark:border-slate-700">

        <h2 className="text-2xl font-bold text-center mb-6 text-slate-800 dark:text-slate-100">
          Create Account
        </h2>

        <form onSubmit={handleSubmit} className="space-y-5">

          <div>
            <label className="text-sm font-medium">Full Name</label>
            <input
              type="text"
              name="fullName"
              value={form.fullName}
              onChange={handleChange}
              className="w-full mt-2 px-4 py-3 border rounded-lg dark:bg-slate-900"
              placeholder="Enter your name"
            />
          </div>

          <div>
            <label className="text-sm font-medium">Email</label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              className="w-full mt-2 px-4 py-3 border rounded-lg dark:bg-slate-900"
              placeholder="Enter your email"
            />
          </div>

          <div>
            <label className="text-sm font-medium">Phone Number</label>
            <input
              type="text"
              name="phoneNo"
              value={form.phoneNo}
              onChange={handleChange}
              className="w-full mt-2 px-4 py-3 border rounded-lg dark:bg-slate-900"
              placeholder="Enter phone number"
            />
          </div>

          <div>
            <label className="text-sm font-medium">Password</label>
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              className="w-full mt-2 px-4 py-3 border rounded-lg dark:bg-slate-900"
              placeholder="Enter password"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-semibold transition disabled:opacity-50"
          >
            {loading ? "Registering..." : "Register"}
          </button>

        </form>

        <p className="text-sm text-center mt-5 text-slate-600 dark:text-slate-400">
          Already have an account?{" "}
          <span
            onClick={() => navigate("/login")}
            className="text-blue-600 cursor-pointer hover:underline"
          >
            Login
          </span>
        </p>

      </div>
    </div>
  );
}

export default Register;