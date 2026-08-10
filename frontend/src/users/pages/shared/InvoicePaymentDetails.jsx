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
  `KES ${Number(amount || 0).toFixed(2)}`;

const formatDate = (date) => {
  if (!date) return "N/A";
  return new Date(date).toLocaleString("en-KE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
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
      <div className="mx-auto max-w-xl rounded-3xl border border-red-200 bg-red-50 p-6 text-center">
        <AlertCircle className="mx-auto mb-4 h-14 w-14 text-red-500" />
        <h3 className="text-lg font-bold text-red-700">Unable to Load</h3>
        <p className="mt-2 text-sm text-red-600">{error || "Receipt not found"}</p>
        <button
          onClick={() => navigate("/dashboard/payments")}
          className="mt-6 rounded-xl bg-red-600 px-6 py-2.5 font-medium text-white hover:bg-red-700"
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
  };

  // ─── Subtotal = sum of all items (waste + transport + platform) ───
  const subtotal = display.wasteValue + display.transportFee + display.platformFee;

  return (
    <div className="max-w-[340px] mx-auto px-2 py-4 print:px-0 print:py-0">
      <style>{`
        @media print {
          .no-print { display: none !important; }
          body { background: white; }
          .receipt-container { box-shadow: none !important; border: none !important; }
        }
        .receipt-item {
          display: flex;
          justify-content: space-between;
          padding: 2px 0;
          font-size: 12px;
        }
        .receipt-item.total {
          font-weight: bold;
          border-top: 1px dashed #ccc;
          padding-top: 6px;
          margin-top: 4px;
        }
        .receipt-item.subtotal {
          border-top: 1px solid #ddd;
          padding-top: 6px;
          margin-top: 4px;
        }
      `}</style>

      { /* ─── Back & Download Buttons ─── */ }
      <div className="no-print flex items-center justify-between mb-3">
        <button
          onClick={() => navigate("/dashboard/payments")}
          className="inline-flex items-center gap-1 rounded-xl border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium hover:bg-gray-50"
        >
          <ArrowLeft size={16} /> Back
        </button>
        <button
          onClick={() => window.print()}
          className="inline-flex items-center gap-1 rounded-xl bg-[#11402D] px-3 py-1.5 text-xs font-bold text-white hover:bg-[#0E2A1C]"
        >
          <Download size={16} /> PDF
        </button>
      </div>

      { /* ─── RECEIPT ─── */ }
      <div className="receipt-container bg-white border border-gray-200 rounded-xl shadow-sm print:rounded-none print:border-0 overflow-hidden">
        <div className="p-4 space-y-3">

          { /* Header */ }
          <div className="text-center border-b border-gray-200 pb-2">
            <div className="flex items-center justify-center gap-1 text-lg font-bold text-[#11402D]">
              <Receipt className="h-5 w-5" />
              <span>ReVive Energy</span>
            </div>
            <p className="text-[10px] text-gray-500 mt-0.5">Waste-to-Energy Platform</p>
            <p className="text-[10px] text-gray-400 mt-0.5">1Garissa university, Garissa</p>
            <p className="text-[10px] text-gray-400">Tel: +254 727 568 271</p>
            <p className="text-[10px] text-gray-400 mt-0.5">{formatDate(display.created_at)}</p>
          </div>

          { /* Receipt Number */ }
          <div className="text-center text-[10px] text-gray-500 border-b border-gray-200 pb-2">
            Receipt #: {display.receiptNumber}
          </div>

          { /* Items */ }
          <div className="space-y-0 text-gray-700">
            <div className="receipt-item">
              <span>Waste Amount</span>
              <span>{formatCurrency(display.wasteValue)}</span>
            </div>
            <div className="receipt-item">
              <span>Transport Fee</span>
              <span>{formatCurrency(display.transportFee)}</span>
            </div>
            <div className="receipt-item">
              <span>Platform Fee</span>
              <span>{formatCurrency(display.platformFee)}</span>
            </div>

            <div className="receipt-item subtotal">
              <span>Sub-total</span>
              <span>{formatCurrency(subtotal)}</span>
            </div>

            <div className="receipt-item total">
              <span>TOTAL</span>
              <span>{formatCurrency(display.total)}</span>
            </div>
          </div>

          { /* Payment Details */ }
          <div className="border-t border-gray-200 pt-2 text-[10px] text-gray-600 space-y-0.5">
            <div className="flex justify-between">
              <span>Method</span>
              <span>M-Pesa</span>
            </div>
            <div className="flex justify-between">
              <span>M-Pesa Receipt</span>
              <span className="font-mono">{display.mpesaReceipt}</span>
            </div>
            <div className="flex justify-between">
              <span>Phone</span>
              <span className="font-mono">{display.phone}</span>
            </div>
            <div className="flex justify-between">
              <span>Status</span>
              <span className={`font-medium ${getStatusBadge(display.status)}`}>
                {pretty(display.status)}
              </span>
            </div>
          </div>

          { /* QR Code — encodes a public URL so scanning it opens the
                receipt directly, without needing to log in */ }
          <div className="flex justify-center border-t border-gray-200 pt-2">
            {receipt?.qr_code_path ? (
              <img
                src={receipt.qr_code_path}
                alt="QR Code"
                className="h-20 w-20 object-contain"
              />
            ) : (
              <QRCodeSVG
                value={`${window.location.origin}/receipt/${display.receiptNumber}`}
                size={80}
                level="H"
                includeMargin
              />
            )}
          </div>

          { /* Footer */ }
          <div className="text-center border-t border-gray-200 pt-2 text-[10px] text-gray-400">
            <p className="font-medium text-gray-600">THANK YOU</p>
            <p className="mt-0.5">Electronically generated receipt</p>
            <p className="mt-0.5">© 2026 ReVive Energy</p>
          </div>

          { /* Print Buttons (web only) */ }
          <div className="no-print flex flex-col sm:flex-row gap-2 justify-center pt-2 border-t border-gray-200">
            <button
              onClick={() => window.print()}
              className="inline-flex items-center justify-center gap-1 rounded-xl bg-[#11402D] px-4 py-2 text-xs font-bold text-white hover:bg-[#0E2A1C]"
            >
              <Download size={14} /> Download Receipt
            </button>
            <button
              onClick={() => window.print()}
              className="inline-flex items-center justify-center gap-1 rounded-xl border border-gray-300 px-4 py-2 text-xs font-bold text-gray-700 hover:bg-gray-50"
            >
              <Printer size={14} /> Print
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}