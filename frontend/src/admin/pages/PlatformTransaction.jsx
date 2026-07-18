// src/admin/pages/PlatformTransaction.jsx
import React, { useState, useEffect } from "react";
import {
  Wallet,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  RefreshCw,
  Filter,
  Search,
  Calendar,
  DollarSign,
  FileText,
  AlertCircle,
} from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export default function PlatformTransaction() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    balance: 0,
    totalFeesEarned: 0,
  });
  const [filters, setFilters] = useState({
    type: "",
    date_from: "",
    date_to: "",
  });
  const [pagination, setPagination] = useState({
    page: 1,
    per_page: 20,
    total: 0,
    pages: 0,
  });

  const token = localStorage.getItem("token");

  const fetchData = async (page = 1) => {
    setLoading(true);
    setError(null);
    try {
      // Fetch balance
      const balanceRes = await fetch(`${API_URL}/platform-wallet/balance`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!balanceRes.ok) throw new Error("Failed to fetch balance");
      const balanceData = await balanceRes.json();
      setStats({
        balance: balanceData.balance || 0,
        totalFeesEarned: balanceData.balance || 0, // Could be separate endpoint
      });

      // Fetch transactions
      const params = new URLSearchParams({
        page: page,
        per_page: 20,
        ...(filters.type && { type: filters.type }),
        ...(filters.date_from && { date_from: filters.date_from }),
        ...(filters.date_to && { date_to: filters.date_to }),
      });
      const txRes = await fetch(`${API_URL}/platform-wallet/transactions?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!txRes.ok) throw new Error("Failed to fetch transactions");
      const txData = await txRes.json();
      setTransactions(txData.transactions || []);
      setPagination(txData.pagination || { page: 1, per_page: 20, total: 0, pages: 0 });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [filters]);

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

  const getTypeBadge = (type) => {
    if (type === "credit") {
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
          <ArrowUpRight size={12} className="mr-1" />
          Credit
        </span>
      );
    }
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
        <ArrowDownRight size={12} className="mr-1" />
        Debit
      </span>
    );
  };

  if (loading && transactions.length === 0) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <div className="flex flex-col items-center">
          <RefreshCw className="w-10 h-10 text-[#11402D] animate-spin" />
          <p className="mt-4 text-gray-600">Loading transactions...</p>
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
            Platform Transactions
          </h1>
          <p className="text-sm text-gray-500">Track all platform revenue and fees</p>
        </div>
        <button
          onClick={() => fetchData(pagination.page)}
          className="mt-3 md:mt-0 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-gray-200 text-sm font-medium hover:bg-gray-50 transition"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 font-medium">Current Balance</p>
              <p className="text-3xl font-bold text-[#0E2A1C] mt-1">
                KES {stats.balance.toFixed(2)}
              </p>
            </div>
            <div className="w-12 h-12 rounded-full bg-[#9CF06B]/20 flex items-center justify-center">
              <Wallet className="w-6 h-6 text-[#11402D]" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 font-medium">Total Fees Earned</p>
              <p className="text-3xl font-bold text-[#0E2A1C] mt-1">
                KES {stats.totalFeesEarned.toFixed(2)}
              </p>
            </div>
            <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 mb-6 flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
          <Filter className="w-4 h-4" />
          <span>Filter:</span>
        </div>
        <select
          value={filters.type}
          onChange={(e) => setFilters({ ...filters, type: e.target.value })}
          className="rounded-lg border border-gray-200 px-3 py-1.5 text-sm outline-none focus:ring-2 focus:ring-green-500 bg-white"
        >
          <option value="">All Types</option>
          <option value="credit">Credit</option>
          <option value="debit">Debit</option>
        </select>
        <input
          type="date"
          value={filters.date_from}
          onChange={(e) => setFilters({ ...filters, date_from: e.target.value })}
          className="rounded-lg border border-gray-200 px-3 py-1.5 text-sm outline-none focus:ring-2 focus:ring-green-500 bg-white"
          placeholder="From"
        />
        <input
          type="date"
          value={filters.date_to}
          onChange={(e) => setFilters({ ...filters, date_to: e.target.value })}
          className="rounded-lg border border-gray-200 px-3 py-1.5 text-sm outline-none focus:ring-2 focus:ring-green-500 bg-white"
          placeholder="To"
        />
        <div className="ml-auto text-sm text-gray-500">
          {pagination.total} transaction{pagination.total !== 1 && "s"}
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
                <th className="px-6 py-3 text-left font-semibold text-gray-600">Payment ID</th>
                <th className="px-6 py-3 text-left font-semibold text-gray-600">Type</th>
                <th className="px-6 py-3 text-left font-semibold text-gray-600">Description</th>
                <th className="px-6 py-3 text-right font-semibold text-gray-600">Amount</th>
                <th className="px-6 py-3 text-left font-semibold text-gray-600">Created At</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {transactions.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center text-gray-500">
                    <div className="flex flex-col items-center">
                      <FileText size={40} className="text-gray-300 mb-2" />
                      <p>No transactions found</p>
                    </div>
                  </td>
                </tr>
              ) : (
                transactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-gray-50/50 transition">
                    <td className="px-6 py-4 font-medium text-[#0E2A1C]">#{tx.id}</td>
                    <td className="px-6 py-4 text-gray-600">{tx.payment_id || "—"}</td>
                    <td className="px-6 py-4">{getTypeBadge(tx.type)}</td>
                    <td className="px-6 py-4 text-gray-600 max-w-xs truncate">
                      {tx.description || "—"}
                    </td>
                    <td className={`px-6 py-4 text-right font-medium ${
                      tx.type === "credit" ? "text-green-600" : "text-red-600"
                    }`}>
                      {tx.type === "credit" ? "+" : "-"} KES {tx.amount?.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 text-gray-500 text-xs">
                      {formatDate(tx.created_at)}
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
                onClick={() => fetchData(pagination.page - 1)}
                disabled={pagination.page <= 1}
                className="px-3 py-1 rounded-lg border border-gray-200 text-sm disabled:opacity-50 hover:bg-gray-50"
              >
                Previous
              </button>
              <button
                onClick={() => fetchData(pagination.page + 1)}
                disabled={pagination.page >= pagination.pages}
                className="px-3 py-1 rounded-lg border border-gray-200 text-sm disabled:opacity-50 hover:bg-gray-50"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}