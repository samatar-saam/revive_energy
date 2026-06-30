// src/users/pages/shared/InvoicePaymentDetails.jsx
import { useState, useEffect } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import {
  ArrowLeft,
  Download,
  Printer,
  AlertCircle,
  Receipt,
  CreditCard,
  Truck,
  User,
  CheckCircle,
} from "lucide-react";
import { toast } from "react-toastify";
import { QRCodeSVG } from "qrcode.react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

// ─── Helpers ──────────────────────────────────────────────────
const formatCurrency = (amount) =>
  `KES ${Number(amount || 0).toLocaleString("en-KE")}`;

const formatDate = (date) => {
  if (!date) return "N/A";
  return new Date(date).toLocaleString("en-KE", {
    dateStyle: "long",
    timeStyle: "short",
  });
};

const getStatusBadge = (status) => {
  const s = String(status || "").toLowerCase();
  if (s === "paid" || s === "completed" || s === "released")
    return "bg-green-100 text-green-700";
  if (s === "pending" || s === "waiting") return "bg-yellow-100 text-yellow-700";
  if (s === "failed") return "bg-red-100 text-red-700";
  if (s === "held") return "bg-purple-100 text-purple-700";
  return "bg-gray-100 text-gray-700";
};

const getEscrowLabel = (status) => {
  const s = String(status || "").toLowerCase();
  if (s === "held") return "Funds Held Securely";
  if (s === "released") return "Funds Released";
  if (s === "waiting") return "Awaiting Payment";
  return "Unknown";
};

const pretty = (value) => {
  if (!value) return "pending";
  return String(value).replaceAll("_", " ");
};

export default function InvoicePaymentDetails() {
  const navigate = useNavigate();
  const { paymentId } = useParams();
  const location = useLocation();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);

  const isInvoice = new URLSearchParams(location.search).get("invoice") === "true";

  useEffect(() => {
    const fetchReceipt = async () => {
      setLoading(true);
      setError(null);

      try {
        const token = localStorage.getItem("token");
        if (!token) throw new Error("Not authenticated");

        const res = await fetch(`${API_URL}/payments/receipt/${paymentId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const result = await res.json().catch(() => ({}));

        if (!res.ok) {
          throw new Error(result.message || "Failed to fetch receipt");
        }

        setData(result);
      } catch (err) {
        setError(err.message);
        toast.error(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (paymentId) {
      fetchReceipt();
    } else {
      setError("No payment ID provided");
      setLoading(false);
    }
  }, [paymentId]);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get("print") === "true" && !loading && !error) {
      setTimeout(() => window.print(), 600);
    }
  }, [location.search, loading, error]);

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-[#11402D] border-t-[#9CF06B]" />
          <p className="mt-4 text-gray-500">Loading receipt...</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="mx-auto max-w-2xl rounded-3xl border border-red-200 bg-red-50 p-8 text-center">
        <AlertCircle className="mx-auto mb-4 h-16 w-16 text-red-500" />
        <h3 className="text-xl font-bold text-red-700">Unable to Load</h3>
        <p className="mt-2 text-red-600">{error || "Receipt not found"}</p>
        <button
          onClick={() => navigate("/dashboard/payments")}
          className="mt-6 rounded-xl bg-red-600 px-6 py-3 font-medium text-white hover:bg-red-700"
        >
          Go Back
        </button>
      </div>
    );
  }

  const { payment, receipt } = data;

  const display = {
    receiptNumber: receipt?.receipt_number || `REV-${paymentId}`,
    invoiceNumber: receipt?.receipt_number || `REV-INV-${paymentId}`,
    status: payment?.payment_status || payment?.status || "Pending",
    escrowStatus: getEscrowLabel(payment?.escrow_status),
    mpesaReceipt: payment?.mpesa_receipt || payment?.transaction_id || "N/A",
    phone: payment?.phone_number || "N/A",
    wasteValue: payment?.waste_amount || 0,
    transportFee: payment?.transport_fee || 0,
    platformFee: payment?.platform_fee || 0,
    total: payment?.amount || payment?.total_amount || 0,
    supplier: "ID " + (payment?.supplier_id || "N/A"),
    producer: "ID " + (payment?.producer_id || "N/A"),
    transporter: payment?.transporter_id ? "ID " + payment.transporter_id : "Not assigned",
    created_at: payment?.created_at || receipt?.generated_at,
    paid_at: payment?.paid_at,
  };

  const title = isInvoice ? "INVOICE" : "CASH RECEIPT";

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 print:px-0 print:py-0">
      <style>{`
        @media print {
          .no-print { display: none !important; }
          body { background: white; }
          .receipt-container { box-shadow: none !important; border: none !important; }
          .print-break { page-break-before: avoid; }
        }
      `}</style>

      {/* ─── Back & Download Buttons ─── */}
      <div className="no-print flex items-center justify-between mb-6">
        <button
          onClick={() => navigate("/dashboard/payments")}
          className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-medium hover:bg-gray-50"
        >
          <ArrowLeft size={18} /> Back to Payments
        </button>
        <button
          onClick={() => window.print()}
          className="inline-flex items-center gap-2 rounded-xl bg-[#11402D] px-4 py-2 text-sm font-bold text-white hover:bg-[#0E2A1C]"
        >
          <Download size={18} /> Download PDF
        </button>
      </div>

      {/* ─── RECEIPT ─── */}
      <div className="receipt-container bg-white border border-gray-200 rounded-2xl shadow-sm print:rounded-none print:border-0 overflow-hidden">
        <div className="p-6 sm:p-8 space-y-6 print:space-y-4">
          {/* Header */}
          <div className="text-center border-b border-gray-200 pb-4 print:border-gray-300">
            <div className="flex items-center justify-center gap-2 text-2xl font-bold text-[#11402D]">
              <Receipt className="h-6 w-6" />
              <span>ReVive Energy</span>
            </div>
            <p className="text-xs text-gray-500 mt-0.5">Waste-to-Energy Platform</p>
            <p className="text-xs text-gray-400 mt-1">{"\u200B"}</p>
          </div>

          {/* Title & Meta */}
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
              <p className="text-sm text-gray-500">Receipt # {display.receiptNumber}</p>
            </div>
            <div className="text-right text-sm">
              <p className="text-gray-500">Date: {formatDate(display.created_at)}</p>
              <span className={`inline-block mt-1 rounded-full px-3 py-0.5 text-xs font-medium ${getStatusBadge(display.status)}`}>
                {pretty(display.status)}
              </span>
            </div>
          </div>

          {/* ─── Itemized Breakdown ─── */}
          <div className="border-t border-gray-200 pt-4 print:border-gray-300">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 text-gray-600 font-semibold">
                  <th className="py-1.5 text-left">Description</th>
                  <th className="py-1.5 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                <tr>
                  <td className="py-2 text-gray-700">Waste Value</td>
                  <td className="py-2 text-right font-mono font-medium">{formatCurrency(display.wasteValue)}</td>
                </tr>
                <tr>
                  <td className="py-2 text-gray-700">Transport Fee</td>
                  <td className="py-2 text-right font-mono font-medium">{formatCurrency(display.transportFee)}</td>
                </tr>
                <tr>
                  <td className="py-2 text-gray-700">Platform Fee</td>
                  <td className="py-2 text-right font-mono font-medium">{formatCurrency(display.platformFee)}</td>
                </tr>
                <tr className="border-t-2 border-gray-300 font-bold">
                  <td className="py-2.5 text-gray-900">TOTAL</td>
                  <td className="py-2.5 text-right text-[#11402D]">{formatCurrency(display.total)}</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* ─── Payment Details ─── */}
          <div className="border-t border-gray-200 pt-4 grid grid-cols-2 gap-x-4 gap-y-2 text-sm print:border-gray-300">
            <div>
              <p className="text-xs text-gray-400 uppercase font-semibold">Payment Method</p>
              <p className="font-medium">M-Pesa</p>
            </div>
            <div>
              <p className="text-xs text-gray-400 uppercase font-semibold">M-Pesa Receipt</p>
              <p className="font-mono text-sm">{display.mpesaReceipt}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400 uppercase font-semibold">Phone</p>
              <p className="font-mono text-sm">{display.phone}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400 uppercase font-semibold">Escrow</p>
              <p className="text-sm">{display.escrowStatus}</p>
            </div>
          </div>

          {/* ─── QR Code ─── */}
          <div className="flex justify-center border-t border-gray-200 pt-4">
            {receipt?.qr_code_path ? (
              <img
                src={receipt.qr_code_path}
                alt="QR Code"
                className="h-28 w-28 object-contain"
              />
            ) : (
              <QRCodeSVG
                value={display.receiptNumber || `REV-${paymentId}`}
                size={112}
                level="H"
                includeMargin
              />
            )}
          </div>

          {/* ─── Footer ─── */}
          <div className="text-center border-t border-gray-200 pt-4 text-xs text-gray-400 print:border-gray-300">
            <p className="font-medium text-gray-600">Thank you!</p>
            <p className="mt-0.5">This receipt is electronically generated.</p>
            <p className="mt-0.5">© 2026 ReVive Energy</p>
          </div>

          {/* ─── Print Buttons ─── */}
          <div className="no-print flex flex-col sm:flex-row gap-3 justify-center pt-4 border-t border-gray-200">
            <button
              onClick={() => window.print()}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#11402D] px-6 py-2.5 font-bold text-white hover:bg-[#0E2A1C]"
            >
              <Download size={18} /> Download Receipt
            </button>
            <button
              onClick={() => window.print()}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-300 px-6 py-2.5 font-bold text-gray-700 hover:bg-gray-50"
            >
              <Printer size={18} /> Print Invoice
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}