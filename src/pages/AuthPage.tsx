import React, { useState, useEffect } from 'react';
import { ShieldCheck, User, Mail, Lock, CreditCard, ArrowRight, Building, Key, CheckCircle, AlertCircle } from 'lucide-react';
import { db } from '../services/db';
import type { Village } from '../types';

interface AuthPageProps {
  onLoginSuccess: (userId: string) => void;
  onBypassGuest: () => void;
}

export const AuthPage: React.FC<AuthPageProps> = ({ onLoginSuccess, onBypassGuest }) => {
  // Tabs: 'citizen' | 'official'
  const [activeTab, setActiveTab] = useState<'citizen' | 'official'>('citizen');
  // Citizen modes: 'login' | 'signup'
  const [citizenMode, setCitizenMode] = useState<'login' | 'signup'>('login');
  
  // Dynamic fields
  const [villages, setVillages] = useState<Village[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [successMsg, setSuccessMsg] = useState<string>('');

  // Form Fields - Citizen Registration
  const [citizenName, setCitizenName] = useState('');
  const [citizenAadhaar, setCitizenAadhaar] = useState('');
  const [citizenEmail, setCitizenEmail] = useState('');
  const [citizenPassword, setCitizenPassword] = useState('');
  const [selectedVillageId, setSelectedVillageId] = useState('');

  // Form Fields - Citizen Login
  const [loginAadhaarOrEmail, setLoginAadhaarOrEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Form Fields - Official Login
  const [officialEmail, setOfficialEmail] = useState('');
  const [officialPassword, setOfficialPassword] = useState('');

  // Aadhaar OTP Simulation State
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [generatedOtp, setGeneratedOtp] = useState('');
  const [enteredOtp, setEnteredOtp] = useState('');
  const [otpError, setOtpError] = useState('');

  // Load villages on mount
  useEffect(() => {
    const loadData = async () => {
      try {
        const list = await db.getVillages();
        setVillages(list);
        if (list.length > 0) {
          setSelectedVillageId(list[0].id);
        }
      } catch (err) {
        console.error('Error loading villages', err);
      }
    };
    loadData();
  }, []);

  const handleCitizenLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginAadhaarOrEmail) {
      setErrorMsg('Please enter your Aadhaar number or Email address.');
      return;
    }
    
    setLoading(true);
    setErrorMsg('');
    
    try {
      const isAadhaar = /^\d+$/.test(loginAadhaarOrEmail);
      if (isAadhaar && loginAadhaarOrEmail.length !== 12) {
        throw new Error('Aadhaar number must be exactly 12 digits.');
      }
      
      const profile = await db.signInUser(
        loginAadhaarOrEmail, 
        isAadhaar ? undefined : loginPassword, 
        'citizen'
      );
      
      if (profile) {
        setSuccessMsg(`Welcome back, ${profile.full_name}!`);
        setTimeout(() => {
          onLoginSuccess(profile.id);
        }, 1000);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleOfficialLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!officialEmail || !officialPassword) {
      setErrorMsg('Please fill in all credentials.');
      return;
    }
    
    setLoading(true);
    setErrorMsg('');
    
    try {
      const profile = await db.signInUser(officialEmail, officialPassword, 'official');
      if (profile) {
        setSuccessMsg(`Access Granted. Role: ${profile.role}`);
        setTimeout(() => {
          onLoginSuccess(profile.id);
        }, 1000);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Login failed. Please check your government credentials.');
    } finally {
      setLoading(false);
    }
  };

  // Step 1 of SignUp: Validate and trigger simulated OTP
  const triggerOtpDispatch = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    
    if (!citizenName || !citizenAadhaar || !citizenEmail || !citizenPassword || !selectedVillageId) {
      setErrorMsg('Please fill in all registration fields.');
      return;
    }

    if (citizenAadhaar.length !== 12 || !/^\d{12}$/.test(citizenAadhaar)) {
      setErrorMsg('Aadhaar number must be a valid 12-digit number.');
      return;
    }

    // Generate random 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedOtp(otp);
    setEnteredOtp('');
    setOtpError('');
    setShowOtpModal(true);
  };

  // Step 2 of SignUp: Verify OTP and write to Database
  const verifyOtpAndSignUp = async () => {
    if (enteredOtp !== generatedOtp) {
      setOtpError('Incorrect OTP verification code. Please try again.');
      return;
    }

    setShowOtpModal(false);
    setLoading(true);
    setErrorMsg('');

    try {
      const villageObj = villages.find(v => v.id === selectedVillageId);
      const constituencyId = villageObj ? villageObj.constituency_id : '';

      const user = await db.signUpUser(
        citizenEmail,
        citizenPassword,
        citizenName,
        'Citizen',
        constituencyId,
        selectedVillageId,
        citizenAadhaar
      );

      if (user) {
        setSuccessMsg('Account created & Aadhaar verified successfully!');
        setTimeout(() => {
          onLoginSuccess(user.id);
        }, 1500);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Signup failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-tr from-slate-900 via-slate-800 to-indigo-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden font-sans">
      
      {/* Visual background accents */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-saffron/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        {/* National Emblem Flag Theme Ribbon */}
        <div className="flex justify-center mb-6">
          <div className="flex h-3 w-36 rounded-full overflow-hidden shadow-md">
            <div className="flex-1 bg-[#FF9933]" />
            <div className="flex-1 bg-white flex items-center justify-center">
              <div className="w-1.5 h-1.5 rounded-full border border-blue-900 animate-spin" />
            </div>
            <div className="flex-1 bg-[#138808]" />
          </div>
        </div>

        <h2 className="text-center text-3xl font-extrabold text-white tracking-tight drop-shadow-md">
          Transgov India
        </h2>
        <p className="mt-2 text-center text-sm text-slate-300">
          Constituency Fund Transparency & Citizen Grievance Portal
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-lg relative z-10 px-4 sm:px-0">
        <div className="bg-slate-900/80 backdrop-blur-xl border border-slate-700/50 py-8 px-4 shadow-2xl sm:rounded-2xl sm:px-10">
          
          {/* Custom Switcher Tabs */}
          <div className="flex bg-slate-950/60 p-1.5 rounded-xl border border-slate-800 mb-8">
            <button
              onClick={() => {
                setActiveTab('citizen');
                setErrorMsg('');
                setSuccessMsg('');
              }}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-xs font-bold rounded-lg transition-all ${
                activeTab === 'citizen'
                  ? 'bg-gradient-to-r from-saffron to-orange-500 text-slate-950 shadow-md transform scale-[1.02]'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <User size={14} />
              <span>Citizen Portal</span>
            </button>
            <button
              onClick={() => {
                setActiveTab('official');
                setErrorMsg('');
                setSuccessMsg('');
              }}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-xs font-bold rounded-lg transition-all ${
                activeTab === 'official'
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-md transform scale-[1.02]'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Building size={14} />
              <span>Official Panel</span>
            </button>
          </div>

          {/* Feedback messages */}
          {errorMsg && (
            <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs flex items-start gap-2.5">
              <AlertCircle className="shrink-0 mt-0.5" size={16} />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="mb-6 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-start gap-2.5">
              <CheckCircle className="shrink-0 mt-0.5" size={16} />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Citizen Portal Form */}
          {activeTab === 'citizen' && (
            <div>
              {/* Form Toggle: Login vs Signup */}
              <div className="flex justify-center gap-6 mb-6 text-xs border-b border-slate-800 pb-3">
                <button
                  type="button"
                  onClick={() => setCitizenMode('login')}
                  className={`pb-1 border-b-2 font-bold transition-all ${
                    citizenMode === 'login'
                      ? 'border-saffron text-saffron'
                      : 'border-transparent text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Sign In with Aadhaar
                </button>
                <button
                  type="button"
                  onClick={() => setCitizenMode('signup')}
                  className={`pb-1 border-b-2 font-bold transition-all ${
                    citizenMode === 'signup'
                      ? 'border-saffron text-saffron'
                      : 'border-transparent text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Register (Aadhaar Verified)
                </button>
              </div>

              {citizenMode === 'login' ? (
                // Citizen Login Form
                <form onSubmit={handleCitizenLogin} className="space-y-5">
                  <div>
                    <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                      Aadhaar Number or Registered Email
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                        <CreditCard size={16} />
                      </div>
                      <input
                        type="text"
                        required
                        value={loginAadhaarOrEmail}
                        onChange={(e) => setLoginAadhaarOrEmail(e.target.value)}
                        placeholder="12-digit Aadhaar or email@example.com"
                        className="block w-full pl-10 pr-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-1 focus:ring-saffron focus:border-saffron transition-all"
                      />
                    </div>
                    <p className="mt-1.5 text-[10px] text-slate-500">
                      Demo citizen: Enter Aadhaar <code className="text-slate-400 font-mono">123456789012</code>
                    </p>
                  </div>

                  {/* Password field only shown if entering an email address */}
                  {!/^\d*$/.test(loginAadhaarOrEmail) && loginAadhaarOrEmail.length > 0 && (
                    <div>
                      <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                        Password
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                          <Lock size={16} />
                        </div>
                        <input
                          type="password"
                          required
                          value={loginPassword}
                          onChange={(e) => setLoginPassword(e.target.value)}
                          placeholder="••••••••"
                          className="block w-full pl-10 pr-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-1 focus:ring-saffron focus:border-saffron transition-all"
                        />
                      </div>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-gradient-to-r from-saffron to-orange-500 text-slate-950 text-sm font-black rounded-xl hover:from-orange-400 hover:to-amber-500 transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 disabled:opacity-50 cursor-pointer shadow-lg shadow-orange-600/10 hover:shadow-orange-600/20"
                  >
                    <span>{loading ? 'Verifying Session...' : 'Sign In'}</span>
                    <ArrowRight size={16} />
                  </button>
                </form>
              ) : (
                // Citizen Registration Form
                <form onSubmit={triggerOtpDispatch} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                        Full Name (as in Aadhaar)
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                          <User size={14} />
                        </div>
                        <input
                          type="text"
                          required
                          value={citizenName}
                          onChange={(e) => setCitizenName(e.target.value)}
                          placeholder="e.g. Amit Patel"
                          className="block w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-600 text-xs focus:outline-none focus:ring-1 focus:ring-saffron transition-all"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                        Aadhaar Number
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                          <CreditCard size={14} />
                        </div>
                        <input
                          type="text"
                          required
                          maxLength={12}
                          value={citizenAadhaar}
                          onChange={(e) => setCitizenAadhaar(e.target.value.replace(/\D/g, ''))}
                          placeholder="12-digit Unique ID"
                          className="block w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-600 text-xs focus:outline-none focus:ring-1 focus:ring-saffron transition-all"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                      Village (For Fund Allocation & Governance)
                    </label>
                    <select
                      value={selectedVillageId}
                      onChange={(e) => setSelectedVillageId(e.target.value)}
                      className="block w-full py-2 px-3 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs focus:outline-none focus:ring-1 focus:ring-saffron transition-all"
                    >
                      {villages.map((v) => (
                        <option key={v.id} value={v.id}>
                          {v.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                        Email Address
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                          <Mail size={14} />
                        </div>
                        <input
                          type="email"
                          required
                          value={citizenEmail}
                          onChange={(e) => setCitizenEmail(e.target.value)}
                          placeholder="email@example.com"
                          className="block w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-600 text-xs focus:outline-none focus:ring-1 focus:ring-saffron transition-all"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                        Password
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                          <Lock size={14} />
                        </div>
                        <input
                          type="password"
                          required
                          value={citizenPassword}
                          onChange={(e) => setCitizenPassword(e.target.value)}
                          placeholder="Min 6 characters"
                          className="block w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-600 text-xs focus:outline-none focus:ring-1 focus:ring-saffron transition-all"
                        />
                      </div>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full mt-2 flex items-center justify-center gap-2 py-2.5 px-4 bg-gradient-to-r from-saffron to-orange-500 text-slate-950 text-xs font-black rounded-xl hover:from-orange-400 hover:to-amber-500 transition-all disabled:opacity-50 cursor-pointer shadow-lg shadow-orange-600/10"
                  >
                    <span>Request UIDAI SMS Verification</span>
                    <ArrowRight size={14} />
                  </button>
                </form>
              )}
            </div>
          )}

          {/* Official Panel Form */}
          {activeTab === 'official' && (
            <form onSubmit={handleOfficialLogin} className="space-y-5">
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                  Official Email Address (Gov ID)
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                    <Mail size={16} />
                  </div>
                  <input
                    type="email"
                    required
                    value={officialEmail}
                    onChange={(e) => setOfficialEmail(e.target.value)}
                    placeholder="official.name@gov.in"
                    className="block w-full pl-10 pr-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
                  />
                </div>
                <p className="mt-1.5 text-[10px] text-slate-500 leading-normal">
                  Demo credentials: <code className="text-slate-400">mla.indore@gov.in</code> (MLA) or{' '}
                  <code className="text-slate-400">commissioner.indore@gov.in</code> (Authority) or{' '}
                  <code className="text-slate-400">contractor.patel@infra.in</code> (Contractor)
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                    <Lock size={16} />
                  </div>
                  <input
                    type="password"
                    required
                    value={officialPassword}
                    onChange={(e) => setOfficialPassword(e.target.value)}
                    placeholder="••••••••"
                    className="block w-full pl-10 pr-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-gradient-to-r from-emerald-500 to-teal-600 text-white text-sm font-black rounded-xl hover:from-emerald-450 hover:to-teal-500 transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 disabled:opacity-50 cursor-pointer shadow-lg shadow-emerald-500/10 hover:shadow-emerald-500/20"
              >
                <span>{loading ? 'Authenticating...' : 'Sign In as Official'}</span>
                <ArrowRight size={16} />
              </button>
            </form>
          )}

          {/* Guest Mode & Demo Helper Link */}
          <div className="mt-8 pt-6 border-t border-slate-850 flex items-center justify-between text-xs">
            <span className="text-slate-500">Evaluating this application?</span>
            <button
              onClick={onBypassGuest}
              className="text-saffron hover:text-orange-400 font-bold hover:underline cursor-pointer flex items-center gap-1"
            >
              <span>View as Guest / Demo Mode</span>
              <ArrowRight size={12} />
            </button>
          </div>

        </div>
      </div>

      {/* Aadhaar OTP Simulation Modal */}
      {showOtpModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* National emblem flag header */}
            <div className="h-1.5 w-full flex">
              <div className="flex-1 bg-[#FF9933]" />
              <div className="flex-1 bg-white" />
              <div className="flex-1 bg-[#138808]" />
            </div>

            <div className="p-6">
              <div className="flex items-center gap-3 text-saffron mb-4">
                <ShieldCheck size={28} className="text-[#FF9933]" />
                <div>
                  <h3 className="text-sm font-black text-white">UIDAI Aadhaar Verification</h3>
                  <p className="text-[10px] text-slate-400">Government of India Identity Authentication</p>
                </div>
              </div>

              <p className="text-slate-300 text-xs leading-relaxed mb-4">
                A verification passcode has been dispatched to the mobile number registered with your Aadhaar Card{' '}
                <strong className="text-white">XXXX-XXXX-{citizenAadhaar.slice(-4)}</strong>.
              </p>

              {/* Simulated Mobile Alert (Visual Demonstration) */}
              <div className="bg-indigo-950/50 border border-indigo-500/20 rounded-xl p-3.5 mb-5 space-y-1">
                <div className="flex items-center justify-between text-[9px] uppercase tracking-wider text-indigo-400 font-bold">
                  <span>📩 SIMULATED SMS NOTIFICATION</span>
                  <span>JUST NOW</span>
                </div>
                <p className="text-xs text-white leading-normal">
                  "Govt OTP: <strong className="text-saffron font-mono text-sm tracking-widest">{generatedOtp}</strong> is your verification code for Transgov India portal. Do not share."
                </p>
              </div>

              {otpError && (
                <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-300 text-xs flex items-center gap-2">
                  <AlertCircle size={14} className="shrink-0" />
                  <span>{otpError}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                  Enter 6-digit Passcode
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                    <Key size={16} />
                  </div>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    value={enteredOtp}
                    onChange={(e) => setEnteredOtp(e.target.value.replace(/\D/g, ''))}
                    placeholder="Enter 6-digit OTP"
                    className="block w-full pl-10 pr-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-700 font-mono text-lg tracking-widest text-center focus:outline-none focus:ring-1 focus:ring-saffron transition-all"
                  />
                </div>
              </div>

              <div className="mt-6 flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setShowOtpModal(false)}
                  className="flex-1 py-2.5 px-4 bg-slate-800 text-slate-300 text-xs font-bold rounded-xl hover:bg-slate-700 transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={verifyOtpAndSignUp}
                  className="flex-1 py-2.5 px-4 bg-gradient-to-r from-saffron to-orange-500 text-slate-950 text-xs font-black rounded-xl hover:from-orange-400 hover:to-amber-500 transition-all shadow-md cursor-pointer"
                >
                  Verify Aadhaar
                </button>
              </div>

            </div>
          </div>
        </div>
      )}
      
    </div>
  );
};
export default AuthPage;
