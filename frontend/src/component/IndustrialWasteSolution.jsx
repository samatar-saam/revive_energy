import React from "react";
import {
  ArrowRight,
  Factory,
  Truck,
  ShieldCheck,
  Recycle,
  Zap,
  Flame,
  PackageCheck,
  BarChart3,
  Warehouse,
  ClipboardCheck,
  Boxes,
  Route,
  FileCheck2,
  Gauge,
  Container,
  HardHat,
  CheckCircle,
  Building2,
} from "lucide-react";

export default function IndustrialWasteSolution() {
  const wasteStreams = [
    "Wood chips",
    "Sawdust",
    "Textile offcuts",
    "Packaging waste",
    "Process residue",
    "Manufacturing byproducts",
    "Pallet waste",
    "Cardboard waste",
    "Plastic offcuts",
  ];

  const process = [
    {
      icon: ClipboardCheck,
      title: "Waste stream audit",
      desc: "Factories register material type, volume, location, risk level, storage condition, and collection frequency.",
    },
    {
      icon: PackageCheck,
      title: "Material classification",
      desc: "Each stream is checked, weighed, categorized, and matched with safe recovery or recycling partners.",
    },
    {
      icon: Route,
      title: "Secure collection",
      desc: "Approved transporters move materials using planned pickup routes and recorded transfer data.",
    },
    {
      icon: Factory,
      title: "Value recovery",
      desc: "Industrial byproducts are converted into fuel, recycled inputs, electricity, heat, or manufacturing feedstock.",
    },
  ];

  const outputs = [
    {
      icon: Flame,
      title: "Industrial Fuel",
      desc: "Dry biomass, wood residue, and selected production waste can support boilers, kilns, and controlled thermal systems.",
    },
    {
      icon: Zap,
      title: "Energy Recovery",
      desc: "Approved industrial streams can generate electricity, heat, or process energy for facilities and recovery plants.",
    },
    {
      icon: Recycle,
      title: "Material Recovery",
      desc: "Reusable material is redirected into recycling, packaging, construction, and manufacturing supply chains.",
    },
    {
      icon: BarChart3,
      title: "Compliance Reports",
      desc: "Track volumes moved, recovery partners, collection records, emissions avoided, and sustainability performance.",
    },
  ];

  const benefits = [
    "Reduces factory disposal costs",
    "Improves industrial waste compliance",
    "Turns byproducts into recovery value",
    "Connects factories with verified buyers",
    "Supports cleaner industrial operations",
    "Reduces landfill dependency",
    "Improves ESG and sustainability reporting",
    "Creates safer material movement",
  ];

  const industries = [
    {
      icon: Warehouse,
      title: "Manufacturing Plants",
      desc: "Manage daily byproducts, packaging waste, pallets, offcuts, and material residue.",
    },
    {
      icon: Building2,
      title: "Industrial Parks",
      desc: "Coordinate shared waste collection across multiple factories and processors.",
    },
    {
      icon: HardHat,
      title: "Construction Suppliers",
      desc: "Recover wood, packaging, plastics, and reusable industrial materials.",
    },
  ];

  return (
    <div className="min-h-screen bg-[#F6F8F4] text-[#142019] font-['Inter'] overflow-x-hidden">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=Inter:wght@400;500;600;700&display=swap');

        .font-display {
          font-family: 'Space Grotesk', sans-serif;
        }
      `}</style>

      {/* FIRST HERO / CHALLENGE - NO SPACE AFTER NAVBAR */}
      <section className="bg-white pt-0 mt-0 pb-16 sm:pb-20 lg:pb-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 pt-0 pb-12 sm:pb-16 lg:pb-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">
            <div className="pt-6 sm:pt-8 lg:pt-10">
              <p className="text-sm font-semibold uppercase tracking-wider text-[#11402D]/60 mb-3">
                Industrial Waste Recovery
              </p>

              <h1 className="font-display text-4xl sm:text-5xl lg:text-[64px] font-semibold text-[#0E2A1C] leading-[1.08] tracking-tight">
                Industrial waste is expensive when it has no recovery pathway.
              </h1>

              <p className="mt-6 text-base sm:text-lg text-[#142019]/65 leading-relaxed max-w-2xl">
                Factories generate usable material every day, but without
                verified buyers, safe transport, and clear documentation, that
                material becomes a cost. ReVive Energy helps industrial
                producers redirect waste into verified recovery channels.
              </p>

              <div className="mt-8 flex flex-col sm:flex-row gap-4">
                <button className="group w-full sm:w-auto px-7 py-3.5 rounded-full bg-[#11402D] text-white font-semibold hover:bg-[#0E2A1C] transition-all flex items-center justify-center gap-2">
                  Register Industrial Waste
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition" />
                </button>

                <button className="w-full sm:w-auto px-7 py-3.5 rounded-full border border-[#0E2A1C]/20 text-[#0E2A1C] font-semibold hover:bg-[#F6F8F4] transition">
                  View Recovery Partners
                </button>
              </div>

              <div className="mt-10 grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[
                  ["36%", "lower disposal cost"],
                  ["72h", "audit cycle"],
                  ["4x", "recovery routes"],
                ].map(([value, label]) => (
                  <div
                    key={label}
                    className="rounded-2xl bg-[#F6F8F4] border border-[#0E2A1C]/10 p-5"
                  >
                    <h3 className="font-display text-2xl font-semibold text-[#0E2A1C]">
                      {value}
                    </h3>
                    <p className="text-sm text-[#142019]/55 mt-1">{label}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative rounded-3xl overflow-hidden min-h-[360px] sm:min-h-[430px] lg:min-h-[560px] shadow-2xl shadow-[#0E2A1C]/10 mt-0">
              <img
                src="https://images.unsplash.com/photo-1565008447742-97f6f38c985c?auto=format&fit=crop&w=1400&q=80"
                alt="Industrial facility and construction equipment"
                className="absolute inset-0 w-full h-full object-cover"
              />

              <div className="absolute inset-0 bg-gradient-to-t from-[#0E2A1C]/70 via-transparent to-transparent" />

              <div className="absolute left-5 right-5 bottom-5 bg-white/95 backdrop-blur rounded-3xl p-5 border border-white/40">
                <div className="flex gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-[#0E2A1C] flex items-center justify-center flex-shrink-0">
                    <Gauge className="w-5 h-5 text-white" />
                  </div>

                  <div>
                    <h3 className="font-display text-xl font-semibold text-[#0E2A1C]">
                      Verified recovery operations
                    </h3>
                    <p className="mt-1 text-sm text-[#142019]/60">
                      Track every stream from factory output to recovery buyer.
                    </p>
                  </div>
                </div>
              </div>

              <div className="hidden xl:block absolute top-6 right-6 bg-[#0E2A1C] text-white rounded-3xl p-5 w-64">
                <FileCheck2 className="w-7 h-7 text-[#9CF06B] mb-4" />
                <h3 className="font-display text-xl font-semibold">
                  Compliance-ready data
                </h3>
                <p className="mt-2 text-sm text-white/60">
                  Record volumes, transfer history, and recovery outcomes.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* VALUE STRIP */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 -mt-10 relative z-10 pb-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            [
              "01",
              "Controlled waste movement",
              "Move industrial materials through verified collection and recovery routes.",
            ],
            [
              "02",
              "Factory cost reduction",
              "Lower disposal costs by redirecting usable material to recovery buyers.",
            ],
            [
              "03",
              "Recovery documentation",
              "Track volumes, buyers, recovery outcomes, and environmental performance.",
            ],
          ].map(([num, title, desc]) => (
            <div
              key={title}
              className="bg-white rounded-3xl border border-[#0E2A1C]/10 p-6 shadow-lg shadow-[#0E2A1C]/5 hover:shadow-xl hover:shadow-[#0E2A1C]/10 transition"
            >
              <span className="text-sm font-semibold text-[#11402D]/60">
                {num}
              </span>

              <h3 className="font-display text-xl font-semibold text-[#0E2A1C] mt-3">
                {title}
              </h3>

              <p className="mt-3 text-sm text-[#142019]/60 leading-relaxed">
                {desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* INDUSTRIES */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 pb-16 sm:pb-20">
        <div className="max-w-2xl mb-10">
          <p className="text-sm font-semibold uppercase tracking-wider text-[#11402D]/60 mb-3">
            Who Uses This
          </p>

          <h2 className="font-display text-3xl sm:text-4xl lg:text-[44px] font-semibold text-[#0E2A1C] leading-tight">
            Built for industrial operators that need cleaner waste movement.
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {industries.map((item) => (
            <div
              key={item.title}
              className="bg-white rounded-3xl border border-[#0E2A1C]/10 p-6 hover:shadow-xl hover:shadow-[#0E2A1C]/10 transition"
            >
              <div className="w-12 h-12 rounded-2xl bg-[#0E2A1C] text-white flex items-center justify-center mb-5">
                <item.icon className="w-5 h-5" />
              </div>

              <h3 className="font-display text-xl font-semibold text-[#0E2A1C]">
                {item.title}
              </h3>

              <p className="mt-3 text-sm text-[#142019]/60 leading-relaxed">
                {item.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* WASTE STREAMS */}
      <section className="bg-white py-16 sm:py-20 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
            <div className="lg:col-span-5">
              <p className="text-sm font-semibold uppercase tracking-wider text-[#11402D]/60 mb-3">
                Accepted Streams
              </p>

              <h2 className="font-display text-3xl sm:text-4xl lg:text-[44px] font-semibold text-[#0E2A1C] leading-tight">
                Common industrial streams that can be recovered.
              </h2>

              <p className="mt-5 text-[#142019]/60 leading-relaxed">
                The platform supports reusable, recyclable, and energy-ready
                materials from factories, workshops, processors, warehouses, and
                industrial parks.
              </p>
            </div>

            <div className="lg:col-span-7 grid grid-cols-2 sm:grid-cols-3 gap-4">
              {wasteStreams.map((item) => (
                <div
                  key={item}
                  className="bg-[#F6F8F4] rounded-2xl border border-[#0E2A1C]/10 p-5 hover:shadow-lg hover:shadow-[#0E2A1C]/10 transition"
                >
                  <div className="w-9 h-9 rounded-xl bg-white flex items-center justify-center">
                    <CheckCircle className="w-4 h-4 text-[#11402D]" />
                  </div>

                  <h3 className="mt-4 font-display font-semibold text-[#0E2A1C]">
                    {item}
                  </h3>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* PROCESS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 py-16 sm:py-20 lg:py-24">
        <div className="max-w-3xl mb-12">
          <p className="text-sm font-semibold uppercase tracking-wider text-[#11402D]/60 mb-3">
            Operating Model
          </p>

          <h2 className="font-display text-3xl sm:text-4xl lg:text-[44px] font-semibold text-[#0E2A1C] leading-tight">
            A secure route from industrial byproduct to recovery buyer.
          </h2>
        </div>

        <div className="relative">
          <div className="hidden lg:block absolute top-12 left-0 right-0 h-px bg-[#0E2A1C]/15" />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {process.map((item, index) => (
              <div
                key={item.title}
                className="relative bg-white rounded-3xl border border-[#0E2A1C]/10 p-6 hover:shadow-lg hover:shadow-[#0E2A1C]/10 transition"
              >
                <div className="w-14 h-14 rounded-2xl bg-[#0E2A1C] text-white flex items-center justify-center mb-6 relative z-10">
                  <item.icon className="w-6 h-6" />
                </div>

                <span className="text-sm font-semibold text-[#11402D]/60">
                  Step 0{index + 1}
                </span>

                <h3 className="font-display text-xl font-semibold text-[#0E2A1C] mt-2">
                  {item.title}
                </h3>

                <p className="mt-3 text-sm text-[#142019]/60 leading-relaxed">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* OUTPUTS */}
      <section className="bg-[#0E2A1C] text-white py-16 sm:py-20 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16">
            <div className="lg:col-span-5">
              <p className="text-sm font-semibold uppercase tracking-wider text-white/50 mb-3">
                Recovery Outputs
              </p>

              <h2 className="font-display text-3xl sm:text-4xl lg:text-[44px] font-semibold leading-tight">
                Industrial waste can become fuel, energy, material, and data.
              </h2>

              <p className="mt-6 text-white/65 leading-relaxed">
                Each waste stream is matched to the best recovery pathway based
                on material type, safety requirements, quality, volume, and
                buyer demand.
              </p>
            </div>

            <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-5">
              {outputs.map((item) => (
                <div
                  key={item.title}
                  className="rounded-3xl bg-white/5 border border-white/10 p-6 hover:bg-white/10 transition"
                >
                  <div className="w-11 h-11 rounded-2xl bg-white/10 flex items-center justify-center mb-5">
                    <item.icon className="w-5 h-5 text-[#9CF06B]" />
                  </div>

                  <h3 className="font-display text-xl font-semibold">
                    {item.title}
                  </h3>

                  <p className="mt-3 text-sm text-white/60 leading-relaxed">
                    {item.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* COMPLIANCE / OPERATIONS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 py-16 sm:py-20 lg:py-24">
        <div className="rounded-[2rem] bg-white border border-[#0E2A1C]/10 overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-2">
            <div className="p-8 sm:p-12 lg:p-16">
              <Container className="w-10 h-10 text-[#11402D] mb-6" />

              <h2 className="font-display text-3xl sm:text-4xl font-semibold text-[#0E2A1C] leading-tight">
                Designed for compliance, traceability, and industrial scale.
              </h2>

              <p className="mt-5 text-[#142019]/65 leading-relaxed">
                The system supports waste stream audits, pickup planning,
                transporter coordination, buyer matching, quality verification,
                payment records, and recovery reporting.
              </p>

              <div className="mt-8 grid grid-cols-2 gap-4">
                {[
                  ["Verified", "factories"],
                  ["Tracked", "movement"],
                  ["Measured", "recovery"],
                  ["Documented", "impact"],
                ].map(([title, desc]) => (
                  <div
                    key={title}
                    className="rounded-2xl bg-[#F6F8F4] border border-[#0E2A1C]/10 p-4"
                  >
                    <h3 className="font-display text-xl font-semibold text-[#0E2A1C]">
                      {title}
                    </h3>
                    <p className="text-sm text-[#142019]/50 mt-1">{desc}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative min-h-[360px]">
              <img
                src="https://images.unsplash.com/photo-1516937941344-00b4e0337589?auto=format&fit=crop&w=1200&q=80"
                alt="Industrial factory"
                className="absolute inset-0 w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* BENEFITS */}
      <section className="bg-white py-16 sm:py-20 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wider text-[#11402D]/60 mb-3">
                Why It Matters
              </p>

              <h2 className="font-display text-3xl sm:text-4xl lg:text-[44px] font-semibold text-[#0E2A1C] leading-tight">
                Better for factories, recyclers, energy producers, and regulators.
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {benefits.map((item) => (
                <div
                  key={item}
                  className="rounded-2xl bg-[#F6F8F4] border border-[#0E2A1C]/10 p-5 flex gap-3"
                >
                  <ShieldCheck className="w-5 h-5 text-[#11402D] flex-shrink-0 mt-0.5" />
                  <p className="font-medium text-[#0E2A1C]">{item}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 py-16 sm:py-20 lg:py-24">
        <div className="rounded-[2rem] bg-[#11402D] text-white p-8 sm:p-12 lg:p-16 text-center relative overflow-hidden">
          <div className="absolute -top-24 -right-24 w-72 h-72 rounded-full border border-white/10" />
          <div className="absolute -bottom-24 -left-24 w-72 h-72 rounded-full border border-white/10" />

          <div className="relative">
            <Boxes className="w-10 h-10 text-[#9CF06B] mx-auto mb-6" />

            <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-semibold max-w-3xl mx-auto leading-tight">
              Move industrial waste into verified recovery channels.
            </h2>

            <p className="mt-5 text-white/70 max-w-xl mx-auto leading-relaxed">
              Register your waste stream, connect with approved transporters,
              and supply recovery partners with quality industrial byproducts.
            </p>

            <div className="mt-8 flex flex-col sm:flex-row justify-center gap-4">
              <button className="w-full sm:w-auto px-7 py-3.5 rounded-full bg-white text-[#0E2A1C] font-semibold hover:bg-[#F6F8F4] transition flex items-center justify-center gap-2">
                Create Listing
                <ArrowRight className="w-4 h-4" />
              </button>

              <button className="w-full sm:w-auto px-7 py-3.5 rounded-full border border-white/20 text-white font-semibold hover:bg-white/10 transition">
                Contact ReVive
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}