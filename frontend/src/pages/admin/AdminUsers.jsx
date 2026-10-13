import { useCallback, useEffect, useState } from "react";
import { adminApi } from "../../api/adminApi";

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [busyId, setBusyId] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminApi.listUsers({ search, page: 0, size: 50 });
      setUsers(res.content || []);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load users");
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => {
    load();
  }, [load]);

  const handleSuspend = async (id) => {
    if (!confirm("Suspend this user? They won't be able to log in.")) return;
    setBusyId(id);
    try {
      await adminApi.suspendUser(id);
      await load();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to suspend");
    } finally {
      setBusyId(null);
    }
  };

  const handleActivate = async (id) => {
    setBusyId(id);
    try {
      await adminApi.activateUser(id);
      await load();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to activate");
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-2xl font-bold text-gray-900">Users</h1>
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name, username, email…"
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-maroon-500 w-72 max-w-full"
        />
      </div>

      {error && (
        <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
          {error}
        </div>
      )}

      {loading ? (
        <div className="text-center py-12 text-gray-500">Loading…</div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200 text-left text-xs uppercase text-gray-500">
              <tr>
                <th className="px-4 py-3">User</th>
                <th className="px-4 py-3">Contact</th>
                <th className="px-4 py-3">Roles</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} className="border-b border-gray-100 last:border-0">
                  <td className="px-4 py-3">
                    <div className="font-medium text-gray-900">
                      {u.firstName} {u.lastName}
                    </div>
                    <div className="text-xs text-gray-500">@{u.username}</div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-xs text-gray-700">{u.email}</div>
                    <div className="text-xs text-gray-500">{u.phone}</div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1 flex-wrap">
                      {u.roles.map((r) => (
                        <span
                          key={r}
                          className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                            r === "ADMIN"
                              ? "bg-maroon-100 text-maroon-800"
                              : r === "SELLER"
                              ? "bg-blue-100 text-blue-800"
                              : "bg-gray-100 text-gray-700"
                          }`}
                        >
                          {r}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`text-xs font-bold px-2 py-0.5 rounded ${
                        u.status === "ACTIVE"
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {u.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    {u.roles.includes("ADMIN") ? (
                      <span className="text-xs text-gray-400">Protected</span>
                    ) : u.status === "ACTIVE" ? (
                      <button
                        disabled={busyId === u.id}
                        onClick={() => handleSuspend(u.id)}
                        className="text-xs px-3 py-1.5 border border-red-300 text-red-700 hover:bg-red-50 rounded disabled:opacity-50"
                      >
                        Suspend
                      </button>
                    ) : (
                      <button
                        disabled={busyId === u.id}
                        onClick={() => handleActivate(u.id)}
                        className="text-xs px-3 py-1.5 border border-green-300 text-green-700 hover:bg-green-50 rounded disabled:opacity-50"
                      >
                        Activate
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}