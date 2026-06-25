// src/users/pages/shared/PaymentsInvoices.jsx
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  CreditCard,
  FileText,
  TrendingUp,
  Clock,
  Eye,
  Search,
  RefreshCw,
  ShieldCheck,
  AlertCircle,
} from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export default function PaymentsInvoices() {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [payments, setPayments] = useState([]);

  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const role = user.role || "supplier";

  const roleTitle =
    role === "producer"
      ? "Payments Made"
      : role === "transporter"
      ? "Transport Earnings"
      : "Expected / Received Payments";

  const fetchPayments = async () => {
    setLoading(true);
    setError("");

    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("Not authenticated");

      const res = await fetch(`${API_URL}/payments/my-payments`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(data.message || `Failed to load payments (${res.status})`);
      }

      setPayments(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message);
      setPayments([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, []);

  const filteredPayments = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return payments;

    return payments.filter((p) =>
      [
        p.id,
        p.payment_status,
        p.status,
        p.escrow_status,
        p.payment_method,
        p.mpesa_receipt,
        p.receipt_number,
        p.transaction_id,
        p.checkout_request_id,
      ]
        .join(" ")
        .toLowerCase()
        .includes(q)
    );
  }, [payments, searchQuery]);

  const roleAmount = (payment) => {
    if (role === "supplier") {
      return (
        payment.supplier_amount ||
        payment.waste_amount ||
        payment.amount ||
        payment.total_amount ||
        0
      );
    }

    if (role === "transporter") {
      return payment.transporter_amount || payment.transport_fee || 0;
    }

    return payment.total_amount || payment.amount || 0;
  };

  const summary = useMemo(() => {
    const totalAmount = payments.reduce(
      (sum, p) => sum + Number(roleAmount(p) || 0),
      0
    );

    const pending = payments.filter(
      (p) => p.payment_status === "pending" || p.status === "pending"
    ).length;

    const completed = payments.filter(
      (p) =>
        p.payment_status === "paid" ||
        p.payment_status === "completed" ||
        p.status === "paid" ||
        p.status === "completed"
    ).length;

    const escrowHeld = payments.filter((p) => p.escrow_status === "held").length;

    return {
      totalPayments: payments.length,
      pendingPayments: pending,
      completedPayments: completed,
      escrowHeld,
      totalAmount,
    };
  }, [payments, role]);

  const formatCurrency = (amount) =>
    `KSh ${Number(amount || 0).toLocaleString("en-KE")}`;

  const formatDate = (date) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleDateString("en-KE", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const pretty = (value) => {
    if (!value) return "pending";
    return String(value).replaceAll("_", " ");
  };

  const getStatusBadge = (status) => {
    const value = String(status || "").toLowerCase();

    const map = {
      paid: "bg-green-100 text-green-700",
      completed: "bg-green-100 text-green-700",
      pending: "bg-yellow-100 text-yellow-700",
      processing: "bg-blue-100 text-blue-700",
      failed: "bg-red-100 text-red-700",
      refunded: "bg-gray-100 text-gray-700",
      held: "bg-purple-100 text-purple-700",
      waiting: "bg-yellow-100 text-yellow-700",
      released: "bg-green-100 text-green-700",
    };

    return map[value] || "bg-gray-100 text-gray-700";
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-[#11402D] border-t-[#9CF06B]" />
          <p className="mt-4 text-gray-500">Loading payments...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 px-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Payments & Receipts</h1>
          <p className="mt-1 text-sm text-gray-500">{roleTitle}</p>
        </div>

        <button
          onClick={fetchPayments}
          className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-medium hover:bg-gray-50"
        >
          <RefreshCw className="h-4 w-4" />
          Refresh
        </button>
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          <AlertCircle className="h-5 w-5" />
          {error}
        </div>
      )}

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <SummaryCard title="Total Records" value={summary.totalPayments} icon={CreditCard} />
        <SummaryCard title="Pending" value={summary.pendingPayments} icon={Clock} color="text-yellow-600" />
        <SummaryCard title="Completed" value={summary.completedPayments} icon={ShieldCheck} color="text-green-600" />
        <SummaryCard
          title={role === "producer" ? "Total Paid" : "Total Value"}
          value={formatCurrency(summary.totalAmount)}
          icon={TrendingUp}
          color="text-emerald-600"
        />
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="Search payments..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full rounded-xl border border-gray-200 bg-white py-3 pl-10 pr-4 outline-none focus:ring-2 focus:ring-green-500"
        />
      </div>

      <div className="overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-sm">
        {filteredPayments.length === 0 ? (
          <div className="p-12 text-center">
            <FileText className="mx-auto mb-4 h-16 w-16 text-gray-300" />
            <h3 className="text-lg font-semibold text-gray-700">
              No payment records found
            </h3>
            <p className="mt-2 text-gray-500">
              Your payment history will appear here.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px]">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500">Date</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500">Amount</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500">Payment Status</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500">Escrow</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500">Method</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500">Receipt</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold uppercase text-gray-500">Action</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100">
                {filteredPayments.map((payment) => (
                  <tr key={payment.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm">{formatDate(payment.created_at)}</td>

                    <td className="px-4 py-3 font-semibold">
                      {formatCurrency(roleAmount(payment))}
                    </td>

                    <td className="px-4 py-3">
                      <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${getStatusBadge(payment.payment_status || payment.status)}`}>
                        {pretty(payment.payment_status || payment.status)}
                      </span>
                    </td>

                    <td className="px-4 py-3">
                      <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${getStatusBadge(payment.escrow_status)}`}>
                        {pretty(payment.escrow_status || "waiting")}
                      </span>
                    </td>

                    <td className="px-4 py-3 text-sm">
                      {payment.payment_method || "M-Pesa"}
                    </td>

                    <td className="px-4 py-3 font-mono text-sm">
                      {payment.mpesa_receipt ||
                        payment.receipt_number ||
                        payment.transaction_id ||
                        payment.checkout_request_id ||
                        "N/A"}
                    </td>

                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => navigate(`/dashboard/payments/details/${payment.id}`)}
                        className="text-gray-400 hover:text-[#11402D]"
                        title="View details"
                      >
                        <Eye className="h-5 w-5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

function SummaryCard({ title, value, icon: Icon, color = "text-[#11402D]" }) {
  return (
    <div className="rounded-3xl border border-gray-100 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm text-gray-500">{title}</p>
          <p className={`mt-1 text-2xl font-bold ${color}`}>{value}</p>
        </div>
        <Icon className={`h-8 w-8 ${color}`} />
      </div>
    </div>
  );
}