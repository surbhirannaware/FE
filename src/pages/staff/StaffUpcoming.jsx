import { useEffect, useState } from "react";
import { getUpcomingAppointments } from "../../services/staffApi";
import React from "react";
import API_BASE_URL from "../api";

function StaffUpcoming() {
  const [appointments, setAppointments] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      const data = await getUpcomingAppointments();
      setAppointments(data);
    };

    fetchData();
  }, []);

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">
        Upcoming Appointments
      </h2>

      {appointments.map((appt) => (
        <div
          key={appt.appointmentId}
          className="bg-white shadow rounded p-4 mb-3"
        >
          <p className="font-semibold">{appt.customerName}</p>
          <p className="text-sm text-gray-500">
            {appt.appointmentDate} | {appt.startTime} - {appt.endTime}
          </p>

          <div className="mt-2">
            {appt.services.map((s, i) => (
              <span
                key={i}
                className="bg-blue-100 text-sm px-2 py-1 rounded mr-2"
              >
                {s}
              </span>
            ))}

            {appt.isOngoing && (
  <span className="text-green-600 font-bold ml-2">
    Ongoing
  </span>
)}

{appt.isUpcoming && (
  <span className="text-blue-600 font-bold ml-2">
    Upcoming
  </span>
)}
          </div>
        </div>
      ))}
    </div>
  );
}

export default StaffUpcoming;