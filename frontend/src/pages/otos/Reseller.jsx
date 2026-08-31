// frontend/src/pages/ResellerThankYou.jsx
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Sidebar from '../../components/Sidebar';
import Navbar from '../../components/Navbar';
import {
  CheckCircle,
  Gift,
  Rocket,
  Headphones,
  Copy,
  Check,
  Users,
  ArrowRight,
  Ticket,
  UserCheck,
  Store,
  Megaphone,
  ThumbsUp,
  Clock,
  Sparkles,
  ShieldCheck,
} from 'lucide-react';
import toast from 'react-hot-toast';

const ResellerThankYou = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [copied, setCopied] = useState(false);

  // Generate reseller code without DB call
  const resellerCode = 'RES-' + Date.now().toString().slice(-8);

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success('Copied to clipboard!');
    setTimeout(() => setCopied(false), 3000);
  };

  const handleContactSupport = () => {
    navigate('/support/ticket');
  };

  const steps = [
    {
      id: 1,
      icon: UserCheck,
      title: 'Reseller Access Activated',
      description: "Your reseller purchase has been successfully activated. You're now ready to request your reseller setup.",
    },
    {
      id: 2,
      icon: Ticket,
      title: 'Contact Support For Setup',
      description: 'Open a support ticket and provide your purchase details along with your preferred reseller information.',
    },
    {
      id: 3,
      icon: Clock,
      title: 'Verification & Setup',
      description: 'Our team will verify your request and guide you through the reseller setup process within 24 hours.',
    },
  ];


  return (
    <div className="flex min-h-screen bg-[#f5f6f8]">
      <Sidebar />
      <div className="flex-1 ml-0 md:ml-[18rem] flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-1 p-4 md:p-6 overflow-y-auto">
          <div className="max-w-4xl mx-auto">

            {/* Hero Section */}
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#111827] via-[#161b28] to-[#1a1a1a] p-8 md:p-12 mb-6 shadow-[0_20px_50px_-15px_rgba(0,0,0,0.5)] border border-[#FACC15]/20">
              {/* Background Decorations */}
              <div className="absolute top-0 right-0 w-72 h-72 bg-[#FACC15]/10 rounded-full blur-3xl -mr-24 -mt-24"></div>
              <div className="absolute bottom-0 left-0 w-56 h-56 bg-[#FACC15]/5 rounded-full blur-3xl -ml-20 -mb-20"></div>
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-[#FACC15]/3 rounded-full blur-3xl"></div>
              {/* Fine grid texture for premium feel */}
              <div
                className="absolute inset-0 opacity-[0.03]"
                style={{
                  backgroundImage:
                    'linear-gradient(#FACC15 1px, transparent 1px), linear-gradient(90deg, #FACC15 1px, transparent 1px)',
                  backgroundSize: '32px 32px',
                }}
              ></div>

              <div className="absolute top-4 right-8 text-[#FACC15] text-2xl opacity-20">✦</div>
              <div className="absolute bottom-4 left-8 text-[#FACC15] text-xl opacity-20">✦</div>

              <div className="relative z-10 text-center">


                <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-[#FACC15]/25 to-[#FACC15]/10 rounded-full mb-6 backdrop-blur-sm border border-[#FACC15]/30 shadow-[0_0_40px_-8px_rgba(250,204,21,0.4)]">
                  <CheckCircle className="w-11 h-11 text-[#FACC15]" strokeWidth={1.75} />
                </div>

                <h1 className="text-3xl md:text-5xl font-bold text-white mb-3 tracking-tight">
                  Reseller Access Activated
                </h1>
                <p className="text-[#FACC15]/90 text-lg max-w-2xl mx-auto mb-8">
                  Welcome to the Reseller Program. You're now ready to start offering this AI platform to your own customers.
                </p>

                {/* Reseller code card */}
                <div className="inline-flex items-center gap-3 bg-white/[0.06] backdrop-blur-sm border border-white/10 rounded-xl px-5 py-3">
                  <div className="text-left">
                    <p className="text-[10px] uppercase tracking-wider text-gray-400 font-medium mb-0.5">
                      Your Reseller Reference
                    </p>
                    <p className="text-white font-mono text-lg font-semibold tabular-nums tracking-wide">
                      {resellerCode}
                    </p>
                  </div>
                  <button
                    onClick={() => handleCopy(resellerCode)}
                    className="flex items-center justify-center w-9 h-9 rounded-lg bg-[#FACC15]/15 hover:bg-[#FACC15]/25 border border-[#FACC15]/20 transition-colors"
                    aria-label="Copy reseller code"
                  >
                    {copied ? (
                      <Check className="w-4 h-4 text-[#FACC15]" />
                    ) : (
                      <Copy className="w-4 h-4 text-[#FACC15]" />
                    )}
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-2.5">
                  Reference this code when you open your support ticket
                </p>
              </div>
            </div>

            {/* Steps Section */}
            <div className="bg-white rounded-2xl shadow-[0_1px_2px_rgba(0,0,0,0.04),0_8px_24px_-8px_rgba(0,0,0,0.06)] border border-gray-100 p-6 md:p-8 mb-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900 flex items-center gap-3">
                  <span className="flex items-center justify-center w-9 h-9 rounded-lg bg-[#FACC15]/15">
                    <Rocket className="w-5 h-5 text-[#B45309]" />
                  </span>
                  Next Steps
                </h2>
                <span className="text-xs font-medium text-gray-400">3 steps · ~5 min</span>
              </div>

              <div className="relative space-y-3">
                {/* Connector line */}
                <div className="absolute left-[1.6rem] top-8 bottom-8 w-px bg-gray-200 hidden sm:block"></div>

                {steps.map((step, index) => {
                  const Icon = step.icon;
                  return (
                    <div
                      key={step.id}
                      className="relative flex items-start gap-4 p-4 rounded-xl bg-gray-50/70 hover:bg-[#FFFBEB] transition-all duration-300 border border-transparent hover:border-[#FACC15]/30 hover:shadow-sm"
                    >
                      <div className="flex-shrink-0 relative z-10">
                        <div className="w-11 h-11 bg-white rounded-xl flex items-center justify-center border border-[#FACC15]/30 shadow-sm">
                          <Icon className="w-5 h-5 text-[#B45309]" />
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-[11px] font-bold text-[#B45309] bg-[#FACC15]/20 w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0">
                            {index + 1}
                          </span>
                          <h3 className="font-semibold text-gray-900">{step.title}</h3>
                        </div>
                        <p className="text-sm text-gray-600 mt-1 leading-relaxed">
                          {step.description}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Contact Support */}
            <div className="relative overflow-hidden bg-gradient-to-r from-[#FFFBEB] to-[#FEF3C7] rounded-2xl p-6 md:p-8 border border-[#FACC15]/30 mb-6">
              <div className="absolute -right-10 -top-10 w-40 h-40 bg-[#FACC15]/10 rounded-full blur-2xl"></div>
              <div className="relative text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-white rounded-2xl mb-4 shadow-sm border border-[#FACC15]/30">
                  <Headphones className="w-8 h-8 text-[#111827]" strokeWidth={1.75} />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  Contact Support For Reseller Setup
                </h2>
                <p className="text-gray-600 max-w-2xl mx-auto mb-6 leading-relaxed">
                  Open a support ticket with your purchase details and preferred reseller information.
                  Our team verifies and guides you through setup within 24 hours.
                </p>
                <button
                  onClick={handleContactSupport}
                  className="inline-flex items-center gap-2 px-8 py-3.5 bg-[#111827] text-white rounded-xl font-semibold hover:bg-black transition-all shadow-lg shadow-[#111827]/20 hover:shadow-xl hover:shadow-[#111827]/30 hover:-translate-y-0.5"
                >
                  <Ticket className="w-5 h-5" />
                  Open Support Ticket
                  <ArrowRight className="w-4 h-4" />
                </button>
                <p className="flex items-center justify-center gap-1.5 text-xs text-gray-500 mt-4">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#B45309]" />
                  Our support team typically responds within 24 hours
                </p>
              </div>
            </div>

            {/* Footer CTA */}
            <div className="relative overflow-hidden bg-gradient-to-br from-[#111827] to-[#1a1a1a] rounded-2xl p-6 md:p-8 text-center border border-[#FACC15]/20 shadow-[0_20px_50px_-15px_rgba(0,0,0,0.5)]">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-32 bg-[#FACC15]/10 rounded-full blur-3xl"></div>
              <div className="relative flex items-center justify-center gap-2 mb-4">
                <Sparkles className="w-6 h-6 text-[#FACC15]" />
                <h2 className="text-2xl md:text-3xl font-bold text-white">Ready to Start Selling?</h2>
                <Sparkles className="w-6 h-6 text-[#FACC15]" />
              </div>
              <p className="relative text-gray-400 max-w-2xl mx-auto mb-6">
                You're all set. Contact our support team to complete your reseller setup and start offering this platform to your customers today.
              </p>
              <button
                onClick={handleContactSupport}
                className="relative px-7 py-3.5 bg-[#FACC15] text-[#111827] rounded-xl font-semibold hover:bg-[#F59E0B] transition-all shadow-lg shadow-[#FACC15]/20 hover:shadow-xl hover:shadow-[#FACC15]/30 hover:-translate-y-0.5"
              >
                Contact Support Now
              </button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default ResellerThankYou;