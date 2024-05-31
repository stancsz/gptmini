import React from 'react';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <div style={{ margin: '0 auto', maxWidth: '960px', padding: '20px' }}>
          <header>
            <h1>GPT Mini</h1>
          </header>
          <main>{children}</main>
        </div>
      </body>
    </html>
  );
}
