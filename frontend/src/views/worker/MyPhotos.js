
import React, { useEffect, useRef, useState } from "react";
import api from "utils/axiosInstance";


const toMsg = (err) =>
  err?.response?.data?.message ??
  (typeof err?.response?.data === "object"
    ? JSON.stringify(err.response.data)
    : err?.response?.data) ??
  err?.message ??
  "Unexpected error";


const backendUrl = process.env.REACT_APP_BACKEND_URL ?? "https://localhost:7109";


export default function MyPhotos() {

  const user = JSON.parse(localStorage.getItem("user"));
  const [profileId, setProfileId] = useState(null);
  const [photos, setPhotos]       = useState([]);


  const [queue, setQueue] = useState([]);


  const [busy,      setBusy]      = useState(false);
  const [editId,    setEditId]    = useState(null);
  const [editDesc,  setEditDesc]  = useState("");
  const [deleteId,  setDeleteId]  = useState(null);

  const fileInputRef = useRef();


  const refresh = async () => {
    try {

      const { data: profile } = await api.get(`/WorkerProfile/user/${user.id}`);
      setProfileId(profile.id);

      const { data } = await api.get(`/WorkerPhoto/by-profile/${profile.id}`);
      setPhotos(data);
    } catch (err) {
      alert(toMsg(err));
    }
  };

  useEffect(() => { refresh(); }, []);


  const onSelectFiles = (e) => {
    const files = Array.from(e.target.files);
    setQueue((prev) => [
      ...prev,
      ...files.map((file) => ({ file, desc: "" })),
    ]);
    e.target.value = null; 
  };

  const onQueueDescChange = (idx, desc) => {
    setQueue((q) => q.map((item, i) => (i === idx ? { ...item, desc } : item)));
  };

  const uploadQueued = async () => {
    if (!queue.length || !profileId) return;
    setBusy(true);
    try {
      const fd = new FormData();
      queue.forEach(({ file }) => fd.append("files", file));
      fd.append("descriptions", JSON.stringify(queue.map((q) => q.desc)));
      await api.post(`/WorkerPhoto/${profileId}/upload`, fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setQueue([]);
      await refresh();
    } catch (err) {
      alert(toMsg(err));
    } finally {
      setBusy(false);
    }
  };

  const startEdit = (p) => {
    setEditId(p.id);
    setEditDesc(p.description ?? "");
  };

  const saveEdit = async () => {
    if (!editId) return;
    setBusy(true);
    try {
      const original = photos.find((p) => p.id === editId);
      await api.put(`/WorkerPhoto/${editId}`, {
        id: editId,
        workerProfileId: profileId,
        imageUrl: original.imageUrl,
        description: editDesc,
      });
      setEditId(null);
      await refresh();
    } catch (err) {
      alert(toMsg(err));
    } finally {
      setBusy(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleteId) return;
    setBusy(true);
    try {
      await api.delete(`/WorkerPhoto/${deleteId}`);
      setDeleteId(null);
      await refresh();
    } catch (err) {
      alert(toMsg(err));
    } finally {
      setBusy(false);
    }
  };


  return (
    <div className="min-h-screen px-4 md:px-10 pt-28 md:pt-32">
      <h2 className="text-2xl font-semibold text-gray-700 mb-8">
        My Project Photos
      </h2>

      <div className="bg-white rounded-lg shadow-lg p-8 mb-14">
        <h3 className="text-lg font-medium text-gray-700 mb-6">Upload new photos</h3>

        <div
          className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-indigo-500 transition"
          onClick={() => fileInputRef.current.click()}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={onSelectFiles}
            className="hidden"
          />
          <p className="text-gray-500">
            Drag & drop images here, or <span className="text-indigo-600 font-medium">browse</span>
          </p>
        </div>

        {queue.length > 0 && (
          <div className="mt-8 space-y-6">
            {queue.map((item, idx) => (
              <div key={idx} className="flex items-center gap-5">
                <img
                  src={URL.createObjectURL(item.file)}
                  alt="preview"
                  className="w-24 h-24 object-cover rounded-lg border"
                />
                <input
                  value={item.desc}
                  onChange={(e) => onQueueDescChange(idx, e.target.value)}
                  placeholder="Write a short description (optional)"
                  className="flex-1 border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 px-4 py-2 rounded-lg text-sm"
                />
              </div>
            ))}
            <button
              onClick={uploadQueued}
              disabled={busy}
              className={`inline-flex items-center justify-center px-6 py-2 rounded-lg text-white font-medium shadow transition focus:outline-none ${
                busy ? "bg-indigo-300" : "bg-indigo-600 hover:bg-indigo-700"
              }`}
            >
              {busy ? "Uploading…" : `Upload ${queue.length} photo${queue.length > 1 ? "s" : ""}`}
            </button>
          </div>
        )}
      </div>

      {photos.length === 0 ? (
        <p className="text-gray-500">You haven’t uploaded any photos yet.</p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
          {photos.map((p) => (
            <div
              key={p.id}
              className="group relative bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition"
            >
              <img
                src={p.imageUrl.startsWith("http") ? p.imageUrl : `${backendUrl}${p.imageUrl}`}
                alt="work"
                className="w-full h-48 object-cover"
              />

              {}
              {editId === p.id ? (
                <div className="p-4 bg-white">
                  <textarea
                    rows="2"
                    value={editDesc}
                    onChange={(e) => setEditDesc(e.target.value)}
                    className="w-full border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-lg text-sm px-3 py-2"
                  />
                  <div className="flex justify-end gap-2 mt-2">
                    <button
                      onClick={() => setEditId(null)}
                      className="text-gray-600 hover:text-gray-800 text-sm"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={saveEdit}
                      className="bg-emerald-500 hover:bg-emerald-600 text-white text-sm px-4 py-1.5 rounded-lg"
                    >
                      Save
                    </button>
                  </div>
                </div>
              ) : (
                p.description && (
                  <p className="p-3 text-xs text-gray-600 line-clamp-3">{p.description}</p>
                )
              )}

              {}
              {editId !== p.id && (
                <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition">
                  <button
                    onClick={() => startEdit(p)}
                    className="bg-white rounded-full p-2 shadow-md hover:bg-gray-100"
                    title="Edit description"
                  >
                    <i className="fas fa-pen text-xs text-gray-700" />
                  </button>
                  <button
                    onClick={() => setDeleteId(p.id)}
                    className="bg-white rounded-full p-2 shadow-md hover:bg-red-100"
                    title="Delete photo"
                  >
                    <i className="fas fa-trash text-xs text-red-600" />
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {}
      {deleteId && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl w-96 p-8 animate-scaleIn">
            <h4 className="text-lg font-medium text-gray-800 mb-2">Delete photo?</h4>
            <p className="text-sm text-gray-500 mb-6">This action can’t be undone.</p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setDeleteId(null)}
                className="px-4 py-2 rounded-lg text-sm hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 rounded-lg text-sm text-white bg-red-600 hover:bg-red-700"
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
