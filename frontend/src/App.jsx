import { useEffect, useState } from "react";
import axios from "axios";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080/api";

export default function App() {
  const [status, setStatus] = useState("checking...");
  const [error, setError] = useState(null);

  useEffect(() => {
    axios.get(`${API_BASE}/health`)
      .then(res => setStatus(res.data.status))
      .catch(err => setError(err.message));
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white">
      <div className="text-center space-y-4">
        <h1 className="text-5xl font-extrabold text-maroon-700">Tradeazy</h1>
        <p className="text-gray-600">Your marketplace, made easy.</p>

        <div className="mt-8 p-6 rounded-xl border border-gray-200 shadow-sm w-80">
          <p className="text-sm text-gray-500 mb-2">Backend status</p>
          {error ? (
            <p className="text-red-600 font-mono text-sm">❌ {error}</p>
          ) : (
            <p className={`font-mono text-lg ${status === "UP" ? "text-green-600" : "text-yellow-600"}`}>
              {status === "UP" ? "✅ API is UP" : `⏳ ${status}`}
            </p>
          )}
        </div>

        <button className="mt-6 px-6 py-2 bg-maroon-700 hover:bg-maroon-800 text-white rounded-lg transition">
          Phase 0 Complete 🎉
        </button>
      </div>
    </div>
  );
}