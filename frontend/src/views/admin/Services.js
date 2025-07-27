import React, { useEffect, useState } from "react";
import axios from "axios";

export default function Services() {
  const [services, setServices] = useState([]);
  const [categories, setCategories] = useState([]);
  const [newService, setNewService] = useState({ name: "", categoryId: "" });
  const [dropdownOpenId, setDropdownOpenId] = useState(null);
  const [editingId, setEditingId] = useState(null);

  const apiService = "https://localhost:7109/api/Service";
  const apiCategory = "https://localhost:7109/api/Category";

  const fetchData = async () => {
    const [sRes, cRes] = await Promise.all([
      axios.get(apiService),
      axios.get(apiCategory)
    ]);
    setServices(sRes.data);
    setCategories(cRes.data);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAdd = async () => {
    if (!newService.name || !newService.categoryId) return;
    await axios.post(apiService, newService);
    setNewService({ name: "", categoryId: "" });
    fetchData();
  };

  const handleUpdate = async (id, data) => {
    await axios.put(`${apiService}/${id}`, data);
    setEditingId(null);
    fetchData();
  };

  const handleDelete = async (id) => {
    await axios.delete(`${apiService}/${id}`);
    fetchData();
  };

  return (
    <div className="flex flex-wrap mt-4">
      <div className="w-full mb-12 px-4">
        <div className="relative flex flex-col min-w-0 break-words w-full mb-6 shadow-lg rounded bg-white">
          <div className="rounded-t mb-0 px-4 py-3 border-0">
            <div className="flex flex-wrap items-center">
              <div className="relative w-full max-w-full flex-grow flex-1">
                <h3 className="font-semibold text-lg text-blueGray-700">Services</h3>
              </div>
            </div>
          </div>
          <div className="block w-full overflow-x-auto">
            <table className="items-center w-full bg-transparent border-collapse">
              <thead>
                <tr>
                  <th className="px-6 py-3 text-xs font-semibold text-left bg-blueGray-50 text-blueGray-500">Name</th>
                  <th className="px-6 py-3 text-xs font-semibold text-left bg-blueGray-50 text-blueGray-500">Category</th>
                  <th className="px-6 py-3 text-xs font-semibold text-right bg-blueGray-50 text-blueGray-500">Actions</th>
                </tr>
              </thead>
              <tbody>
                {services.map((service) => (
                  <tr key={service.id}>
                    <td className="border-t-0 px-6 align-middle text-sm">
                      {editingId === service.id ? (
                        <input
                          className="border rounded px-2 py-1"
                          value={service.name}
                          onChange={(e) => {
                            setServices((prev) =>
                              prev.map((s) =>
                                s.id === service.id ? { ...s, name: e.target.value } : s
                              )
                            );
                          }}
                        />
                      ) : (
                        service.name
                      )}
                    </td>
                    <td className="border-t-0 px-6 align-middle text-sm">
                      {editingId === service.id ? (
                        <select
                          className="border rounded px-2 py-1"
                          value={service.categoryId}
                          onChange={(e) => {
                            const val = parseInt(e.target.value);
                            setServices((prev) =>
                              prev.map((s) =>
                                s.id === service.id ? { ...s, categoryId: val } : s
                              )
                            );
                          }}
                        >
                          <option value="">Select</option>
                          {categories.map((cat) => (
                            <option key={cat.id} value={cat.id}>
                              {cat.name}
                            </option>
                          ))}
                        </select>
                      ) : (
                        categories.find((c) => c.id === service.categoryId)?.name || "-"
                      )}
                    </td>
                    <td className="border-t-0 px-6 align-middle text-sm text-right">
                      <div className="relative inline-block text-left">
                        <button
                          onClick={() =>
                            setDropdownOpenId(dropdownOpenId === service.id ? null : service.id)
                          }
                          className="text-blueGray-500 hover:text-blueGray-700"
                        >
                          ⋮
                        </button>
                        {dropdownOpenId === service.id && (
                          <div className="origin-top-right absolute right-0 mt-2 w-28 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-10">
                            <div className="py-1">
                              {editingId === service.id ? (
                                <button
                                  onClick={() =>
                                    handleUpdate(service.id, {
                                      name: service.name,
                                      categoryId: service.categoryId,
                                    })
                                  }
                                  className="block px-4 py-2 text-sm w-full text-left"
                                >
                                  Save
                                </button>
                              ) : (
                                <button
                                  onClick={() => setEditingId(service.id)}
                                  className="block px-4 py-2 text-sm w-full text-left"
                                >
                                  Edit
                                </button>
                              )}
                              <button
                                onClick={() => handleDelete(service.id)}
                                className="block px-4 py-2 text-sm w-full text-left text-red-500"
                              >
                                Delete
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
                <tr>
                  <td className="px-6 py-3">
                    <input
                      className="border rounded px-2 py-1 w-full"
                      placeholder="New Service"
                      value={newService.name}
                      onChange={(e) =>
                        setNewService((prev) => ({ ...prev, name: e.target.value }))
                      }
                    />
                  </td>
                  <td className="px-6 py-3">
                    <select
                      className="border rounded px-2 py-1 w-full"
                      value={newService.categoryId}
                      onChange={(e) =>
                        setNewService((prev) => ({ ...prev, categoryId: parseInt(e.target.value) }))
                      }
                    >
                      <option value="">Select Category</option>
                      {categories.map((cat) => (
                        <option key={cat.id} value={cat.id}>
                          {cat.name}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="px-6 py-3 text-right">
                    <button
                      onClick={handleAdd}
                      className="bg-emerald-500 text-white text-sm px-4 py-2 rounded"
                    >
                      Add
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
