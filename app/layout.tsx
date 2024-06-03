import React from 'react';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <div style={{ margin: '0 auto', maxWidth: '960px', padding: '20px'}}>
          <header style={{ display: 'flex', alignItems: 'center', userSelect: 'none' }}>
            <img
              src="/favicon.ico"
              alt="Favicon"
              style={{ height: '48px', width: '48px', marginRight: '10px' , userSelect: 'none'}} // Adjust height and width statically
            />
            <h1 style={{ fontSize: '24px'}}>GPT Mini</h1> {/* Assuming a default font size */}
          </header>
          <main>{children}</main>
        </div>
      </body>
    </html>
  );
}
