// app/page.tsx

import React from 'react';
import ChatPage from '../modules/chat/page';
import './globals.css'; // Import your global styles
import './app.css'; // Import your global styles

const MainPage = () => {
  return (
    <div className="container">
      {/* <header className="page-header">
        Main Application
      </header> */}
      <main className="main">
        <ChatPage />
      </main>
      {/* <footer className="footer"> */}
        {/* Footer content */}
      {/* </footer> */}
    </div>
  );
};

export default MainPage;
