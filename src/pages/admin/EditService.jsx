import React , { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import API_BASE_URL from "../../api";

export default function EditService() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const token = localStorage.getItem("token");

    const serviceRes = await axios.get(
      `${API_BASE_URL}/api/services/${id}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );

    const categoryRes = await axios.get(
      `${API_BASE_URL}/api/services/categories`
    );

    setForm(serviceRes.data);
    setCategories(categoryRes.data);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();

    await axios.put(
      `${API_BASE_URL}/api/services/${id}`,
      form,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`
        }
      }
    );

    navigate("/services");
  };

  if (!form) return <div className="p-6">Loading...</div>;

  return (
    <div className="p-6">
      <div className="bg-white rounded-2xl shadow-lg p-6 max-w-xl mx-auto">
        <h2 className="text-xl font-semibold mb-6">Edit Service</h2>

        <form onSubmit={handleUpdate} className="space-y-4">

          <input
            value={form.serviceName}
            onChange={e => setForm({ ...form, serviceName: e.target.value })}
            className="w-full border p-2 rounded-lg"
          />

          <textarea
            value={form.description || ""}
            onChange={e => setForm({ ...form, description: e.target.value })}
            className="w-full border p-2 rounded-lg"
          />

          <select
            value={form.categoryId}
            onChange={e => setForm({ ...form, categoryId: e.target.value })}
            className="w-full border p-2 rounded-lg"
          >
            {categories.map(cat => (
              <option key={cat.categoryId} value={cat.categoryId}>
                {cat.categoryName}
              </option>
            ))}
          </select>

          <input
            type="number"
            value={form.price}
            onChange={e => setForm({ ...form, price: e.target.value })}
            className="w-full border p-2 rounded-lg"
          />

          <input
            type="number"
            value={form.durationMinutes}
            onChange={e => setForm({ ...form, durationMinutes: e.target.value })}
            className="w-full border p-2 rounded-lg"
          />

          <button className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700">
            Update Service
          </button>
        </form>
      </div>
    </div>
  );
}