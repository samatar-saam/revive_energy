// src/users/pages/shared/InvoicePaymentDetails.jsx
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Download,
  Printer,
  CheckCircle,
  Clock,
  AlertCircle,
  CreditCard,
  Building2,
  User,
  Mail,
  Phone,
  MapPin,
  FileText,
  QrCode,
  Calendar,
  DollarSign
} from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export default function InvoicePaymentDetails() {
  const { paymentId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // const token = localStorage.getItem('token');
        // const res = await fetch(`${API_URL}/payments/receipt/${paymentId}`, {
        //   headers: { Authorization: `Bearer ${token}` }
        // });
        // const result = await res.json();
        // setData(result);

        // Mock data
        setData({
          payment: {
            id: 1,
            receipt_number: 'REV-2026-000001',
            transaction_id: 'TXN-2026-001',
            amount: 11500,
            payment_status: 'completed',
            mpesa_receipt: 'SGH8KJ9LQ2',
            created_at: '2026-06-18T10:15:00Z',
            completed_at: '2026-06-18T10:20:00Z',
          },
          receipt: {
            receipt_number: 'REV-2026-000001',
            qr_code_path: null,
          },
          buyer: {
            name: 'Green Biogas Ltd',
            contact: 'John Kariuki',
            email: 'john@greenbiogas.com',
            phone: '+254 712 345 678',
            location: 'Nairobi, Kenya',
            type: 'Energy Producer'
          },
          supplier: {
            name: 'Hotel Paradise',
            contact: 'Jane Wanjiru',
            email: 'jane@hotelparadise.com',
            phone: '+254 723 456 789',
            location: 'Nairobi, Kenya',
            type: 'Hotel'
          },
          transport: {
            name: 'CleanMove Logistics',
            driver: 'John Mwangi',
            truck: 'KDA 123A',
            phone: '+254 734 567 890'
          },
          waste: {
            type: 'Organic Food Waste',
            quantity: '500 kg',
            location: 'Nairobi, Kenya',
            pickupDate: '2026-06-18',
            deliveryDate: '2026-06-19',
          },
          breakdown: {
            wasteCost: 10000,
            transportFee: 1000,
            platformFee: 500,
            total: 11500,
          },
          timeline: [
            { step: 'Payment Initiated', date: '2026-06-18', time: '10:15 AM', status: 'completed' },
            { step: 'Payment Completed', date: '2026-06-18', time: '10:20 AM', status: 'completed' },
            { step: 'Pickup Scheduled', date: '2026-06-18', time: '11:00 AM', status: 'completed' },
            { step: 'Waste Collected', date: '2026-06-19', time: '08:30 AM', status: 'completed' },
          ]
        });
        setLoading(false);
      } catch (error) {
        console.error('Error fetching invoice details:', error);
        setLoading(false);
      }
    };
    fetchData();
  }, [paymentId]);

  const formatCurrency = (amount) => `KSh ${(amount || 0).toLocaleString()}`;
  const formatDate = (date) => new Date(date).toLocaleDateString('en-KE', { day: '2-digit', month: 'short', year: 'numeric' });
  const formatTime = (date) => new Date(date).toLocaleTimeString('en-KE', { hour: '2-digit', minute: '2-digit' });

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'completed': return 'text-green-700 bg-green-50 border-green-200';
      case 'pending': return 'text-yellow-700 bg-yellow-50 border-yellow-200';
      case 'failed': return 'text-red-700 bg-red-50 border-red-200';
      default: return 'text-gray-700 bg-gray-50 border-gray-200';
    }
  };

  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case 'completed': return <CheckCircle className="w-5 h-5" />;
      case 'pending': return <Clock className="w-5 h-5" />;
      case 'failed': return <AlertCircle className="w-5 h-5" />;
      default: return <AlertCircle className="w-5 h-5" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#11402D] border-t-[#9CF06B] rounded-full animate-spin mx-auto" />
          <p className="mt-4 text-gray-500">Loading invoice details...</p>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8 text-center">
        <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
        <h3 className="font-display text-xl font-bold text-red-700">Invoice not found</h3>
        <button
          onClick={() => navigate('/dashboard/payments')}
          className="mt-4 px-6 py-2 bg-[#11402D] text-white rounded-xl"
        >
          Back to Payments
        </button>
      </div>
    );
  }

  const { payment, receipt, buyer, supplier, transport, waste, breakdown, timeline } = data;

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
      {/* Back button */}
      <button
        onClick={() => navigate('/dashboard/payments')}
        className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition"
      >
        <ArrowLeft className="w-5 h-5" />
        Back to Payments
      </button>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-gray-900">Invoice Details</h1>
          <p className="text-sm text-gray-500">Transaction {payment.payment_status}</p>
        </div>
        <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium ${getStatusColor(payment.payment_status)}`}>
          {getStatusIcon(payment.payment_status)}
          <span className="uppercase">{payment.payment_status}</span>
        </div>
      </div>

      {/* Invoice Summary */}
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div>
            <p className="text-xs text-gray-500">Invoice Number</p>
            <p className="font-mono text-sm font-medium">{payment.receipt_number}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Transaction ID</p>
            <p className="font-mono text-sm font-medium">{payment.transaction_id}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Date</p>
            <p className="text-sm">{formatDate(payment.created_at)}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Amount</p>
            <p className="font-display text-xl font-bold text-[#11402D]">{formatCurrency(payment.amount)}</p>
          </div>
        </div>
      </div>

      {/* Buyer & Supplier */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
          <h3 className="font-display font-semibold text-gray-900 flex items-center gap-2">
            <Building2 className="w-5 h-5 text-blue-600" />
            Buyer (Energy Producer)
          </h3>
          <div className="mt-3 space-y-1 text-sm text-gray-700">
            <p className="font-medium">{buyer.name}</p>
            <p>{buyer.type}</p>
            <div className="flex items-center gap-1"><User className="w-4 h-4" /> {buyer.contact}</div>
            <div className="flex items-center gap-1"><Mail className="w-4 h-4" /> {buyer.email}</div>
            <div className="flex items-center gap-1"><Phone className="w-4 h-4" /> {buyer.phone}</div>
            <div className="flex items-center gap-1"><MapPin className="w-4 h-4" /> {buyer.location}</div>
          </div>
        </div>
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
          <h3 className="font-display font-semibold text-gray-900 flex items-center gap-2">
            <Building2 className="w-5 h-5 text-emerald-600" />
            Supplier (Waste Supplier)
          </h3>
          <div className="mt-3 space-y-1 text-sm text-gray-700">
            <p className="font-medium">{supplier.name}</p>
            <p>{supplier.type}</p>
            <div className="flex items-center gap-1"><User className="w-4 h-4" /> {supplier.contact}</div>
            <div className="flex items-center gap-1"><Mail className="w-4 h-4" /> {supplier.email}</div>
            <div className="flex items-center gap-1"><Phone className="w-4 h-4" /> {supplier.phone}</div>
            <div className="flex items-center gap-1"><MapPin className="w-4 h-4" /> {supplier.location}</div>
          </div>
        </div>
      </div>

      {/* Transport & Waste */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
          <h3 className="font-display font-semibold text-gray-900 flex items-center gap-2">
            <Truck className="w-5 h-5 text-purple-600" />
            Transport Partner
          </h3>
          <div className="mt-3 space-y-1 text-sm text-gray-700">
            <p className="font-medium">{transport.name}</p>
            <p>Driver: {transport.driver}</p>
            <p>Truck: {transport.truck}</p>
            <p><Phone className="w-4 h-4 inline" /> {transport.phone}</p>
          </div>
        </div>
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
          <h3 className="font-display font-semibold text-gray-900 flex items-center gap-2">
            <Package className="w-5 h-5 text-yellow-600" />
            Waste Details
          </h3>
          <div className="mt-3 space-y-1 text-sm text-gray-700">
            <p><span className="font-medium">Type:</span> {waste.type}</p>
            <p><span className="font-medium">Quantity:</span> {waste.quantity}</p>
            <p><span className="font-medium">Location:</span> {waste.location}</p>
            <p><span className="font-medium">Pickup:</span> {waste.pickupDate}</p>
            <p><span className="font-medium">Delivery:</span> {waste.deliveryDate}</p>
          </div>
        </div>
      </div>

      {/* Payment Breakdown */}
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
        <h3 className="font-display font-semibold text-gray-900 flex items-center gap-2">
          <DollarSign className="w-5 h-5 text-green-600" />
          Payment Breakdown
        </h3>
        <div className="mt-4 space-y-2">
          <div className="flex justify-between py-2 border-b border-gray-100">
            <span className="text-gray-600">Waste Cost</span>
            <span className="font-medium">{formatCurrency(breakdown.wasteCost)}</span>
          </div>
          <div className="flex justify-between py-2 border-b border-gray-100">
            <span className="text-gray-600">Transport Fee</span>
            <span className="font-medium">{formatCurrency(breakdown.transportFee)}</span>
          </div>
          <div className="flex justify-between py-2 border-b border-gray-100">
            <span className="text-gray-600">Platform Fee</span>
            <span className="font-medium">{formatCurrency(breakdown.platformFee)}</span>
          </div>
          <div className="flex justify-between py-3 bg-gray-50 rounded-xl px-4 -mx-4">
            <span className="font-display font-semibold text-gray-900">Total</span>
            <span className="font-display text-xl font-bold text-[#11402D]">{formatCurrency(breakdown.total)}</span>
          </div>
        </div>
      </div>

      {/* M-Pesa Details */}
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
        <h3 className="font-display font-semibold text-gray-900 flex items-center gap-2">
          <CreditCard className="w-5 h-5 text-indigo-600" />
          Payment Information
        </h3>
        <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-gray-500">Payment Method</p>
            <p className="font-medium">M-Pesa</p>
          </div>
          <div>
            <p className="text-gray-500">M-Pesa Receipt</p>
            <p className="font-mono font-medium">{payment.mpesa_receipt || 'N/A'}</p>
          </div>
          <div>
            <p className="text-gray-500">Phone</p>
            <p className="font-medium">{buyer.phone}</p>
          </div>
          <div>
            <p className="text-gray-500">Date</p>
            <p className="font-medium">{formatDate(payment.completed_at)}</p>
          </div>
          <div>
            <p className="text-gray-500">Time</p>
            <p className="font-medium">{formatTime(payment.completed_at)}</p>
          </div>
          <div>
            <p className="text-gray-500">Status</p>
            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(payment.payment_status)}`}>
              {getStatusIcon(payment.payment_status)} {payment.payment_status}
            </span>
          </div>
        </div>
      </div>

      {/* QR Code */}
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 text-center">
        <h3 className="font-display font-semibold text-gray-900 mb-4">QR Code Verification</h3>
        <div className="flex justify-center">
          {receipt?.qr_code_path ? (
            <img src={`${API_URL.replace('/api', '')}${receipt.qr_code_path}`} alt="QR Code" className="w-40 h-40" />
          ) : (
            <div className="w-40 h-40 flex items-center justify-center bg-gray-50 rounded-2xl border-2 border-dashed border-gray-300">
              <QrCode className="w-20 h-20 text-gray-300" />
            </div>
          )}
        </div>
        <p className="text-sm text-gray-500 mt-2">Scan to verify receipt</p>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-3">
        <button className="flex-1 min-w-[120px] flex items-center justify-center gap-2 py-3 px-4 bg-[#11402D] text-white rounded-xl font-medium hover:bg-[#0E2A1C] transition">
          <Download className="w-5 h-5" /> Download PDF
        </button>
        <button className="flex-1 min-w-[120px] flex items-center justify-center gap-2 py-3 px-4 border border-[#11402D] text-[#11402D] rounded-xl font-medium hover:bg-[#11402D] hover:text-white transition">
          <Printer className="w-5 h-5" /> Print Invoice
        </button>
      </div>
    </div>
  );
}