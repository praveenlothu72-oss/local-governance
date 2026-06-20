import React from 'react';
import { IndianRupee, ShieldAlert, Award, Compass, ArrowRight } from 'lucide-react';

interface LandingPageProps {
  setActivePage: (page: string) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ setActivePage }) => {
  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-b from-slate-50 to-slate-100 flex flex-col font-sans">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-16 px-4 md:py-24 md:px-8 text-center bg-slate-900 text-white rounded-b-3xl shadow-lg">
        {/* Decorative background grid and gradients */}
        <div className="absolute inset-0 opacity-10 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px]"></div>
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-96 h-96 bg-saffron/20 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 left-1/2 -translate-x-1/2 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl"></div>

        <div className="relative max-w-4xl mx-auto space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-slate-700 bg-slate-800/80 text-xs font-semibold text-saffron tracking-wider uppercase shadow">
            <span>🇮🇳 PS-15: Viksit Bharat 2047</span>
          </div>

          <h1 className="text-3xl md:text-5xl lg:text-6xl font-black tracking-tight leading-tight">
            Transparent Funds.<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-saffron via-white to-emerald-400">Accountable Development.</span><br />
            Empowered Citizens.
          </h1>

          <p className="text-sm md:text-lg text-slate-400 max-w-2xl mx-auto font-medium">
            Bridging the gap between constituency funds, contractor executions, and citizen oversight to build a corruption-free, digitally verified India.
          </p>

          <div className="flex flex-col sm:flex-row justify-center items-center gap-4 pt-4">
            <button
              onClick={() => setActivePage('fund-dash')}
              className="w-full sm:w-auto flex items-center justify-center gap-2 py-3.5 px-6 rounded-xl bg-saffron text-slate-950 font-bold hover:bg-orange-400 hover:scale-105 active:scale-95 transition-all shadow-lg shadow-orange-500/20 text-sm"
            >
              <span>View Constituency Funds</span>
              <ArrowRight size={16} />
            </button>
            <button
              onClick={() => setActivePage('raise-issue')}
              className="w-full sm:w-auto flex items-center justify-center gap-2 py-3.5 px-6 rounded-xl border border-slate-700 bg-slate-800/50 text-slate-200 font-semibold hover:bg-slate-800 hover:text-white hover:border-slate-600 transition-all text-sm"
            >
              <span>Raise Village Issue</span>
            </button>
          </div>
        </div>
      </section>

      {/* Pillars Section */}
      <section className="max-w-6xl mx-auto px-4 py-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 flex-1">
        {/* Card 1 */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 hover:shadow-md hover:border-slate-300 hover:-translate-y-1 transition-all group flex flex-col justify-between">
          <div className="space-y-4">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-orange-50 text-saffron group-hover:bg-saffron group-hover:text-slate-950 transition-colors">
              <IndianRupee size={22} />
            </div>
            <h3 className="font-bold text-slate-800 text-base">Fund Transparency</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Every single rupee of budget allocation is tracked village-wise. Citizens can audit the exact amounts approved, spent, and leftover.
            </p>
          </div>
          <button 
            onClick={() => setActivePage('fund-dash')}
            className="flex items-center gap-1.5 text-xs text-saffron font-bold hover:text-orange-600 mt-6 group-hover:translate-x-1 transition-transform"
          >
            <span>Audit Funds</span>
            <ArrowRight size={12} />
          </button>
        </div>

        {/* Card 2 */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 hover:shadow-md hover:border-slate-300 hover:-translate-y-1 transition-all group flex flex-col justify-between">
          <div className="space-y-4">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
              <Award size={22} />
            </div>
            <h3 className="font-bold text-slate-800 text-base">Contractor Ratings</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Contractors are graded based on citizen ratings and post-completion complaints. View rankings, projects, and geo-tagged proof of work.
            </p>
          </div>
          <button 
            onClick={() => setActivePage('citizen-dash')}
            className="flex items-center gap-1.5 text-xs text-emerald-600 font-bold hover:text-emerald-700 mt-6 group-hover:translate-x-1 transition-transform"
          >
            <span>Explore Works</span>
            <ArrowRight size={12} />
          </button>
        </div>

        {/* Card 3 */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 hover:shadow-md hover:border-slate-300 hover:-translate-y-1 transition-all group flex flex-col justify-between">
          <div className="space-y-4">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
              <Compass size={22} />
            </div>
            <h3 className="font-bold text-slate-800 text-base">Citizen Voice</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Raise local public complaints with photo proof and geo-coordinates. Upvote neighboring problems to automatically escalate them.
            </p>
          </div>
          <button 
            onClick={() => setActivePage('vote-issue')}
            className="flex items-center gap-1.5 text-xs text-blue-600 font-bold hover:text-blue-700 mt-6 group-hover:translate-x-1 transition-transform"
          >
            <span>Vote on Issues</span>
            <ArrowRight size={12} />
          </button>
        </div>

        {/* Card 4 */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 hover:shadow-md hover:border-slate-300 hover:-translate-y-1 transition-all group flex flex-col justify-between">
          <div className="space-y-4">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-red-50 text-red-600 group-hover:bg-red-600 group-hover:text-white transition-colors">
              <ShieldAlert size={22} />
            </div>
            <h3 className="font-bold text-slate-800 text-base">Viksit Bharat 2047</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Accelerating Indias journey to a developed nation by introducing digital accountability, smart anomalies, and audit log trails.
            </p>
          </div>
          <button 
            onClick={() => setActivePage('analytics')}
            className="flex items-center gap-1.5 text-xs text-red-600 font-bold hover:text-red-700 mt-6 group-hover:translate-x-1 transition-transform"
          >
            <span>Smart Anomalies</span>
            <ArrowRight size={12} />
          </button>
        </div>
      </section>
    </div>
  );
};
export default LandingPage;
