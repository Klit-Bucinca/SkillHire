import React, { useEffect, useState } from "react";
import axios from "axios";

export default function Categories() {
  const [categories, setCategories] = useState([]);
  const [newName, setNewName] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [dropdownOpenId, setDropdownOpenId] = useState(null);

  const api = "https://localhost:7109/api/Category"; // adjust to your backend URL

  const fetchCategories = async () => {
    const res = await axios.get(api);
    setCategories(res.data);
  };

  const handleAdd = async () => {
    if (!newName.trim()) return;
    await axios.post(api, { name: newName });
    setNewName("");
    fetchCategories();
  };

  const handleUpdate = async (id, name) => {
    await axios.put(`${api}/${id}`, { id, name });
    setEditingId(null);
    fetchCategories();
  };

  const handleDelete = async (id) => {
    await axios.delete(`${api}/${id}`);
    fetchCategories();
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  return (
    <div className="flex flex-wrap mt-4">
      <div className="w-full mb-12 px-4">
        <div className="relative flex flex-col min-w-0 break-words w-full mb-6 shadow-lg rounded bg-white">
          <div className="rounded-t mb-0 px-4 py-3 border-0">
            <div className="flex flex-wrap items-center">
              <div className="relative w-full max-w-full flex-grow flex-1">
                <h3 className="font-semibold text-lg text-blueGray-700">Categories</h3>
              </div>
            </div>
          </div>
          <div className="block w-full overflow-x-auto">
            <table className="items-center w-full bg-transparent border-collapse">
              <thead>
                <tr>
                  <th className="px-6 align-middle border border-solid py-3 text-xs uppercase border-l-0 border-r-0 whitespace-nowrap font-semibold text-left bg-blueGray-50 text-blueGray-500 border-blueGray-100">
                    Name
                  </th>
                  <th className="px-6 text-right bg-blueGray-50 text-blueGray-500">Actions</th>
                </tr>
              </thead>
              <tbody>
                {categories.map((cat) => (
                  <tr key={cat.id}>
                    <td className="border-t-0 px-6 align-middle text-sm">
                      {editingId === cat.id ? (
                        <input
                          className="border rounded px-2 py-1"
                          value={cat.name}
                          onChange={(e) => {
                            setCategories((prev) =>
                              prev.map((c) =>
                                c.id === cat.id ? { ...c, name: e.target.value } : c
                              )
                            );
                          }}
                        />
                      ) : (
                        cat.name
                      )}
                    </td>
                    <td className="border-t-0 px-6 align-middle text-sm text-right">
                      <div className="relative inline-block text-left">
                        <button
                          onClick={() =>
                            setDropdownOpenId(dropdownOpenId === cat.id ? null : cat.id)
                          }
                          className="text-blueGray-500 hover:text-blueGray-700"
                        >
                          ⋮
                        </button>
                        {dropdownOpenId === cat.id && (
                          <div className="origin-top-right absolute right-0 mt-2 w-28 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-10">
                            <div className="py-1">
                              {editingId === cat.id ? (
                                <button
                                  onClick={() => handleUpdate(cat.id, cat.name)}
                                  className="block px-4 py-2 text-sm w-full text-left"
                                >
                                  Save
                                </button>
                              ) : (
                                <button
                                  onClick={() => setEditingId(cat.id)}
                                  className="block px-4 py-2 text-sm w-full text-left"
                                >
                                  Edit
                                </button>
                              )}
                              <button
                                onClick={() => handleDelete(cat.id)}
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
    </div>
  );
}
