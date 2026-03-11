 import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import API_BASE_URL from "../../api";

function Categories() {
  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);

  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize] = useState(5);
  const [pagination, setPagination] = useState({
    totalPages: 1,
    totalRecords: 0,
  });

  const [deleteModal, setDeleteModal] = useState({
    open: false,
    categoryId: null,
    categoryName: "",
  });

  const fetchCategories = async () => {
    setLoading(true);

    try {
      const res = await fetch(
        `${API_BASE_URL}/api/service-categories?search=${encodeURIComponent(
          search
        )}&page=${page}&pageSize=${pageSize}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!res.ok) throw new Error("Failed to load categories");

      const data = await res.json();
      setCategories(data.items);
      setPagination({
        totalPages: data.totalPages,
        totalRecords: data.totalRecords,
      });
    } catch (err) {
      console.error(err);
      toast.error(err.message || "Failed to load categories");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, [page, search]);

  const handleToggle = async (id) => {
    try {
      const res = await fetch(
        `${API_BASE_URL}/api/service-categories/${id}/toggle`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!res.ok) {
        const msg = await res.text();
        throw new Error(msg || "Toggle failed");
      }

      toast.success("Category status updated");
      fetchCategories();
    } catch (err) {
      console.error(err);
      toast.error(err.message || "Toggle failed");
    }
  };

  const openDeleteModal = (categoryId, categoryName) => {
    setDeleteModal({
      open: true,
      categoryId,
      categoryName,
    });
  };

  const closeDeleteModal = () => {
    setDeleteModal({
      open: false,
      categoryId: null,
      categoryName: "",
    });
  };

  const confirmDelete = async () => {
    try {
      const res = await fetch(
        `${API_BASE_URL}/api/service-categories/${deleteModal.categoryId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!res.ok) {
        const msg = await res.text();
        throw new Error(msg || "Delete failed");
      }

      const data = await res.json();
      toast.success(data.message || "Category deleted");
      closeDeleteModal();

      if (categories.length === 1 && page > 1) {
        setPage((prev) => prev - 1);
      } else {
        fetchCategories();
      }
    } catch (err) {
      console.error(err);
      toast.error(err.message || "Delete failed");
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold">Categories</h2>
            <p className="text-sm text-slate-500 mt-1">
              Manage service categories
            </p>
          </div>

          <button
            onClick={() => navigate("/admin/categories/add")}
            className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-lg font-semibold"
          >
            + Add Category
          </button>
        </div>

        <div className="mt-6">
          <input
            type="text"
            placeholder="Search category by name..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="w-full md:w-80 px-4 py-3 border rounded-lg"
          />
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
          <h3 className="text-lg font-semibold">Category List</h3>
          <span className="text-sm text-slate-500">
            Total: {pagination.totalRecords}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-400 uppercase text-xs">
              <tr>
                <th className="px-6 py-4 text-left">Name</th>
                <th className="px-6 py-4 text-left">Services</th>
                <th className="px-6 py-4 text-left">Status</th>
                <th className="px-6 py-4 text-left">Actions</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="4" className="text-center py-10 text-slate-500">
                    Loading...
                  </td>
                </tr>
              ) : categories.length === 0 ? (
                <tr>
                  <td colSpan="4" className="text-center py-10 text-slate-500">
                    No categories found
                  </td>
                </tr>
              ) : (
                categories.map((cat) => (
                  <tr
                    key={cat.categoryId}
                    className="border-t border-slate-200 dark:border-slate-700"
                  >
                    <td className="px-6 py-4 font-medium">{cat.categoryName}</td>
                    <td className="px-6 py-4">{cat.serviceCount}</td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          cat.isActive
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {cat.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-6 py-4 flex gap-2 flex-wrap">
                      <button
                        onClick={() => navigate(`/admin/categories/edit/${cat.categoryId}`)}
                        className="bg-yellow-500 text-white px-3 py-1 rounded-md text-xs"
                      >
                        Edit
                      </button>

                      <button
                        onClick={() => handleToggle(cat.categoryId)}
                        className="bg-indigo-600 text-white px-3 py-1 rounded-md text-xs"
                      >
                        Toggle
                      </button>

                      <button
                        onClick={() => openDeleteModal(cat.categoryId, cat.categoryName)}
                        className="bg-red-600 text-white px-3 py-1 rounded-md text-xs"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between">
          <button
            disabled={page <= 1}
            onClick={() => setPage((prev) => prev - 1)}
            className="px-4 py-2 rounded-lg border disabled:opacity-50"
          >
            Previous
          </button>

          <span className="text-sm text-slate-500">
            Page {page} of {pagination.totalPages || 1}
          </span>

          <button
            disabled={page >= pagination.totalPages}
            onClick={() => setPage((prev) => prev + 1)}
            className="px-4 py-2 rounded-lg border disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>

      {deleteModal.open && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl w-full max-w-md p-6">
            <h3 className="text-lg font-bold mb-2">Delete Category</h3>
            <p className="text-sm text-slate-500 mb-6">
              Are you sure you want to delete{" "}
              <span className="font-semibold text-slate-800 dark:text-slate-100">
                {deleteModal.categoryName}
              </span>
              ?
            </p>

            <div className="flex justify-end gap-3">
              <button
                onClick={closeDeleteModal}
                className="px-4 py-2 rounded-lg border"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 rounded-lg bg-red-600 text-white"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Categories;