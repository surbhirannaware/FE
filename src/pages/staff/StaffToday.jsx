import { useEffect, useState } from "react";
import {
  getTodayAppointments,
  completeAppointment,
} from "../../services/staffApi";
import toast from "react-hot-toast";
import React from "react";
import API_BASE_URL from "../../api";

function StaffToday() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
  try {
    const result = await getTodayAppointments();
    console.log("API RESULT:", result);  
    setData(result);
  } catch (err) {
    console.error("API ERROR:", err);     
    toast.error("Failed to load appointments");
  } finally {
    setLoading(false);
  }
};

  useEffect(() => {
    fetchData();
  }, []);

  const handleComplete = async (id) => {
    try {
      await completeAppointment(id);
      toast.success("Appointment completed");
      fetchData();
    } catch {
      toast.error("Error completing appointment");
    }
  };

  if (loading) return <p>Loading...</p>;

  return (
    <div className="p-6 space-y-6">

      {/* DASHBOARD STATS */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">

        <div className="bg-blue-500 text-white p-4 rounded-xl shadow">
          <p className="text-sm">Total Appointments</p>
          <h3 className="text-2xl font-bold">
            {data?.totalAppointments}
          </h3>
        </div>

        <div className="bg-green-500 text-white p-4 rounded-xl shadow">
          <p className="text-sm">Completed</p>
          <h3 className="text-2xl font-bold">
            {data?.completedAppointments}
          </h3>
        </div>

        <div className="bg-yellow-500 text-white p-4 rounded-xl shadow">
          <p className="text-sm">Pending</p>
          <h3 className="text-2xl font-bold">
            {data?.pendingAppointments}
          </h3>
        </div>

        <div className="bg-purple-500 text-white p-4 rounded-xl shadow">
          <p className="text-sm">Today's Earnings</p>
          <h3 className="text-2xl font-bold">
            ₹ {data?.todayEarnings}
          </h3>
        </div>

      </div>

      {/* TODAY'S APPOINTMENTS LIST */}
      <div>
        <h2 className="text-2xl font-bold mb-4">
          Today's Appointments
        </h2>

        {data?.appointments?.length === 0 && (
          <p className="text-gray-500">No appointments today</p>
        )}

        {data?.appointments?.map((appt) => (
          <div
            key={appt.appointmentId}
            className="bg-white shadow-md rounded-xl p-4 mb-4"
          >
            <div className="flex justify-between items-center">

              <div>
                <p className="font-semibold text-lg">
                  {appt.customerName}
                </p>

                <p className="text-sm text-gray-500">
                  {appt.startTime} - {appt.endTime}
                </p>

                <div className="mt-2">
                  {appt.services.map((s, i) => (
                    <span
                      key={i}
                      className="bg-gray-200 text-sm px-2 py-1 rounded mr-2"
                    >
                      {s}
                    </span>
                  ))}
                </div>
              </div>

              {appt.status === "Booked" && (
                <button
                  onClick={() =>
                    handleComplete(appt.appointmentId)
                  }
                  className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
                >
                  Complete
                </button>
              )}

              {appt.status === "Completed" && (
                <span className="text-green-600 font-semibold">
                  Completed
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default StaffToday;