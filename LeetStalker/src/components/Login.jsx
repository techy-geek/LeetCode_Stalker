// src/components/Login.jsx
import React, { useState } from 'react';

const Login = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    if (!username.trim()) {
      setError('Please enter a username');
      return;
    }

    setError('');
    setIsLoading(true);

    try {
      await onLogin(username);
    } catch (e) {
      setIsLoading(false);
      // FIX: Display the actual error message thrown by App.jsx
      setError(e.message || 'Login failed. Please try again.');
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleSubmit();
  };

  return (
    <div className="login-wrapper">
      <div className="login-card">

        {/* --- LOGO SECTION --- */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem' }}>
          <img
            src="/image.png"
            alt="LeetStalker Logo"
            style={{
              width: '80px',
              height: '80px',
              borderRadius: '50%',
              boxShadow: '0 0 20px rgba(12, 143, 243, 0.4)',
              border: '2px solid rgba(40, 175, 153, 0.5)'
            }}
            onError={(e) => { e.target.style.display = 'none' }}
          />
        </div>

        {/* Brand / Text Section */}
        <div style={{ marginBottom: '2rem' }}>
          <h1 style={{ fontSize: '2.5rem', margin: '0 0 10px 0', letterSpacing: '-1px' }}>
            Leet<span style={{ color: '#28af99' }}>Tracker</span>
          </h1>
          <p style={{ color: '#9ca1b2', fontSize: '0.95rem', lineHeight: '1.5' }}>
            Track your DSA programming journey <br /> and compete with your friends.
          </p>
        </div>

        {/* Form Section */}
        <div className="login-form">
          <div style={{ textAlign: 'left', marginBottom: '5px' }}>
            <label style={{ fontSize: '0.8rem', color: '#ccc', fontWeight: '600', marginLeft: '4px' }}>
              LEETCODE USERNAME
            </label>
          </div>

          <input
            placeholder="e.g. neal_wu"
            value={username}
            onChange={(e) => {
              setUsername(e.target.value.toLowerCase());
              setError('');
            }}
            onKeyDown={handleKeyDown}
            className={`login-input ${error ? 'input-error' : ''}`}
            disabled={isLoading}
          />

          {error && <div className="error-msg">⚠️ {error}</div>}

          <button
            onClick={handleSubmit}
            className="primary-btn login-btn"
            disabled={isLoading}
            style={{ backgroundColor: '#28af43ff', color: '#000' }}
          >
            {isLoading ? (
              <span className="spinner">↻ Connecting...</span>
            ) : (
              'Connect Profile →'
            )}
          </button>
        </div>

        <div className="login-footer">
          By connecting, you agree to become a better coder. <br />
          <span style={{ opacity: 0.6, fontSize: '0.8em' }}>Made by Anurag Sharma</span>
        </div>
      </div>
    </div>
  );
};

export default Login;