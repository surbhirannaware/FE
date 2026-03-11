 import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import api from "../../api";

export default function EditService() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");

      const [serviceRes, categoryRes] = await Promise.all([
        api.get(`/api/services/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        api.get("/api/services/categories"),
      ]);

      setForm({
        ...serviceRes.data,
        categoryId: serviceRes.data.categoryId?.toString() || "",
        serviceName: serviceRes.data.serviceName || "",
        description: serviceRes.data.description || "",
        price: serviceRes.data.price ?? "",
        durationMinutes: serviceRes.data.durationMinutes ?? "",
        isActive: serviceRes.data.isActive ?? true,
      });

      setCategories(Array.isArray(categoryRes.data) ? categoryRes.data : []);
    } catch (err) {
      console.error(err);
      toast.error(
        err.response?.data?.message ||
          err.response?.data ||
          "Failed to load service"
      );
      navigate("/services");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();

    if (!form.serviceName?.trim()) {
      toast.error("Service name is required");
      return;
    }

    if (!form.categoryId) {
      toast.error("Category is required");
      return;
    }

    try {
      setSaving(true);

      await api.put(
        `/api/services/${id}`,
        {
          ...form,
          categoryId: parseInt(form.categoryId, 10),
          price: parseFloat(form.price),
          durationMinutes: parseInt(form.durationMinutes, 10),
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      toast.success("Service updated successfully");
      navigate("/services");
    } catch (err) {
      console.error(err);
      toast.error(
        err.response?.data?.message ||
          err.response?.data ||
          "Failed to update service"
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading || !form) return <div className="p-6">Loading...</div>;

  return (
    <div className="p-6">
      <div className="bg-white rounded-2xl shadow-lg p-6 max-w-xl mx-auto">
        <h2 className="text-xl font-semibold mb-6">Edit Service</h2>

        <form onSubmit={handleUpdate} className="space-y-4">
          <input
            value={form.serviceName}
            onChange={(e) =>
              setForm({ ...form, serviceName: e.target.value })
            }
            className="w-full border p-2 rounded-lg"
            placeholder="Service Name"
          />

          <textarea
            value={form.description || ""}
            onChange={(e) =>
              setForm({ ...form, description: e.target.value })
            }
            className="w-full border p-2 rounded-lg"
            placeholder="Description"
          />

          <select
            value={form.categoryId}
            onChange={(e) =>
              setForm({ ...form, categoryId: e.target.value })
            }
            className="w-full border p-2 rounded-lg"
          >
            <option value="">Select Category</option>
            {categories.map((cat) => (
              <option key={cat.categoryId} value={cat.categoryId}>
                {cat.categoryName}
              </option>
            ))}
          </select>

          <input
            type="number"
            value={form.price}
            onChange={(e) => setForm({ ...form, price: e.target.value })}
            className="w-full border p-2 rounded-lg"
            placeholder="Price"
          />

          <input
            type="number"
            value={form.durationMinutes}
            onChange={(e) =>
              setForm({ ...form, durationMinutes: e.target.value })
            }
            className="w-full border p-2 rounded-lg"
            placeholder="Duration (Minutes)"
          />

          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={form.isActive}
              onChange={(e) =>
                setForm({ ...form, isActive: e.target.checked })
              }
            />
            Active
          </label>

          <button
            type="submit"
            disabled={saving}
            className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 disabled:opacity-50"
          >
            {saving ? "Updating..." : "Update Service"}
          </button>
        </form>
      </div>
    </div>
  );
}