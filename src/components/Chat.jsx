import { useState, useEffect, useRef } from 'react';
import { listingAPI } from '../api/client';
import '../styles/Chat.css';
import ChatMessage from './ChatMessage';

export default function Chat({ chatId, onClose, currentUserId, otherUserName, otherUserEmail }) {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (!chatId) return;
    setLoading(true);
    fetchChat();
    const interval = setInterval(fetchChat, 3000); // Auto-refresh every 3 seconds
    return () => clearInterval(interval);
  }, [chatId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchChat = async () => {
    try {
      const response = await listingAPI.getChat(chatId);
      // Axios wraps response in .data property
      const chatData = response.data || response;
      console.log('Chat data received:', chatData);
      setMessages(chatData.messages || []);
      setLoading(false);
      setError('');
    } catch (error) {
      console.error('Error fetching chat:', error);
      setError('Failed to load messages');
      setLoading(false);
    }
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    try {
      await listingAPI.sendChatMessage(chatId, { content: newMessage });
      setNewMessage('');
      await fetchChat();
    } catch (error) {
      console.error('Error sending message:', error);
      setError('Failed to send message');
    }
  };

  return (
    <div className="chat-container">
      <div className="chat-header">
        <div className="chat-header-user-info">
          <h3 className="chat-header-name">{otherUserName}</h3>
          {otherUserEmail && <p className="chat-header-email">{otherUserEmail}</p>}
        </div>
        <button onClick={onClose} className="close-btn">✕</button>
      </div>

      <div className="messages-list">
        {error && <div className="chat-error">{error}</div>}
        
        {loading && messages.length === 0 && (
          <div className="chat-loading-inline">Loading messages...</div>
        )}
        
        {!loading && messages.length === 0 ? (
          <div className="no-messages-panel">
            <div className="conversation-start-box">
              <p className="start-message">💬 Start a conversation</p>
              <p className="start-subtitle">Say hello to {otherUserName}!</p>
            </div>
          </div>
        ) : (
          messages.map((msg, index) => (
            <ChatMessage
              key={index}
              senderId={msg.senderId}
              senderName={msg.senderId?.name || otherUserName}
              content={msg.content}
              timestamp={msg.timestamp}
              isOwn={msg.senderId?._id?.toString() === currentUserId || msg.senderId === currentUserId}
            />
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={sendMessage} className="message-form">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type your message..."
          className="message-input"
        />
        <button type="submit" className="send-btn">Send</button>
      </form>
    </div>
  );
}
