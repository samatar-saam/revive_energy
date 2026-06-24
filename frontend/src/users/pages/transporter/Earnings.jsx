import { useEffect, useState } from "react";
import {
  DollarSign,
  CreditCard,
  FileText,
  CheckCircle,
  Clock,
  RefreshCw,
  AlertCircle,
  Truck,
} from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export default function Earnings() {
  const [earnings, setEarnings] = useState({
    total_earnings: 0,
    pending_earnings: 0,
    released_earnings: 0,
    completed_jobs_count: 0,
    payments: [],
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchEarnings = async () => {
    setLoading(true);
    setError("");

    try {
      const token = localStorage.getItem("token");

      const res = await fetch(`${API_URL}/transporter/earnings`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) throw new Error("Failed to load earnings");

      const data = await res.json();

      setEarnings({
        total_earnings: data.total_earnings || 0,
        pending_earnings: data.pending_earnings || 0,
        released_earnings: data.released_earnings || 0,
        completed_jobs_count: data.completed_jobs_count || 0,
        payments: data.payments || [],
      });
    } catch (err) {
      setError(err.message || "Something went wrong");
      setEarnings({
        total_earnings: 0,
        pending_earnings: 0,
        released_earnings: 0,
        completed_jobs_count: 0,
        payments: [],
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEarnings();
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-[55vh] items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-14 w-14 animate-spin rounded-full border-4 border-[#11402D] border-t-[#9CF06B]" />
          <p className="mt-4 text-sm text-gray-500">Loading earnings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Earnings</h1>
            <p className="mt-1 text-sm text-gray-500">
              View your transport payments, completed deliveries, and payout status.
            </p>
          </div>

          <button
            onClick={fetchEarnings}
            className="inline-flex items-center justify-center gap-2 rounded-2xl border border-gray-200 px-5 py-3 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </button>
        </div>
      </div>

      {error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-red-700">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5" />
            <p className="font-medium">{error}</p>
          </div>
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-4">
        <StatCard
          icon={DollarSign}
          title="Total Earnings"
          value={`KSh ${earnings.total_earnings}`}
        />

        <StatCard
          icon={Clock}
          title="Pending Earnings"
          value={`KSh ${earnings.pending_earnings}`}
        />

        <StatCard
          icon={CheckCircle}
          title="Released Earnings"
          value={`KSh ${earnings.released_earnings}`}
        />

        <StatCard
          icon={Truck}
          title="Completed Jobs"
          value={earnings.completed_jobs_count}
        />
      </div>

      <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Payment History</h2>
            <p className="text-sm text-gray-500">
              Your delivery payments will appear here.
            </p>
          </div>

          <CreditCard className="h-6 w-6 text-[#11402D]" />
        </div>

        {earnings.payments.length === 0 ? (
          <div className="py-12 text-center">
            <FileText className="mx-auto h-16 w-16 text-[#11402D]" />
            <h3 className="mt-4 text-xl font-bold text-gray-900">
              No earnings yet
            </h3>
            <p className="mx-auto mt-2 max-w-md text-gray-500">
              Earnings will appear after you complete delivery jobs and payments are released.
            </p>
          </div>
        ) : (
          <div className="mt-6 overflow-hidden rounded-2xl border border-gray-200">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 text-gray-500">
                <tr>
                  <th className="px-4 py-3">Reference</th>
                  <th className="px-4 py-3">Amount</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Method</th>
                  <th className="px-4 py-3">Date</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100">
                {earnings.payments.map((payment) => (
                  <tr key={payment.id}>
                    <td className="px-4 py-4 font-semibold text-gray-900">
                      {payment.reference || `PAY-${payment.id}`}
                    </td>
                    <td className="px-4 py-4 text-gray-700">
                      KSh {payment.amount || 0}
                    </td>
                    <td className="px-4 py-4">
                      <span className="rounded-full bg-green-50 px-3 py-1 text-xs font-semibold text-green-700">
                        {payment.status || "pending"}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-gray-700">
                      {payment.payment_method || "M-Pesa"}
                    </td>
                    <td className="px-4 py-4 text-gray-500">
                      {payment.created_at
                        ? new Date(payment.created_at).toLocaleDateString()
                        : "Not available"}
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

function StatCard({ icon: Icon, title, value }) {
  return (
    <div className="rounded-3xl border border-gray-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#11402D]/10">
          <Icon className="h-6 w-6 text-[#11402D]" />
        </div>

        <p className="text-xl font-bold text-gray-900">{value}</p>
      </div>

      <p className="mt-4 text-sm font-medium text-gray-500">{title}</p>
    </div>
  );
}