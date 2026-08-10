// src/users/pages/shared/Messages.jsx
import { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  Search,
  MessageCircle,
  Send,
  Paperclip,
  MoreVertical,
  User,
  Package,
  Truck,
  Zap,
  MapPin,
  Inbox,
  Check,
  CheckCheck,
  ChevronLeft,
  X,
  Trash2,
  Mic,
  Info,
  Eraser,
  FileText,
  Image as ImageIcon,
  Smile,
} from 'lucide-react';

import EmojiPicker from 'emoji-picker-react';   // <-- new library

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

const formatDuration = (secs) => {
  const m = String(Math.floor(secs / 60)).padStart(2, '0');
  const s = String(secs % 60).padStart(2, '0');
  return `${m}:${s}`;
};

const formatDateLabel = (timestamp) => {
  const date = new Date(timestamp);
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);
  const sameDay = (a, b) =>
    a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
  if (sameDay(date, today)) return 'Today';
  if (sameDay(date, yesterday)) return 'Yesterday';
  return date.toLocaleDateString('en-KE', { day: '2-digit', month: 'long', year: 'numeric' });
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

const hiddenKey = (conversationId) => `hiddenMessages_${conversationId}`;

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
  const conversationIdRef = useRef(null);

  // ─── Attachments ────────────────────────────────────────────
  const [attachedFile, setAttachedFile] = useState(null);
  const fileInputRef = useRef(null);

  // ─── Voice notes ────────────────────────────────────────────
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [voiceError, setVoiceError] = useState(null);
  const mediaRecorderRef = useRef(null);
  const recordedChunksRef = useRef([]);
  const recordingStreamRef = useRef(null);
  const recordingTimerRef = useRef(null);
  const recordingCancelledRef = useRef(false);

  // ─── Per‑message action menu ──────────────────────────────
  const [openMenuId, setOpenMenuId] = useState(null);
  const [hiddenIds, setHiddenIds] = useState(new Set());
  const msgMenuRef = useRef(null);

  // ─── Chat header "..." menu ─────────────────────────────────
  const [showHeaderMenu, setShowHeaderMenu] = useState(false);
  const headerMenuRef = useRef(null);

  // ─── Conversation-row "..." menu ──────────────────────────
  const [openConvMenuId, setOpenConvMenuId] = useState(null);
  const convMenuRef = useRef(null);

  // ─── Emoji picker ──────────────────────────────────────────
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const emojiPickerRef = useRef(null);

  // ─── Effects ────────────────────────────────────────────────
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

  // Close any open popover when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (msgMenuRef.current && !msgMenuRef.current.contains(e.target)) {
        setOpenMenuId(null);
      }
      if (headerMenuRef.current && !headerMenuRef.current.contains(e.target)) {
        setShowHeaderMenu(false);
      }
      if (convMenuRef.current && !convMenuRef.current.contains(e.target)) {
        setOpenConvMenuId(null);
      }
      // Close emoji picker if click outside
      if (emojiPickerRef.current && !emojiPickerRef.current.contains(e.target)) {
        setShowEmojiPicker(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // ─── Fetch conversations ────────────────────────────────────
  const fetchConversations = useCallback(async () => {
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
  }, []);

  useEffect(() => { fetchConversations(); }, [fetchConversations]);

  // ─── Mark messages as read ──────────────────────────────────
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
      setConversations(prev =>
        prev.map(conv => conv.id === conversationId ? { ...conv, unread_count: 0 } : conv)
      );
    } catch (err) {
      console.error('Error marking messages as read:', err);
    }
  }, []);

  // ─── Fetch messages ────────────────────────────────────────
  const fetchMessages = useCallback(async (conversationId) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;
      const response = await fetch(
        `${API_URL}/messages/conversations/${conversationId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (!response.ok) throw new Error('Failed to fetch messages');
      const data = await response.json();
      setMessages(data);
    } catch (err) {
      console.error('Error fetching messages:', err);
      setMessages([]);
    }
  }, []);

  useEffect(() => {
    if (!activeConversation) {
      setMessages([]);
      conversationIdRef.current = null;
      return;
    }
    try {
      const stored = localStorage.getItem(hiddenKey(activeConversation.id));
      setHiddenIds(new Set(stored ? JSON.parse(stored) : []));
    } catch (e) {
      setHiddenIds(new Set());
    }
    markConversationAsRead(activeConversation.id);
    fetchMessages(activeConversation.id);
  }, [activeConversation, markConversationAsRead, fetchMessages]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // ─── Send message ──────────────────────────────────────────
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if ((!newMessage.trim() && !attachedFile) || !activeConversation || sending) return;
    setSending(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('Not authenticated');

      let response;
      if (attachedFile) {
        const formData = new FormData();
        formData.append('conversation_id', activeConversation.id);
        formData.append('message', newMessage.trim());
        formData.append('attachment', attachedFile);
        response = await fetch(`${API_URL}/messages/send`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
          body: formData
        });
      } else {
        response = await fetch(`${API_URL}/messages/send`, {
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
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to send message');
      }
      const newMsg = await response.json();
      setMessages(prev => [...prev, newMsg]);
      setNewMessage('');
      setAttachedFile(null);
      setConversations(prev =>
        prev.map(conv =>
          conv.id === activeConversation.id
            ? { ...conv, last_message: newMsg.message || (attachedFile ? '📎 Attachment' : ''), timestamp: newMsg.created_at }
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

  // ─── Attachment picking ──────────────────────────────────────
  const handleAttachClick = () => fileInputRef.current?.click();

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) setAttachedFile(file);
    e.target.value = '';
  };

  // ─── Voice notes ──────────────────────────────────────────────
  const sendVoiceNote = async (file) => {
    if (!activeConversation) return;
    setSending(true);
    try {
      const token = localStorage.getItem('token');
      const formData = new FormData();
      formData.append('conversation_id', activeConversation.id);
      formData.append('message', '');
      formData.append('attachment', file);
      const response = await fetch(`${API_URL}/messages/send`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to send voice message');
      }
      const newMsg = await response.json();
      setMessages(prev => [...prev, newMsg]);
      setConversations(prev =>
        prev.map(conv =>
          conv.id === activeConversation.id
            ? { ...conv, last_message: '🎤 Voice message', timestamp: newMsg.created_at }
            : conv
        )
      );
    } catch (err) {
      console.error('Send voice note error:', err);
      alert(err.message);
    } finally {
      setSending(false);
    }
  };

  const startRecording = async () => {
    setVoiceError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      recordingStreamRef.current = stream;
      recordedChunksRef.current = [];
      recordingCancelledRef.current = false;

      const recorder = new MediaRecorder(stream);
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) recordedChunksRef.current.push(e.data);
      };
      recorder.onstop = () => {
        stream.getTracks().forEach(t => t.stop());
        if (recordingCancelledRef.current) {
          recordedChunksRef.current = [];
          return;
        }
        const blob = new Blob(recordedChunksRef.current, { type: 'audio/webm' });
        const file = new File([blob], `voice-note-${Date.now()}.webm`, { type: 'audio/webm' });
        sendVoiceNote(file);
      };

      mediaRecorderRef.current = recorder;
      recorder.start();
      setIsRecording(true);
      setRecordingSeconds(0);
      recordingTimerRef.current = setInterval(() => setRecordingSeconds(s => s + 1), 1000);
    } catch (err) {
      console.error('Microphone permission error:', err);
      setVoiceError('Microphone access was blocked. Allow permissions to record a voice message.');
    }
  };

  const stopRecording = (cancel) => {
    recordingCancelledRef.current = cancel;
    mediaRecorderRef.current?.stop();
    clearInterval(recordingTimerRef.current);
    setIsRecording(false);
    setRecordingSeconds(0);
  };

  useEffect(() => () => {
    clearInterval(recordingTimerRef.current);
    recordingStreamRef.current?.getTracks().forEach(t => t.stop());
  }, []);

  // ─── Delete a single message ──────────────────────────────
  const handleDeleteMessage = async (msg, scope) => {
    setOpenMenuId(null);
    if (scope === 'me') {
      const next = new Set(hiddenIds);
      next.add(msg.id);
      setHiddenIds(next);
      localStorage.setItem(hiddenKey(activeConversation.id), JSON.stringify([...next]));
      return;
    }
    if (!window.confirm('Delete this message for everyone?')) return;
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/messages/${msg.id}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ scope: 'everyone' })
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to delete message');
      }
      setMessages(prev => prev.map(m => (m.id === msg.id ? { ...m, message: '', is_deleted: true } : m)));
    } catch (err) {
      console.error('Delete message error:', err);
      alert(err.message);
    }
  };

  // ─── Clear chat ────────────────────────────────────────────
  const handleClearChat = async () => {
    if (!activeConversation) return;
    setShowHeaderMenu(false);
    if (!window.confirm('Clear all messages in this chat? This cannot be undone.')) return;
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(
        `${API_URL}/messages/conversations/${activeConversation.id}/messages`,
        { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } }
      );
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to clear chat');
      }
      setMessages([]);
      setConversations(prev =>
        prev.map(c => c.id === activeConversation.id ? { ...c, last_message: '', unread_count: 0 } : c)
      );
    } catch (err) {
      console.error('Clear chat error:', err);
      alert(err.message);
    }
  };

  // ─── Delete an entire chat ──────────────────────────────────
  const handleDeleteChat = async (conversationId) => {
    setOpenConvMenuId(null);
    setShowHeaderMenu(false);
    if (!window.confirm('Delete this chat? This removes it from your conversation list.')) return;
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/messages/conversations/${conversationId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to delete chat');
      }
      setConversations(prev => prev.filter(c => c.id !== conversationId));
      if (activeConversation?.id === conversationId) {
        setActiveConversation(null);
        setMessages([]);
      }
    } catch (err) {
      console.error('Delete chat error:', err);
      alert(err.message);
    }
  };

  // ─── Select conversation ────────────────────────────────────
  const handleSelectConversation = (conv) => {
    setActiveConversation(conv);
    setShowInfoPanel(false);
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

  const visibleMessages = messages.filter(m => !hiddenIds.has(m.id));

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
    <div className="h-[calc(100vh-120px)] flex gap-4 px-4 relative">
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
                filter === 'all' ? 'bg-[#11402D] text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilter('unread')}
              className={`px-3 py-1 rounded-full text-xs font-medium transition ${
                filter === 'unread' ? 'bg-[#11402D] text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
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
                className={`group relative flex items-start gap-3 p-3 rounded-xl cursor-pointer transition hover:bg-gray-50 ${
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

                {/* Row "..." menu — delete chat */}
                <div className="relative flex-shrink-0 opacity-0 group-hover:opacity-100 transition">
                  <button
                    onClick={(e) => { e.stopPropagation(); setOpenConvMenuId(openConvMenuId === conv.id ? null : conv.id); }}
                    className="p-1 rounded-full hover:bg-gray-200 text-gray-400"
                  >
                    <MoreVertical className="w-4 h-4" />
                  </button>
                  {openConvMenuId === conv.id && (
                    <div
                      ref={convMenuRef}
                      onClick={(e) => e.stopPropagation()}
                      className="absolute right-0 top-full mt-1 w-40 bg-white rounded-xl shadow-lg border border-gray-100 py-1 z-20"
                    >
                      <button
                        onClick={() => handleDeleteChat(conv.id)}
                        className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 text-left"
                      >
                        <Trash2 className="w-3.5 h-3.5" /> Delete chat
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Center: Chat Window */}
      <div
        id="chat-window"
        className={`flex-1 bg-white rounded-3xl shadow-sm border border-gray-100 flex flex-col relative ${
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
              <button
                onClick={() => setShowInfoPanel(v => !v)}
                className="flex items-center gap-3 text-left"
              >
                {isMobileView && (
                  <span onClick={(e) => { e.stopPropagation(); handleBackToList(); }} className="text-gray-500 hover:text-gray-700">
                    <ChevronLeft className="w-5 h-5" />
                  </span>
                )}
                <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 font-medium">
                  {activeConversation.participant?.name?.charAt(0)?.toUpperCase() || 'U'}
                </div>
                <div>
                  <p className="font-medium text-gray-900">{activeConversation.participant?.name || 'Unknown'}</p>
                  <p className="text-xs text-gray-500 flex items-center gap-1">
                    {getRoleIcon(activeConversation.participant?.role)}
                    {activeConversation.participant?.role || 'unknown'}
                  </p>
                </div>
              </button>
              <div className="flex items-center gap-1">
                <div className="relative">
                  <button
                    onClick={() => setShowHeaderMenu(v => !v)}
                    className="p-2 rounded-xl hover:bg-gray-100 transition text-gray-500"
                  >
                    <MoreVertical className="w-4 h-4" />
                  </button>
                  {showHeaderMenu && (
                    <div
                      ref={headerMenuRef}
                      className="absolute right-0 top-full mt-1 w-48 bg-white rounded-xl shadow-lg border border-gray-100 py-1 z-20"
                    >
                      <button
                        onClick={() => { setShowInfoPanel(v => !v); setShowHeaderMenu(false); }}
                        className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 text-left"
                      >
                        <Info className="w-3.5 h-3.5" /> View contact info
                      </button>
                      <button
                        onClick={handleClearChat}
                        className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 text-left"
                      >
                        <Eraser className="w-3.5 h-3.5" /> Clear chat
                      </button>
                      <button
                        onClick={() => handleDeleteChat(activeConversation.id)}
                        className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 text-left"
                      >
                        <Trash2 className="w-3.5 h-3.5" /> Delete chat
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="flex-1 flex overflow-hidden">
              {/* Messages column */}
              <div className="flex-1 flex flex-col min-w-0">
                <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/30">
                  {visibleMessages.length === 0 ? (
                    <div className="flex items-center justify-center h-full text-gray-400 text-sm">
                      <div className="text-center">
                        <MessageCircle className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                        <p>No messages yet</p>
                        <p className="text-xs">Say hello to start the conversation</p>
                      </div>
                    </div>
                  ) : (
                    visibleMessages.map((msg, index) => {
                      const isOutgoing = msg.sender_id === user?.id;
                      const prevMsg = visibleMessages[index - 1];
                      const showDateSeparator =
                        !prevMsg || formatDateLabel(prevMsg.created_at) !== formatDateLabel(msg.created_at);
                      const isVoiceNote = msg.attachment_type?.startsWith('audio');

                      const menuButton = (
                        <div className="relative opacity-0 group-hover:opacity-100 transition">
                          <button
                            onClick={() => setOpenMenuId(openMenuId === msg.id ? null : msg.id)}
                            className="p-1 rounded-full hover:bg-gray-200 text-gray-400"
                          >
                            <MoreVertical className="w-4 h-4" />
                          </button>
                          {openMenuId === msg.id && (
                            <div
                              ref={msgMenuRef}
                              className={`absolute ${isOutgoing ? 'right-0' : 'left-0'} bottom-full mb-1 w-44 bg-white rounded-xl shadow-lg border border-gray-100 py-1 z-20`}
                            >
                              <button
                                onClick={() => handleDeleteMessage(msg, 'me')}
                                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 text-left"
                              >
                                <Trash2 className="w-3.5 h-3.5" /> Delete for me
                              </button>
                              {isOutgoing && (
                                <button
                                  onClick={() => handleDeleteMessage(msg, 'everyone')}
                                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 text-left"
                                >
                                  <Trash2 className="w-3.5 h-3.5" /> Delete for everyone
                                </button>
                              )}
                            </div>
                          )}
                        </div>
                      );
                      return (
                        <div key={msg.id}>
                          {showDateSeparator && (
                            <div className="flex justify-center my-3">
                              <span className="px-3 py-1 rounded-full bg-white border border-gray-100 shadow-sm text-[11px] font-medium text-gray-500">
                                {formatDateLabel(msg.created_at)}
                              </span>
                            </div>
                          )}
                          <div className={`group flex items-center gap-1 ${isOutgoing ? 'justify-end' : 'justify-start'}`}>
                            {isOutgoing && !msg.is_deleted && menuButton}
                            <div
                              className={`max-w-[75%] rounded-2xl px-4 py-2.5 ${
                                isOutgoing ? 'bg-[#11402D] text-white rounded-br-sm' : 'bg-gray-100 text-gray-800 rounded-bl-sm'
                              } ${msg.is_deleted ? 'italic opacity-70' : ''}`}
                            >
                              {isVoiceNote && !msg.is_deleted && (
                                <div className="flex items-center gap-2 mb-1.5">
                                  <div className={`p-1.5 rounded-full ${isOutgoing ? 'bg-white/15' : 'bg-white'}`}>
                                    <Mic className="w-3.5 h-3.5" />
                                  </div>
                                  <audio
                                    controls
                                    src={msg.attachment_url}
                                    className="h-8 max-w-[190px]"
                                    style={{ filter: isOutgoing ? 'invert(1) hue-rotate(180deg)' : 'none' }}
                                  />
                                </div>
                              )}
                              {msg.attachment_url && !isVoiceNote && !msg.is_deleted && (
                                <a
                                  href={msg.attachment_url}
                                  target="_blank"
                                  rel="noreferrer"
                                  className={`flex items-center gap-2 mb-1.5 px-2 py-1.5 rounded-lg text-xs ${
                                    isOutgoing ? 'bg-white/10' : 'bg-white'
                                  }`}
                                >
                                  {msg.attachment_type?.startsWith('image') ? (
                                    <ImageIcon className="w-3.5 h-3.5" />
                                  ) : (
                                    <FileText className="w-3.5 h-3.5" />
                                  )}
                                  <span className="truncate">{msg.attachment_name || 'Attachment'}</span>
                                </a>
                              )}
                              {(!isVoiceNote || msg.message) && (
                                <p className="text-sm whitespace-pre-wrap">
                                  {msg.is_deleted ? 'This message was deleted' : msg.message}
                                </p>
                              )}
                              <div className={`flex items-center gap-1 mt-1 text-[10px] ${isOutgoing ? 'text-white/60' : 'text-gray-400'}`}>
                                <span>{formatTime(msg.created_at)}</span>
                                {isOutgoing && (
                                  <span>{msg.is_read ? <CheckCheck className="w-3 h-3" /> : <Check className="w-3 h-3" />}</span>
                                )}
                              </div>
                            </div>
                            {!isOutgoing && !msg.is_deleted && menuButton}
                          </div>
                        </div>
                      );
                    })
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Attached file preview */}
                {attachedFile && (
                  <div className="px-4 pt-2">
                    <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-700 w-fit">
                      {attachedFile.type?.startsWith('image') ? (
                        <ImageIcon className="w-4 h-4 text-gray-400" />
                      ) : (
                        <FileText className="w-4 h-4 text-gray-400" />
                      )}
                      <span className="truncate max-w-[200px]">{attachedFile.name}</span>
                      <button type="button" onClick={() => setAttachedFile(null)} className="text-gray-400 hover:text-gray-600">
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                )}

                {/* Input */}
                <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-100 relative">
                  {voiceError && (
                    <p className="text-xs text-red-500 mb-2 px-1">{voiceError}</p>
                  )}

                  {isRecording ? (
                    <div className="flex items-center gap-3 bg-red-50 rounded-2xl px-4 py-2.5 border border-red-100">
                      <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse flex-shrink-0" />
                      <span className="text-sm font-medium text-red-600">Recording…</span>
                      <span className="text-sm font-mono text-red-500">{formatDuration(recordingSeconds)}</span>
                      <div className="flex-1" />
                      <button
                        type="button"
                        onClick={() => stopRecording(true)}
                        title="Cancel"
                        className="p-2 rounded-xl text-gray-500 hover:bg-white transition"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => stopRecording(false)}
                        title="Send voice message"
                        className="p-2 bg-[#11402D] text-white rounded-xl hover:bg-[#0E2A1C] transition"
                      >
                        <Send className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 bg-gray-50 rounded-2xl px-4 py-2 border border-gray-200 focus-within:ring-2 focus-within:ring-green-500 transition">
                      {/* Attachment button */}
                      <button type="button" onClick={handleAttachClick} className="text-gray-400 hover:text-gray-600 transition">
                        <Paperclip className="w-5 h-5" />
                      </button>
                      <input ref={fileInputRef} type="file" onChange={handleFileChange} className="hidden" />

                      {/* Emoji picker */}
                      <div className="relative" ref={emojiPickerRef}>
                        <button
                          type="button"
                          onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                          className="text-gray-400 hover:text-gray-600 transition p-1"
                          aria-label="Pick an emoji"
                        >
                          <Smile className="w-5 h-5" />
                        </button>
                        {showEmojiPicker && (
                          <div className="absolute bottom-full left-0 mb-2 z-50">
                            <EmojiPicker
                              onEmojiClick={(emojiObject) => {
                                setNewMessage((prev) => prev + emojiObject.emoji);
                                setShowEmojiPicker(false);
                              }}
                              skinTonesDisabled
                              searchDisabled
                              height={350}
                              width={300}
                            />
                          </div>
                        )}
                      </div>

                      <input
                        ref={inputRef}
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Type a message..."
                        className="flex-1 bg-transparent outline-none text-sm text-gray-700 placeholder-gray-400"
                      />

                      {!newMessage.trim() && !attachedFile ? (
                        <button
                          type="button"
                          onClick={startRecording}
                          title="Record a voice message"
                          className="p-2 bg-[#11402D] text-white rounded-xl hover:bg-[#0E2A1C] transition"
                        >
                          <Mic className="w-5 h-5" />
                        </button>
                      ) : (
                        <button
                          type="submit"
                          disabled={sending}
                          className="p-2 bg-[#11402D] text-white rounded-xl hover:bg-[#0E2A1C] transition disabled:opacity-50"
                        >
                          {sending ? (
                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          ) : (
                            <Send className="w-5 h-5" />
                          )}
                        </button>
                      )}
                    </div>
                  )}
                </form>
              </div>

              {/* Contact info side panel */}
              {showInfoPanel && (
                <div className="w-72 border-l border-gray-100 flex flex-col p-5 overflow-y-auto">
                  <div className="flex items-center justify-between mb-4">
                    <p className="font-display font-semibold text-gray-900">Contact info</p>
                    <button onClick={() => setShowInfoPanel(false)} className="text-gray-400 hover:text-gray-600">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="flex flex-col items-center text-center mb-6">
                    <div className="w-20 h-20 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 font-semibold text-2xl mb-3">
                      {activeConversation.participant?.name?.charAt(0)?.toUpperCase() || 'U'}
                    </div>
                    <p className="font-medium text-gray-900">{activeConversation.participant?.name || 'Unknown'}</p>
                    <span className={`inline-flex items-center gap-1 mt-2 px-2 py-0.5 rounded-full text-[10px] font-medium ${getRoleColor(activeConversation.participant?.role)}`}>
                      {getRoleIcon(activeConversation.participant?.role)}
                      {activeConversation.participant?.role || 'unknown'}
                    </span>
                  </div>
                  <div className="space-y-1 border-t border-gray-100 pt-4">
                    <button
                      onClick={handleClearChat}
                      className="w-full flex items-center gap-2 px-2 py-2 rounded-lg text-sm text-gray-700 hover:bg-gray-50 text-left"
                    >
                      <Eraser className="w-4 h-4" /> Clear chat
                    </button>
                    <button
                      onClick={() => handleDeleteChat(activeConversation.id)}
                      className="w-full flex items-center gap-2 px-2 py-2 rounded-lg text-sm text-red-600 hover:bg-red-50 text-left"
                    >
                      <Trash2 className="w-4 h-4" /> Delete chat
                    </button>
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}