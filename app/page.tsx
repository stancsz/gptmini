'use client';

import React, { useState, useEffect, useRef } from 'react';
import OpenAI from 'openai';
import { saveAs } from 'file-saver';
import MarkdownIt from 'markdown-it';
import hljs from 'highlight.js';
import 'highlight.js/styles/github.css';
import './globals.css';

const md: MarkdownIt = new MarkdownIt({
  highlight: (str: string, lang: string) => {
    if (lang && hljs.getLanguage(lang)) {
      try {
        return `<pre class="hljs"><code>${hljs.highlight(str, { language: lang, ignoreIllegals: true }).value}</code></pre>`;
      } catch (__) { }
    }
    return `<pre class="hljs"><code>${md.utils.escapeHtml(str)}</code></pre>`;
  }
});

interface Message {
  role: 'user' | 'assistant';
  content: string;
  isFolded?: boolean;
}

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [userToken, setUserToken] = useState('');
  const [isTokenSet, setIsTokenSet] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [menuVisible, setMenuVisible] = useState(false);

  const handleResize = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  };

  useEffect(() => {
    const cachedToken = localStorage.getItem('userToken');
    if (cachedToken) {
      setUserToken(cachedToken);
      setIsTokenSet(true);
    }
  }, []);

  useEffect(() => {
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      const chatHistory = JSON.stringify(messages);
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
      try {
        const savedMessages: Message[] = JSON.parse(savedHistory);
        setMessages(savedMessages);
      } catch (error) {
        console.error('Error parsing chat history from local storage:', error);
      }
    }
  }, []);

  useEffect(() => {
    handleResize();
  }, [inputMessage]);

  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') {
      handleSend(event as unknown as React.FormEvent);
    }
  };

  const handleDownload = () => {
    const chatHistory = messages.map(msg => `${msg.role}: ${msg.content}`).join('\n\n');
    const firstUserMessage = messages.find(msg => msg.role === 'user')?.content || '';
    const truncatedMessage = firstUserMessage.substring(0, 30).replace(/\s+/g, '_');
    const dateStr = new Date().toISOString().split('T')[0];
    const fileName = `${dateStr}_${truncatedMessage}.txt`;

    const blob = new Blob([chatHistory], { type: 'text/plain;charset=utf-8' });
    saveAs(blob, fileName);
  };

  const handleDownloadLastAIResponse = (messageContent: string) => {
    const truncatedMessage = messageContent.substring(0, 20).replace(/\s+/g, '_');
    const dateStr = new Date().toISOString().split('T')[0];
    const fileName = `${dateStr}_${truncatedMessage}.txt`;

    const blob = new Blob([messageContent], { type: 'text/plain;charset=utf-8' });
    saveAs(blob, fileName);
  };

  const handleDeleteMessage = (index: number) => {
    setMessages(prevMessages => prevMessages.filter((_, i) => i !== index));
  };

  const handleClearMessages = () => {
    setMessages([]);
    localStorage.removeItem('chatHistory');
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
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

    const userMessages = updatedMessages.filter(msg => msg.role === 'user');
    const lastFiveUserMessages = userMessages.slice(-5);

    try {
      const openai = new OpenAI({
        apiKey: userToken,
        dangerouslyAllowBrowser: true,
      });

      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: lastFiveUserMessages.map(msg => ({ role: msg.role, content: msg.content })),
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

  const handleDownloadJSON = () => {
    const chatHistory = { messages };
    const firstUserMessage = messages.find(msg => msg.role === 'user')?.content || '';
    const truncatedMessage = firstUserMessage.substring(0, 30).replace(/[^a-zA-Z0-9]/g, '_');
    const dateStr = new Date().toISOString().split('T')[0];
    const fileName = `${dateStr}_${truncatedMessage}.json`;

    const blob = new Blob([JSON.stringify(chatHistory, null, 2)], { type: 'application/json' });
    saveAs(blob, fileName);
  };

  const handleLoadChat = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        const parsed = JSON.parse(content);
        if (parsed.messages) {
          if (window.confirm('Are you sure? Unsaved changes will be lost.')) {
            setMessages(parsed.messages);
          }
        } else {
          alert('Invalid file format.');
        }
        // Reset the input value to allow reloading the same file
        (event.target as HTMLInputElement).value = '';
      };
      reader.readAsText(file);
    }
  };

  const toggleMenu = () => {
    setMenuVisible(!menuVisible);
  };

  const toggleFold = (index: number) => {
    setMessages(prevMessages =>
      prevMessages.map((message, i) => {
        if (i === index) {
          return { ...message, isFolded: !message.isFolded };
        }
        return message;
      })
    );
  };

  return (
    <div className="container">
      <div className="main">
        {messages.map((message, index) => {
          const isFolded = message.isFolded ?? false;
          const displayContent = isFolded ? `${message.content.substring(0, 150)}...` : message.content;

          return (
            <div key={index} className={`message-container ${message.role}`}>
              <div className={`message-bubble ${message.role}`}>
                <div dangerouslySetInnerHTML={{ __html: md.render(displayContent) }} />
                <div className="button-container">
                  <button
                    className="fold-button square-button"
                    onClick={() => toggleFold(index)}
                  >
                    {isFolded ? '🔽' : '🔼'}
                  </button>
                  {message.role === 'assistant' && (
                    <button
                      className="download-button square-button"
                      onClick={() => handleDownloadLastAIResponse(message.content)}
                    >
                      💾
                    </button>
                  )}
                  <button
                    className="delete-button square-button"
                    onClick={() => handleDeleteMessage(index)}
                  >
                    ❌
                  </button>
                </div>
              </div>
            </div>
          );
        })}
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
          <div className="form-container">
            <form className="form" onSubmit={(event) => {
              handleSend(event);
              setMenuVisible(false); // Hide menu after sending
            }}>
              <button type="button" className="menu-toggle" onClick={toggleMenu}>
                <svg width="20" height="20" viewBox="0 0 30 20" fill="black" xmlns="http://www.w3.org/2000/svg">
                  <rect width="30" height="3"></rect>
                  <rect y="8" width="30" height="3"></rect>
                  <rect y="16" width="30" height="3"></rect>
                </svg>
              </button>
              <textarea
                className="textarea"
                value={inputMessage}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                placeholder="Type your message here... (Ctrl/Cmd + Enter to send)"
                rows={1}
                ref={textareaRef}
                onInput={handleResize}
              />
              <button type="submit" className="button" disabled={isLoading}>
                {isLoading ? '⌛' : (
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">
                    <path d="M2 21L23 12 2 3v7l15 2-15 2v7z" />
                  </svg>
                )}
              </button>
            </form>
            <div className={`menu-bar ${menuVisible ? 'show' : ''}`}>
              <div className="menu-button-container">
                <button onClick={() => { handleClearMessages(); setMenuVisible(false); }} className="button">
                  📄 New
                </button>
                <button className="button">
                  <label htmlFor="upload-json" style={{ cursor: 'pointer' }}>
                    📂 Load
                  </label>
                  <input
                    type="file"
                    id="upload-json"
                    className="hidden"
                    accept=".json"
                    onChange={(event) => { handleLoadChat(event); setMenuVisible(false); }}
                  />
                </button>
                <button onClick={() => { handleDownloadJSON(); setMenuVisible(false); }} className="button" disabled={messages.length === 0}>
                  💾 Save
                </button>
                <button onClick={() => setMenuVisible(false)} className="button close-button">
                  ❌ Close
                </button>
              </div>
            </div>
          </div>
        )}
        {error && <div style={{ color: 'red', marginTop: '10px' }}>{error}</div>}
        <div className="info-text">
          This minimalist chat app lets you talk to GPT-4o. To use it, you'll need your OpenAI API key
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
