// src/admin/pages/PlatformWithdrawals.jsx
import React, { useState, useEffect } from "react";
import {
  Wallet,
  Plus,
  RefreshCw,
  Filter,
  Search,
  DollarSign,
  FileText,
  AlertCircle,
  XCircle,
  CheckCircle,
  Clock,
  Calendar,
  Building2,
  User,
} from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export default function PlatformWithdrawals() {
  const [withdrawals, setWithdrawals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    amount: "",
    bank_name: "",
    account_number: "",
    account_name: "",
  });
  const [pagination, setPagination] = useState({
    page: 1,
    per_page: 20,
    total: 0,
    pages: 0,
  });

  const token = localStorage.getItem("token");

  const fetchWithdrawals = async (page = 1) => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        page: page,
        per_page: 20,
      });
      const res = await fetch(`${API_URL}/platform-wallet/withdrawals?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to fetch withdrawals");
      const data = await res.json();
      setWithdrawals(data.withdrawals || []);
      setPagination(data.pagination || { page: 1, per_page: 20, total: 0, pages: 0 });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const createWithdrawal = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch(`${API_URL}/platform-wallet/withdrawals`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });
      if (!res.ok) throw new Error("Failed to create withdrawal request");
      await fetchWithdrawals();
      setModalOpen(false);
      setFormData({ amount: "", bank_name: "", account_number: "", account_name: "" });
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  useEffect(() => {
    fetchWithdrawals();
  }, []);

  const formatDate = (dateStr) => {
    if (!dateStr) return "—";
    return new Date(dateStr).toLocaleString("en-KE", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusBadge = (status) => {
    const styles = {
      pending: "bg-yellow-100 text-yellow-800",
      approved: "bg-blue-100 text-blue-800",
      completed: "bg-green-100 text-green-800",
      failed: "bg-red-100 text-red-800",
      cancelled: "bg-gray-100 text-gray-800",
    };
    const icons = {
      pending: <Clock size={12} className="mr-1" />,
      approved: <CheckCircle size={12} className="mr-1" />,
      completed: <CheckCircle size={12} className="mr-1" />,
      failed: <XCircle size={12} className="mr-1" />,
      cancelled: <XCircle size={12} className="mr-1" />,
    };
    return (
      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${styles[status] || styles.pending}`}>
        {icons[status]}
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  if (loading && withdrawals.length === 0) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <div className="flex flex-col items-center">
          <RefreshCw className="w-10 h-10 text-[#11402D] animate-spin" />
          <p className="mt-4 text-gray-600">Loading withdrawals...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <div>
          <h1 className="font-display text-2xl font-bold text-[#0E2A1C] flex items-center gap-2">
            <Wallet className="w-6 h-6 text-[#11402D]" />
            Platform Withdrawals
          </h1>
          <p className="text-sm text-gray-500">Manage payouts from the platform wallet</p>
        </div>
        <div className="flex gap-2 mt-3 md:mt-0">
          <button
            onClick={() => fetchWithdrawals(pagination.page)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-gray-200 text-sm font-medium hover:bg-gray-50 transition"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
          <button
            onClick={() => setModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#11402D] text-white text-sm font-medium hover:bg-[#0E2A1C] transition"
          >
            <Plus className="w-4 h-4" />
            Request Withdrawal
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-4 text-red-700 mb-6 flex items-center gap-2">
          <AlertCircle size={20} />
          {error}
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="px-6 py-3 text-left font-semibold text-gray-600">ID</th>
                <th className="px-6 py-3 text-left font-semibold text-gray-600">Amount</th>
                <th className="px-6 py-3 text-left font-semibold text-gray-600">Bank Details</th>
                <th className="px-6 py-3 text-left font-semibold text-gray-600">Status</th>
                <th className="px-6 py-3 text-left font-semibold text-gray-600">Created At</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {withdrawals.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center text-gray-500">
                    <div className="flex flex-col items-center">
                      <FileText size={40} className="text-gray-300 mb-2" />
                      <p>No withdrawal requests found</p>
                    </div>
                  </td>
                </tr>
              ) : (
                withdrawals.map((w) => (
                  <tr key={w.id} className="hover:bg-gray-50/50 transition">
                    <td className="px-6 py-4 font-medium text-[#0E2A1C]">#{w.id}</td>
                    <td className="px-6 py-4 font-medium">KES {w.amount?.toFixed(2)}</td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="text-gray-800 font-medium">{w.account_name}</span>
                        <span className="text-gray-500 text-xs">{w.bank_name} - {w.account_number}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">{getStatusBadge(w.status)}</td>
                    <td className="px-6 py-4 text-gray-500 text-xs">
                      {formatDate(w.created_at)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        {/* Pagination */}
        {pagination.pages > 1 && (
          <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between">
            <div className="text-sm text-gray-500">
              Page {pagination.page} of {pagination.pages}
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => fetchWithdrawals(pagination.page - 1)}
                disabled={pagination.page <= 1}
                className="px-3 py-1 rounded-lg border border-gray-200 text-sm disabled:opacity-50 hover:bg-gray-50"
              >
                Previous
              </button>
              <button
                onClick={() => fetchWithdrawals(pagination.page + 1)}
                disabled={pagination.page >= pagination.pages}
                className="px-3 py-1 rounded-lg border border-gray-200 text-sm disabled:opacity-50 hover:bg-gray-50"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Create Withdrawal Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto p-6 animate-fadeIn">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Request Withdrawal</h2>
              <button onClick={() => setModalOpen(false)} className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
                <XCircle size={24} />
              </button>
            </div>
            <form onSubmit={createWithdrawal}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Amount (KES)</label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                    <input
                      type="number"
                      required
                      min="1"
                      step="0.01"
                      className="mt-1 w-full pl-10 px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-[#9CF06B] dark:bg-gray-800 dark:text-white"
                      value={formData.amount}
                      onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                      placeholder="Enter amount"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Bank Name</label>
                  <input
                    type="text"
                    required
                    className="mt-1 w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-[#9CF06B] dark:bg-gray-800 dark:text-white"
                    value={formData.bank_name}
                    onChange={(e) => setFormData({ ...formData, bank_name: e.target.value })}
                    placeholder="e.g., Equity Bank"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Account Number</label>
                  <input
                    type="text"
                    required
                    className="mt-1 w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-[#9CF06B] dark:bg-gray-800 dark:text-white"
                    value={formData.account_number}
                    onChange={(e) => setFormData({ ...formData, account_number: e.target.value })}
                    placeholder="Enter account number"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Account Holder Name</label>
                  <input
                    type="text"
                    required
                    className="mt-1 w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-[#9CF06B] dark:bg-gray-800 dark:text-white"
                    value={formData.account_name}
                    onChange={(e) => setFormData({ ...formData, account_name: e.target.value })}
                    placeholder="Enter account holder name"
                  />
                </div>
              </div>
              <div className="mt-6 flex justify-end space-x-3">
                <button type="button" onClick={() => setModalOpen(false)} className="px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800">
                  Cancel
                </button>
                <button type="submit" disabled={submitting} className="px-4 py-2 bg-[#11402D] text-white rounded-lg hover:bg-[#0E2A1C] disabled:opacity-50 flex items-center">
                  {submitting ? <RefreshCw className="animate-spin mr-2" size={18} /> : <Plus size={18} className="mr-2" />}
                  Submit Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}