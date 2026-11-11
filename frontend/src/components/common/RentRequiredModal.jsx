import { Link } from "react-router-dom";

export default function RentRequiredModal({ open, onClose }) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 text-center">
          <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-red-100 flex items-center justify-center">
            <span className="text-red-600 text-2xl font-bold">!</span>
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">
            Rent subscription required
          </h2>
          <p className="text-sm text-gray-600 mb-2">
            You need an <strong>active Rent subscription</strong> to create new listings.
          </p>
          <p className="text-sm text-gray-500">
            Your existing listings remain visible — only new listings are blocked.
          </p>
        </div>

        <div className="px-6 pb-6 flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg text-sm font-semibold hover:bg-gray-50"
          >
            Cancel
          </button>
          <Link
            to="/seller/rent"
            onClick={onClose}
            className="flex-1 px-4 py-2.5 bg-maroon-700 hover:bg-maroon-800 text-white rounded-lg text-sm font-semibold text-center transition"
          >
            Go to Rent
          </Link>
        </div>
      </div>
    </div>
  );
}