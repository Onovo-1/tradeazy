import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import PasswordInput from "../../components/common/PasswordInput";

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    username: "",
    email: "",
    phone: "", 
    password: "",
    confirmPassword: "",
    accountType: "BUYER",
  });
  const [error, setError] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  
  // State to track if the user has left the email field
  const [emailTouched, setEmailTouched] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "firstName" || name === "lastName") {
      const sanitizedValue = value.replace(/[^a-zA-Z\s'-]/g, "");
      setForm((f) => ({ ...f, [name]: sanitizedValue.slice(0, 25) }));
      return;
    }

    if (name === "phone") {
      let rawValue = value.replace(/\D/g, ""); 
      if (rawValue.length > 11) rawValue = rawValue.slice(0, 11);

      if (rawValue.length >= 1 && rawValue[0] !== "0") return;
      if (rawValue.length >= 2 && !["7", "8", "9"].includes(rawValue[1])) return;
      if (rawValue.length >= 3 && !["0", "1"].includes(rawValue[2])) return;

      setForm((f) => ({ ...f, phone: rawValue }));
      return;
    }

    setForm((f) => ({ ...f, [name]: value }));
  };

  const isValidEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setFieldErrors({});
    setEmailTouched(true); // Force email validation on submit
    
    if (!isValidEmail(form.email)) {
      setError("Please enter a valid email address.");
      return;
    }

    if (form.phone.length !== 11) {
      setError("Please enter a valid 11-digit phone number.");
      return;
    }

    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (form.password.length < 8) {
      setError("Password must be at least 8 characters long.");
      return;
    }
    if (!/[A-Z]/.test(form.password)) {
      setError("Password must contain at least one uppercase letter.");
      return;
    }
    if (!/[a-z]/.test(form.password)) {
      setError("Password must contain at least one lowercase letter.");
      return;
    }
    if (!/[0-9]/.test(form.password)) {
      setError("Password must contain at least one number.");
      return;
    }

    setSubmitting(true);
    try {
      const payload = { ...form, phone: `+234${form.phone.substring(1)}` };
      await register(payload);
      navigate("/", { replace: true });
    } catch (err) {
      const data = err.response?.data;
      if (data?.fieldErrors) {
        setFieldErrors(data.fieldErrors);
        setError("Please fix the highlighted fields.");
      } else {
        setError(data?.message || "Registration failed. Please try again.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  const inputClass = (field) =>
    `w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-maroon-500 focus:border-transparent ${
      fieldErrors[field] ? "border-red-400" : "border-gray-300"
    }`;

  // Show error only if touched AND invalid
  const showEmailError = emailTouched && form.email && !isValidEmail(form.email);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-10">
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
        <h1 className="text-3xl font-extrabold text-maroon-700 text-center mb-2">
          Create your account
        </h1>
        <p className="text-center text-gray-500 mb-8">
          Join Tradeazy as a buyer or seller
        </p>

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          
          <div className="mb-6">
            <div className="grid grid-cols-2 gap-3">
              {["BUYER", "SELLER"].map((type) => (
                <label
                  key={type}
                  className={`cursor-pointer border-2 rounded-lg px-4 py-3 text-center transition ${
                    form.accountType === type
                      ? "border-maroon-700 bg-maroon-50 text-maroon-800 font-semibold"
                      : "border-gray-200 hover:border-maroon-300"
                  }`}
                >
                  <input
                    type="radio"
                    name="accountType"
                    value={type}
                    checked={form.accountType === type}
                    onChange={handleChange}
                    className="sr-only"
                  />
                  {type === "BUYER" ? "🛒 Buyer" : "🏪 Seller"}
                </label>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                First name
              </label>
              <input
                type="text"
                name="firstName"
                value={form.firstName}
                onChange={handleChange}
                required
                className={inputClass("firstName")}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Last name
              </label>
              <input
                type="text"
                name="lastName"
                value={form.lastName}
                onChange={handleChange}
                required
                className={inputClass("lastName")}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Username
            </label>
            <input
              type="text"
              name="username"
              value={form.username}
              onChange={handleChange}
              required
              className={inputClass("username")}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              onBlur={() => setEmailTouched(true)} // Mark as touched when leaving field
              required
              placeholder="you@example.com"
              className={`${inputClass("email")} ${showEmailError ? "border-red-400" : ""}`}
            />
            {showEmailError && (
              <p className="text-xs text-red-600 mt-1">Invalid email format</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Phone Number
            </label>
            <input
              type="text"
              name="phone"
              value={form.phone}
              onChange={handleChange}
              required
              maxLength="11"
              placeholder="e.g. 08012345678"
              className={inputClass("phone")}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <PasswordInput
                name="password"
                value={form.password}
                onChange={handleChange}
                required
                autoComplete="new-password"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Confirm password
              </label>
              <PasswordInput
                name="confirmPassword"
                value={form.confirmPassword}
                onChange={handleChange}
                required
                autoComplete="new-password"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-maroon-700 hover:bg-maroon-800 disabled:opacity-60 text-white font-semibold py-2.5 rounded-lg transition mt-6"
          >
            {submitting ? "Creating account..." : "Create account"}
          </button>
        </form>

        <p className="text-center text-sm text-gray-600 mt-6">
          Already have an account?{" "}
          <Link to="/login" className="text-maroon-700 font-semibold hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}