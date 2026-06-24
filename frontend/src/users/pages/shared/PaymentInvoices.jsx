// src/users/pages/shared/PaymentsInvoices.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  DollarSign,
  CreditCard,
  FileText,
  TrendingUp,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Search,
  Filter,
  Download,
  Eye,
  ChevronDown,
  Calendar,
  ArrowUpRight
} from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export default function PaymentsInvoices() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('payments');
  const [searchQuery, setSearchQuery] = useState('');

  const [payments, setPayments] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [summary, setSummary] = useState({
    totalPayments: 0,
    pendingPayments: 0,
    totalInvoices: 0,
    totalRevenue: 0,
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        // const token = localStorage.getItem('token');
        // const paymentsRes = await fetch(`${API_URL}/payments`, {
        //   headers: { Authorization: `Bearer ${token}` }
        // });
        // const invoicesRes = await fetch(`${API_URL}/invoices`, {
        //   headers: { Authorization: `Bearer ${token}` }
        // });
        // const paymentsData = await paymentsRes.json();
        // const invoicesData = await invoicesRes.json();
        // setPayments(paymentsData);
        // setInvoices(invoicesData);
        // calculate summary...

        // Mock empty state
        setPayments([]);
        setInvoices([]);
        setSummary({
          totalPayments: 0,
          pendingPayments: 0,
          totalInvoices: 0,
          totalRevenue: 0,
        });
        setLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const formatCurrency = (amount) => `KSh ${(amount || 0).toLocaleString()}`;
  const formatDate = (date) => new Date(date).toLocaleDateString('en-KE', { day: '2-digit', month: 'short', year: 'numeric' });

  const getStatusBadge = (status) => {
    const map = {
      'completed': 'bg-green-100 text-green-700',
      'pending': 'bg-yellow-100 text-yellow-700',
      'failed': 'bg-red-100 text-red-700',
      'unpaid': 'bg-gray-100 text-gray-700',
      'paid': 'bg-green-100 text-green-700',
      'verified': 'bg-blue-100 text-blue-700',
    };
    return map[status?.toLowerCase()] || 'bg-gray-100 text-gray-700';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#11402D] border-t-[#9CF06B] rounded-full animate-spin mx-auto" />
          <p className="mt-4 text-gray-500">Loading data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 px-4">
      {/* Header */}
      <div>
        <h1 className="font-display text-2xl font-bold text-gray-900">Payments & Invoices</h1>
        <p className="text-sm text-gray-500 mt-1">Manage your financial transactions</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-3xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Payments</p>
              <p className="font-display text-2xl font-bold text-gray-900">{summary.totalPayments}</p>
            </div>
            <DollarSign className="w-8 h-8 text-emerald-600" />
          </div>
          <p className="text-xs text-emerald-600 mt-1">All time</p>
        </div>
        <div className="bg-white rounded-3xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Pending</p>
              <p className="font-display text-2xl font-bold text-yellow-600">{summary.pendingPayments}</p>
            </div>
            <Clock className="w-8 h-8 text-yellow-600" />
          </div>
          <p className="text-xs text-yellow-600 mt-1">Awaiting confirmation</p>
        </div>
        <div className="bg-white rounded-3xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Invoices</p>
              <p className="font-display text-2xl font-bold text-gray-900">{summary.totalInvoices}</p>
            </div>
            <FileText className="w-8 h-8 text-blue-600" />
          </div>
          <p className="text-xs text-blue-600 mt-1">Generated</p>
        </div>
        <div className="bg-white rounded-3xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Revenue</p>
              <p className="font-display text-2xl font-bold text-green-600">{formatCurrency(summary.totalRevenue)}</p>
            </div>
            <TrendingUp className="w-8 h-8 text-green-600" />
          </div>
          <p className="text-xs text-green-600 mt-1">Total earned</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200">
        <button
          onClick={() => setActiveTab('payments')}
          className={`px-4 py-2 text-sm font-medium transition ${
            activeTab === 'payments'
              ? 'border-b-2 border-[#11402D] text-[#11402D]'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Payments
        </button>
        <button
          onClick={() => setActiveTab('invoices')}
          className={`px-4 py-2 text-sm font-medium transition ${
            activeTab === 'invoices'
              ? 'border-b-2 border-[#11402D] text-[#11402D]'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Invoices
        </button>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          placeholder={`Search ${activeTab}...`}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 bg-white focus:ring-2 focus:ring-green-500 transition"
        />
      </div>

      {/* Payments Table */}
      {activeTab === 'payments' && (
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
          {payments.length === 0 ? (
            <div className="p-12 text-center">
              <CreditCard className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="font-display text-lg font-semibold text-gray-700">No payment records found</h3>
              <p className="text-gray-500 mt-2">Your payment history will appear here</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[700px]">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Date</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Amount</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Status</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Method</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Reference</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {payments.map((p) => (
                    <tr key={p.id} className="hover:bg-gray-50 transition">
                      <td className="px-4 py-3 text-sm">{formatDate(p.created_at)}</td>
                      <td className="px-4 py-3 font-medium">{formatCurrency(p.amount)}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${getStatusBadge(p.status)}`}>
                          {p.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm">{p.payment_method || 'M-Pesa'}</td>
                      <td className="px-4 py-3 text-sm font-mono">{p.reference || p.transaction_id || 'N/A'}</td>
                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={() => navigate(`/dashboard/payments/details/${p.id}`)}
                          className="text-gray-400 hover:text-[#11402D] transition"
                        >
                          <Eye className="w-5 h-5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Invoices Table */}
      {activeTab === 'invoices' && (
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
          {invoices.length === 0 ? (
            <div className="p-12 text-center">
              <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="font-display text-lg font-semibold text-gray-700">No invoices found</h3>
              <p className="text-gray-500 mt-2">Your invoices will appear here</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[700px]">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Invoice</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Customer</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Amount</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Status</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {invoices.map((inv) => (
                    <tr key={inv.id} className="hover:bg-gray-50 transition">
                      <td className="px-4 py-3 font-mono text-sm">{inv.invoice_number}</td>
                      <td className="px-4 py-3 text-sm">{inv.customer || 'N/A'}</td>
                      <td className="px-4 py-3 font-medium">{formatCurrency(inv.total_amount)}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${getStatusBadge(inv.status)}`}>
                          {inv.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button className="text-gray-400 hover:text-[#11402D] transition">
                          <Download className="w-5 h-5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}