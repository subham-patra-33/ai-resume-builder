import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import API from "../../lib/api";

function Login() {
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!username || !password) {
      setError('Please enter username and password');
      return;
    }

    setLoading(true);
    try {
      const resp = await API.login(username, password);
      if (resp && resp.token) {
        localStorage.setItem('token', resp.token);
        navigate("/db");
      } else {
        setError(resp.message || 'Login failed');
      }
    } catch (err) {
      setError(err.message || 'Login error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center w-full h-full bg-background px-4 sm:px-6 md:px-8">

      <div className="card w-full max-w-md p-8">

        <h1 className="text-2xl font-bold text-center mb-4">Welcome back</h1>
        <p className="text-center muted mb-6">Sign in to continue to AI Resume Builder</p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4 sm:gap-5">
          <label className="label">Username</label>
          <input
            type="text"
            placeholder="Your username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="input"
            required
            aria-label="Username"
          />

          <label className="label">Password</label>
          <input
            type="password"
            placeholder="Your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="input"
            required
            aria-label="Password"
          />

          {error && <div className="text-red-600">{error}</div>}

          <button
            type="submit"
            className="btn btn-primary mt-2"
            disabled={loading}
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>

          <div className="text-center mt-4 text-sm text-muted">
            Need an account?{' '}
            <Link to="/register" className="text-purple-600 font-semibold">
              Register
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Login;