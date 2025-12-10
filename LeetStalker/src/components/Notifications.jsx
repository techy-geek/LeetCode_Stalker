import React from 'react';

const Notifications = ({ messages, onClear, onClose }) => {
  return (
    <div style={{
      position: 'absolute',
      top: '50px',
      right: '0',
      width: '300px',
      background: '#1a1a1a',
      border: '1px solid #333',
      borderRadius: '8px',
      boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
      zIndex: 1000,
      overflow: 'hidden',
      animation: 'fadeIn 0.2s ease'
    }}>
      <div style={{
        padding: '12px',
        borderBottom: '1px solid #333',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        background: '#282828'
      }}>
        <h4 style={{ margin: 0, color: '#ffa116', fontSize: '0.9rem' }}>
          Notifications ({messages.length})
        </h4>
        <button
          onClick={onClose}
          style={{ background: 'transparent', border: 'none', color: '#888', cursor: 'pointer', fontSize: '1rem' }}
        >
          ×
        </button>
      </div>

      <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
        {messages.length === 0 ? (
          <p style={{ padding: '20px', textAlign: 'center', color: '#666', fontSize: '0.9rem', margin: 0 }}>
            No new notifications
          </p>
        ) : (
          <ul style={{ margin: 0, padding: 0, listStyle: 'none' }}>
            {messages.map((msg, idx) => (
              <li key={idx} style={{
                padding: '12px',
                borderBottom: '1px solid #333',
                color: '#ddd',
                fontSize: '0.9rem',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '10px'
              }}>
                <span style={{ color: '#ffa116' }}>•</span>
                {msg}
              </li>
            ))}
          </ul>
        )}
      </div>

      {messages.length > 0 && (
        <div style={{ padding: '10px', background: '#282828', textAlign: 'center' }}>
          <button
            onClick={onClear}
            style={{
              background: 'transparent',
              border: '1px solid #ffa116',
              color: '#ffa116',
              padding: '6px 12px',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '0.8rem',
              width: '100%'
            }}
          >
            Clear All
          </button>
        </div>
      )}
    </div>
  );
};

export default Notifications;