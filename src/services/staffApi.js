const BASE_URL = "http://localhost:5007/api";

const getAuthHeaders = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${localStorage.getItem("token")}`,
});

export const getTodayAppointments = async () => {
  const res = await fetch(`${BASE_URL}/staff/dashboard/today`, {
    headers: getAuthHeaders(),
  });

  if (!res.ok) throw new Error(`API ${res.status}`);
  return res.json();
};

export const completeAppointment = async (id) => {
  const res = await fetch(
    `${BASE_URL}/staff/dashboard/appointments/${id}/complete`,
    {
      method: "PUT",
      headers: getAuthHeaders(),
    }
  );

  if (!res.ok) throw new Error(`API ${res.status}`);
  return res.json();
};

export const getUpcomingAppointments = async () => {
  const res = await fetch(
    `${BASE_URL}/staff/dashboard/appointments/upcoming`,
    {
      headers: getAuthHeaders(),
    }
  );

  if (!res.ok) throw new Error(`API ${res.status}`);
  return res.json();
};