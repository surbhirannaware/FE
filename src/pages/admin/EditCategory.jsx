 import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import api from "../../api";

function EditCategory() {
  const token = localStorage.getItem("token");
  const navigate = useNavigate();
  const { id } = useParams();

  const [form, setForm] = useState({
    categoryName: "",
    isActive: true,
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const fetchCategory = async () => {
    try {
      const res = await api.get(`/api/service-categories/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = res.data;

      setForm({
        categoryName: data.categoryName || "",
        isActive: data.isActive ?? true,
      });
    } catch (err) {
      console.error(err);
      toast.error(
        err.response?.data?.message ||
          err.response?.data ||
          "Failed to load category"
      );
      navigate("/admin/categories");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategory();
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.categoryName.trim()) {
      toast.error("Category name is required");
      return;
    }

    try {
      setSaving(true);

      await api.put(
        `/api/service-categories/${id}`,
        {
          categoryName: form.categoryName.trim(),
          isActive: form.isActive,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      toast.success("Category updated successfully");
      navigate("/admin/categories");
    } catch (err) {
      console.error(err);
      toast.error(
        err.response?.data?.message ||
          err.response?.data ||
          err.message ||
          "Something went wrong"
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="text-slate-500">Loading category...</div>;
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm p-6">
        <h2 className="text-2xl font-bold mb-6">Edit Category</h2>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium mb-2">
              Category Name
            </label>
            <input
              type="text"
              value={form.categoryName}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, categoryName: e.target.value }))
              }
              placeholder="Enter category name"
              className="w-full px-4 py-3 border rounded-lg"
            />
          </div>

          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={form.isActive}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, isActive: e.target.checked }))
              }
            />
            Active
          </label>

          <div className="flex gap-3">
            <button
              type="submit"
              disabled={saving}
              className="bg-blue-600 text-white px-5 py-3 rounded-lg font-semibold disabled:opacity-50"
            >
              {saving ? "Updating..." : "Update"}
            </button>

            <button
              type="button"
              onClick={() => navigate("/admin/categories")}
              className="bg-slate-500 text-white px-5 py-3 rounded-lg font-semibold"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default EditCategory;