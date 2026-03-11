import React, { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import API_BASE_URL from "../api"

export default function MyLeaves() {
  const [leaves, setLeaves] = useState([]);

  useEffect(() => {
    fetchLeaves();
  }, []);

  const fetchLeaves = async () => {
    try {
      const res = await axios.get(
        `${API_BASE_URL}/api/staff-leaves/my-leaves`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      setLeaves(res.data);
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch leaves");
    }
  };

  const cancelLeave = async (id) => {
    try {
      await axios.delete(`${API_BASE_URL}/api/staff-leaves/${id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setLeaves((prev) => prev.filter((l) => l.staffLeaveId !== id));
      toast.success("Leave canceled");
    } catch (err) {
      console.error(err);
      toast.error("Failed to cancel leave");
    }
  };

  // Separate pending and historical leaves
  const pendingLeaves = leaves.filter((l) => l.status === "Pending");
  const historicalLeaves = leaves.filter((l) => l.status !== "Pending");

  return (
    <div className="space-y-10">
      {/* Pending Leaves */}
      <div>
        <h2 className="text-2xl font-semibold mb-4">Pending Leaves</h2>
        {pendingLeaves.length === 0 ? (
          <p className="text-gray-500">No pending leave requests.</p>
        ) : (
          <div className="space-y-3">
            {pendingLeaves.map((leave) => (
              <div
                key={leave.staffLeaveId}
                className="p-4 border rounded-xl shadow-sm bg-gray-50"
              >
                <p><strong>Date:</strong> {leave.leaveDate.split("T")[0]}</p>
                <p>
                  <strong>Time:</strong>{" "}
                  {leave.startTime && leave.endTime
                    ? `${leave.startTime} - ${leave.endTime}`
                    : "Full Day"}
                </p>
                <p><strong>Reason:</strong> {leave.reason}</p>
                <p><strong>Status:</strong> {leave.status}</p>
                {leave.adminRemark && (
                  <p><strong>Admin Remark:</strong> {leave.adminRemark}</p>
                )}
                <button
                  onClick={() => cancelLeave(leave.staffLeaveId)}
                  className="mt-2 bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                >
                  Cancel
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Historical Leaves */}
      <div>
        <h2 className="text-2xl font-semibold mb-4">Leave History</h2>
        {historicalLeaves.length === 0 ? (
          <p className="text-gray-500">No past leaves found.</p>
        ) : (
          <div className="space-y-3">
            {historicalLeaves.map((leave) => (
              <div
                key={leave.staffLeaveId}
                className={`p-4 border rounded-xl shadow-sm ${
                  leave.status === "Approved"
                    ? "bg-green-50 border-green-300"
                    : "bg-red-50 border-red-300"
                }`}
              >
                <p><strong>Date:</strong> {leave.leaveDate.split("T")[0]}</p>
                <p>
                  <strong>Time:</strong>{" "}
                  {leave.startTime && leave.endTime
                    ? `${leave.startTime} - ${leave.endTime}`
                    : "Full Day"}
                </p>
                <p><strong>Reason:</strong> {leave.reason}</p>
                <p><strong>Status:</strong> {leave.status}</p>
                {leave.adminRemark && (
                  <p><strong>Admin Remark:</strong> {leave.adminRemark}</p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}