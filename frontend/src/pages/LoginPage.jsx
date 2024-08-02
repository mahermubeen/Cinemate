import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuthStore } from "../store/authUser";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const togglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };

  const { login, isLoggingIn } = useAuthStore();

  const handleLogin = (e) => {
    e.preventDefault();
    login({ email, password });
  };

  return (
    <div className="h-screen w-full hero-bg">
      <header className="max-w-6xl mx-auto flex items-center justify-between p-4">
        <Link to={"/"}>
          <img src="/cinemate-logo.png" alt="logo" className="w-52" />
        </Link>
      </header>

      <div className="flex justify-center items-center mt-20 mx-3">
        <div className="w-full max-w-md p-8 space-y-6 bg-black/60 rounded-lg shadow-md">
          <h1 className="text-center text-white text-2xl font-bold mb-4">
            Login
          </h1>

          <form className="space-y-4" onSubmit={handleLogin}>
            <div>
              <label
                htmlFor="email"
                className="text-sm font-medium text-gray-300 block"
              >
                Email
              </label>
              <input
                type="email"
                className="w-full px-3 py-2 mt-1 border border-gray-700 rounded-md bg-transparent text-white focus:outline-none focus:ring"
                placeholder="you@example.com"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="relative">
              <label
                htmlFor="password"
                className="text-sm font-medium text-gray-300 block"
              >
                Password
              </label>
              <input
                type={showPassword ? "text" : "password"} // Toggle between text and password
                className="w-full px-3 py-2 mt-1 border border-gray-700 rounded-md bg-transparent text-white focus:outline-none focus:ring"
                placeholder="••••••••"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button
                type="button"
                onClick={togglePasswordVisibility}
                className="absolute right-3 top-8 text-gray-400 focus:outline-none"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="w-5 h-5"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M3.98 8.59A10.97 10.97 0 0112 5c2.415 0 4.65.798 6.414 2.137M9.5 9.5l5 5M14.5 9.5l-5 5M21 21L3 3"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M9.75 9.75L8.53 8.53c-2.283 1.58-4.764 2.833-7.53 2.833 3.31 4.265 7.69 7 12.5 7 2.415 0 4.65-.798 6.414-2.137M9.5 9.5l5 5M14.5 9.5l-5 5M21 21L3 3"
                    />
                  </svg>
                ) : (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="w-5 h-5"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M2.458 12C3.732 7.943 7.523 5 12 5c4.477 0 8.268 2.943 9.542 7-.274.81-.68 1.577-1.191 2.268M12 5c-4.477 0-8.268 2.943-9.542 7C3.268 16.057 7.523 19 12 19c4.477 0 8.268-2.943 9.542-7a9.936 9.936 0 00-1.191-2.268M3 3l18 18"
                    />
                  </svg>
                )}
              </button>
            </div>

            <button
              className="w-full py-2 bg-red-600 text-white font-semibold rounded-md
							hover:bg-red-700
						"
              disabled={isLoggingIn}
            >
              {isLoggingIn ? "Loading..." : "Login"}
            </button>
          </form>
          <div className="text-center text-gray-400">
            Don't have an account?{" "}
            <Link to={"/signup"} className="text-red-500 hover:underline">
              Sign Up
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
export default LoginPage;
