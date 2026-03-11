import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import { Pencil, Trash2 } from "lucide-react";
import API_BASE_URL from "./api";

export default function Services() {
  const [services, setServices] = useState([]);
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [loading, setLoading] = useState(false);

  const [page, setPage] = useState(1);
  const [pageSize] = useState(6);
  const [pagination, setPagination] = useState({
    totalPages: 1,
    totalRecords: 0,
  });

  const [deleteModal, setDeleteModal] = useState({
    open: false,
    serviceId: null,
    serviceName: "",
  });

  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchServices();
  }, [page, search, selectedCategory]);

  const fetchCategories = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/services/categories`);
      setCategories(res.data);
    } catch (error) {
      console.error(error);
      toast.error("Failed to load categories");
    }
  };

 const fetchServices = async () => {
  setLoading(true);
  try {
    const params = {
      search,
      page,
      pageSize,
      includeInactive: true,
    };

    if (selectedCategory) {
      params.categoryId = selectedCategory;
    }

    const res = await axios.get(`${API_BASE_URL}/api/services`, {
      params,
    });

    setServices(res.data.items || []);
    setPagination({
      totalPages: res.data.totalPages || 1,
      totalRecords: res.data.totalRecords || 0,
    });
  } catch (error) {
    console.error(error);
    toast.error("Failed to load services");
  } finally {
    setLoading(false);
  }
};

  const openDeleteModal = (serviceId, serviceName) => {
    setDeleteModal({
      open: true,
      serviceId,
      serviceName,
    });
  };

  const closeDeleteModal = () => {
    setDeleteModal({
      open: false,
      serviceId: null,
      serviceName: "",
    });
  };

  const confirmDelete = async () => {
    try {
      await axios.delete(
        `${API_BASE_URL}/api/services/${deleteModal.serviceId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      toast.success("Service deactivated successfully");
      closeDeleteModal();

      if (services.length === 1 && page > 1) {
        setPage((prev) => prev - 1);
      } else {
        fetchServices();
      }
    } catch (error) {
      console.error(error);
      const msg =
        error?.response?.data ||
        error?.message ||
        "Failed to delete service";
      toast.error(typeof msg === "string" ? msg : "Failed to delete service");
    }
  };

  const handleToggle = async (id) => {
    try {
      const res = await axios.put(
        `${API_BASE_URL}/api/services/${id}/toggle`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setServices((prev) =>
        prev.map((s) =>
          s.serviceId === id ? { ...s, isActive: res.data.isActive } : s
        )
      );

      toast.success("Service status updated");
    } catch (error) {
      console.error(error);
      const msg =
        error?.response?.data ||
        error?.message ||
        "Failed to update service";
      toast.error(typeof msg === "string" ? msg : "Failed to update service");
    }
  };

  return (
    <div className="p-6">
      <div className="bg-white dark:bg-slate-800 shadow-lg rounded-2xl p-6 border border-slate-200 dark:border-slate-700">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-6">
          <div>
            <h2 className="text-2xl font-semibold text-gray-800 dark:text-slate-100">
              Service Management
            </h2>
            <p className="text-gray-500 dark:text-slate-400 text-sm">
              Manage all salon services
            </p>
          </div>

          <button
            onClick={() => navigate("/admin/add-service")}
            className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg shadow"
          >
            + Add Service
          </button>
        </div>

        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <input
            type="text"
            placeholder="Search service..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="border border-gray-300 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100 rounded-lg px-4 py-2 w-full md:w-1/3 focus:outline-none focus:ring-2 focus:ring-blue-400"
          />

          <select
            value={selectedCategory}
            onChange={(e) => {
              setSelectedCategory(e.target.value);
              setPage(1);
            }}
            className="border border-gray-300 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100 rounded-lg px-4 py-2 w-full md:w-1/4 focus:outline-none focus:ring-2 focus:ring-blue-400"
          >
            <option value="">All Categories</option>
            {categories.map((cat) => (
              <option key={cat.categoryId} value={cat.categoryId}>
                {cat.categoryName}
              </option>
            ))}
          </select>
        </div>

        {loading ? (
          <div className="text-center py-10 text-slate-500">Loading services...</div>
        ) : services.length === 0 ? (
          <div className="text-center py-10 text-slate-500">
            No services found
          </div>
        ) : (
          <>
            <div className="mb-4 text-sm text-slate-500">
              Total: {pagination.totalRecords}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {services.map((service) => (
                <div
                  key={service.serviceId}
                  className={`border rounded-xl p-5 hover:shadow-xl transition duration-200 bg-gray-50 dark:bg-slate-900 ${
                    service.isActive
                      ? "border-green-200 dark:border-green-800"
                      : "border-red-200 dark:border-red-800 opacity-90"
                  }`}
                >
                  <div className="flex justify-between items-start gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="font-semibold text-gray-800 dark:text-slate-100">
                          {service.serviceName}
                        </h4>

                        <span
                          className={`px-2.5 py-1 rounded-full text-[11px] font-semibold ${
                            service.isActive
                              ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300"
                              : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300"
                          }`}
                        >
                          {service.isActive ? "Active" : "Inactive"}
                        </span>
                      </div>

                      <p className="text-xs text-slate-500 mt-2">
                        {service.categoryName}
                      </p>
                    </div>

                    <div className="flex gap-2 text-gray-500">
                      <button
                        onClick={() =>
                          navigate(`/admin/edit-service/${service.serviceId}`)
                        }
                        className="p-2 rounded-lg hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-slate-800"
                        title="Edit service"
                      >
                        <Pencil size={16} />
                      </button>

                      <button
                        onClick={() =>
                          openDeleteModal(service.serviceId, service.serviceName)
                        }
                        className="p-2 rounded-lg hover:bg-red-50 hover:text-red-600 dark:hover:bg-slate-800"
                        title="Delete service"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>

                  <div className="flex justify-between items-center mt-4">
                    <span className="text-blue-600 font-semibold text-lg">
                      ₹{service.price}
                    </span>

                    <label className="inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={service.isActive}
                        onChange={() => handleToggle(service.serviceId)}
                        className="sr-only peer"
                      />
                      <div className="w-10 h-5 bg-gray-300 peer-checked:bg-green-500 rounded-full relative transition">
                        <div className="absolute left-1 top-1 w-3 h-3 bg-white rounded-full transition peer-checked:translate-x-5"></div>
                      </div>
                    </label>
                  </div>

                  <div className="text-xs text-gray-400 mt-2">
                    {service.durationMinutes} mins
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8 flex items-center justify-between">
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
          </>
        )}
      </div>

      {deleteModal.open && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl w-full max-w-md p-6 border border-slate-200 dark:border-slate-700">
            <h3 className="text-lg font-bold mb-2 text-slate-900 dark:text-slate-100">
              Delete Service
            </h3>

            <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
              Are you sure you want to delete{" "}
              <span className="font-semibold text-slate-800 dark:text-slate-100">
                {deleteModal.serviceName}
              </span>
              ?
            </p>

            <div className="flex justify-end gap-3">
              <button
                onClick={closeDeleteModal}
                className="px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600"
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