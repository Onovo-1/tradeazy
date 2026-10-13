import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { adminApi } from "../../api/adminApi";
import { formatNaira } from "../../utils/formatters";

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    adminApi
      .dashboard()
      .then(setStats)
      .catch((err) =>
        setError(err.response?.data?.message || "Failed to load dashboard")
      )
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-10 w-10 border-4 border-maroon-200 border-t-maroon-700" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Admin Overview</h1>
        <p className="text-sm text-gray-500">Platform-wide statistics</p>
      </div>

      {/* Users */}
      <Section title="Users">
        <StatCard label="Total Users" value={stats.totalUsers} />
        <StatCard label="Buyers" value={stats.totalBuyers} color="text-green-700" />
        <StatCard label="Sellers" value={stats.totalSellers} color="text-maroon-700" />
        <StatCard label="Admins" value={stats.totalAdmins} color="text-gray-600" />
      </Section>

      {/* Products */}
      <Section title="Products">
        <StatCard label="Total" value={stats.totalProducts} />
        <StatCard label="Active" value={stats.activeProducts} color="text-green-700" />
        <StatCard label="Sold" value={stats.soldProducts} color="text-maroon-700" />
        <StatCard label="Removed" value={stats.removedProducts} color="text-gray-400" />
      </Section>

      {/* Orders */}
      <Section title="Orders & Revenue">
        <StatCard label="Total Orders" value={stats.totalOrders} />
        <StatCard label="Pending" value={stats.pendingOrders} color="text-yellow-700" />
        <StatCard label="Completed" value={stats.completedOrders} color="text-green-700" />
        <StatCard
          label="Total Revenue"
          value={formatNaira(stats.totalRevenue)}
          color="text-maroon-800"
          isText
        />
      </Section>

      {/* Subscriptions */}
      <Section title="Subscriptions (Rent)">
        <StatCard label="Active" value={stats.activeSubscriptions} color="text-green-700" />
        <StatCard label="Expired" value={stats.expiredSubscriptions} color="text-gray-500" />
        <StatCard
          label="Subscription Revenue"
          value={formatNaira(stats.subscriptionRevenue)}
          color="text-maroon-800"
          isText
        />
        <StatCard label="Total Rent Collected" value="" hidden />
      </Section>

      {/* Engagement */}
      <Section title="Engagement">
        <StatCard label="Conversations" value={stats.totalConversations} />
        <StatCard label="Offers" value={stats.totalOffers} />
        <StatCard label="Favorites" value={stats.totalFavorites} />
        <StatCard label="" value="" hidden />
      </Section>

      {/* Quick links */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="font-semibold text-gray-900 mb-4">Quick actions</h2>
        <div className="flex flex-wrap gap-3">
          <Link
            to="/admin/users"
            className="bg-maroon-700 hover:bg-maroon-800 text-white font-semibold px-4 py-2 rounded-lg transition"
          >
            Manage users
          </Link>
          <Link
            to="/admin/products"
            className="border border-maroon-700 text-maroon-700 hover:bg-maroon-50 font-semibold px-4 py-2 rounded-lg transition"
          >
            Moderate products
          </Link>
        </div>
      </div>
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div>
      <h2 className="text-lg font-bold text-gray-900 mb-3">{title}</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">{children}</div>
    </div>
  );
}

function StatCard({ label, value, color = "text-gray-900", isText = false, hidden = false }) {
  if (hidden) return null;
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4">
      <p className="text-xs uppercase text-gray-400 font-bold mb-1">{label}</p>
      <p className={`${isText ? "text-xl" : "text-3xl"} font-extrabold ${color}`}>
        {value}
      </p>
    </div>
  );
}