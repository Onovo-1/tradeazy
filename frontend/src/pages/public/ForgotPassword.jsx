import { useState } from "react";
import { Link } from "react-router-dom";
import axiosClient from "../../api/axiosClient";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await axiosClient.post("/auth/forgot-password", { email });
      setSubmitted(true);
    } catch (err) {
      setError("Something went wrong. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center bg-gray-50 px-4 py-10">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
        <h1 className="text-2xl font-bold text-maroon-900 text-center mb-2">Forgot Password</h1>
        <p className="text-gray-500 text-center text-sm mb-6">
          Enter your email and we'll send you a reset link.
        </p>

        {submitted ? (
          <div className="p-4 rounded-lg bg-green-50 border border-green-200 text-green-800 text-sm text-center">
            If an account exists for <strong>{email}</strong>, we've sent a link.
            <br /><br />
            <span className="text-xs text-gray-600">(For now, check the backend console for the reset link.)</span>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
                {error}
              </div>
            )}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-maroon-500"
                placeholder="you@example.com"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-maroon-700 hover:bg-maroon-800 text-white font-bold py-3 rounded-lg transition disabled:opacity-50"
            >
              {loading ? "Sending..." : "Send Reset Link"}
            </button>
          </form>
        )}

        <p className="text-center text-sm text-gray-600 mt-6">
          <Link to="/login" className="text-maroon-700 font-bold hover:underline">
            ← Back to login
          </Link>
        </p>
      </div>
    </div>
  );
}