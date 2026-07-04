// src/users/pages/shared/Wallet.jsx
import React, { useState, useEffect } from 'react';
import {
  Wallet as WalletIcon,
  RefreshCw,
  AlertCircle,
  ArrowUpRight,
  ArrowDownRight,
  Download,
  FileText,
} from 'lucide-react';
import { toast } from 'react-toastify';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export default function Wallet() {
  const [loading, setLoading] = useState(true);
  const [wallet, setWallet] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [payments, setPayments] = useState([]);
  const [error, setError] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [withdrawModal, setWithdrawModal] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [withdrawMethod, setWithdrawMethod] = useState('mpesa');
  const [accountDetails, setAccountDetails] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const getToken = () => localStorage.getItem('token');

  // ─── Get user role ─────────────────────────────────────────────
  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      try {
        const user = JSON.parse(userData);
        const rawRole = user.role || user.user_role || 'supplier';
        const roleMap = {
          'waste-supplier': 'supplier',
          'energy-producer': 'producer',
          'transport-partner': 'transporter',
          supplier: 'supplier',
          producer: 'producer',
          transporter: 'transporter',
        };
        setUserRole(roleMap[rawRole] || 'supplier');
      } catch (e) {
        console.error('Error parsing user role:', e);
      }
    }
  }, []);

  // ─── Fetch wallet ─────────────────────────────────────────────
  const fetchWallet = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = getToken();
      if (!token) {
        setError('Not authenticated');
        setLoading(false);
        return;
      }
      const res = await fetch(`${API_URL}/wallet`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        if (res.status === 404) {
          setWallet({ balance: 0 });
          setLoading(false);
          return;
        }
        throw new Error(`HTTP ${res.status}`);
      }
      const data = await res.json();
      setWallet(data);
    } catch (err) {
      setError(err.message);
      toast.error('Failed to load wallet');
    } finally {
      setLoading(false);
    }
  };

  // ─── Fetch transactions (SAFE) ─────────────────────────────────
  const fetchTransactions = async () => {
    try {
      const token = getToken();
      if (!token) return;
      const res = await fetch(`${API_URL}/wallet/transactions`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Failed to fetch transactions');
      const data = await res.json();
      console.log('📦 Transactions response:', data); // Debug

      // ✅ Always ensure we set an array
      let txs = [];
      if (data && typeof data === 'object') {
        if (Array.isArray(data.data)) {
          txs = data.data;
        } else if (Array.isArray(data)) {
          txs = data;
        }
      }
      setTransactions(txs);
    } catch (err) {
      console.error('❌ Transactions error:', err);
      setTransactions([]);
      toast.error('Failed to load transactions');
    }
  };

  // ─── Fetch payments (for producers) ──────────────────────────
  const fetchPayments = async () => {
    try {
      const token = getToken();
      if (!token) return;
      const res = await fetch(`${API_URL}/payments`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Failed to fetch payments');
      const data = await res.json();
      setPayments(data || []);
    } catch (err) {
      toast.error('Failed to load payment history');
    }
  };

  // ─── Initial data load ──────────────────────────────────────
  useEffect(() => {
    if (userRole === 'producer') {
      fetchPayments();
      setLoading(false);
    } else if (userRole === 'supplier' || userRole === 'transporter') {
      fetchWallet();
      fetchTransactions();
      setLoading(false);
    }
  }, [userRole]);

  if (userRole === null) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#11402D] border-t-[#9CF06B] rounded-full animate-spin mx-auto" />
          <p className="mt-4 text-gray-500">Loading...</p>
        </div>
      </div>
    );
  }

  // ─── Withdrawal handler ─────────────────────────────────────
  const handleWithdraw = async (e) => {
    e.preventDefault();
    const amount = parseFloat(withdrawAmount);
    if (!amount || amount <= 0) {
      toast.error('Enter a valid amount');
      return;
    }
    if (!wallet || amount > wallet.balance) {
      toast.error('Insufficient balance');
      return;
    }
    if (!accountDetails.trim()) {
      toast.error('Please provide account details');
      return;
    }

    setSubmitting(true);
    try {
      const token = getToken();
      const res = await fetch(`${API_URL}/wallet/withdraw`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          amount,
          payment_method: withdrawMethod,
          account_details: accountDetails.trim(),
        }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || 'Withdrawal request failed');
      }
      toast.success('Withdrawal request submitted successfully');
      setWithdrawModal(false);
      setWithdrawAmount('');
      setAccountDetails('');
      fetchWallet();
      fetchTransactions();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  // ─── Helpers ─────────────────────────────────────────────────
  const formatCurrency = (amount) =>
    new Intl.NumberFormat('en-KE', { style: 'currency', currency: 'KES' }).format(amount || 0);

  const formatDate = (date) =>
    date ? new Date(date).toLocaleDateString('en-KE', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'N/A';

  const getStatusBadge = (status) => {
    const map = {
      pending: 'bg-yellow-50 text-yellow-700 border-yellow-200',
      completed: 'bg-green-50 text-green-700 border-green-200',
      paid: 'bg-green-50 text-green-700 border-green-200',
      failed: 'bg-red-50 text-red-700 border-red-200',
      refunded: 'bg-gray-50 text-gray-700 border-gray-200',
    };
    return map[status] || 'bg-gray-50 text-gray-700 border-gray-200';
  };

  const downloadReceipt = (paymentId) => {
    toast.info('Receipt download feature coming soon');
  };

  const downloadInvoice = (paymentId) => {
    toast.info('Invoice download feature coming soon');
  };

  // ─── Loading / Error states ─────────────────────────────────
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#11402D] border-t-[#9CF06B] rounded-full animate-spin mx-auto" />
          <p className="mt-4 text-gray-500">Loading...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center max-w-md">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-gray-900">Unable to load</h3>
          <p className="text-gray-500 mt-2">{error}</p>
          <button
            onClick={() => {
              if (userRole !== 'producer') {
                fetchWallet();
                fetchTransactions();
              } else {
                fetchPayments();
              }
            }}
            className="mt-4 px-6 py-2 bg-[#11402D] text-white rounded-xl hover:bg-[#0E2A1C] transition"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // ─── Producer view: payment history only ──────────────────────
  if (userRole === 'producer') {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Payment History</h2>
          <p className="text-sm text-gray-500">View all payments you have made as a producer</p>
        </div>

        {payments.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-12 text-center">
            <WalletIcon className="mx-auto h-16 w-16 text-gray-300" />
            <p className="text-gray-500 mt-2">No payment history found.</p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[800px]">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500">ID</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500">Supplier</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500">Amount</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500">Status</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500">Date</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {payments.map((p) => (
                    <tr key={p.id} className="hover:bg-gray-50/50 transition">
                      <td className="px-4 py-3 font-mono text-sm text-gray-500">#{p.id}</td>
                      <td className="px-4 py-3 text-sm text-gray-700">{p.supplier_name || 'N/A'}</td>
                      <td className="px-4 py-3 font-medium text-gray-900">{formatCurrency(p.amount)}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium border ${getStatusBadge(p.status)}`}>
                          {p.status || 'pending'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-500">{formatDate(p.created_at)}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => downloadReceipt(p.id)}
                            className="rounded-lg p-1.5 text-gray-400 transition hover:bg-gray-100 hover:text-blue-600"
                            title="Download Receipt"
                          >
                            <Download className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => downloadInvoice(p.id)}
                            className="rounded-lg p-1.5 text-gray-400 transition hover:bg-gray-100 hover:text-purple-600"
                            title="Download Invoice"
                          >
                            <FileText className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    );
  }

  // ─── Supplier / Transporter view: wallet with balance ────────
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">My Wallet</h2>
          <p className="text-sm text-gray-500">View your balance and transaction history</p>
        </div>
        <button
          onClick={() => {
            fetchWallet();
            fetchTransactions();
          }}
          className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition shadow-sm"
        >
          <RefreshCw className="h-4 w-4" /> Refresh
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500">Available Balance</p>
            <p className="text-4xl font-bold text-[#11402D]">{formatCurrency(wallet?.balance || 0)}</p>
          </div>
          <button
            onClick={() => setWithdrawModal(true)}
            disabled={!wallet || wallet.balance <= 0}
            className="rounded-xl bg-[#11402D] px-6 py-2.5 text-white font-bold hover:bg-[#0E2A1C] transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Request Withdrawal
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <h3 className="font-semibold text-gray-700 mb-4">Transaction History</h3>
        {!Array.isArray(transactions) || transactions.length === 0 ? (
          <p className="text-sm text-gray-500 text-center py-8">No transactions yet.</p>
        ) : (
          <div className="divide-y divide-gray-100">
            {transactions.map((tx) => (
              <div key={tx.id} className="py-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-full ${tx.amount >= 0 ? 'bg-green-100' : 'bg-red-100'}`}>
                    {tx.amount >= 0 ? (
                      <ArrowDownRight className="h-4 w-4 text-green-600" />
                    ) : (
                      <ArrowUpRight className="h-4 w-4 text-red-600" />
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{tx.description || tx.type}</p>
                    <p className="text-xs text-gray-400">{formatDate(tx.created_at)}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`text-sm font-semibold ${tx.amount >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {formatCurrency(tx.amount)}
                  </p>
                  <p className="text-xs text-gray-400 capitalize">{tx.status}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ─── Withdrawal Modal ────────────────────────────────────── */}
      {withdrawModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full mx-4 shadow-2xl">
            <h3 className="text-lg font-bold text-gray-900">Request Withdrawal</h3>
            <p className="text-sm text-gray-500 mt-1">Available balance: {formatCurrency(wallet?.balance || 0)}</p>
            <form onSubmit={handleWithdraw} className="mt-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Amount (KES)</label>
                <input
                  type="number"
                  value={withdrawAmount}
                  onChange={(e) => setWithdrawAmount(e.target.value)}
                  placeholder="e.g. 5000"
                  min="1"
                  step="1"
                  className="mt-1 w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-green-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Payment Method</label>
                <select
                  value={withdrawMethod}
                  onChange={(e) => setWithdrawMethod(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option value="mpesa">M-Pesa</option>
                  <option value="bank">Bank Transfer</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Account Details</label>
                <input
                  type="text"
                  value={accountDetails}
                  onChange={(e) => setAccountDetails(e.target.value)}
                  placeholder={withdrawMethod === 'mpesa' ? 'M-Pesa phone number' : 'Bank account details'}
                  className="mt-1 w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-green-500"
                  required
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setWithdrawModal(false)}
                  className="flex-1 rounded-xl border border-gray-200 py-2.5 font-medium text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 rounded-xl bg-[#11402D] py-2.5 font-bold text-white hover:bg-[#0E2A1C] disabled:opacity-70"
                >
                  {submitting ? 'Submitting...' : 'Submit Request'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}