// src/admin/pages/Messages.jsx
import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  MessageSquare,
  Search,
  ChevronLeft,
  ChevronRight,
  User,
  Mail,
  Clock,
  CheckCircle,
  AlertCircle,
  Send,
  RefreshCw,
  X,
} from 'lucide-react';
import { toast } from 'react-toastify';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export default function AdminMessages() {
  const [loading, setLoading] = useState(true);
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);
  const [replyText, setReplyText] = useState('');
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef(null);

  const getToken = () => localStorage.getItem('token');

  // ─── Fetch conversations ──────────────────────────────────────
  const fetchConversations = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = getToken();
      if (!token) {
        setError('Not authenticated. Please login.');
        setLoading(false);
        return;
      }

      const res = await fetch(`${API_URL}/admin/messages/conversations`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.status === 401 || res.status === 403) {
        setError('Session expired. Please login again.');
        setLoading(false);
        return;
      }

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}: ${res.statusText}`);
      }

      const responseData = await res.json();
      const data = responseData.data || responseData;
      setConversations(data);
    } catch (err) {
      console.error('❌ Fetch error:', err);
      setError(err.message);
      toast.error(err.message || 'Failed to load conversations');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConversations();
  }, []);

  // ─── Fetch messages for selected conversation ────────────────
  const fetchMessages = async (conversationId) => {
    try {
      const token = getToken();
      if (!token) return;

      const res = await fetch(`${API_URL}/admin/messages/conversations/${conversationId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}: ${res.statusText}`);
      }

      const data = await res.json();
      setMessages(data.messages || []);
    } catch (err) {
      console.error('❌ Fetch messages error:', err);
      toast.error('Failed to load messages');
    }
  };

  // ─── Select conversation ──────────────────────────────────────
  const selectConversation = (conv) => {
    setSelectedConversation(conv);
    fetchMessages(conv.id);
  };

  // ─── Send reply ──────────────────────────────────────────────
  const sendReply = async (e) => {
    e.preventDefault();
    if (!replyText.trim()) return;
    if (!selectedConversation) return;

    setSending(true);
    try {
      const token = getToken();
      if (!token) throw new Error('Not authenticated');

      const payload = {
        conversation_id: selectedConversation.id,
        receiver_id: selectedConversation.participant?.id,
        message: replyText.trim(),
      };

      const res = await fetch(`${API_URL}/admin/messages/send`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Send failed');
      }

      toast.success('Message sent');
      setReplyText('');
      fetchMessages(selectedConversation.id);
      fetchConversations();
    } catch (err) {
      toast.error(err.message || 'Failed to send message');
    } finally {
      setSending(false);
    }
  };

  // ─── Auto-scroll to bottom ──────────────────────────────────
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  // ─── Filtering & pagination ──────────────────────────────────
  const filteredConversations = useMemo(() => {
    let filtered = [...conversations];
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      filtered = filtered.filter(
        (c) =>
          c.participant?.name?.toLowerCase().includes(q) ||
          c.participant?.email?.toLowerCase().includes(q) ||
          c.last_message?.toLowerCase().includes(q)
      );
    }
    return filtered;
  }, [conversations, searchQuery]);

  const totalPages = Math.ceil(filteredConversations.length / pageSize);
  const paginatedConversations = filteredConversations.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  // ─── Stats ────────────────────────────────────────────────────
  const stats = useMemo(() => {
    const total = conversations.length;
    const withUnread = conversations.filter((c) => c.unread_count > 0).length;
    const active = conversations.filter(
      (c) => c.timestamp && new Date(c.timestamp) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    ).length;
    return { total, withUnread, active };
  }, [conversations]);

  const formatDate = (date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleString('en-KE', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getInitials = (name) => {
    if (!name) return '?';
    return name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#11402D] border-t-[#9CF06B] rounded-full animate-spin mx-auto" />
          <p className="mt-4 text-gray-500">Loading conversations...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center max-w-md">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-gray-900">Unable to load messages</h3>
          <p className="text-gray-500 mt-2">{error}</p>
          <button
            onClick={fetchConversations}
            className="mt-4 px-6 py-2 bg-[#11402D] text-white rounded-xl hover:bg-[#0E2A1C] transition"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* ─── Stats Cards ────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard label="Total Conversations" value={stats.total} icon={MessageSquare} color="blue" />
        <StatCard label="With Unread" value={stats.withUnread} icon={Mail} color="yellow" />
        <StatCard label="Active (7 days)" value={stats.active} icon={Clock} color="green" />
      </div>

      {/* ─── Toolbar ────────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name or message..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-64 rounded-xl border border-gray-200 bg-white py-2 pl-9 pr-4 text-sm outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
        </div>
        <button
          onClick={() => { fetchConversations(); if (selectedConversation) fetchMessages(selectedConversation.id); }}
          className="inline-flex items-center gap-2 rounded-xl border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition"
        >
          <RefreshCw className="h-4 w-4" />
          Refresh
        </button>
      </div>

      {/* ─── Conversation List & Detail ─────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Conversation List */}
        <div className="lg:col-span-1 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="p-3 border-b border-gray-100 bg-gray-50">
            <h3 className="font-semibold text-gray-700">Conversations</h3>
            <p className="text-xs text-gray-500">{filteredConversations.length} total</p>
          </div>
          <div className="overflow-y-auto max-h-[600px] divide-y divide-gray-100">
            {paginatedConversations.length === 0 ? (
              <div className="p-8 text-center text-gray-500 text-sm">No conversations found</div>
            ) : (
              paginatedConversations.map((conv) => (
                <div
                  key={conv.id}
                  onClick={() => selectConversation(conv)}
                  className={`p-3 cursor-pointer hover:bg-gray-50 transition ${
                    selectedConversation?.id === conv.id ? 'bg-green-50 border-l-4 border-[#11402D]' : ''
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#11402D]/10 flex items-center justify-center text-[#11402D] font-semibold text-sm flex-shrink-0">
                      {getInitials(conv.participant?.name)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="font-medium text-gray-900 truncate text-sm">
                          {conv.participant?.name || 'Unknown'}
                        </p>
                        {conv.unread_count > 0 && (
                          <span className="bg-[#11402D] text-white text-xs rounded-full px-2 py-0.5">
                            {conv.unread_count}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-500 truncate">{conv.participant?.email}</p>
                      <p className="text-sm text-gray-600 truncate mt-0.5">{conv.last_message || 'No messages'}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{formatDate(conv.timestamp)}</p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
          {totalPages > 1 && (
            <div className="p-3 border-t border-gray-100 flex items-center justify-between">
              <button
                onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                disabled={currentPage === 1}
                className="p-1 rounded hover:bg-gray-100 disabled:opacity-50"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <span className="text-xs text-gray-500">Page {currentPage} of {totalPages}</span>
              <button
                onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="p-1 rounded hover:bg-gray-100 disabled:opacity-50"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>

        {/* Right: Conversation Detail */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col h-[600px]">
          {selectedConversation ? (
            <>
              {/* Header */}
              <div className="p-4 border-b border-gray-100 flex items-center gap-3 bg-gray-50 rounded-t-2xl">
                <div className="w-10 h-10 rounded-full bg-[#11402D]/10 flex items-center justify-center text-[#11402D] font-semibold text-sm">
                  {getInitials(selectedConversation.participant?.name)}
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">{selectedConversation.participant?.name}</h4>
                  <p className="text-xs text-gray-500">{selectedConversation.participant?.email}</p>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {messages.length === 0 ? (
                  <div className="text-center text-gray-500 text-sm py-8">No messages in this conversation</div>
                ) : (
                  messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex ${msg.sender_role === 'admin' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[70%] rounded-2xl px-4 py-2 ${
                          msg.sender_role === 'admin'
                            ? 'bg-[#11402D] text-white'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        <p className="text-sm">{msg.message}</p>
                        <p className="text-xs opacity-70 mt-1">{formatDate(msg.created_at)}</p>
                      </div>
                    </div>
                  ))
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Reply Input */}
              <form onSubmit={sendReply} className="p-4 border-t border-gray-100 flex gap-3 bg-gray-50 rounded-b-2xl">
                <input
                  type="text"
                  placeholder="Type your reply..."
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  className="flex-1 rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-green-500"
                />
                <button
                  type="submit"
                  disabled={sending || !replyText.trim()}
                  className="rounded-xl bg-[#11402D] px-4 py-2.5 text-white font-bold hover:bg-[#0E2A1C] transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {sending ? '...' : <Send className="h-4 w-4" />}
                  <span className="hidden sm:inline">Send</span>
                </button>
              </form>
            </>
          ) : (
            <div className="flex items-center justify-center h-full text-gray-500 text-sm">
              Select a conversation to view messages
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Stat Card ──────────────────────────────────────────────────
function StatCard({ label, value, icon: Icon, color }) {
  const colorMap = {
    blue: 'bg-blue-50 text-blue-600 border-blue-100',
    yellow: 'bg-yellow-50 text-yellow-600 border-yellow-100',
    green: 'bg-green-50 text-green-600 border-green-100',
  };
  const style = colorMap[color] || colorMap.blue;

  return (
    <div className={`bg-white rounded-2xl p-5 shadow-sm border ${style}`}>
      <div className="flex items-center gap-3">
        <div className={`p-2 rounded-xl ${style}`}>
          <Icon className="w-5 h-5" />
        </div>
        <div>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          <p className="text-sm text-gray-500">{label}</p>
        </div>
      </div>
    </div>
  );
}