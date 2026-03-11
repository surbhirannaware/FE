 import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import api from "../../api";

export default function MyLeaves() {
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(false);
  const [cancellingId, setCancellingId] = useState(null);

  useEffect(() => {
    fetchLeaves();
  }, []);

  const fetchLeaves = async () => {
    try {
      setLoading(true);

      const res = await api.get("/api/staff-leaves/my-leaves", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      setLeaves(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error(err);
      toast.error(
        err.response?.data?.message ||
          err.response?.data ||
          "Failed to fetch leaves"
      );
      setLeaves([]);
    } finally {
      setLoading(false);
    }
  };

  const cancelLeave = async (id) => {
    try {
      setCancellingId(id);

      await api.delete(`/api/staff-leaves/${id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      setLeaves((prev) => prev.filter((l) => l.staffLeaveId !== id));
      toast.success("Leave canceled");
    } catch (err) {
      console.error(err);
      toast.error(
        err.response?.data?.message ||
          err.response?.data ||
          "Failed to cancel leave"
      );
    } finally {
      setCancellingId(null);
    }
  };

  const formatDate = (dateValue) => {
    if (!dateValue) return "-";
    return new Date(dateValue).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const formatTime = (timeValue) => {
    if (!timeValue) return "Full Day";

    const date = new Date(`1970-01-01T${timeValue}`);
    return date.toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  const pendingLeaves = leaves.filter((l) => l.status === "Pending");
  const historicalLeaves = leaves.filter((l) => l.status !== "Pending");

  if (loading) {
    return <div className="text-gray-500">Loading leaves...</div>;
  }

  return (
    <div className="space-y-10">
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
                <p>
                  <strong>Date:</strong> {formatDate(leave.leaveDate)}
                </p>
                <p>
                  <strong>Time:</strong>{" "}
                  {leave.startTime && leave.endTime
                    ? `${formatTime(leave.startTime)} - ${formatTime(
                        leave.endTime
                      )}`
                    : "Full Day"}
                </p>
                <p>
                  <strong>Reason:</strong> {leave.reason || "-"}
                </p>
                <p>
                  <strong>Status:</strong> {leave.status}
                </p>
                {leave.adminRemark && (
                  <p>
                    <strong>Admin Remark:</strong> {leave.adminRemark}
                  </p>
                )}
                <button
                  onClick={() => cancelLeave(leave.staffLeaveId)}
                  disabled={cancellingId === leave.staffLeaveId}
                  className="mt-2 bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 disabled:opacity-60"
                >
                  {cancellingId === leave.staffLeaveId
                    ? "Cancelling..."
                    : "Cancel"}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

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
                <p>
                  <strong>Date:</strong> {formatDate(leave.leaveDate)}
                </p>
                <p>
                  <strong>Time:</strong>{" "}
                  {leave.startTime && leave.endTime
                    ? `${formatTime(leave.startTime)} - ${formatTime(
                        leave.endTime
                      )}`
                    : "Full Day"}
                </p>
                <p>
                  <strong>Reason:</strong> {leave.reason || "-"}
                </p>
                <p>
                  <strong>Status:</strong> {leave.status}
                </p>
                {leave.adminRemark && (
                  <p>
                    <strong>Admin Remark:</strong> {leave.adminRemark}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}