 import React, { useEffect, useState } from "react";
import API_BASE_URL from "../../api";

export default function AdminLeaves() {
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLeaves();
  }, []);

  const fetchLeaves = async () => {
    try {
      setLoading(true);

      const res = await fetch(
        `${API_BASE_URL}/api/staff-leaves/admin/pending`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      const data = await res.json();
      setLeaves(data);
    } catch (error) {
      console.error("Error fetching leaves:", error);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id, status) => {
    try {
      await fetch(
        `${API_BASE_URL}/api/staff-leaves/admin/${id}?status=${status}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      fetchLeaves();
    } catch (error) {
      console.error("Error updating leave status:", error);
    }
  };

  // Format date as dd-mon-yyyy
  const formatDate = (dateString) => {
    const date = new Date(dateString);

    const day = String(date.getDate()).padStart(2, "0");
    const month = date.toLocaleString("en-US", { month: "short" });
    const year = date.getFullYear();

    return `${day}-${month}-${year}`;
  };

  return (
    <div className="p-8">
      <h2 className="text-2xl font-semibold mb-6 text-gray-800">
        Pending Leave Requests
      </h2>

      {loading ? (
        <p className="text-gray-500">Loading leave requests...</p>
      ) : leaves.length === 0 ? (
        <p className="text-gray-500">No pending leave requests.</p>
      ) : (
        leaves.map((leave) => (
          <div
            key={leave.staffLeaveId}
            className="border p-5 rounded-xl mb-5 shadow-sm bg-white"
          >
            <p className="mb-1">
              <strong>Staff:</strong> {leave.staff.user.fullName}
            </p>

            <p className="mb-1">
              <strong>Date:</strong> {formatDate(leave.leaveDate)}
            </p>

            <p className="mb-3">
              <strong>Reason:</strong> {leave.reason}
            </p>

            <div className="flex gap-3">
              <button
                onClick={() =>
                  updateStatus(leave.staffLeaveId, "Approved")
                }
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md"
              >
                Approve
              </button>

              <button
                onClick={() =>
                  updateStatus(leave.staffLeaveId, "Rejected")
                }
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md"
              >
                Reject
              </button>
            </div>
          </div>
        ))
      )}
    </div>
  );
}