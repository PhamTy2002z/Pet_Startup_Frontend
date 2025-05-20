//src/pages/LoginPage.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import './LoginPage.css';

export default function LoginPage() {
  const { login, token } = useAuth();
  const navigate = useNavigate();

  // Form state
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  // Validation state
  const [error, setError] = useState('');
  const [usernameError, setUsernameError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  /* Đã có token → vào thẳng dashboard */
  useEffect(() => {
    if (token) navigate('/admin', { replace: true });
  }, [token, navigate]);

  const validateForm = () => {
    let isValid = true;
    
    // Reset errors
    setUsernameError('');
    setPasswordError('');
    
    // Username validation
    if (!username.trim()) {
      setUsernameError('Vui lòng nhập tên đăng nhập');
      isValid = false;
    }
    
    // Password validation
    if (!password) {
      setPasswordError('Vui lòng nhập mật khẩu');
      isValid = false;
    }
    
    return isValid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Clear previous errors
    setError('');
    
    if (!validateForm()) return;
    
    setIsLoading(true);
    
    try {
      await login(username.trim(), password);
      // navigate đã được gọi trong login()
    } catch (err) {
      if (err?.response?.status === 401) {
        setError('Sai tài khoản hoặc mật khẩu');
      } else if (err?.response?.data?.message) {
        setError(err.response.data.message);
      } else {
        setError('Đăng nhập thất bại. Vui lòng thử lại sau.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-card">
          <div className="login-header">
            <h2>Quản trị VNIPET</h2>
            <p>Đăng nhập để tiếp tục</p>
          </div>

          {error && <div className="login-error">{error}</div>}

          <form onSubmit={handleSubmit} className="login-form">
            <div className="input-group">
              <label htmlFor="username">Tên đăng nhập</label>
              <div className="input-wrapper">
                <input
                  id="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Nhập tên đăng nhập"
                  autoFocus
                  className={usernameError ? 'error' : ''}
                />
                <span className="input-icon">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                    <circle cx="12" cy="7" r="4"></circle>
                  </svg>
                </span>
              </div>
              {usernameError && <div className="field-error">{usernameError}</div>}
            </div>

            <div className="input-group">
              <label htmlFor="password">Mật khẩu</label>
              <div className="input-wrapper">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Nhập mật khẩu"
                  className={passwordError ? 'error' : ''}
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={togglePasswordVisibility}
                  tabIndex="-1"
                >
                  {showPassword ? (
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                      <line x1="1" y1="1" x2="23" y2="23"></line>
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                      <circle cx="12" cy="12" r="3"></circle>
                    </svg>
                  )}
                </button>
              </div>
              {passwordError && <div className="field-error">{passwordError}</div>}
            </div>

            <button 
              className={`btn-login ${isLoading ? 'loading' : ''}`} 
              type="submit"
              disabled={isLoading}
            >
              {isLoading ? (
                <span className="loading-spinner">
                  <span className="spinner"></span>
                  Đang xử lý...
                </span>
              ) : (
                'Đăng nhập'
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
