'use client';

import React, { useState, useEffect } from 'react';
import OpenAI from 'openai';
import { saveAs } from 'file-saver';  // Import file-saver for download


interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [userToken, setUserToken] = useState('');
  const [isTokenSet, setIsTokenSet] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null); // State for error message

  useEffect(() => {
    const cachedToken = localStorage.getItem('userToken');
    if (cachedToken) {
      setUserToken(cachedToken);
      setIsTokenSet(true);
    }
  }, []);

  useEffect(() => {
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      const chatHistory = messages.map(msg => `${msg.role}: ${msg.content}`).join('\n\n');
      localStorage.setItem('chatHistory', chatHistory);
      // You can customize the message here:
      event.preventDefault();
      event.returnValue = '';
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [messages]); // Run only when messages change

  useEffect(() => {
    const savedHistory = localStorage.getItem('chatHistory');
    if (savedHistory) {
      const savedMessages = savedHistory.split('\n\n').map(line => {
        const [role, content] = line.split(': ');
        return { role: role as 'user' | 'assistant', content };
      });
      setMessages(savedMessages);
    }
  }, []); // Run only once on component mount

  const handleDownload = () => {
    const chatHistory = messages.map(msg => `${msg.role}: ${msg.content}`).join('\n\n');
    const blob = new Blob([chatHistory], { type: 'text/plain;charset=utf-8' });
    saveAs(blob, 'chat_history.txt');
  };

  const handleClearMessages = () => {
    setMessages([]); // Clear the messages array
    localStorage.removeItem('chatHistory'); // Optionally clear from localStorage as well
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setInputMessage(event.target.value);
  };

  const handleTokenChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setUserToken(event.target.value);
  };

  const handleSaveToken = (event: React.FormEvent) => {
    event.preventDefault(); // Prevent default form submission
    if (!userToken.trim()) {
      setError('API key is required'); // Show an error message
      return;
    }

    const obfuscatedToken = '*'.repeat(userToken.length);
    localStorage.setItem('userToken', userToken);
    setUserToken(obfuscatedToken);
    setIsTokenSet(true);
    setError(null); // Clear any previous error
  };

  const handleSend = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!inputMessage.trim() || !userToken) return;

    setIsLoading(true);

    // Include the new user message before making the API call
    const updatedMessages: Message[] = [...messages, { role: 'user', content: inputMessage }];
    setMessages(updatedMessages);
    setInputMessage('');

    try {
      const openai = new OpenAI({
        apiKey: userToken,
        dangerouslyAllowBrowser: true, // Enable browser usage (use with caution)
      });

      const response = await openai.chat.completions.create({
        model: "gpt-3.5-turbo", // or your preferred model
        messages: updatedMessages.map(msg => ({ role: msg.role, content: msg.content })),
        temperature: 1, // Adjust these parameters as needed
        max_tokens: 4095,
        top_p: 1,
        frequency_penalty: 0,
        presence_penalty: 0,
      });

      if (response.choices && response.choices.length > 0) {
        const aiMessage: Message = { role: 'assistant', content: response.choices[0].message?.content || '' };
        setMessages(prev => [...prev, aiMessage]);
      } else {
        setMessages(prev => [...prev, { role: 'assistant', content: 'No response from AI' }]);
      }
    } catch (error: any) {
      console.error('Error fetching response:', error);
      if (error.response && error.response.status === 401) {
        setError('Incorrect API key');
      } else if (error.response && error.response.status === 404) {
        setError('Model not found. Please check the model name.');
      } else {
        setError('Error fetching response from AI');
      }
    } finally {
      setIsLoading(false);
    }
  };


  return (
    <div style={{ margin: '0 auto', maxWidth: '960px', padding: '20px', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <main style={{ flex: 1, overflowY: 'auto', marginBottom: '20px' }}>
        {/* Display Messages */}
        {messages.map((message, index) => (
          <div
            key={index}
            style={{
              margin: '10px 0',
              textAlign: message.role === 'user' ? 'right' : 'left',
              padding: '8px 12px',
              borderRadius: '8px',
              backgroundColor: message.role === 'user' ? '#f0f0f0' : '#e0e0e0'
            }}
          >
            {message.content}
          </div>
        ))}
      </main>

      <footer style={{ position: 'sticky', bottom: '20px', width: '100%' }}>
  {!isTokenSet ? (
    <form onSubmit={handleSaveToken} style={{ marginBottom: '10px' }}> {/* Add margin bottom */}
      <input type="hidden" name="username" />
      <input
        type="password"
        value={userToken}
        onChange={handleTokenChange}
        autoComplete="new-password"
        placeholder="Enter your OpenAI API key"
        style={{ marginRight: '10px', flex: 1 }}  // Allow input to grow
      />
      <button type="submit">Save Token</button>
    </form>
  ) : (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      <form onSubmit={handleSend} style={{ display: 'flex', marginBottom: '10px' }}> {/* Add margin bottom */}
        <input
          type="text"
          value={inputMessage}
          onChange={handleInputChange}
          placeholder="Type your message here..."
          style={{ flex: 1, marginRight: '10px' }}
        />
        <button type="submit" disabled={isLoading}>
          {isLoading ? 'Sending...' : 'Send'}
        </button>
      </form>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: '10px' }}>
        <button onClick={handleDownload} disabled={messages.length === 0}>
          Download
        </button>
        <button onClick={handleClearMessages}>
          Clear
        </button>
      </div>
    </div>
  )}

  <div style={{ marginTop: '20px', fontSize: '0.8rem' }}> {/* Add spacing, smaller font */}
    This minimalist chat app lets you talk to GPT-4. To use it, you'll need your OpenAI API key 
    <a href="https://platform.openai.com/api-keys" target="_blank" rel="noopener noreferrer">
      (https://platform.openai.com/api-keys)
    </a>. Your API key will only be stored locally in your browser. 
    <a href="https://github.com/stancsz/my-chat-app" target="_blank" rel="noopener noreferrer" style={{ display: 'block' }}> {/* Make link a block element */}
      View source on GitHub
    </a>
  </div>
</footer>

    </div>
  );

}