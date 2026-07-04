// src/admin/pages/Wallet.jsx
import React, { useState, useEffect, useMemo } from 'react';
import {
  Wallet,
  Search,
  RefreshCw,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  X,
} from 'lucide-react';
import { toast } from 'react-toastify';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export default function AdminWallet() {
  const [loading, setLoading] = useState(true);
  const [wallets, setWallets] = useState([]);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showTransactions, setShowTransactions] = useState(false);
  const [transactions, setTransactions] = useState([]);
  const [txLoading, setTxLoading] = useState(false);

  const getToken = () => localStorage.getItem('token');

  const fetchWallets = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = getToken();
      if (!token) throw new Error('Not authenticated');
      const res = await fetch(`${API_URL}/admin/wallets`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      // data is { data: [...] }
      setWallets(data.data || []);
    } catch (err) {
      setError(err.message);
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWallets();
  }, []);

  const fetchTransactions = async (userId) => {
    setTxLoading(true);
    try {
      const token = getToken();
      const res = await fetch(`${API_URL}/admin/wallets/${userId}/transactions`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Failed to fetch transactions');
      const data = await res.json();
      // data can be array or { data: [...] }
      setTransactions(data.data || data || []);
      setShowTransactions(true);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setTxLoading(false);
    }
  };

  const filteredWallets = useMemo(() => {
    if (!searchQuery) return wallets;
    const q = searchQuery.toLowerCase();
    return wallets.filter(w =>
      w.user_name?.toLowerCase().includes(q) ||
      w.business_name?.toLowerCase().includes(q) ||
      w.email?.toLowerCase().includes(q)
    );
  }, [wallets, searchQuery]);

  const totalPages = Math.ceil(filteredWallets.length / pageSize);
  const paginated = filteredWallets.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const formatCurrency = (amount) =>
    new Intl.NumberFormat('en-KE', { style: 'currency', currency: 'KES' }).format(amount || 0);

  const formatDate = (date) =>
    date ? new Date(date).toLocaleDateString('en-KE', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'N/A';

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorState message={error} onRetry={fetchWallets} />;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Wallet Management</h2>
          <p className="text-sm text-gray-500">View and manage supplier & transporter wallets</p>
        </div>
        <button
          onClick={fetchWallets}
          className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition shadow-sm"
        >
          <RefreshCw className="h-4 w-4" /> Refresh
        </button>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <input
          type="text"
          placeholder="Search by name, business, email..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full rounded-xl border border-gray-200 bg-white py-2 pl-9 pr-4 text-sm outline-none focus:ring-2 focus:ring-green-500"
        />
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-2xl border border-gray-100 bg-white shadow-sm">
        <table className="w-full min-w-[700px]">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500">User</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500">Business</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500">Role</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500">Balance</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {paginated.length === 0 ? (
              <tr><td colSpan="5" className="px-4 py-8 text-center text-gray-500">No wallets found</td></tr>
            ) : (
              paginated.map(w => (
                <tr key={w.user_id} className="hover:bg-gray-50/50 transition">
                  <td className="px-4 py-3 text-sm text-gray-700">{w.user_name}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{w.business_name || '—'}</td>
                  <td className="px-4 py-3 text-sm text-gray-600 capitalize">{w.role}</td>
                  <td className="px-4 py-3 font-medium text-gray-900">{formatCurrency(w.balance)}</td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => { setSelectedUser(w); fetchTransactions(w.user_id); }}
                      className="text-sm text-[#11402D] hover:underline font-medium"
                    >
                      View Transactions
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-500">Page {currentPage} of {totalPages}</span>
          <div className="flex gap-1">
            <button
              onClick={() => setCurrentPage(p => Math.max(p-1, 1))}
              disabled={currentPage === 1}
              className="rounded-xl border border-gray-200 p-2 text-gray-500 hover:bg-gray-50 disabled:opacity-50"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              onClick={() => setCurrentPage(p => Math.min(p+1, totalPages))}
              disabled={currentPage === totalPages}
              className="rounded-xl border border-gray-200 p-2 text-gray-500 hover:bg-gray-50 disabled:opacity-50"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* Transactions Modal */}
      {showTransactions && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-2xl p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-900">
                Transactions – {selectedUser.user_name}
                {txLoading && <span className="ml-2 text-sm text-gray-400">(loading...)</span>}
              </h3>
              <button onClick={() => setShowTransactions(false)} className="p-2 hover:bg-gray-100 rounded-xl">
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </div>
            {txLoading ? (
              <div className="flex justify-center py-8">
                <div className="w-8 h-8 border-4 border-[#11402D] border-t-[#9CF06B] rounded-full animate-spin" />
              </div>
            ) : transactions.length === 0 ? (
              <p className="text-center text-gray-500 py-8">No transactions found.</p>
            ) : (
              <div className="divide-y divide-gray-100">
                {transactions.map(t => (
                  <div key={t.id} className="py-3 flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{t.type}</p>
                      <p className="text-xs text-gray-500">{formatDate(t.created_at)}</p>
                    </div>
                    <div className="text-right">
                      <p className={`text-sm font-semibold ${t.amount >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {formatCurrency(t.amount)}
                      </p>
                      <p className="text-xs text-gray-400 capitalize">{t.status}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Loading Spinner ──────────────────────────────────────────────
function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-[#11402D] border-t-[#9CF06B] rounded-full animate-spin mx-auto" />
        <p className="mt-4 text-gray-500">Loading wallets...</p>
      </div>
    </div>
  );
}

// ─── Error State ──────────────────────────────────────────────────
function ErrorState({ message, onRetry }) {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="text-center max-w-md">
        <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
        <h3 className="text-xl font-bold text-gray-900">Unable to load wallets</h3>
        <p className="text-gray-500 mt-2">{message}</p>
        <button
          onClick={onRetry}
          className="mt-4 px-6 py-2 bg-[#11402D] text-white rounded-xl hover:bg-[#0E2A1C] transition"
        >
          Try Again
        </button>
      </div>
    </div>
  );
}