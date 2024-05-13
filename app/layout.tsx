// app/layout.tsx
import React from 'react';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <div style={{ margin: '0 auto', maxWidth: '960px', padding: '20px' }}>
          <header>
            <h1>My Chat App</h1>
          </header>
          <main>{children}</main> {/* Ensure children are directly inside <main> */}
        </div>
      </body>
    </html>
  );
}
