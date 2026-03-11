 import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import React from "react";
import api from "../../api";

function AddService() {
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState({
    categoryId: "",
    serviceName: "",
    description: "",
    price: "",
    durationMinutes: "",
    isActive: true,
  });

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const res = await api.get("/api/services/categories");
      setCategories(res.data);
    } catch (err) {
      toast.error("Failed to load categories");
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await api.post("/api/services", {
        ...form,
        categoryId: parseInt(form.categoryId, 10),
        price: parseFloat(form.price),
        durationMinutes: parseInt(form.durationMinutes, 10),
      });

      toast.success("Service added successfully");
      setForm({
        categoryId: "",
        serviceName: "",
        description: "",
        price: "",
        durationMinutes: "",
        isActive: true,
      });
    } catch (err) {
      toast.error(
        err.response?.data?.message ||
          err.response?.data ||
          "Error adding service"
      );
    }
  };

  return (
    <div className="max-w-3xl mx-auto bg-white p-8 rounded-xl shadow-md">
      <h2 className="text-2xl font-bold mb-6">Add Service</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <select
          name="categoryId"
          value={form.categoryId}
          onChange={handleChange}
          required
          className="w-full p-2 border rounded"
        >
          <option value="">Select Category</option>
          {categories.map((cat) => (
            <option key={cat.categoryId} value={cat.categoryId}>
              {cat.categoryName}
            </option>
          ))}
        </select>

        <input
          type="text"
          name="serviceName"
          placeholder="Service Name"
          value={form.serviceName}
          onChange={handleChange}
          required
          className="w-full p-2 border rounded"
        />

        <textarea
          name="description"
          placeholder="Description"
          value={form.description}
          onChange={handleChange}
          className="w-full p-2 border rounded"
        />

        <input
          type="number"
          min="1"
          step="1"
          name="price"
          placeholder="Price"
          value={form.price}
          onChange={handleChange}
          required
          className="w-full p-2 border rounded"
        />

        <input
          type="number"
          name="durationMinutes"
          placeholder="Duration (Minutes)"
          value={form.durationMinutes}
          onChange={handleChange}
          required
          className="w-full p-2 border rounded"
        />

        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            name="isActive"
            checked={form.isActive}
            onChange={handleChange}
          />
          Active
        </label>

        <button
          type="submit"
          className="bg-black text-white px-6 py-2 rounded hover:bg-gray-800"
        >
          Add Service
        </button>
      </form>
    </div>
  );
}

export default AddService;