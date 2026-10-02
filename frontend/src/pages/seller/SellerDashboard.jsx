import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { sellerApi } from "../../api/sellerApi";
import { useAuth } from "../../context/AuthContext";

export default function SellerDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await sellerApi.myProducts({ page: 0, size: 100 });
        const products = res.content || [];
        if (!cancelled) {
          setStats({
            total: products.length,
            active: products.filter((p) => p.status === "ACTIVE").length,
            sold: products.filter((p) => p.status === "SOLD").length,
            removed: products.filter((p) => p.status === "REMOVED").length,
          });
        }
      } catch (err) {
        // ignore
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Welcome back, {user?.firstName}
        </h1>
        <p className="text-gray-500 text-sm">Here's your seller overview.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard label="Total" value={loading ? "—" : stats?.total} />
        <StatCard label="Active" value={loading ? "—" : stats?.active} color="text-green-700" />
        <StatCard label="Sold" value={loading ? "—" : stats?.sold} color="text-maroon-700" />
        <StatCard label="Removed" value={loading ? "—" : stats?.removed} color="text-gray-400" />
      </div>

      {/* Quick actions */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="font-semibold text-gray-900 mb-4">Quick actions</h2>
        <div className="flex flex-wrap gap-3">
          <Link
            to="/seller/products/new"
            className="bg-maroon-700 hover:bg-maroon-800 text-white font-semibold px-4 py-2 rounded-lg transition"
          >
            + Add new product
          </Link>
          <Link
            to="/seller/products"
            className="border border-maroon-700 text-maroon-700 hover:bg-maroon-50 font-semibold px-4 py-2 rounded-lg transition"
          >
            Manage products
          </Link>
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, color = "text-gray-900" }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4">
      <p className="text-xs uppercase text-gray-400 font-bold">{label}</p>
      <p className={`text-3xl font-extrabold ${color}`}>{value ?? 0}</p>
    </div>
  );
}