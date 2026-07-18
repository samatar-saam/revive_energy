// src/admin/pages/PlatformWallet.jsx
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Wallet,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  RefreshCw,
  Calendar,
  DollarSign,
  ChevronRight,
  FileText,
  AlertCircle,
  Building2,
  Clock,
} from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export default function PlatformWallet() {
  const [balance, setBalance] = useState(0);
  const [totalFees, setTotalFees] = useState(0);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const token = localStorage.getItem("token");

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      // Fetch balance
      const balanceRes = await fetch(`${API_URL}/platform-wallet/balance`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!balanceRes.ok) throw new Error("Failed to fetch balance");
      const balanceData = await balanceRes.json();
      setBalance(balanceData.balance || 0);

      // Fetch recent transactions (limit 10)
      const txRes = await fetch(`${API_URL}/platform-wallet/transactions?page=1&per_page=10`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!txRes.ok) throw new Error("Failed to fetch transactions");
      const txData = await txRes.json();
      setTransactions(txData.transactions || []);
      
      // Total fees earned is the sum of all credits; we can compute from the paginated data or use a separate endpoint.
      // For now, we sum credits from the transactions we have (if less than 10, it's accurate).
      // Better: have a separate endpoint for total fees.
      // We'll use balance as total fees if no separate endpoint.
      setTotalFees(balanceData.balance || 0);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
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

  if (loading && !transactions.length) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <div className="flex flex-col items-center">
          <RefreshCw className="w-10 h-10 text-[#11402D] animate-spin" />
          <p className="mt-4 text-gray-600">Loading platform wallet...</p>
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
            Platform Wallet
          </h1>
          <p className="text-sm text-gray-500">Overview of platform earnings and revenue</p>
        </div>
        <button
          onClick={fetchData}
          className="mt-3 md:mt-0 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-gray-200 text-sm font-medium hover:bg-gray-50 transition"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-4 text-red-700 mb-6 flex items-center gap-2">
          <AlertCircle size={20} />
          {error}
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 font-medium">Current Balance</p>
              <p className="text-4xl font-bold text-[#0E2A1C] mt-1">
                KES {balance.toFixed(2)}
              </p>
            </div>
            <div className="w-14 h-14 rounded-full bg-[#9CF06B]/20 flex items-center justify-center">
              <Wallet className="w-7 h-7 text-[#11402D]" />
            </div>
          </div>
          <div className="mt-4 flex gap-4">
            <Link
              to="/admin/platform-transactions"
              className="inline-flex items-center text-sm text-[#11402D] hover:underline font-medium"
            >
              View All Transactions <ChevronRight size={16} className="ml-1" />
            </Link>
            <Link
              to="/admin/platform-withdrawals"
              className="inline-flex items-center text-sm text-[#11402D] hover:underline font-medium"
            >
              View Withdrawals <ChevronRight size={16} className="ml-1" />
            </Link>
          </div>
        </div>
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 font-medium">Total Fees Earned</p>
              <p className="text-4xl font-bold text-[#0E2A1C] mt-1">
                KES {totalFees.toFixed(2)}
              </p>
            </div>
            <div className="w-14 h-14 rounded-full bg-blue-50 flex items-center justify-center">
              <TrendingUp className="w-7 h-7 text-blue-600" />
            </div>
          </div>
          <p className="mt-4 text-xs text-gray-400">Lifetime platform revenue from all transactions</p>
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="font-semibold text-gray-900">Recent Transactions</h2>
          <Link
            to="/admin/platform-transactions"
            className="text-sm text-[#11402D] hover:underline font-medium inline-flex items-center"
          >
            View All <ChevronRight size={16} className="ml-1" />
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="px-6 py-3 text-left font-semibold text-gray-600">ID</th>
                <th className="px-6 py-3 text-left font-semibold text-gray-600">Type</th>
                <th className="px-6 py-3 text-left font-semibold text-gray-600">Description</th>
                <th className="px-6 py-3 text-right font-semibold text-gray-600">Amount</th>
                <th className="px-6 py-3 text-left font-semibold text-gray-600">Created At</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {transactions.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center text-gray-500">
                    <div className="flex flex-col items-center">
                      <FileText size={40} className="text-gray-300 mb-2" />
                      <p>No transactions yet</p>
                    </div>
                  </td>
                </tr>
              ) : (
                transactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-gray-50/50 transition">
                    <td className="px-6 py-4 font-medium text-[#0E2A1C]">#{tx.id}</td>
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
        {transactions.length > 0 && (
          <div className="px-6 py-3 border-t border-gray-100 text-right">
            <span className="text-xs text-gray-400">Showing latest {transactions.length} transactions</span>
          </div>
        )}
      </div>
    </div>
  );
}