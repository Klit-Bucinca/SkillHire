import React, { useEffect, useState } from "react";
import api from "utils/axiosInstance";

export default function Services() {
  const [services, setServices] = useState([]);
  const [categories, setCategories] = useState([]);
  const [newService, setNewService] = useState({ name: "", categoryId: "" });
  const [editingId, setEditingId] = useState(null);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("name");
  const [sortDir, setSortDir] = useState("asc");

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
    try {
      await api.post("/Service", newService);
      setNewService({ name: "", categoryId: "" });
      fetchData();
    } catch (err) {
      alert("Add service failed: " + (err.response?.data?.title || err.message));
    }
  };

  const handleUpdate = async (id, service) => {
    try {
      await api.put(`/Service/${id}`, {
        id: id, // make sure it's included
        name: service.name,
        categoryId: service.categoryId,
      });
      setEditingId(null);
      fetchData();
    } catch (error) {
      console.error("Update failed:", error.response?.data || error.message);
      alert("Failed to update service. Check console for details.");
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/Service/${id}`);
      fetchData();
    } catch (err) {
      alert("Delete failed: " + (err.response?.data?.title || err.message));
    }
  };

  const getCategoryName = (categoryId) =>
    categories.find((c) => c.id === categoryId)?.name || "-";

  const visibleServices = [...services]
    .filter((service) => {
      const q = search.toLowerCase();
      const categoryName = getCategoryName(service.categoryId).toLowerCase();
      return (
        (service.name || "").toLowerCase().includes(q) || categoryName.includes(q)
      );
    })
    .sort((a, b) => {
      const aVal =
        sortBy === "category" ? getCategoryName(a.categoryId) : (a.name || "");
      const bVal =
        sortBy === "category" ? getCategoryName(b.categoryId) : (b.name || "");
      return sortDir === "asc"
        ? aVal.localeCompare(bVal)
        : bVal.localeCompare(aVal);
    });

  return (
    <div className="flex flex-wrap mt-4">
      {/* Top table - Add new service */}
      <div className="w-full mb-6 px-4">
        <div className="relative flex flex-col min-w-0 break-words w-full shadow-lg rounded bg-white">
          <div className="rounded-t px-4 py-3 border-0">
            <h3 className="font-semibold text-lg text-blueGray-700">Add New Service</h3>
          </div>
          <div className="block w-full overflow-x-auto">
            <table className="items-center w-full bg-transparent border-collapse">
              <thead>
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold bg-blueGray-50 text-blueGray-500">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold bg-blueGray-50 text-blueGray-500">Category</th>
                  <th className="px-6 py-3 text-right text-xs font-semibold bg-blueGray-50 text-blueGray-500">Add</th>
                </tr>
              </thead>
              <tbody>
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
                        setNewService((prev) => ({
                          ...prev,
                          categoryId: parseInt(e.target.value),
                        }))
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

      {/* Bottom table - All services */}
      <div className="w-full mb-12 px-4">
        <div className="relative flex flex-col min-w-0 break-words w-full shadow-lg rounded bg-white">
          <div className="rounded-t px-4 py-3 border-0">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
              <h4 className="font-semibold text-md text-blueGray-600">All Services</h4>
              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  className="border rounded px-3 py-1.5 text-sm"
                  placeholder="Search services or category"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
                <select
                  className="border rounded px-3 py-1.5 text-sm"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                >
                  <option value="name">Sort by name</option>
                  <option value="category">Sort by category</option>
                </select>
                <select
                  className="border rounded px-7 py-1.5 pl-2 text-sm"
                  value={sortDir}
                  onChange={(e) => setSortDir(e.target.value)}
                >
                  <option value="asc">A - Z</option>
                  <option value="desc">Z - A</option>
                </select>
              </div>
            </div>
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
                {visibleServices.map((service) => (
                  <tr key={service.id}>
                    <td className="border-t px-6 py-3 text-sm">
                      {editingId === service.id ? (
                        <input
                          className="border rounded px-2 py-1 w-full"
                          value={service.name}
                          onChange={(e) =>
                            setServices((prev) =>
                              prev.map((s) =>
                                s.id === service.id ? { ...s, name: e.target.value } : s
                              )
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
                            setServices((prev) =>
                              prev.map((s) =>
                                s.id === service.id
                                  ? { ...s, categoryId: parseInt(e.target.value) }
                                  : s
                              )
                            )
                          }
                        >
                          <option value="">Select</option>
                          {categories.map((cat) => (
                            <option key={cat.id} value={cat.id}>
                              {cat.name}
                            </option>
                          ))}
                        </select>
                      ) : (
                        getCategoryName(service.categoryId)
                      )}
                    </td>
                    <td className="border-t px-6 py-3 text-sm text-right space-x-2">
                      {editingId === service.id ? (
                        <button
                          onClick={() =>
                            handleUpdate(service.id, {
                              name: service.name,
                              categoryId: service.categoryId,
                            })
                          }
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
                {visibleServices.length === 0 && (
                  <tr>
                    <td
                      colSpan={3}
                      className="border-t px-6 py-4 text-sm text-blueGray-500 text-center"
                    >
                      No services found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
