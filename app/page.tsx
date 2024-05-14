'use client';

import React, { useState, useEffect } from 'react';
import OpenAI from 'openai';
import { saveAs } from 'file-saver';
import './chatpage.css';

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
  const [error, setError] = useState<string | null>(null);

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
      event.preventDefault();
      event.returnValue = '';
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [messages]);

  useEffect(() => {
    const savedHistory = localStorage.getItem('chatHistory');
    if (savedHistory) {
      const savedMessages = savedHistory.split('\n\n').map(line => {
        const [role, content] = line.split(': ');
        return { role: role as 'user' | 'assistant', content };
      });
      setMessages(savedMessages);
    }
  }, []);

  const handleDownload = () => {
    const chatHistory = messages.map(msg => `${msg.role}: ${msg.content}`).join('\n\n');
    const firstUserMessage = messages.find(msg => msg.role === 'user')?.content || '';
    const truncatedMessage = firstUserMessage.substring(0, 30).replace(/\s+/g, '_');
    const dateStr = new Date().toISOString().split('T')[0];
    const fileName = `${dateStr}_${truncatedMessage}.txt`;

    const blob = new Blob([chatHistory], { type: 'text/plain;charset=utf-8' });
    saveAs(blob, fileName);
  };

  const handleClearMessages = () => {
    setMessages([]);
    localStorage.removeItem('chatHistory');
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setInputMessage(event.target.value);
  };

  const handleTokenChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setUserToken(event.target.value);
  };

  const handleSaveToken = (event: React.FormEvent) => {
    event.preventDefault();
    if (!userToken.trim()) {
      setError('API key is required');
      return;
    }

    localStorage.setItem('userToken', userToken);
    setIsTokenSet(true);
    setError(null);
  };

  const handleSend = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!inputMessage.trim() || !userToken) return;

    setIsLoading(true);

    const updatedMessages: Message[] = [...messages, { role: 'user', content: inputMessage }];
    setMessages(updatedMessages);
    setInputMessage('');

    try {
      const openai = new OpenAI({
        apiKey: userToken,
        dangerouslyAllowBrowser: true,
      });

      const response = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: updatedMessages.map(msg => ({ role: msg.role, content: msg.content })),
        temperature: 1,
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
    <div className="container">
      <div className="main">
        {messages.map((message, index) => (
          <div key={index} className={`message-container ${message.role}`}>
            <div className={`message-bubble ${message.role}`}>
              {message.content}
            </div>
          </div>
        ))}
      </div>
      <div className="footer">
        {!isTokenSet ? (
          <form className="form" onSubmit={handleSaveToken}>
            <input
              type="password"
              className="input"
              value={userToken}
              onChange={handleTokenChange}
              autoComplete="new-password"
              placeholder="Enter your OpenAI API key"
            />
            <button type="submit" className="button">Save Token</button>
          </form>
        ) : (
          <div>
            <form className="form" onSubmit={handleSend}>
              <input
                type="text"
                className="input"
                value={inputMessage}
                onChange={handleInputChange}
                placeholder="Type your message here..."
              />
              <button type="submit" className="button" disabled={isLoading}>
                {isLoading ? 'Sending...' : 'Send'}
              </button>
            </form>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: '10px' }}>
              <button onClick={handleDownload} className="secondary-button" disabled={messages.length === 0}>
                Download
              </button>
              <button onClick={handleClearMessages} className="secondary-button">
                Clear
              </button>
            </div>
          </div>
        )}
        {error && <div style={{ color: 'red', marginTop: '10px' }}>{error}</div>}
        <div className="info-text">
          This minimalist chat app lets you talk to GPT-4. To use it, you'll need your OpenAI API key 
          <a href="https://platform.openai.com/api-keys" target="_blank" rel="noopener noreferrer">
            (https://platform.openai.com/api-keys)
          </a>. Your API key will only be stored locally in your browser. 
          <a href="https://github.com/stancsz/my-chat-app" target="_blank" rel="noopener noreferrer">
            View source on GitHub
          </a>
        </div>
      </div>
    </div>
  );
}
