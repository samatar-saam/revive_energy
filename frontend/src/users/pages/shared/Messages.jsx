// src/users/pages/shared/Messages.jsx
import { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  Search,
  MessageCircle,
  Send,
  Paperclip,
  Smile,
  MoreVertical,
  Phone,
  Video,
  User,
  Package,
  Truck,
  Zap,
  MapPin,
  Inbox,
  Check,
  CheckCheck,
  ChevronLeft,
  X
} from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// ─── Helper functions ─────────────────────────────────────────
const formatTime = (timestamp) => {
  if (!timestamp) return '';
  const date = new Date(timestamp);
  const now = new Date();
  const diff = Math.floor((now - date) / 1000);
  if (diff < 60) return 'Just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}d`;
  return date.toLocaleDateString('en-KE', { day: '2-digit', month: 'short' });
};

const getRoleIcon = (role) => {
  switch (role?.toLowerCase()) {
    case 'supplier': return <Package className="w-4 h-4" />;
    case 'producer': return <Zap className="w-4 h-4" />;
    case 'transporter': return <Truck className="w-4 h-4" />;
    default: return <User className="w-4 h-4" />;
  }
};

const getRoleColor = (role) => {
  switch (role?.toLowerCase()) {
    case 'supplier': return 'bg-emerald-100 text-emerald-700';
    case 'producer': return 'bg-yellow-100 text-yellow-700';
    case 'transporter': return 'bg-blue-100 text-blue-700';
    default: return 'bg-gray-100 text-gray-700';
  }
};

export default function Messages() {
  const [loading, setLoading] = useState(true);
  const [conversations, setConversations] = useState([]);
  const [activeConversation, setActiveConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState('all');
  const [isMobileView, setIsMobileView] = useState(window.innerWidth < 768);
  const [showInfoPanel, setShowInfoPanel] = useState(false);
  const [sending, setSending] = useState(false);
  const [user, setUser] = useState(null);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const conversationIdRef = useRef(null); // to avoid duplicate mark-read calls

  useEffect(() => {
    const handleResize = () => setIsMobileView(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try { setUser(JSON.parse(storedUser)); } catch (e) {}
    }
  }, []);

  // ─── Fetch conversations ────────────────────────────────────
  useEffect(() => {
    const fetchConversations = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setConversations([]);
          setLoading(false);
          return;
        }
        const response = await fetch(`${API_URL}/messages/conversations`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.message || 'Failed to fetch conversations');
        }
        const data = await response.json();
        setConversations(data);
      } catch (err) {
        console.error('Error fetching conversations:', err);
        setConversations([]);
      } finally {
        setLoading(false);
      }
    };
    fetchConversations();
  }, []);

  // ─── Mark messages as read when conversation is opened ─────
  const markConversationAsRead = useCallback(async (conversationId) => {
    if (!conversationId || conversationIdRef.current === conversationId) return;
    conversationIdRef.current = conversationId;

    try {
      const token = localStorage.getItem('token');
      if (!token) return;
      await fetch(`${API_URL}/messages/conversations/${conversationId}/read`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` }
      });
      // Update unread count locally
      setConversations(prev =>
        prev.map(conv =>
          conv.id === conversationId ? { ...conv, unread_count: 0 } : conv
        )
      );
    } catch (err) {
      console.error('Error marking messages as read:', err);
    }
  }, []);

  // ─── Fetch messages when active conversation changes ──────
  useEffect(() => {
    if (!activeConversation) {
      setMessages([]);
      conversationIdRef.current = null;
      return;
    }

    // Mark as read
    markConversationAsRead(activeConversation.id);

    const fetchMessages = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;
        const response = await fetch(
          `${API_URL}/messages/conversations/${activeConversation.id}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (!response.ok) throw new Error('Failed to fetch messages');
        const data = await response.json();
        setMessages(data);
      } catch (err) {
        console.error('Error fetching messages:', err);
        setMessages([]);
      }
    };
    fetchMessages();
  }, [activeConversation, markConversationAsRead]);

  // ─── Scroll to bottom on new messages ──────────────────────
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // ─── Send message ───────────────────────────────────────────
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeConversation || sending) return;
    setSending(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('Not authenticated');

      const response = await fetch(`${API_URL}/messages/send`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          conversation_id: activeConversation.id,
          message: newMessage.trim()
        })
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to send message');
      }
      const newMsg = await response.json();
      setMessages(prev => [...prev, newMsg]);
      setNewMessage('');
      // Update conversation list with new last message
      setConversations(prev =>
        prev.map(conv =>
          conv.id === activeConversation.id
            ? { ...conv, last_message: newMsg.message, timestamp: newMsg.created_at }
            : conv
        )
      );
    } catch (err) {
      console.error('Send message error:', err);
      alert(err.message);
    } finally {
      setSending(false);
    }
  };

  // ─── Select conversation ────────────────────────────────────
  const handleSelectConversation = (conv) => {
    setActiveConversation(conv);
    if (isMobileView) {
      document.getElementById('conversation-list')?.classList.add('hidden');
      document.getElementById('chat-window')?.classList.remove('hidden');
    }
  };

  const handleBackToList = () => {
    document.getElementById('conversation-list')?.classList.remove('hidden');
    document.getElementById('chat-window')?.classList.add('hidden');
  };

  // ─── Filter conversations ──────────────────────────────────
  const filteredConversations = conversations.filter(conv => {
    if (filter === 'unread' && (conv.unread_count || 0) === 0) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      return (
        conv.participant?.name?.toLowerCase().includes(q) ||
        conv.participant?.role?.toLowerCase().includes(q) ||
        conv.last_message?.toLowerCase().includes(q)
      );
    }
    return true;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#11402D] border-t-[#9CF06B] rounded-full animate-spin mx-auto" />
          <p className="mt-4 text-gray-500">Loading conversations...</p>
        </div>
      </div>
    );
  }

  if (conversations.length === 0) {
    return (
      <div className="space-y-6 px-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-gray-900">Messages</h1>
          <p className="text-sm text-gray-500 mt-1">Your communications hub</p>
        </div>
        <div className="bg-white rounded-3xl p-12 text-center border border-gray-100 shadow-sm">
          <MessageCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="font-display text-xl font-semibold text-gray-700">
            No conversations available yet.
          </h3>
          <p className="text-gray-500 mt-2 max-w-md mx-auto">
            Conversations are automatically created after waste requests are approved and delivery jobs are assigned.
          </p>
          <Link
            to="/dashboard/marketplace"
            className="inline-block mt-4 px-6 py-2 bg-[#11402D] text-white rounded-xl text-sm font-medium hover:bg-[#0E2A1C] transition"
          >
            Go to Marketplace
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-120px)] flex gap-4 px-4">
      {/* Left: Conversation List */}
      <div
        id="conversation-list"
        className={`w-full md:w-80 lg:w-96 bg-white rounded-3xl shadow-sm border border-gray-100 flex flex-col ${
          isMobileView && activeConversation ? 'hidden' : 'flex'
        }`}
      >
        <div className="p-4 border-b border-gray-100">
          <h2 className="font-display text-lg font-semibold text-gray-900">Messages</h2>
          <div className="relative mt-3">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-xl border border-gray-200 bg-gray-50 focus:ring-2 focus:ring-green-500 focus:bg-white transition text-sm"
            />
          </div>
          <div className="flex gap-2 mt-3">
            <button
              onClick={() => setFilter('all')}
              className={`px-3 py-1 rounded-full text-xs font-medium transition ${
                filter === 'all'
                  ? 'bg-[#11402D] text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilter('unread')}
              className={`px-3 py-1 rounded-full text-xs font-medium transition ${
                filter === 'unread'
                  ? 'bg-[#11402D] text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Unread
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-3 space-y-1">
          {filteredConversations.length === 0 ? (
            <div className="text-center py-8 text-gray-400 text-sm">
              <Inbox className="w-8 h-8 mx-auto mb-2 text-gray-300" />
              No conversations match your filters.
            </div>
          ) : (
            filteredConversations.map((conv) => (
              <div
                key={conv.id}
                onClick={() => handleSelectConversation(conv)}
                className={`flex items-start gap-3 p-3 rounded-xl cursor-pointer transition hover:bg-gray-50 ${
                  activeConversation?.id === conv.id ? 'bg-[#11402D]/5 border border-[#11402D]/20' : ''
                }`}
              >
                <div className="relative flex-shrink-0">
                  <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 font-medium">
                    {conv.participant?.name?.charAt(0)?.toUpperCase() || 'U'}
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-medium text-gray-900 truncate">{conv.participant?.name || 'Unknown'}</p>
                    {conv.timestamp && (
                      <span className="text-xs text-gray-400 whitespace-nowrap">{formatTime(conv.timestamp)}</span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-medium ${getRoleColor(conv.participant?.role)}`}>
                      {getRoleIcon(conv.participant?.role)}
                      {conv.participant?.role || 'unknown'}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 truncate mt-1">{conv.last_message || 'No messages yet'}</p>
                </div>
                {conv.unread_count > 0 && (
                  <span className="flex-shrink-0 w-5 h-5 rounded-full bg-[#11402D] text-white text-[10px] font-bold flex items-center justify-center">
                    {conv.unread_count}
                  </span>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Center: Chat Window */}
      <div
        id="chat-window"
        className={`flex-1 bg-white rounded-3xl shadow-sm border border-gray-100 flex flex-col ${
          isMobileView && !activeConversation ? 'hidden' : 'flex'
        }`}
      >
        {!activeConversation ? (
          <div className="flex-1 flex items-center justify-center text-gray-400">
            <div className="text-center">
              <MessageCircle className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p className="font-medium">Select a conversation</p>
              <p className="text-sm">Choose a conversation to start messaging</p>
            </div>
          </div>
        ) : (
          <>
            {/* Chat Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-100">
              <div className="flex items-center gap-3">
                {isMobileView && (
                  <button onClick={handleBackToList} className="text-gray-500 hover:text-gray-700">
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                )}
                <div className="relative">
                  <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 font-medium">
                    {activeConversation.participant?.name?.charAt(0)?.toUpperCase() || 'U'}
                  </div>
                </div>
                <div>
                  <p className="font-medium text-gray-900">{activeConversation.participant?.name || 'Unknown'}</p>
                  <p className="text-xs text-gray-500 flex items-center gap-1">
                    {getRoleIcon(activeConversation.participant?.role)}
                    {activeConversation.participant?.role || 'unknown'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button className="p-2 rounded-xl hover:bg-gray-100 transition text-gray-500">
                  <MoreVertical className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/30">
              {messages.length === 0 ? (
                <div className="flex items-center justify-center h-full text-gray-400 text-sm">
                  <div className="text-center">
                    <MessageCircle className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                    <p>No messages yet</p>
                    <p className="text-xs">Say hello to start the conversation</p>
                  </div>
                </div>
              ) : (
                messages.map((msg) => {
                  const isOutgoing = msg.sender_id === user?.id;
                  return (
                    <div key={msg.id} className={`flex ${isOutgoing ? 'justify-end' : 'justify-start'}`}>
                      <div
                        className={`max-w-[75%] rounded-2xl px-4 py-2.5 ${
                          isOutgoing
                            ? 'bg-[#11402D] text-white rounded-br-sm'
                            : 'bg-gray-100 text-gray-800 rounded-bl-sm'
                        }`}
                      >
                        <p className="text-sm whitespace-pre-wrap">{msg.message}</p>
                        <div className={`flex items-center gap-1 mt-1 text-[10px] ${isOutgoing ? 'text-white/60' : 'text-gray-400'}`}>
                          <span>{formatTime(msg.created_at)}</span>
                          {isOutgoing && (
                            <span>{msg.is_read ? <CheckCheck className="w-3 h-3" /> : <Check className="w-3 h-3" />}</span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-100">
              <div className="flex items-center gap-2 bg-gray-50 rounded-2xl px-4 py-2 border border-gray-200 focus-within:ring-2 focus-within:ring-green-500 transition">
                <input
                  ref={inputRef}
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type a message..."
                  className="flex-1 bg-transparent outline-none text-sm text-gray-700 placeholder-gray-400"
                />
                <button
                  type="submit"
                  disabled={!newMessage.trim() || sending}
                  className="p-2 bg-[#11402D] text-white rounded-xl hover:bg-[#0E2A1C] transition disabled:opacity-50"
                >
                  {sending ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Send className="w-5 h-5" />
                  )}
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
}