import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FiUser, FiMail, FiLock, FiLoader, FiMessageCircle, FiUserX } from "react-icons/fi";
import { useAuth } from "../hooks/useAuth";

const Register = () => {
  const [name, setName]                     = useState("");
  const [email, setEmail]                   = useState("");
  const [password, setPassword]             = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError]                   = useState("");
  const [loading, setLoading]               = useState(false);

  const { register, loginAsGuest } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (password !== confirmPassword) { setError("Passwords do not match"); return; }
    if (password.length < 6)          { setError("Password must be at least 6 characters"); return; }
    setLoading(true);
    try {
      await register(name, email, password);
      navigate("/chat");
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleGuest = () => {
    loginAsGuest();
    navigate("/chat");
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 dark:bg-gray-900">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-lg dark:bg-gray-800">
        <div className="mb-6 flex flex-col items-center">
          <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-primary-600 text-white">
            <FiMessageCircle size={24} />
          </div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Create Account</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Sign up to save your chat history
          </p>
        </div>

        {error && (
          <div className="mb-4 rounded-lg bg-red-50 px-4 py-2 text-sm text-red-600 dark:bg-red-900/30 dark:text-red-400">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {[
            { label: "Full Name", value: name, set: setName, type: "text", icon: FiUser, placeholder: "John Doe" },
            { label: "Email", value: email, set: setEmail, type: "email", icon: FiMail, placeholder: "you@example.com" },
            { label: "Password", value: password, set: setPassword, type: "password", icon: FiLock, placeholder: "••••••••" },
            { label: "Confirm Password", value: confirmPassword, set: setConfirmPassword, type: "password", icon: FiLock, placeholder: "••••••••" },
          ].map(({ label, value, set, type, icon: Icon, placeholder }) => (
            <div key={label}>
              <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">{label}</label>
              <div className="relative">
                <Icon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                <input
                  type={type} required value={value}
                  onChange={(e) => set(e.target.value)}
                  placeholder={placeholder}
                  className="w-full rounded-lg border border-gray-300 bg-white py-2.5 pl-10 pr-3 text-sm text-gray-800 outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
                />
              </div>
            </div>
          ))}

          <button
            type="submit" disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary-600 py-2.5 text-sm font-semibold text-white hover:bg-primary-700 disabled:opacity-60"
          >
            {loading && <FiLoader className="animate-spin" size={16} />}
            {loading ? "Creating account..." : "Sign Up"}
          </button>
        </form>

        <div className="my-5 flex items-center gap-3">
          <div className="h-px flex-1 bg-gray-200 dark:bg-gray-600" />
          <span className="text-xs text-gray-400">OR</span>
          <div className="h-px flex-1 bg-gray-200 dark:bg-gray-600" />
        </div>

        <button
          onClick={handleGuest}
          className="flex w-full items-center justify-center gap-2 rounded-lg border-2 border-dashed border-gray-300 py-2.5 text-sm font-medium text-gray-600 hover:border-primary-400 hover:text-primary-600 dark:border-gray-600 dark:text-gray-400 dark:hover:border-primary-500 dark:hover:text-primary-400"
        >
          <FiUserX size={16} />
          Continue as Guest (no sign-up needed)
        </button>
        <p className="mt-2 text-center text-xs text-gray-400 dark:text-gray-500">
          Guest chats are not saved. Sign in to keep your history.
        </p>

        <p className="mt-5 text-center text-sm text-gray-500 dark:text-gray-400">
          Already have an account?{" "}
          <Link to="/login" className="font-medium text-primary-600 hover:underline">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
