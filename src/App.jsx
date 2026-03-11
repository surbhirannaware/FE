 import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./Login";
import Dashboard from "./pages/admin/Dashboard";
import Layout from "./components/Layout";
import Appointments from "./Appointment";
import Register from "./Register";
import RegisterStaff from "./pages/admin/RegisterStaff";
import Unauthorized from "./pages/Unauthorized";
import jwtDecode from "jwt-decode";
import AddService from "./pages/admin/AddService";
import StaffToday from "./pages/staff/StaffToday";
import StaffUpcoming from "./pages/staff/StaffUpcoming";
import ApplyLeave from "./pages/staff/ApplyLeave";
import MyLeaves from "./pages/staff/MyLeaves";
import AdminLeaves from "./pages/admin/AdminLeaves";
import Services from "./pages/Services";
import EditService from "./pages/admin/EditService";
import Categories from "./pages/admin/Categories";
import AddCategory from "./pages/admin/AddCategory";
import EditCategory from "./pages/admin/EditCategory";
import CustomerDashboard from "./pages/customer/CustomerDashboard";

function ProtectedRoute({ children, allowedRoles }) {
  const token = localStorage.getItem("token");

  if (!token) return <Navigate to="/login" replace />;

  try {
    const decoded = jwtDecode(token);
    const userRole =
      decoded["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"];

    if (allowedRoles && !allowedRoles.includes(userRole)) {
      return <Navigate to="/unauthorized" replace />;
    }

    return children;
  } catch {
    localStorage.removeItem("token");
    return <Navigate to="/login" replace />;
  }
}

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      <Route
        element={
          <ProtectedRoute allowedRoles={["Admin"]}>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/appointments" element={<Appointments />} />
        <Route path="/admin/register-staff" element={<RegisterStaff />} />
        <Route path="/admin/add-service" element={<AddService />} />
        <Route path="/admin/admin-leaves" element={<AdminLeaves />} />
        <Route path="/services" element={<Services />} />
        <Route path="/admin/edit-service/:id" element={<EditService />} />
        <Route path="/admin/categories" element={<Categories />} />
        <Route path="/admin/categories/add" element={<AddCategory />} />
        <Route path="/admin/categories/edit/:id" element={<EditCategory />} />
      </Route>

      <Route
        path="/staff"
        element={
          <ProtectedRoute allowedRoles={["Staff"]}>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route index element={<StaffToday />} />
        <Route path="today" element={<StaffToday />} />
        <Route path="upcoming" element={<StaffUpcoming />} />
        <Route path="apply-leave" element={<ApplyLeave />} />
        <Route path="my-leaves" element={<MyLeaves />} />
      </Route>

      <Route
        path="/customer"
        element={
          <ProtectedRoute allowedRoles={["Customer"]}>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route index element={<CustomerDashboard />} />
        <Route path="dashboard" element={<CustomerDashboard />} />
        <Route path="book-appointment" element={<Appointments />} />
      </Route>

      <Route path="/unauthorized" element={<Unauthorized />} />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

export default App;