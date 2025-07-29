import React, { useEffect, useState } from "react";
import api from "utils/axiosInstance";

export default function Services() {
  const [services, setServices] = useState([]);
  const [categories, setCategories] = useState([]);
  const [newService, setNewService] = useState({ name: "", categoryId: "" });
  const [editingId, setEditingId] = useState(null);

  const fetchData = async () => {
    const [sRes, cRes] = await Promise.all([
      api.get("/Service"),
      api.get("/Category")
    ]);
    setServices(sRes.data);
    setCategories(cRes.data);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAdd = async () => {
    if (!newService.name || !newService.categoryId) return;
    await api.post("/Service", newService);
    setNewService({ name: "", categoryId: "" });
    fetchData();
  };

  const handleUpdate = async (id, data) => {
    await api.put(`/Service/${id}`, data);
    setEditingId(null);
    fetchData();
  };

  const handleDelete = async (id) => {
    await api.delete(`/Service/${id}`);
    fetchData();
  };

  return (
    <div className="flex flex-wrap mt-4">
      {/* Add Service */}
      <div className="w-full mb-6 px-4">
        <div className="relative flex flex-col min-w-0 break-words w-full shadow-lg rounded bg-white">
          <div className="rounded-t px-4 py-3 border-0">
            <h3 className="font-semibold text-lg text-blueGray-700">Add Service</h3>
          </div>
          <div className="block w-full overflow-x-auto">
            <table className="items-center w-full bg-transparent border-collapse">
              <thead>
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold bg-blueGray-50 text-blueGray-500">Service Name</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold bg-blueGray-50 text-blueGray-500">Category</th>
                  <th className="px-6 py-3 text-right text-xs font-semibold bg-blueGray-50 text-blueGray-500">Action</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="px-6 py-3">
                    <input
                      className="border rounded px-2 py-1 w-full"
                      placeholder="New Service"
                      value={newService.name}
                      onChange={(e) => setNewService({ ...newService, name: e.target.value })}
                    />
                  </td>
                  <td className="px-6 py-3">
                    <select
                      className="border rounded px-2 py-1 w-full"
                      value={newService.categoryId}
                      onChange={(e) => setNewService({ ...newService, categoryId: parseInt(e.target.value) })}
                    >
                      <option value="">Select Category</option>
                      {categories.map(cat => (
                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                      ))}
                    </select>
                  </td>
                  <td className="px-6 py-3 text-right">
                    <button onClick={handleAdd} className="bg-emerald-500 text-white text-sm px-4 py-2 rounded">
                      Add
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* All Services */}
      <div className="w-full mb-12 px-4">
        <div className="relative flex flex-col min-w-0 break-words w-full shadow-lg rounded bg-white">
          <div className="rounded-t px-4 py-3 border-0">
            <h4 className="font-semibold text-md text-blueGray-600">All Services</h4>
          </div>
          <div className="block w-full overflow-x-auto">
            <table className="items-center w-full bg-transparent border-collapse">
              <thead>
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold bg-blueGray-50 text-blueGray-500">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold bg-blueGray-50 text-blueGray-500">Category</th>
                  <th className="px-6 py-3 text-right text-xs font-semibold bg-blueGray-50 text-blueGray-500">Actions</th>
                </tr>
              </thead>
              <tbody>
                {services.map(service => (
                  <tr key={service.id}>
                    <td className="border-t px-6 py-3 text-sm">
                      {editingId === service.id ? (
                        <input
                          className="border rounded px-2 py-1 w-full"
                          value={service.name}
                          onChange={(e) =>
                            setServices(prev =>
                              prev.map(s => s.id === service.id ? { ...s, name: e.target.value } : s)
                            )
                          }
                        />
                      ) : (
                        service.name
                      )}
                    </td>
                    <td className="border-t px-6 py-3 text-sm">
                      {editingId === service.id ? (
                        <select
                          className="border rounded px-2 py-1 w-full"
                          value={service.categoryId}
                          onChange={(e) =>
                            setServices(prev =>
                              prev.map(s =>
                                s.id === service.id ? { ...s, categoryId: parseInt(e.target.value) } : s
                              )
                            )
                          }
                        >
                          <option value="">Select</option>
                          {categories.map(cat => (
                            <option key={cat.id} value={cat.id}>{cat.name}</option>
                          ))}
                        </select>
                      ) : (
                        categories.find(c => c.id === service.categoryId)?.name || "-"
                      )}
                    </td>
                    <td className="border-t px-6 py-3 text-sm text-right space-x-2">
                      {editingId === service.id ? (
                        <button
                          onClick={() => handleUpdate(service.id, {
                            name: service.name,
                            categoryId: service.categoryId,
                          })}
                          className="bg-lightBlue-500 text-white px-3 py-1 rounded text-xs"
                        >
                          Save
                        </button>
                      ) : (
                        <button
                          onClick={() => setEditingId(service.id)}
                          className="bg-blueGray-600 text-white px-3 py-1 rounded text-xs"
                        >
                          Edit
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete(service.id)}
                        className="bg-red-500 text-white px-3 py-1 rounded text-xs"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
