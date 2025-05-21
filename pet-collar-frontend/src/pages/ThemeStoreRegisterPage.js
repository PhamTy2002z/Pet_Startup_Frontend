import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FiUser, FiMail, FiLock, FiEye, FiEyeOff } from 'react-icons/fi';
import { useThemeStoreAuth } from '../contexts/ThemeStoreAuthContext';
import './ThemeStoreAuth.css';

export default function ThemeStoreRegisterPage() {
  const navigate = useNavigate();
  const { register } = useThemeStoreAuth();

  const [name, setName]         = useState('');
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [showPwd, setShowPwd]   = useState(false);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await register({ name, email, password });
      navigate('/theme-store');
    } catch (err) {
      setError(err.response?.data?.error || 'Register failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-card">
          <header className="login-header">
            <h2>Create account</h2>
            <p>Join our Theme-Store community</p>
          </header>

          {error && (
            <div className="login-error">
              <span>{error}</span>
            </div>
          )}

          <form className="login-form" onSubmit={handleSubmit}>
            {/* Name */}
            <div className="input-group">
              <label>Name</label>
              <div className="input-wrapper">
                <FiUser className="input-icon" size={18} />
                <input
                  placeholder="Your name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Email */}
            <div className="input-group">
              <label>Email</label>
              <div className="input-wrapper">
                <FiMail className="input-icon" size={18} />
                <input
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div className="input-group">
              <label>Password</label>
              <div className="input-wrapper">
                <FiLock className="input-icon" size={18} />
                <input
                  type={showPwd ? 'text' : 'password'}
                  placeholder="Create password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPwd((v) => !v)}
                >
                  {showPwd ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              className={`btn-login ${loading ? 'loading' : ''}`}
              disabled={loading}
            >
              {loading ? (
                <span className="loading-spinner">
                  <span className="spinner" />
                  Creating…
                </span>
              ) : (
                'Register'
              )}
            </button>
          </form>

          <p className="switch-auth" style={{ marginTop: '1.25rem' }}>
            Have an account? <Link to="/theme-store/login">Login</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
