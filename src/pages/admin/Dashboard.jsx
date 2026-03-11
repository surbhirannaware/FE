 import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import API_BASE_URL from "../../api";

function Dashboard() {
  const location = useLocation();
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [data, setData] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [updatingId, setUpdatingId] = useState(null);

  const fetchData = async (dateToUse = selectedDate) => {
    setLoading(true);

    try {
      const [res1, res2] = await Promise.all([
        fetch(`${API_BASE_URL}/api/admin/dashboard?date=${dateToUse}`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(
          `${API_BASE_URL}/api/admin/dashboard/appointments?date=${dateToUse}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        ),
      ]);

      if (!res1.ok || !res2.ok) {
        throw new Error("Failed to load dashboard data");
      }

      const summary = await res1.json();
      const apps = await res2.json();

      setData(summary);
      setAppointments(apps);
    } catch (err) {
      console.error(err);
      toast.error(err.message || "Failed to load dashboard");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (location.state?.selectedDate) {
      setSelectedDate(location.state.selectedDate);
      return;
    }

    fetchData();
  }, []);

  useEffect(() => {
    fetchData(selectedDate);
  }, [selectedDate]);

  useEffect(() => {
    if (location.state?.refresh || location.state?.selectedDate) {
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location.state, navigate, location.pathname]);

  const statusSelectClass = (status) => {
    switch (status) {
      case "Completed":
      case "Paid":
        return "bg-green-100 text-green-700 border-green-200";
      case "Cancelled":
      case "Failed":
        return "bg-red-100 text-red-700 border-red-200";
      case "Booked":
        return "bg-yellow-100 text-yellow-700 border-yellow-200";
      case "Pending":
        return "bg-orange-100 text-orange-700 border-orange-200";
      default:
        return "bg-slate-100 text-slate-700 border-slate-200";
    }
  };

  const formatTime = (time) => {
    if (!time) return "";
    return new Date(`1970-01-01T${time}`).toLocaleTimeString([], {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  const saveAppointmentUpdate = async (row, previousRow = null) => {
    try {
      const payload = {
        status: row.appointmentStatus,
        paymentStatus: row.paymentStatus,
        paymentMethod:
          row.paymentStatus === "Paid" ? row.paymentMethod || null : null,
      };

      const res = await fetch(
        `${API_BASE_URL}/api/admin/dashboard/appointments/${row.appointmentId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        }
      );

      if (!res.ok) {
        const msg = await res.text();
        throw new Error(msg || "Failed to update appointment");
      }

      toast.success("Appointment updated successfully");
      await fetchData(selectedDate);
    } catch (err) {
      console.error(err);

      if (previousRow) {
        setAppointments((prev) =>
          prev.map((item) =>
            item.appointmentId === previousRow.appointmentId ? previousRow : item
          )
        );
      }

      toast.error(err.message || "Update failed");
    } finally {
      setUpdatingId(null);
    }
  };

  const handleAutoSaveChange = (appointmentId, field, value) => {
    const currentRow = appointments.find((x) => x.appointmentId === appointmentId);
    if (!currentRow) return;

    const previousRow = { ...currentRow };

    const updatedRow = {
      ...currentRow,
      [field]: value,
    };

    if (field === "paymentStatus" && value !== "Paid") {
      updatedRow.paymentMethod = null;
    }

    if (
      field === "paymentMethod" &&
      (!updatedRow.paymentStatus || updatedRow.paymentStatus !== "Paid")
    ) {
      return;
    }

    if (
      field === "paymentStatus" &&
      value === "Paid" &&
      !updatedRow.paymentMethod
    ) {
      updatedRow.paymentMethod = "Cash";
    }

    setAppointments((prev) =>
      prev.map((item) =>
        item.appointmentId === appointmentId ? updatedRow : item
      )
    );

    setUpdatingId(appointmentId);
    saveAppointmentUpdate(updatedRow, previousRow);
  };

  if (loading || !data) {
    return (
      <div className="flex justify-center items-center h-64 text-lg font-medium text-slate-500">
        Loading dashboard...
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8 bg-white dark:bg-slate-900 transition-colors duration-300">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Select Date
          </p>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="mt-3 w-full text-lg font-semibold px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-transparent"
          />
        </div>

        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Appointments
          </p>
          <h2 className="text-4xl font-bold mt-3 text-blue-600">
            {data?.totalAppointments}
          </h2>
        </div>

        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Completed
          </p>
          <h2 className="text-4xl font-bold mt-3 text-green-600">
            {data?.completedAppointments}
          </h2>
        </div>

        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
          <p className="text-sm text-slate-500 dark:text-slate-400">Revenue</p>
          <h2 className="text-4xl font-bold mt-3 text-emerald-600">
            ₹ {data?.revenue}
          </h2>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
          <h3 className="text-lg font-semibold">Appointments</h3>
          <span className="text-sm text-slate-500">
            {appointments.length} records
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-400 uppercase text-xs">
              <tr>
                <th className="px-6 py-4 text-left">Customer</th>
                <th className="px-6 py-4 text-left">Service</th>
                <th className="px-6 py-4 text-left">Staff</th>
                <th className="px-6 py-4 text-left">Time</th>
                <th className="px-6 py-4 text-left">Amount</th>
                <th className="px-6 py-4 text-left">Status</th>
                <th className="px-6 py-4 text-left">Payment</th>
                <th className="px-6 py-4 text-left">Method</th>
              </tr>
            </thead>

            <tbody>
              {appointments.length === 0 ? (
                <tr>
                  <td colSpan="8" className="text-center py-10 text-slate-500">
                    No appointments for selected date
                  </td>
                </tr>
              ) : (
                appointments.map((a) => (
                  <tr
                    key={a.appointmentId}
                    className="border-t border-slate-200 dark:border-slate-700 hover:bg-blue-50 dark:hover:bg-slate-700 transition"
                  >
                    <td className="px-6 py-4 font-medium">{a.customerName}</td>
                    <td className="px-6 py-4">{a.services?.join(", ")}</td>
                    <td className="px-6 py-4">{a.staffName}</td>
                    <td className="px-6 py-4">
                      {formatTime(a.startTime)} - {formatTime(a.endTime)}
                    </td>
                    <td className="px-6 py-4 font-medium">₹ {a.totalAmount}</td>

                    <td className="px-6 py-4">
                      <select
                        value={a.appointmentStatus}
                        disabled={updatingId === a.appointmentId}
                        onChange={(e) =>
                          handleAutoSaveChange(
                            a.appointmentId,
                            "appointmentStatus",
                            e.target.value
                          )
                        }
                        className={`px-3 py-2 rounded-full text-xs font-semibold border outline-none min-w-[130px] ${statusSelectClass(
                          a.appointmentStatus
                        )}`}
                      >
                        <option value="Booked">Booked</option>
                        <option value="Completed">Completed</option>
                        <option value="Cancelled">Cancelled</option>
                      </select>
                    </td>

                    <td className="px-6 py-4">
                      <select
                        value={a.paymentStatus || "Pending"}
                        disabled={updatingId === a.appointmentId}
                        onChange={(e) =>
                          handleAutoSaveChange(
                            a.appointmentId,
                            "paymentStatus",
                            e.target.value
                          )
                        }
                        className={`px-3 py-2 rounded-full text-xs font-semibold border outline-none min-w-[120px] ${statusSelectClass(
                          a.paymentStatus || "Pending"
                        )}`}
                      >
                        <option value="Pending">Pending</option>
                        <option value="Paid">Paid</option>
                        <option value="Failed">Failed</option>
                      </select>
                    </td>

                    <td className="px-6 py-4">
                      <select
                        value={a.paymentMethod || ""}
                        disabled={
                          updatingId === a.appointmentId ||
                          (a.paymentStatus || "Pending") !== "Paid"
                        }
                        onChange={(e) =>
                          handleAutoSaveChange(
                            a.appointmentId,
                            "paymentMethod",
                            e.target.value
                          )
                        }
                        className="px-3 py-2 rounded-full text-xs font-semibold border outline-none min-w-[110px] bg-slate-100 text-slate-700 border-slate-200 disabled:opacity-50"
                      >
                        <option value="">Select</option>
                        <option value="Cash">Cash</option>
                        <option value="UPI">UPI</option>
                        <option value="Card">Card</option>
                      </select>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;