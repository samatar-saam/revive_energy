import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  LifeBuoy,
  Send,
  AlertCircle,
  CheckCircle,
  Clock,
  RefreshCw,
  X,
  Reply,
} from 'lucide-react';
import { toast } from 'react-toastify';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export default function Support() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    subject: '',
    message: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  const getToken = () => localStorage.getItem('token');

  const fetchTickets = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = getToken();
      if (!token) {
        setError('Not authenticated. Please login.');
        setLoading(false);
        return;
      }

      const res = await fetch(`${API_URL}/support`, {
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

      const data = await res.json();
      setTickets(data);
    } catch (err) {
      console.error('❌ Fetch error:', err);
      setError(err.message);
      toast.error(err.message || 'Failed to load support tickets');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.subject.trim() || !formData.message.trim()) {
      toast.error('Subject and message are required');
      return;
    }

    setSubmitting(true);
    try {
      const token = getToken();
      if (!token) throw new Error('Not authenticated');

      const res = await fetch(`${API_URL}/support`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          subject: formData.subject.trim(),
          message: formData.message.trim(),
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Failed to submit ticket');
      }

      toast.success('Support ticket submitted successfully');
      setFormData({ subject: '', message: '' });
      fetchTickets();
    } catch (err) {
      toast.error(err.message || 'Failed to submit ticket');
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusBadge = (status) => {
    const map = {
      open: 'bg-green-100 text-green-700',
      in_progress: 'bg-blue-100 text-blue-700',
      resolved: 'bg-purple-100 text-purple-700',
      closed: 'bg-gray-100 text-gray-700',
    };
    return map[status] || 'bg-gray-100 text-gray-700';
  };

  const formatDate = (date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-KE', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // ─── New: Render replies for a ticket ──────────────────────
  const renderReplies = (replies) => {
    if (!replies || replies.length === 0) return null;
    return (
      <div className="mt-3 space-y-2">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Replies</p>
        {replies.map((reply) => (
          <div
            key={reply.id}
            className={`rounded-lg p-3 ${
              reply.sender_role === 'admin'
                ? 'bg-green-50 border-l-4 border-green-500'
                : 'bg-gray-50 border-l-4 border-gray-300'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-sm">{reply.sender_name}</span>
                <span className="text-xs text-gray-500">({reply.sender_role})</span>
              </div>
              <span className="text-xs text-gray-400">{formatDate(reply.created_at)}</span>
            </div>
            <p className="text-sm text-gray-700 mt-1">{reply.message}</p>
          </div>
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#11402D] border-t-[#9CF06B] rounded-full animate-spin mx-auto" />
          <p className="mt-4 text-gray-500">Loading support tickets...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center max-w-md">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-gray-900">Unable to load support</h3>
          <p className="text-gray-500 mt-2">{error}</p>
          <button
            onClick={fetchTickets}
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
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Support</h2>
          <p className="text-sm text-gray-500">Submit a request or view your tickets</p>
        </div>
        <button
          onClick={fetchTickets}
          className="inline-flex items-center gap-2 rounded-xl border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition"
        >
          <RefreshCw className="h-4 w-4" />
          Refresh
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Create Ticket Form */}
        <div className="lg:col-span-1 bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h3 className="font-semibold text-gray-700 mb-4">New Support Ticket</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Subject *</label>
              <input
                type="text"
                name="subject"
                value={formData.subject}
                onChange={handleChange}
                placeholder="Brief summary of your issue"
                className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-green-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Message *</label>
              <textarea
                name="message"
                rows="5"
                value={formData.message}
                onChange={handleChange}
                placeholder="Describe your issue in detail..."
                className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-green-500 resize-none"
                required
              />
            </div>
            <button
              type="submit"
              disabled={submitting}
              className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-[#11402D] px-4 py-2.5 text-white font-bold hover:bg-[#0E2A1C] transition disabled:opacity-70"
            >
              <Send className="h-4 w-4" />
              {submitting ? 'Submitting...' : 'Submit Ticket'}
            </button>
          </form>
        </div>

        {/* Right: Ticket List */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
            <h3 className="font-semibold text-gray-700">Your Tickets</h3>
            <span className="text-xs text-gray-500">{tickets.length} total</span>
          </div>
          <div className="overflow-y-auto max-h-[600px] divide-y divide-gray-100">
            {tickets.length === 0 ? (
              <div className="p-12 text-center text-gray-500 text-sm">
                <LifeBuoy className="mx-auto mb-4 h-12 w-12 text-gray-300" />
                <p>No support tickets found.</p>
                <p className="text-xs">Submit a ticket using the form on the left.</p>
              </div>
            ) : (
              tickets.map((ticket) => (
                <div key={ticket.id} className="p-4 hover:bg-gray-50 transition">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 truncate">{ticket.subject}</p>
                      <p className="text-sm text-gray-600 line-clamp-2 mt-1">
                        {ticket.message}
                      </p>
                      <div className="flex flex-wrap items-center gap-3 mt-2">
                        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getStatusBadge(ticket.status)}`}>
                          {ticket.status || 'open'}
                        </span>
                        <span className="text-xs text-gray-400">{formatDate(ticket.created_at)}</span>
                      </div>
                      {/* ─── Display replies ─────────────────── */}
                      {ticket.replies && ticket.replies.length > 0 && renderReplies(ticket.replies)}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}