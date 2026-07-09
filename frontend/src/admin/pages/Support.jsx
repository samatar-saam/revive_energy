// src/admin/pages/Support.jsx
import React, { useState, useEffect, useMemo } from 'react';
import {
  LifeBuoy,
  Search,
  Filter,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Eye,
  X,
  AlertCircle,
  CheckCircle,
  Clock,
  MessageSquare,
  RefreshCw,
  Trash2,
  User,
  Mail,
} from 'lucide-react';
import { toast } from 'react-toastify';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export default function Support() {
  const [loading, setLoading] = useState(true);
  const [tickets, setTickets] = useState([]);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(5);

  // ─── Modal states ────────────────────────────────────────────
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const getToken = () => localStorage.getItem('token');

  // ─── Fetch tickets ──────────────────────────────────────────
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

      const res = await fetch(`${API_URL}/admin/support/tickets`, {
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

  // ─── Filtering & pagination ──────────────────────────────────
  const filteredTickets = useMemo(() => {
    let filtered = [...tickets];
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      filtered = filtered.filter(
        (t) =>
          t.subject?.toLowerCase().includes(q) ||
          t.message?.toLowerCase().includes(q) ||
          t.name?.toLowerCase().includes(q) ||
          t.email?.toLowerCase().includes(q)
      );
    }
    if (filterStatus !== 'all') {
      filtered = filtered.filter((t) => t.status === filterStatus);
    }
    return filtered;
  }, [tickets, searchQuery, filterStatus]);

  const totalPages = Math.ceil(filteredTickets.length / pageSize);
  const paginatedTickets = filteredTickets.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  // ─── Stats ────────────────────────────────────────────────────
  const stats = useMemo(() => {
    const total = tickets.length;
    const open = tickets.filter((t) => t.status === 'open').length;
    const inProgress = tickets.filter((t) => t.status === 'in_progress').length;
    const resolved = tickets.filter((t) => t.status === 'resolved').length;
    const closed = tickets.filter((t) => t.status === 'closed').length;
    return { total, open, inProgress, resolved, closed };
  }, [tickets]);

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

  // ─── Helper: check if ticket is from a guest ────────────────
  const isGuestTicket = (ticket) => {
    return !ticket.user_id || ticket.user_id === null;
  };

  // ─── Handlers ─────────────────────────────────────────────────
  const openView = (ticket) => {
    setSelectedTicket(ticket);
    setReplyText('');
    setShowViewModal(true);
  };

  const closeModals = () => {
    setShowViewModal(false);
    setSelectedTicket(null);
    setReplyText('');
  };

  const handleUpdateStatus = async (ticketId, status) => {
    try {
      const token = getToken();
      if (!token) throw new Error('Not authenticated');

      const res = await fetch(`${API_URL}/admin/support/tickets/${ticketId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Update failed');
      }

      toast.success(`Ticket ${status.replace('_', ' ')} successfully`);
      fetchTickets();
      if (selectedTicket && selectedTicket.id === ticketId) {
        setSelectedTicket({ ...selectedTicket, status });
      }
    } catch (err) {
      toast.error(err.message || 'Failed to update ticket');
    }
  };

  const handleReply = async (e) => {
    e.preventDefault();
    if (!replyText.trim() || !selectedTicket) return;

    setSubmitting(true);
    try {
      const token = getToken();
      if (!token) throw new Error('Not authenticated');

      const res = await fetch(`${API_URL}/admin/support/tickets/${selectedTicket.id}/reply`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ reply: replyText.trim() }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Reply failed');
      }

      toast.success('Reply sent');
      setReplyText('');
      fetchTickets();
    } catch (err) {
      toast.error(err.message || 'Failed to send reply');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (ticket) => {
    if (!confirm(`Are you sure you want to delete this ticket?`)) return;
    try {
      const token = getToken();
      if (!token) throw new Error('Not authenticated');

      const res = await fetch(`${API_URL}/admin/support/tickets/${ticket.id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Delete failed');
      }

      toast.success('Ticket deleted successfully');
      fetchTickets();
      closeModals();
    } catch (err) {
      toast.error(err.message || 'Failed to delete ticket');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#11402D] border-t-[#9CF06B] rounded-full animate-spin mx-auto" />
          <p className="mt-4 text-gray-500 font-display">Loading support tickets...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center max-w-md">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-gray-900 font-display">Unable to load tickets</h3>
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
    <div className="min-h-screen bg-[#F8FAFC] font-['Inter']">
      {/* ─── Fonts ────────────────────────────────────────────────── */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap');
        .font-display { font-family: 'Space Grotesk', sans-serif; }
        .font-mono-cw { font-family: 'JetBrains Mono', monospace; }
      `}</style>

      <div className="max-w-7xl mx-auto p-4 lg:p-6 space-y-6">
        {/* ─── Stats Cards ────────────────────────────────────────── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard label="Total Tickets" value={stats.total} icon={LifeBuoy} color="blue" />
          <StatCard label="Open" value={stats.open} icon={Clock} color="yellow" />
          <StatCard label="In Progress" value={stats.inProgress} icon={MessageSquare} color="blue" />
          <StatCard label="Resolved" value={stats.resolved} icon={CheckCircle} color="green" />
        </div>

        {/* ─── Toolbar ────────────────────────────────────────────── */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search by subject, message, or user..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-64 rounded-xl border border-gray-200 bg-white py-2 pl-9 pr-4 text-sm outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>

            <div className="relative">
              <Filter className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="appearance-none rounded-xl border border-gray-200 bg-white py-2 pl-9 pr-8 text-sm outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="all">All Status</option>
                <option value="open">Open</option>
                <option value="in_progress">In Progress</option>
                <option value="resolved">Resolved</option>
                <option value="closed">Closed</option>
              </select>
              <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            </div>
          </div>

          <button
            onClick={fetchTickets}
            className="inline-flex items-center gap-2 rounded-xl border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </button>
        </div>

        {/* ─── Table ───────────────────────────────────────────────── */}
        <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
          {paginatedTickets.length === 0 ? (
            <div className="p-12 text-center">
              <LifeBuoy className="mx-auto mb-4 h-16 w-16 text-gray-300" />
              <h3 className="text-lg font-semibold text-gray-700 font-display">No support tickets found</h3>
              <p className="text-sm text-gray-500">Try adjusting your filters.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1000px]">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500">ID</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500">Subject</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500">User</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500">Email</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500">Status</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500">Created</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold uppercase text-gray-500">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {paginatedTickets.map((ticket) => (
                    <tr key={ticket.id} className="hover:bg-gray-50/50 transition">
                      <td className="px-4 py-3 font-mono-cw text-sm text-gray-500">#{ticket.id}</td>
                      <td className="px-4 py-3 font-medium text-gray-900">{ticket.subject}</td>
                      <td className="px-4 py-3 text-sm text-gray-700 flex items-center gap-1.5">
                        {ticket.name}
                        {isGuestTicket(ticket) && (
                          <span className="text-[10px] bg-gray-200 text-gray-600 px-1.5 py-0.5 rounded-full font-normal">
                            Guest
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">{ticket.email}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${getStatusBadge(ticket.status)}`}>
                          {ticket.status || 'open'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm font-mono-cw text-gray-500">{formatDate(ticket.created_at)}</td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => openView(ticket)}
                            className="rounded-lg p-1.5 text-gray-400 transition hover:bg-gray-100 hover:text-[#11402D]"
                            title="View"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(ticket)}
                            className="rounded-lg p-1.5 text-gray-400 transition hover:bg-gray-100 hover:text-red-600"
                            title="Delete"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* ─── Pagination ──────────────────────────────────────────── */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-500">
              Showing {Math.min(filteredTickets.length, (currentPage - 1) * pageSize + 1)} to{' '}
              {Math.min(filteredTickets.length, currentPage * pageSize)} of {filteredTickets.length} entries
            </p>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                disabled={currentPage === 1}
                className="rounded-xl border border-gray-200 p-2 text-gray-500 hover:bg-gray-50 disabled:opacity-50"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`rounded-xl px-3 py-1 text-sm font-medium ${
                    page === currentPage
                      ? 'bg-[#11402D] text-white'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  {page}
                </button>
              ))}
              <button
                onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="rounded-xl border border-gray-200 p-2 text-gray-500 hover:bg-gray-50 disabled:opacity-50"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}

        {/* ─── View Modal ──────────────────────────────────────────── */}
        {showViewModal && selectedTicket && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
            <div className="w-full max-w-2xl rounded-3xl bg-white p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
              <div className="mb-5 flex items-start justify-between">
                <div>
                  <h2 className="font-display text-xl font-bold text-gray-900">Support Ticket</h2>
                  <p className="text-sm text-gray-500 font-mono-cw">ID #{selectedTicket.id}</p>
                </div>
                <button onClick={closeModals} className="rounded-xl p-2 hover:bg-gray-100">
                  <X className="h-5 w-5 text-gray-500" />
                </button>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs font-semibold uppercase text-gray-400">Subject</p>
                    <p className="mt-1 text-sm font-medium text-gray-900">{selectedTicket.subject}</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase text-gray-400">Status</p>
                    <div className="mt-1 flex items-center gap-2">
                      <span className={`inline-block rounded-full px-2.5 py-1 text-xs font-medium ${getStatusBadge(selectedTicket.status)}`}>
                        {selectedTicket.status || 'open'}
                      </span>
                      <select
                        value={selectedTicket.status}
                        onChange={(e) => handleUpdateStatus(selectedTicket.id, e.target.value)}
                        className="rounded-xl border border-gray-200 px-2 py-1 text-sm outline-none focus:ring-2 focus:ring-green-500"
                      >
                        <option value="open">Open</option>
                        <option value="in_progress">In Progress</option>
                        <option value="resolved">Resolved</option>
                        <option value="closed">Closed</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase text-gray-400">From</p>
                    <p className="mt-1 text-sm text-gray-700 flex items-center gap-1.5">
                      {selectedTicket.name}
                      {isGuestTicket(selectedTicket) && (
                        <span className="text-[10px] bg-gray-200 text-gray-600 px-1.5 py-0.5 rounded-full font-normal">
                          Guest
                        </span>
                      )}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase text-gray-400">Email</p>
                    <p className="mt-1 text-sm text-gray-700">{selectedTicket.email}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-xs font-semibold uppercase text-gray-400">Message</p>
                    <p className="mt-1 text-sm text-gray-700 whitespace-pre-wrap">{selectedTicket.message}</p>
                  </div>
                </div>

                {/* ─── Reply Form ──────────────────────────────────── */}
                <div className="border-t border-gray-100 pt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Admin Reply</label>
                  <form onSubmit={handleReply} className="flex flex-col gap-2">
                    <textarea
                      rows="3"
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      placeholder="Type your reply here..."
                      className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-green-500 resize-none"
                    />
                    <div className="flex items-center justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => setReplyText('')}
                        className="rounded-xl border border-gray-200 px-4 py-1.5 text-sm text-gray-700 hover:bg-gray-50"
                      >
                        Clear
                      </button>
                      <button
                        type="submit"
                        disabled={submitting || !replyText.trim()}
                        className="rounded-xl bg-[#11402D] px-4 py-1.5 text-sm font-bold text-white hover:bg-[#0E2A1C] disabled:opacity-70"
                      >
                        {submitting ? 'Sending...' : 'Send Reply'}
                      </button>
                    </div>
                  </form>
                </div>
              </div>

              <div className="mt-6 flex justify-end gap-3">
                <button
                  onClick={() => handleDelete(selectedTicket)}
                  className="rounded-xl bg-red-600 px-6 py-2.5 font-bold text-white hover:bg-red-700"
                >
                  Delete Ticket
                </button>
                <button onClick={closeModals} className="rounded-xl bg-[#11402D] px-6 py-2.5 font-bold text-white hover:bg-[#0E2A1C]">
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
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
          <p className="font-display text-2xl font-bold text-gray-900">{value}</p>
          <p className="text-sm text-gray-500">{label}</p>
        </div>
      </div>
    </div>
  );
}