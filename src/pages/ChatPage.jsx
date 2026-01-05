import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Chat from '../components/Chat';
import '../pages/ChatPage.css';

export default function ChatPage() {
  const [chats, setChats] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const location = useLocation();
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const currentUserId = user.id;

  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }
    
    const loadChats = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/chat`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        const data = await response.json();
        setChats(data);
        setLoading(false);
        
        // Auto-select chat if we have a chatId in navigation state
        if (location.state?.chatId) {
          const chatToSelect = data.find(chat => chat._id === location.state.chatId);
          if (chatToSelect) {
            setSelectedChat(chatToSelect);
          }
        }
      } catch (error) {
        setError('Failed to load chats');
        setLoading(false);
      }
    };
    
    loadChats();
    const interval = setInterval(loadChats, 5000); // Refresh every 5 seconds
    return () => clearInterval(interval);
  }, [token, navigate]);

  const handleDeleteChat = async (chatId) => {
    if (window.confirm('Are you sure you want to delete this chat?')) {
      try {
        await fetch(`/api/chat/${chatId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        setChats(chats.filter(chat => chat._id !== chatId));
        if (selectedChat?._id === chatId) {
          setSelectedChat(null);
        }
      } catch (error) {
        setError('Failed to delete chat');
      }
    }
  };

  if (loading) return <div className="loading">Loading chats...</div>;

  return (
    <div className="chat-page">
      <div className="chat-list-container">
        <h2>Messages</h2>
        {error && <div className="error-message">{error}</div>}
        
        {chats.length === 0 ? (
          <div className="no-chats">
            <p>No conversations yet. Start chatting with a landlord!</p>
          </div>
        ) : (
          <ul className="chat-list">
            {chats.map((chat) => {
              // Convert ObjectId to string for proper comparison
              const otherUser = chat.participants.find(p => p._id.toString() !== currentUserId);
              return (
                <li
                  key={chat._id}
                  className={`chat-item ${selectedChat?._id === chat._id ? 'active' : ''}`}
                >
                  <div
                    className="chat-item-content"
                    onClick={() => setSelectedChat(chat)}
                  >
                    <div className="chat-header-info">
                      <strong>{otherUser?.name || 'User'}</strong>
                      <span className="chat-time">
                        {new Date(chat.lastMessageTime).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="last-message">{chat.lastMessage}</p>
                    {chat.listingId && (
                      <span className="listing-info">📍 {chat.listingId.title}</span>
                    )}
                  </div>
                  <button
                    className="delete-btn"
                    onClick={() => handleDeleteChat(chat._id)}
                    title="Delete chat"
                  >
                    🗑️
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {selectedChat && (
        <div className="chat-area">
          <Chat
            chatId={selectedChat._id}
            currentUserId={currentUserId}
            otherUserName={
              selectedChat.participants.find(p => p._id.toString() !== currentUserId)?.name || 'User'
            }
            otherUserEmail={
              selectedChat.participants.find(p => p._id.toString() !== currentUserId)?.email || ''
            }
            onClose={() => setSelectedChat(null)}
          />
        </div>
      )}
    </div>
  );
}
