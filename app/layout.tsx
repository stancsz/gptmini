import React from 'react';
import Head from 'next/head';
import getConfig from 'next/config';

const { publicRuntimeConfig } = getConfig();

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const assetPrefix = publicRuntimeConfig.assetPrefix || '';
  const faviconPath = `${assetPrefix}/favicon.ico`;

  return (
    <html lang="en">
      <Head>
        <link rel="icon" href={faviconPath} />
      </Head>
      <body>
        <div style={{ margin: '0 auto', maxWidth: '960px', padding: '20px', userSelect: 'none' }}>
          <header style={{ display: 'flex', alignItems: 'center' }}>
            <img
              src={faviconPath}
              alt="Favicon"
              style={{ height: '48px', width: '48px', marginRight: '10px' }} // Adjust height and width statically
            />
            <h1 style={{ fontSize: '24px'}}>GPT Mini</h1> {/* Assuming a default font size */}
          </header>
          <main>{children}</main>
        </div>
      </body>
    </html>
  );
}
