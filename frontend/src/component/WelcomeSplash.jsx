import React, { useEffect } from "react";
import { Recycle, Leaf, Zap, Droplet, Sun, Wind, Factory } from "lucide-react";
import logo from "../assets/logo.png";

export default function WelcomeSplash({ onFinish }) {
  useEffect(() => {
    // Show splash screen for 3.5 seconds
    const timer = setTimeout(() => {
      if (onFinish) {
        onFinish();
      }
    }, 1500);

    return () => {
      clearTimeout(timer);
    };
  }, [onFinish]);

  // Floating icons data
  const floatingIcons = [
    { id: 1, icon: Leaf, left: "5%", top: "10%", delay: "0s", duration: "8s", size: 32 },
    { id: 2, icon: Recycle, left: "88%", top: "15%", delay: "1s", duration: "10s", size: 40 },
    { id: 3, icon: Zap, left: "12%", top: "75%", delay: "0.5s", duration: "9s", size: 28 },
    { id: 4, icon: Leaf, left: "78%", top: "80%", delay: "2s", duration: "11s", size: 36 },
    { id: 5, icon: Recycle, left: "45%", top: "5%", delay: "1.5s", duration: "7s", size: 30 },
    { id: 6, icon: Zap, left: "92%", top: "50%", delay: "0.8s", duration: "9.5s", size: 34 },
    { id: 7, icon: Droplet, left: "3%", top: "42%", delay: "2.5s", duration: "8.5s", size: 28 },
    { id: 8, icon: Sun, left: "65%", top: "88%", delay: "1.2s", duration: "10.5s", size: 38 },
    { id: 9, icon: Wind, left: "30%", top: "8%", delay: "0.3s", duration: "7.5s", size: 32 },
    { id: 10, icon: Factory, left: "50%", top: "65%", delay: "1.8s", duration: "9s", size: 35 },
    { id: 11, icon: Leaf, left: "20%", top: "30%", delay: "0.7s", duration: "8s", size: 25 },
    { id: 12, icon: Recycle, left: "70%", top: "40%", delay: "2.2s", duration: "9.8s", size: 33 },
  ];

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-[#F6F8F4] overflow-hidden">
      {/* Floating Icons */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {floatingIcons.map((item) => {
          const Icon = item.icon;

          return (
            <div
              key={item.id}
              className="absolute animate-float"
              style={{
                left: item.left,
                top: item.top,
                animationDelay: item.delay,
                animationDuration: item.duration,
              }}
            >
              <Icon size={item.size} className="text-[#0E2A1C] opacity-20" />
            </div>
          );
        })}
      </div>

      {/* Main Content */}
      <div className="relative z-10 text-center px-6 animate-fadeIn">
        <img
          src={logo}
          alt="ReVive Energy"
          className="w-24 h-24 sm:w-28 sm:h-28 mx-auto object-contain animate-spin-logo"
        />

        <h1 className="mt-5 text-3xl sm:text-4xl font-bold text-[#0E2A1C]">
          Welcome to ReVive Energy
        </h1>

        <p className="mt-2 text-sm sm:text-base text-[#11402D] font-semibold">
          Transforming Waste Into Clean Energy
        </p>

        <div className="mt-6 flex items-center justify-center gap-2 text-[#11402D]">
          <Recycle className="w-5 h-5 animate-spin" />
          <span className="text-xs text-gray-500 animate-pulse">
            Preparing your clean energy experience...
          </span>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(12px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes float {
          0%, 100% {
            transform: translateY(0px) translateX(0px) rotate(0deg);
          }
          25% {
            transform: translateY(-20px) translateX(15px) rotate(5deg);
          }
          50% {
            transform: translateY(-10px) translateX(-10px) rotate(-3deg);
          }
          75% {
            transform: translateY(-15px) translateX(8px) rotate(2deg);
          }
        }

        @keyframes spinLogo {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }

        @keyframes spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }

        @keyframes pulse {
          0%, 100% {
            opacity: 0.5;
          }
          50% {
            opacity: 1;
          }
        }

        .animate-fadeIn {
          animation: fadeIn 0.6s ease-out;
        }

        .animate-float {
          animation-name: float;
          animation-iteration-count: infinite;
          animation-timing-function: ease-in-out;
        }

        .animate-spin-logo {
          animation: spinLogo 3s linear infinite;
        }

        .animate-spin {
          animation: spin 1.5s linear infinite;
        }

        .animate-pulse {
          animation: pulse 1.5s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}