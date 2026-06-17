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
  Gauge,
  ClipboardCheck,
  Boxes,
  Route,
  FileCheck2,
  Leaf,
  Package,
} from "lucide-react";
import heroImage from "../assets/my-plastic-image.png";
import environmentalImage from "../assets/plastic-recycling.jpg";

export default function PlasticRecyclingSolution() {
  const plasticTypes = [
    "PET Bottles",
    "HDPE Containers",
    "LDPE Films",
    "PP Packaging",
    "PS Products",
    "Mixed Plastics",
  ];

  const process = [
    {
      icon: ClipboardCheck,
      title: "Collection & Sorting",
      desc: "Plastic waste is collected from various sources and sorted by type and quality.",
    },
    {
      icon: PackageCheck,
      title: "Shredding & Washing",
      desc: "Plastics are shredded into small flakes and thoroughly washed to remove contaminants.",
    },
    {
      icon: Route,
      title: "Melting & Pelletizing",
      desc: "Clean plastic flakes are melted and extruded into high-quality recycled pellets.",
    },
    {
      icon: Factory,
      title: "Manufacturing",
      desc: "Recycled pellets are sold to manufacturers for new plastic products.",
    },
  ];

  const outputs = [
    {
      icon: Recycle,
      title: "Recycled PET (rPET)",
      desc: "High-quality recycled PET for bottles, packaging, and textile applications.",
    },
    {
      icon: Package,
      title: "Recycled HDPE",
      desc: "Durable recycled plastic for containers, pipes, and industrial products.",
    },
    {
      icon: Flame,
      title: "Plastic-to-Fuel",
      desc: "Non-recyclable plastics converted to fuel oil and energy.",
    },
    {
      icon: BarChart3,
      title: "Circular Economy Data",
      desc: "Track diversion rates, CO₂ savings, and material recovery metrics.",
    },
  ];

  const benefits = [
    "Reduces plastic pollution in landfills and oceans",
    "Conserves natural resources and energy",
    "Creates economic value from waste plastic",
    "Supports sustainable manufacturing",
    "Reduces carbon emissions compared to virgin plastic",
    "Meets corporate sustainability goals",
  ];

  return (
    <div className="min-h-screen bg-[#F6F8F4] text-[#142019] font-['Inter'] overflow-x-hidden">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=Inter:wght@400;500;600;700&display=swap');
        .font-display { font-family: 'Space Grotesk', sans-serif; }
      `}</style>

      {/* HERO SECTION - PLASTIC RECYCLING */}
      <section className="bg-white pt-0 pb-16 sm:pb-20 lg:pb-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 py-12 sm:py-16 lg:py-20 w-full">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wider text-[#11402D]/60 mb-3">
                PLASTIC RECYCLING
              </p>

              <h1 className="font-display text-3xl sm:text-4xl lg:text-[44px] xl:text-5xl font-semibold text-[#0E2A1C] leading-tight">
                Turn plastic waste
                <br />
                into valuable
                <br />
                recycled materials.
              </h1>

              <p className="mt-6 text-base sm:text-lg text-[#142019]/65 leading-relaxed">
                ReVive Energy connects plastic waste generators with certified
                recyclers, converting discarded plastics into high-quality
                recycled materials for new products.
              </p>

              <div className="mt-8 flex flex-col sm:flex-row gap-4">
                <button className="group px-7 py-3.5 rounded-full bg-[#11402D] text-white font-semibold hover:bg-[#0E2A1C] transition-all hover:scale-105 flex items-center justify-center gap-2">
                  Start Recycling
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition" />
                </button>
                <button className="px-7 py-3.5 rounded-full border border-[#0E2A1C]/20 text-[#0E2A1C] font-semibold hover:bg-gray-50 transition-all hover:scale-105">
                  Find Recyclers
                </button>
              </div>

              <div className="mt-10 grid grid-cols-3 gap-4 max-w-md">
                {[
                  ["78%", "recovery rate"],
                  ["45K+", "tons recycled/yr"],
                  ["62%", "less energy"],
                ].map(([value, label]) => (
                  <div key={label}>
                    <h3 className="font-display text-2xl sm:text-3xl font-semibold text-[#0E2A1C]">
                      {value}
                    </h3>
                    <p className="text-xs sm:text-sm text-[#142019]/55 mt-1">
                      {label}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Hero Image - Using my-plastic-image.png */}
            <div className="relative rounded-3xl overflow-hidden min-h-[360px] lg:min-h-[460px] shadow-2xl">
              <img
                src={heroImage}
                alt="Plastic recycling facility"
                className="absolute inset-0 w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* VALUE STRIP */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            [
              "01",
              "Responsible collection",
              "Certified collection and sorting of post-consumer and post-industrial plastic waste.",
            ],
            [
              "02",
              "Quality processing",
              "Advanced washing, shredding, and pelletizing for high-quality recycled materials.",
            ],
            [
              "03",
              "Circular supply chain",
              "Recycled materials sold back to manufacturers for new products.",
            ],
          ].map(([num, title, desc]) => (
            <div
              key={title}
              className="bg-white rounded-3xl border border-[#0E2A1C]/10 p-6 hover:shadow-lg hover:shadow-[#0E2A1C]/10 transition"
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

      {/* PLASTIC TYPES */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 pb-16 sm:pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          <div className="lg:col-span-5">
            <p className="text-sm font-semibold uppercase tracking-wider text-[#11402D]/60 mb-3">
              Accepted Plastics
            </p>

            <h2 className="font-display text-3xl sm:text-4xl lg:text-[44px] font-semibold text-[#0E2A1C] leading-tight">
              We recycle all major plastic types.
            </h2>
          </div>

          <div className="lg:col-span-7 grid grid-cols-2 sm:grid-cols-3 gap-4">
            {plasticTypes.map((item) => (
              <div
                key={item}
                className="bg-white rounded-2xl border border-[#0E2A1C]/10 p-5 hover:shadow-lg hover:shadow-[#0E2A1C]/10 transition"
              >
                <div className="w-9 h-9 rounded-xl bg-[#F6F8F4] flex items-center justify-center">
                  <Recycle className="w-4 h-4 text-[#11402D]" />
                </div>

                <h3 className="mt-4 font-display font-semibold text-[#0E2A1C]">
                  {item}
                </h3>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CHALLENGE SECTION */}
      <section className="bg-white py-16 sm:py-20 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wider text-[#11402D]/60 mb-3">
                The Challenge
              </p>

              <h2 className="font-display text-3xl sm:text-4xl lg:text-[44px] font-semibold text-[#0E2A1C] leading-tight">
                Most plastic waste ends up in landfills or the environment.
              </h2>

              <p className="mt-6 text-base sm:text-lg text-[#142019]/65 leading-relaxed">
                Every year, millions of tons of plastic waste are discarded,
                polluting our land and oceans. Without proper recycling
                infrastructure, this valuable material is lost forever.
              </p>

              <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  ["Problem", "Plastic waste pollutes landfills, oceans, and ecosystems."],
                  ["Solution", "Advanced recycling creates circular economy for plastics."],
                ].map(([title, desc]) => (
                  <div
                    key={title}
                    className="rounded-2xl bg-[#F6F8F4] border border-[#0E2A1C]/10 p-5"
                  >
                    <h3 className="font-display text-lg font-semibold text-[#0E2A1C]">
                      {title}
                    </h3>
                    <p className="mt-2 text-sm text-[#142019]/60">{desc}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative rounded-3xl overflow-hidden min-h-[360px] lg:min-h-[460px]">
              <img
                src="https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?auto=format&fit=crop&w=1200&q=80"
                alt="Plastic waste"
                className="absolute inset-0 w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* PROCESS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 py-16 sm:py-20 lg:py-24">
        <div className="max-w-3xl mb-12">
          <p className="text-sm font-semibold uppercase tracking-wider text-[#11402D]/60 mb-3">
            Recycling Process
          </p>

          <h2 className="font-display text-3xl sm:text-4xl lg:text-[44px] font-semibold text-[#0E2A1C] leading-tight">
            From waste plastic to valuable raw material.
          </h2>
        </div>

        <div className="relative">
          <div className="hidden lg:block absolute top-12 left-0 right-0 h-px bg-[#0E2A1C]/15" />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {process.map((item, index) => (
              <div
                key={item.title}
                className="relative bg-[#F6F8F4] rounded-3xl border border-[#0E2A1C]/10 p-6 hover:shadow-lg hover:shadow-[#0E2A1C]/10 transition"
              >
                <div className="w-14 h-14 rounded-2xl bg-[#0E2A1C] text-white flex items-center justify-center mb-6">
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
                Recycled Products
              </p>

              <h2 className="font-display text-3xl sm:text-4xl lg:text-[44px] font-semibold leading-tight">
                High-quality materials for new products.
              </h2>

              <p className="mt-6 text-white/65 leading-relaxed">
                Our recycling process produces materials that meet industry
                standards for new plastic products, packaging, and applications.
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

      {/* ENVIRONMENTAL IMPACT - Using plastic-recycling.jpg */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 py-16 sm:py-20 lg:py-24">
        <div className="rounded-[2rem] bg-white border border-[#0E2A1C]/10 overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-2">
            <div className="p-8 sm:p-12 lg:p-16">
              <Leaf className="w-10 h-10 text-[#11402D] mb-6" />

              <h2 className="font-display text-3xl sm:text-4xl font-semibold text-[#0E2A1C] leading-tight">
                Environmental benefits of plastic recycling.
              </h2>

              <p className="mt-5 text-[#142019]/65 leading-relaxed">
                Recycling plastic reduces oil consumption, lowers carbon
                emissions, and prevents plastic pollution. Every ton of recycled
                plastic saves valuable resources.
              </p>

              <div className="mt-8 grid grid-cols-2 gap-4">
                {[
                  ["88%", "less energy use"],
                  ["1.5 tons", "CO₂ saved/ton"],
                  ["16 barrels", "oil saved/ton"],
                  ["7.4 yards³", "landfill saved"],
                ].map(([value, label]) => (
                  <div
                    key={label}
                    className="rounded-2xl bg-[#F6F8F4] border border-[#0E2A1C]/10 p-4"
                  >
                    <h3 className="font-display text-xl font-semibold text-[#0E2A1C]">
                      {value}
                    </h3>
                    <p className="text-sm text-[#142019]/50 mt-1">{label}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative min-h-[360px]">
              <img
                src={environmentalImage}
                alt="Recycled plastic pellets"
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
                Better for the planet, economy, and future generations.
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
            <Recycle className="w-10 h-10 text-[#9CF06B] mx-auto mb-6" />

            <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-semibold max-w-3xl mx-auto leading-tight">
              Start recycling your plastic waste today.
            </h2>

            <p className="mt-5 text-white/70 max-w-xl mx-auto leading-relaxed">
              Connect with certified recyclers and turn your plastic waste into
              valuable recycled materials.
            </p>

            <div className="mt-8 flex flex-col sm:flex-row justify-center gap-4">
              <button className="w-full sm:w-auto px-7 py-3.5 rounded-full bg-white text-[#0E2A1C] font-semibold hover:bg-[#F6F8F4] transition flex items-center justify-center gap-2">
                Start Recycling
                <ArrowRight className="w-4 h-4" />
              </button>

              <button className="w-full sm:w-auto px-7 py-3.5 rounded-full border border-white/20 text-white font-semibold hover:bg-white/10 transition">
                Find Recyclers
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}