import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import API_BASE_URL from "../../api";

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
      const res = await fetch(
        `${API_BASE_URL}/api/service-categories/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!res.ok) throw new Error("Failed to load category");

      const data = await res.json();

      setForm({
        categoryName: data.categoryName,
        isActive: data.isActive,
      });
    } catch (err) {
      console.error(err);
      toast.error(err.message || "Failed to load category");
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

      const res = await fetch(
        `${API_BASE_URL}/api/service-categories/${id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            categoryName: form.categoryName.trim(),
            isActive: form.isActive,
          }),
        }
      );

      if (!res.ok) {
        const msg = await res.text();
        throw new Error(msg || "Failed to update category");
      }

      toast.success("Category updated successfully");
      navigate("/admin/categories");
    } catch (err) {
      console.error(err);
      toast.error(err.message || "Something went wrong");
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