// src/admin/pages/AdminMessages.jsx
import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  MessageSquare,
  Search,
  ChevronLeft,
  ChevronRight,
  User,
  Mail,
  Clock,
  AlertCircle,
  Send,
  RefreshCw,
  PhoneMissed,
  Phone,
  Video,
  Users,
  ExternalLink,
  CheckCircle,
} from 'lucide-react';
import { toast } from 'react-toastify';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export default function AdminMessages() {
  const [activeTab, setActiveTab] = useState('conversations'); // 'conversations' | 'missed-calls'

  // ─── Conversations tab state ─────────────────────────────────
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

  // ─── Missed calls tab state ───────────────────────────────────
  const [escalations, setEscalations] = useState([]);
  const [escalationsLoading, setEscalationsLoading] = useState(true);
  const [startingCallId, setStartingCallId] = useState(null);

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
      if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);

      const responseData = await res.json();
      let data = [];
      if (Array.isArray(responseData)) data = responseData;
      else if (responseData.data && Array.isArray(responseData.data)) data = responseData.data;
      else if (responseData.conversations && Array.isArray(responseData.conversations)) data = responseData.conversations;

      setConversations(data);
    } catch (err) {
      setError(err.message);
      toast.error(err.message || 'Failed to load conversations');
    } finally {
      setLoading(false);
    }
  };

  // ─── Fetch missed-call escalations ────────────────────────────
  const fetchEscalations = async () => {
    setEscalationsLoading(true);
    try {
      const token = getToken();
      const res = await fetch(`${API_URL}/admin/missed-calls`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setEscalations(Array.isArray(data) ? data : []);
    } catch (err) {
      toast.error('Failed to load missed calls');
      setEscalations([]);
    } finally {
      setEscalationsLoading(false);
    }
  };

  useEffect(() => {
    fetchConversations();
    fetchEscalations();
  }, []);

  // ─── Fetch messages for selected conversation ────────────────
  const fetchMessages = async (conversationId) => {
    try {
      const token = getToken();
      if (!token) return;
      const res = await fetch(`${API_URL}/admin/messages/conversations/${conversationId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);
      const data = await res.json();
      const msgs = data.messages || data.data || data || [];
      setMessages(Array.isArray(msgs) ? msgs : []);
    } catch (err) {
      toast.error('Failed to load messages');
      setMessages([]);
    }
  };

  const selectConversation = (conv) => {
    setSelectedConversation(conv);
    fetchMessages(conv.id);
  };

  // The escalation (if any) tied to whichever conversation is open right now
  const activeConversationEscalation = useMemo(() => {
    if (!selectedConversation) return null;
    return escalations.find(
      (e) => e.conversation_id === selectedConversation.id && e.status !== 'resolved'
    ) || null;
  }, [escalations, selectedConversation]);

  // ─── Send reply ──────────────────────────────────────────────
  const sendReply = async (e) => {
    e.preventDefault();
    if (!replyText.trim() || !selectedConversation) return;

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
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
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

  // ─── Missed-call actions ───────────────────────────────────────
  const startGroupCall = async (escalation) => {
    setStartingCallId(escalation.id);
    try {
      const token = getToken();
      const res = await fetch(
        `${API_URL}/admin/missed-calls/${escalation.id}/start-group-call`,
        { method: 'POST', headers: { Authorization: `Bearer ${token}` } }
      );
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || 'Failed to start call');
      }
      const data = await res.json();
      toast.success('Group call started — both users have been notified');
      window.open(data.room_url, '_blank', 'noopener,noreferrer');
      fetchEscalations();
      if (selectedConversation?.id === escalation.conversation_id) {
        fetchMessages(selectedConversation.id);
      }
    } catch (err) {
      toast.error(err.message);
    } finally {
      setStartingCallId(null);
    }
  };

  const resolveEscalation = async (escalation) => {
    try {
      const token = getToken();
      const res = await fetch(`${API_URL}/admin/missed-calls/${escalation.id}/resolve`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Failed to resolve');
      toast.success('Marked resolved');
      fetchEscalations();
    } catch (err) {
      toast.error(err.message);
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
    const convs = Array.isArray(conversations) ? conversations : [];
    let filtered = [...convs];
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
    const convs = Array.isArray(conversations) ? conversations : [];
    const total = convs.length;
    const withUnread = convs.filter((c) => c.unread_count > 0).length;
    const openMissedCalls = escalations.length;
    return { total, withUnread, openMissedCalls };
  }, [conversations, escalations]);

  const formatDate = (date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleString('en-KE', {
      day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
    });
  };

  const getInitials = (name) => {
    if (!name) return '?';
    return name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const getParticipantDisplay = (conv) => {
    if (conv.participant) {
      return {
        name: conv.participant.name || 'Unknown',
        email: conv.participant.email || '',
        isGuest: conv.participant.role === 'guest',
      };
    }
    return { name: conv.guest_name || 'Guest', email: conv.guest_email || 'guest@example.com', isGuest: true };
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#11402D] border-t-[#9CF06B] rounded-full animate-spin mx-auto" />
          <p className="mt-4 text-gray-500 font-display">Loading conversations...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center max-w-md">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-gray-900 font-display">Unable to load messages</h3>
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
    <div className="min-h-screen bg-[#F8FAFC] font-['Inter']">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap');
        .font-display { font-family: 'Space Grotesk', sans-serif; }
        .font-mono-cw { font-family: 'JetBrains Mono', monospace; }
      `}</style>

      <div className="max-w-7xl mx-auto p-4 lg:p-6 space-y-6">
        {/* ─── Stats Cards ────────────────────────────────────────── */}
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
          <StatCard label="Total Conversations" value={stats.total} icon={MessageSquare} color="blue" />
          <StatCard label="With Unread" value={stats.withUnread} icon={Mail} color="yellow" />
          <StatCard
            label="Missed Calls Needing Follow-up"
            value={stats.openMissedCalls}
            icon={PhoneMissed}
            color="red"
            onClick={() => setActiveTab('missed-calls')}
          />
        </div>

        {/* ─── Tabs ───────────────────────────────────────────────── */}
        <div className="flex items-center gap-2 border-b border-gray-200">
          <TabButton
            active={activeTab === 'conversations'}
            onClick={() => setActiveTab('conversations')}
            icon={MessageSquare}
            label="Conversations"
          />
          <TabButton
            active={activeTab === 'missed-calls'}
            onClick={() => setActiveTab('missed-calls')}
            icon={PhoneMissed}
            label="Missed Calls"
            badge={stats.openMissedCalls > 0 ? stats.openMissedCalls : null}
          />
        </div>

        {activeTab === 'conversations' ? (
          <>
            {/* ─── Toolbar ────────────────────────────────────────────── */}
            <div className="flex flex-wrap items-center justify-between gap-3">
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
                  <h3 className="font-display font-semibold text-gray-700">Conversations</h3>
                  <p className="text-xs text-gray-500">{filteredConversations.length} total</p>
                </div>
                <div className="overflow-y-auto max-h-[600px] divide-y divide-gray-100">
                  {paginatedConversations.length === 0 ? (
                    <div className="p-8 text-center text-gray-500 text-sm">
                      {searchQuery ? 'No matching conversations' : 'No conversations found'}
                    </div>
                  ) : (
                    paginatedConversations.map((conv) => {
                      const participant = getParticipantDisplay(conv);
                      const hasMissedCall = escalations.some(
                        (e) => e.conversation_id === conv.id && e.status !== 'resolved'
                      );
                      return (
                        <div
                          key={conv.id}
                          onClick={() => selectConversation(conv)}
                          className={`p-3 cursor-pointer hover:bg-gray-50 transition ${
                            selectedConversation?.id === conv.id ? 'bg-green-50 border-l-4 border-[#11402D]' : ''
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            <div className="w-10 h-10 rounded-full bg-[#11402D]/10 flex items-center justify-center text-[#11402D] font-semibold text-sm flex-shrink-0">
                              {getInitials(participant.name)}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between">
                                <p className="font-display font-medium text-gray-900 truncate text-sm flex items-center gap-1.5">
                                  {participant.name}
                                  {participant.isGuest && (
                                    <span className="text-[10px] bg-gray-200 text-gray-600 px-1.5 py-0.5 rounded-full font-normal">
                                      Guest
                                    </span>
                                  )}
                                  {hasMissedCall && (
                                    <PhoneMissed className="w-3 h-3 text-red-500 flex-shrink-0" />
                                  )}
                                </p>
                                {conv.unread_count > 0 && (
                                  <span className="bg-[#11402D] text-white text-xs rounded-full px-2 py-0.5">
                                    {conv.unread_count}
                                  </span>
                                )}
                              </div>
                              <p className="text-xs text-gray-500 truncate">{participant.email}</p>
                              <p className="text-sm text-gray-600 truncate mt-0.5">{conv.last_message || 'No messages'}</p>
                              <p className="text-xs text-gray-400 mt-0.5 font-mono-cw">{formatDate(conv.timestamp)}</p>
                            </div>
                          </div>
                        </div>
                      );
                    })
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
                    <span className="text-xs text-gray-500 font-mono-cw">
                      Page {currentPage} of {totalPages}
                    </span>
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
                        {getInitials(selectedConversation.participant?.name || 'Guest')}
                      </div>
                      <div>
                        <h4 className="font-display font-semibold text-gray-900 flex items-center gap-1.5">
                          {selectedConversation.participant?.name || 'Guest'}
                          {selectedConversation.participant?.role === 'guest' && (
                            <span className="text-[10px] bg-gray-200 text-gray-600 px-1.5 py-0.5 rounded-full font-normal">
                              Guest
                            </span>
                          )}
                        </h4>
                        <p className="text-xs text-gray-500">{selectedConversation.participant?.email || 'guest@example.com'}</p>
                      </div>
                    </div>

                    {/* Missed-call banner, only if this conversation has an open escalation */}
                    {activeConversationEscalation && (
                      <div className="flex items-center justify-between gap-3 px-4 py-3 bg-red-50 border-b border-red-100">
                        <div className="flex items-center gap-2 text-sm text-red-700">
                          <PhoneMissed className="w-4 h-4 flex-shrink-0" />
                          <span>
                            <strong>{activeConversationEscalation.caller?.name}</strong> tried calling{' '}
                            <strong>{activeConversationEscalation.callee?.name}</strong> — no answer
                          </span>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          {activeConversationEscalation.status === 'call_started' && activeConversationEscalation.room_url && (
                            <a
                              href={activeConversationEscalation.room_url}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1 text-xs text-red-700 hover:underline"
                            >
                              <ExternalLink className="w-3 h-3" /> Rejoin
                            </a>
                          )}
                          <button
                            onClick={() => startGroupCall(activeConversationEscalation)}
                            disabled={startingCallId === activeConversationEscalation.id}
                            className="inline-flex items-center gap-1.5 rounded-lg bg-[#11402D] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#0E2A1C] transition disabled:opacity-50"
                          >
                            <Users className="w-3.5 h-3.5" />
                            {startingCallId === activeConversationEscalation.id ? 'Starting…' : 'Start Group Call'}
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-3">
                      {messages.length === 0 ? (
                        <div className="text-center text-gray-500 text-sm py-8">No messages in this conversation</div>
                      ) : (
                        messages.map((msg) => {
                          if (msg.message_type === 'call_invite') {
                            return (
                              <div key={msg.id} className="flex justify-center">
                                <div className="flex flex-col items-center gap-2 px-4 py-3 rounded-2xl bg-blue-50 border border-blue-100 max-w-xs text-center">
                                  <p className="text-xs text-blue-700">{msg.message}</p>
                                  <a
                                    href={msg.attachment_url}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-[#11402D] text-white text-xs font-semibold hover:bg-[#0E2A1C] transition"
                                  >
                                    <Phone className="w-3.5 h-3.5" /> Join Call
                                  </a>
                                </div>
                              </div>
                            );
                          }
                          if (msg.message_type === 'call') {
                            return (
                              <div key={msg.id} className="flex justify-center">
                                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-gray-100 text-gray-500 text-xs">
                                  {msg.call_type === 'video' ? <Video className="w-3.5 h-3.5" /> : <Phone className="w-3.5 h-3.5" />}
                                  <span>{msg.message}</span>
                                  <span className="text-gray-400">· {formatDate(msg.created_at)}</span>
                                </div>
                              </div>
                            );
                          }
                          return (
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
                                <p className="text-xs opacity-70 mt-1 font-mono-cw">{formatDate(msg.created_at)}</p>
                              </div>
                            </div>
                          );
                        })
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
          </>
        ) : (
          /* ─── Missed Calls Tab ─────────────────────────────────── */
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-500">Users who couldn't reach each other by call</p>
              <button
                onClick={fetchEscalations}
                className="inline-flex items-center gap-2 rounded-xl border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition"
              >
                <RefreshCw className="h-4 w-4" />
                Refresh
              </button>
            </div>

            {escalationsLoading ? (
              <div className="flex items-center justify-center py-16">
                <div className="w-10 h-10 border-4 border-[#11402D] border-t-[#9CF06B] rounded-full animate-spin" />
              </div>
            ) : escalations.length === 0 ? (
              <div className="bg-white rounded-2xl p-12 text-center border border-gray-100 shadow-sm">
                <CheckCircle className="w-12 h-12 text-green-400 mx-auto mb-3" />
                <p className="text-gray-600 font-medium">No missed calls need attention</p>
              </div>
            ) : (
              escalations.map((e) => (
                <div key={e.id} className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3">
                      <div className="p-2 rounded-xl bg-red-50 text-red-500 mt-0.5">
                        {e.call_type === 'video' ? <Video className="w-4 h-4" /> : <Phone className="w-4 h-4" />}
                      </div>
                      <div>
                        <p className="text-sm text-gray-900">
                          <span className="font-semibold">{e.caller?.name || 'Unknown'}</span>
                          {' '}tried calling{' '}
                          <span className="font-semibold">{e.callee?.name || 'Unknown'}</span>
                          {' '}but didn't get an answer
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          {e.caller?.role} → {e.callee?.role} · {formatDate(e.created_at)}
                        </p>
                        {e.status === 'call_started' && e.room_url && (
                          <a
                            href={e.room_url}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 text-xs text-[#11402D] font-medium mt-2 hover:underline"
                          >
                            <ExternalLink className="w-3 h-3" /> Rejoin call room
                          </a>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-col gap-2 flex-shrink-0">
                      <button
                        onClick={() => {
                          const conv = conversations.find((c) => c.id === e.conversation_id);
                          if (conv) { setActiveTab('conversations'); selectConversation(conv); }
                        }}
                        className="text-xs text-gray-500 hover:text-gray-700 transition text-right"
                      >
                        View conversation
                      </button>
                      <button
                        onClick={() => startGroupCall(e)}
                        disabled={startingCallId === e.id}
                        className="inline-flex items-center gap-1.5 rounded-xl bg-[#11402D] px-3 py-2 text-xs font-semibold text-white hover:bg-[#0E2A1C] transition disabled:opacity-50"
                      >
                        <Users className="w-3.5 h-3.5" />
                        {startingCallId === e.id
                          ? 'Starting…'
                          : e.status === 'call_started' ? 'Restart call' : 'Start group call'}
                      </button>
                      <button
                        onClick={() => resolveEscalation(e)}
                        className="text-xs text-gray-500 hover:text-gray-700 transition"
                      >
                        Mark resolved
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Tab Button ─────────────────────────────────────────────────
function TabButton({ active, onClick, icon: Icon, label, badge }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition ${
        active
          ? 'border-[#11402D] text-[#11402D]'
          : 'border-transparent text-gray-500 hover:text-gray-700'
      }`}
    >
      <Icon className="w-4 h-4" />
      {label}
      {badge && (
        <span className="bg-red-500 text-white text-[10px] font-bold rounded-full px-1.5 py-0.5">
          {badge}
        </span>
      )}
    </button>
  );
}

// ─── Stat Card ──────────────────────────────────────────────────
function StatCard({ label, value, icon: Icon, color, onClick }) {
  const colorMap = {
    blue: 'bg-blue-50 text-blue-600 border-blue-100',
    yellow: 'bg-yellow-50 text-yellow-600 border-yellow-100',
    green: 'bg-green-50 text-green-600 border-green-100',
    red: 'bg-red-50 text-red-600 border-red-100',
  };
  const style = colorMap[color] || colorMap.blue;

  return (
    <div
      onClick={onClick}
      className={`bg-white rounded-2xl p-4 shadow-sm border ${style} ${onClick ? 'cursor-pointer hover:shadow-md transition' : ''}`}
    >
      <div className="flex items-center gap-3">
        <div className={`p-2 rounded-xl ${style}`}>
          <Icon className="w-5 h-5" />
        </div>
        <div>
          <p className="font-display text-2xl font-bold text-gray-900">{value}</p>
          <p className="text-sm text-gray-500">{label}</p>
        </div>
      </div>
    </div>
  );
}