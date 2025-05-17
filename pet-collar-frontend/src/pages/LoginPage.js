//src/pages/LoginPage.js
import React, { useState, useEffect } from 'react';
import { useNavigate }           from 'react-router-dom';
import { useAuth }               from '../contexts/AuthContext';
import './LoginPage.css';

export default function LoginPage() {
  const { login, token } = useAuth();
  const navigate         = useNavigate();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error,    setError]    = useState('');

  /* Đã có token → vào thẳng dashboard */
  useEffect(() => {
    if (token) navigate('/admin', { replace: true });
  }, [token, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await login(username.trim(), password);
      /* navigate đã được gọi trong login() */
    } catch (err) {
      const msg = err?.response?.status === 401
        ? 'Sai tài khoản hoặc mật khẩu'
        : 'Đăng nhập thất bại.';
      setError(msg);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <h2>Quản trị VNIPET</h2>
        <p>Đăng nhập để tiếp tục</p>

        {error && <div className="login-error">{error}</div>}

        <form onSubmit={handleSubmit} className="login-form">
          <div className="input-group">
            <label>Tên đăng nhập</label>
            <input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoFocus
              required
            />
          </div>

          <div className="input-group">
            <label>Mật khẩu</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button className="btn-login" type="submit">
            Đăng nhập
          </button>
        </form>
      </div>
    </div>
  );
}
