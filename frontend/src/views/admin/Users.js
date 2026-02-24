import React, { useEffect, useState } from "react";
import api from "utils/axiosInstance";

export default function Users() {
  const [users, setUsers] = useState([]);
  const [editingId, setEditingId] = useState(null);

  const fetchUsers = async () => {
    const res = await api.get("/Users");
    setUsers(res.data);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleUpdate = async (user) => {
    try {
      await api.put(`/Users/${user.id}`, {
        id: user.id,
        name: user.name,
        surname: user.surname,
        personalNumber: user.personalNumber,
        username: user.username,
        email: user.email,
        role: user.role,
      });
      setEditingId(null);
      fetchUsers();
    } catch (err) {
      alert(err.response?.data || "Update failed.");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this user?")) return;
    try {
      await api.delete(`/Users/${id}`);
      fetchUsers();
    } catch (err) {
      if (err.response?.status === 409) {
        const force = window.confirm(
          "User has related records. Force delete? This will remove related hires and worker data."
        );
        if (!force) return;
        try {
          await api.delete(`/Users/${id}?force=true`);
          fetchUsers();
          return;
        } catch (forceErr) {
          alert(forceErr.response?.data || "Force delete failed.");
          return;
        }
      }
      alert(err.response?.data || "Delete failed.");
    }
  };

  const updateField = (id, field, value) => {
    setUsers((prev) =>
      prev.map((u) => (u.id === id ? { ...u, [field]: value } : u))
    );
  };

  return (
    <div className="flex flex-wrap mt-4">
      <div className="w-full mb-12 px-4">
        <div className="relative flex flex-col min-w-0 break-words w-full shadow-lg rounded bg-white">
          <div className="rounded-t px-4 py-3 border-0">
            <h4 className="font-semibold text-md text-blueGray-600">Users</h4>
          </div>
          <div className="block w-full overflow-x-auto">
            <table className="items-center w-full bg-transparent border-collapse">
              <thead>
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold bg-blueGray-50 text-blueGray-500">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold bg-blueGray-50 text-blueGray-500">
                    Surname
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold bg-blueGray-50 text-blueGray-500">
                    Username
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold bg-blueGray-50 text-blueGray-500">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold bg-blueGray-50 text-blueGray-500">
                    Role
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold bg-blueGray-50 text-blueGray-500">
                    Personal Number
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-semibold bg-blueGray-50 text-blueGray-500">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id}>
                    <td className="border-t px-6 py-3 text-sm">
                      {editingId === u.id ? (
                        <input
                          className="border rounded px-2 py-1 w-full"
                          value={u.name || ""}
                          onChange={(e) => updateField(u.id, "name", e.target.value)}
                        />
                      ) : (
                        u.name
                      )}
                    </td>
                    <td className="border-t px-6 py-3 text-sm">
                      {editingId === u.id ? (
                        <input
                          className="border rounded px-2 py-1 w-full"
                          value={u.surname || ""}
                          onChange={(e) =>
                            updateField(u.id, "surname", e.target.value)
                          }
                        />
                      ) : (
                        u.surname
                      )}
                    </td>
                    <td className="border-t px-6 py-3 text-sm">
                      {editingId === u.id ? (
                        <input
                          className="border rounded px-2 py-1 w-full"
                          value={u.username || ""}
                          onChange={(e) =>
                            updateField(u.id, "username", e.target.value)
                          }
                        />
                      ) : (
                        u.username
                      )}
                    </td>
                    <td className="border-t px-6 py-3 text-sm">
                      {editingId === u.id ? (
                        <input
                          className="border rounded px-2 py-1 w-full"
                          value={u.email || ""}
                          onChange={(e) => updateField(u.id, "email", e.target.value)}
                        />
                      ) : (
                        u.email
                      )}
                    </td>
                    <td className="border-t px-6 py-3 text-sm">
                      {editingId === u.id ? (
                        <select
                          className="border rounded px-2 py-1 w-full"
                          value={u.role || "Client"}
                          onChange={(e) => updateField(u.id, "role", e.target.value)}
                        >
                          <option value="Client">Client</option>
                          <option value="Worker">Worker</option>
                          <option value="Admin">Admin</option>
                        </select>
                      ) : (
                        u.role
                      )}
                    </td>
                    <td className="border-t px-6 py-3 text-sm">
                      {editingId === u.id ? (
                        <input
                          className="border rounded px-2 py-1 w-full"
                          value={u.personalNumber || ""}
                          onChange={(e) =>
                            updateField(u.id, "personalNumber", e.target.value)
                          }
                        />
                      ) : (
                        u.personalNumber
                      )}
                    </td>
                    <td className="border-t px-6 py-3 text-sm text-right space-x-2">
                      {editingId === u.id ? (
                        <button
                          onClick={() => handleUpdate(u)}
                          className="bg-lightBlue-500 text-white px-3 py-1 rounded text-xs"
                        >
                          Save
                        </button>
                      ) : (
                        <button
                          onClick={() => setEditingId(u.id)}
                          className="bg-blueGray-600 text-white px-3 py-1 rounded text-xs"
                        >
                          Edit
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete(u.id)}
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
