import React, { useEffect, useState } from "react";
import api from "utils/axiosInstance";

export default function Categories() {
  const [categories, setCategories] = useState([]);
  const [newName, setNewName] = useState("");
  const [editingId, setEditingId] = useState(null);

  const categoryUrl = "/Category";

  const fetchCategories = async () => {
    const res = await api.get(categoryUrl);
    setCategories(res.data);
  };

  const handleAdd = async () => {
    if (!newName.trim()) return;
    await api.post(categoryUrl, { name: newName });
    setNewName("");
    fetchCategories();
  };

  const handleUpdate = async (id, name) => {
    await api.put(`${categoryUrl}/${id}`, { id, name });
    setEditingId(null);
    fetchCategories();
  };

  const handleDelete = async (id) => {
    await api.delete(`${categoryUrl}/${id}`);
    fetchCategories();
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  return (
    <div className="flex flex-wrap mt-4">
      <div className="w-full mb-6 px-4">
        <div className="relative flex flex-col min-w-0 break-words w-full shadow-lg rounded bg-white">
          <div className="rounded-t px-4 py-3 border-0">
            <div className="flex items-center">
              <h3 className="font-semibold text-lg text-blueGray-700">Categories</h3>
            </div>
          </div>
          <div className="block w-full overflow-x-auto">
            <table className="items-center w-full bg-transparent border-collapse">
              <thead>
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold bg-blueGray-50 text-blueGray-500">
                    Add New Category
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-semibold bg-blueGray-50 text-blueGray-500">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="px-6 py-3">
                    <input
                      className="border rounded px-2 py-1 w-full"
                      placeholder="New Category"
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                    />
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

      {/* Categories Table */}
      <div className="w-full mb-12 px-4">
        <div className="relative flex flex-col min-w-0 break-words w-full shadow-lg rounded bg-white">
          <div className="rounded-t px-4 py-3 border-0">
            <div className="flex items-center">
              <h4 className="font-semibold text-md text-blueGray-600">All Categories</h4>
            </div>
          </div>
          <div className="block w-full overflow-x-auto">
            <table className="items-center w-full bg-transparent border-collapse">
              <thead>
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold bg-blueGray-50 text-blueGray-500">
                    Name
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-semibold bg-blueGray-50 text-blueGray-500">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {categories.map((cat) => (
                  <tr key={cat.id}>
                    <td className="border-t px-6 py-3 text-sm align-middle">
                      {editingId === cat.id ? (
                        <input
                          className="border rounded px-2 py-1 w-full"
                          value={cat.name}
                          onChange={(e) =>
                            setCategories((prev) =>
                              prev.map((c) =>
                                c.id === cat.id ? { ...c, name: e.target.value } : c
                              )
                            )
                          }
                        />
                      ) : (
                        cat.name
                      )}
                    </td>
                    <td className="border-t px-6 py-3 text-sm align-middle text-right space-x-2">
                      {editingId === cat.id ? (
                        <button
                          onClick={() => handleUpdate(cat.id, cat.name)}
                          className="bg-lightBlue-500 text-white px-3 py-1 rounded text-xs"
                        >
                          Save
                        </button>
                      ) : (
                        <button
                          onClick={() => setEditingId(cat.id)}
                          className="bg-blueGray-600 text-white px-3 py-1 rounded text-xs"
                        >
                          Edit
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete(cat.id)}
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
