import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  CheckCircle,
  CreditCard,
  Download,
  FileText,
  MapPin,
  Phone,
  Printer,
  Receipt,
  ShieldCheck,
  Truck,
  User,
} from "lucide-react";

export default function InvoicePaymentDetails() {
  const navigate = useNavigate();
  const { paymentId } = useParams();

  const payment = {
    invoiceNumber: `REV-INV-${paymentId || "000154"}`,
    receiptNumber: "REV-RCT-000154",
    status: "Paid",
    escrowStatus: "Funds Held Securely",
    mpesaReceipt: "SGK72JH3DF",
    phone: "254712345678",
    wasteValue: 50000,
    transportFee: 5000,
    platformFee: 2000,
    total: 57000,
    supplier: "Green Farms Ltd",
    producer: "Eco Biogas Ltd",
    transporter: "Fast Waste Logistics",
    wasteType: "Food Waste",
    quantity: "5,000 kg",
    pickup: "Nairobi Market",
    destination: "Eco Biogas Plant",
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-[#11402D]"
      >
        <ArrowLeft size={18} /> Back to Payments
      </button>

      <div className="rounded-3xl bg-[#11402D] p-8 text-white shadow-xl">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-green-200 text-sm font-bold uppercase tracking-widest">
              Invoice Payment Details
            </p>
            <h1 className="mt-2 text-3xl font-black">{payment.invoiceNumber}</h1>
            <p className="mt-2 text-green-100">
              Receipt No: {payment.receiptNumber}
            </p>
          </div>

          <div className="rounded-2xl bg-white/10 px-5 py-3 text-center">
            <CheckCircle className="mx-auto mb-1 text-[#9CF06B]" />
            <p className="font-black">{payment.status}</p>
            <p className="text-xs text-green-100">Payment Successful</p>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <StatusCard
          icon={CreditCard}
          title="Payment Method"
          value="M-Pesa"
          desc={payment.mpesaReceipt}
        />
        <StatusCard
          icon={ShieldCheck}
          title="Escrow Status"
          value={payment.escrowStatus}
          desc="Protected until delivery confirmation"
        />
        <StatusCard
          icon={Truck}
          title="Delivery Status"
          value="Delivered"
          desc="Waste received by producer"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-3xl bg-white p-6 shadow border border-gray-100">
          <h2 className="mb-5 flex items-center gap-2 text-xl font-black">
            <Receipt className="text-[#11402D]" /> Payment Breakdown
          </h2>

          <PaymentRow label="Waste Value" amount={payment.wasteValue} />
          <PaymentRow label="Transport Fee" amount={payment.transportFee} />
          <PaymentRow label="Platform Fee" amount={payment.platformFee} />

          <div className="mt-4 border-t pt-4 flex justify-between text-xl font-black">
            <span>Total Paid</span>
            <span>KES {payment.total.toLocaleString()}</span>
          </div>
        </section>

        <section className="rounded-3xl bg-white p-6 shadow border border-gray-100">
          <h2 className="mb-5 flex items-center gap-2 text-xl font-black">
            <Phone className="text-[#11402D]" /> M-Pesa Information
          </h2>

          <Info label="Phone Number" value={payment.phone} />
          <Info label="M-Pesa Receipt" value={payment.mpesaReceipt} />
          <Info label="Merchant Request ID" value="29115-39393" />
          <Info label="Checkout Request ID" value="ws_CO_25062026_1017" />
        </section>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <PartyCard icon={User} title="Supplier" name={payment.supplier} detail="Waste owner" />
        <PartyCard icon={User} title="Producer" name={payment.producer} detail="Waste buyer" />
        <PartyCard icon={Truck} title="Transporter" name={payment.transporter} detail="Delivery partner" />
      </div>

      <section className="rounded-3xl bg-white p-6 shadow border border-gray-100">
        <h2 className="mb-5 flex items-center gap-2 text-xl font-black">
          <MapPin className="text-[#11402D]" /> Waste & Route Information
        </h2>

        <div className="grid gap-4 md:grid-cols-2">
          <Info label="Waste Type" value={payment.wasteType} />
          <Info label="Quantity" value={payment.quantity} />
          <Info label="Pickup Location" value={payment.pickup} />
          <Info label="Destination" value={payment.destination} />
        </div>
      </section>

      <section className="rounded-3xl bg-white p-6 shadow border border-gray-100">
        <h2 className="mb-5 flex items-center gap-2 text-xl font-black">
          <ShieldCheck className="text-[#11402D]" /> Escrow Timeline
        </h2>

        <div className="grid gap-3 md:grid-cols-3">
          {[
            "Producer Paid",
            "Funds Held in Escrow",
            "Transport Assigned",
            "Waste Collected",
            "Waste Delivered",
            "Supplier & Transporter Paid",
          ].map((item) => (
            <div
              key={item}
              className="flex items-center gap-3 rounded-2xl bg-green-50 p-4 text-sm font-bold text-[#11402D]"
            >
              <CheckCircle size={18} />
              {item}
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-3xl bg-white p-6 shadow border border-gray-100">
        <h2 className="mb-5 flex items-center gap-2 text-xl font-black">
          <FileText className="text-[#11402D]" /> Official Receipt
        </h2>

        <div className="rounded-2xl border-2 border-dashed border-gray-200 p-6 text-center">
          <p className="text-sm text-gray-500">Digital Receipt</p>
          <h3 className="mt-2 text-2xl font-black">{payment.receiptNumber}</h3>
          <p className="mt-2 text-gray-500">
            This receipt confirms that payment was made and recorded by ReVive Energy.
          </p>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <button className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#11402D] px-5 py-3 font-bold text-white">
              <Download size={18} /> Download Receipt
            </button>
            <button
              onClick={() => window.print()}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-200 px-5 py-3 font-bold text-gray-700"
            >
              <Printer size={18} /> Print Invoice
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}

function StatusCard({ icon: Icon, title, value, desc }) {
  return (
    <div className="rounded-3xl bg-white p-6 shadow border border-gray-100">
      <Icon className="mb-4 text-[#11402D]" size={28} />
      <p className="text-sm text-gray-500">{title}</p>
      <h3 className="mt-1 text-lg font-black">{value}</h3>
      <p className="mt-1 text-xs text-gray-400">{desc}</p>
    </div>
  );
}

function PaymentRow({ label, amount }) {
  return (
    <div className="mb-3 flex justify-between text-gray-700">
      <span>{label}</span>
      <span className="font-bold">KES {amount.toLocaleString()}</span>
    </div>
  );
}

function Info({ label, value }) {
  return (
    <div className="mb-3 rounded-2xl bg-gray-50 p-4">
      <p className="text-xs font-bold uppercase text-gray-400">{label}</p>
      <p className="mt-1 font-bold text-gray-800">{value}</p>
    </div>
  );
}

function PartyCard({ icon: Icon, title, name, detail }) {
  return (
    <div className="rounded-3xl bg-white p-6 shadow border border-gray-100">
      <Icon className="mb-4 text-[#11402D]" size={28} />
      <p className="text-sm text-gray-500">{title}</p>
      <h3 className="mt-1 text-lg font-black">{name}</h3>
      <p className="mt-1 text-xs text-gray-400">{detail}</p>
    </div>
  );
}