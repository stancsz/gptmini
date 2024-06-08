import React from 'react';
import './globals.css';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <div style={{ margin: '0 auto', maxWidth: '960px', padding: '20px' }}>
          <div className="title-container">
            <img src="/logo.png" alt="Logo" className="logo" width="60" height="60" />
            <h1 className="title">GPTMINI</h1>
          </div>
          <main>{children}</main>
        </div>
      </body>
    </html>
  );
}
