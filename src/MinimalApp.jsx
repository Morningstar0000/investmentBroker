import React from 'react';

export default function MinimalApp() {
  console.log('MinimalApp is rendering!');
  return (
    <div style={{ padding: '50px', backgroundColor: '#f0f0f0' }}>
      <h1 style={{ color: 'green' }}>✅ Minimal App Works!</h1>
      <p>If you see this, the issue is in your main App.jsx</p>
    </div>
  );
}