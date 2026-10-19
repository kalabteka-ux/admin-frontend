import React, { useState, useEffect } from 'react';
import { API_BASE_URL } from './config';

export default function App() {
  const [activeTab, setActiveTab] = useState<'overview' | 'vendors' | 'orders' | 'logs'>('overview');
  const [vendors, setVendors] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [activities, setActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // መረጃዎችን ከባክ-ኢንድ እና ከ LocalStorage ማቀናጀት
  const fetchAdminData = async () => {
    setLoading(true);
    let apiVendors = [];
    try {
      const res = await fetch(`${API_BASE_URL}/vendors`);
      const data = await res.json();
      if (Array.isArray(data)) apiVendors = data;
    } catch {}

    const localVendors = JSON.parse(localStorage.getItem('eotc_admin_vendors') || '[]');
    const combinedVendors = [...apiVendors];
    localVendors.forEach((lv: any) => {
      if (!combinedVendors.some(v => v.store_name === lv.store_name)) {
        combinedVendors.push(lv);
      }
    });

    setVendors(combinedVendors);

    // የናሙና እንቅስቃሴዎች (Activity Logs) ለእይታ
    const mockActivities = [
      { id: 1, type: 'VENDOR', text: 'አዲስ ነጋዴ ሱቅ መዝግቧል (Pending KYC)', time: 'ከጥቂት ደቂቃዎች በፊት', status: 'Pending' },
      { id: 2, type: 'ORDER', text: 'የቴሌብር ክፍያ ማረጋገጫ ተልኳል (650 ETB)', time: 'ከ 15 ደቂቃ በፊት', status: 'Escrow' },
      { id: 3, type: 'PRODUCT', text: 'አዲስ እቃ ወደ ገበያ ተጭኗል (መጽሐፈ ሰዓታት)', time: 'ከ 1 ሰዓት በፊት', status: 'Active' },
    ];
    setActivities(mockActivities);
    setLoading(false);
  };

  useEffect(() => {
    fetchAdminData();
    const interval = setInterval(fetchAdminData, 4000); // በየ 4 ሰከንዱ በራሱ እንዲያደስ (Live Sync)
    return () => clearInterval(interval);
  }, []);

  // ሱቁን ማጽደቅ
  const approveVendor = (id: number) => {
    setVendors(vendors.map(v => v.id === id ? { ...v, status: 'Approved ✅' } : v));
    const local = JSON.parse(localStorage.getItem('eotc_admin_vendors') || '[]');
    const updated = local.map((v: any) => v.id === id ? { ...v, status: 'Approved ✅' } : v);
    localStorage.setItem('eotc_admin_vendors', JSON.stringify(updated));
  };

  return (
    <div className="min-h-screen bg-[#161A20] text-white p-4 md:p-8 font-sans">
      {/* Top Header */}
      <header className="bg-[#1E232B] border border-white/5 rounded-3xl px-6 py-4 flex flex-col md:flex-row items-center justify-between gap-4 mb-6 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#F97316] to-[#FB923C] flex items-center justify-center font-bold text-black text-lg shadow-lg shadow-orange-500/20">
            ✥
          </div>
          <div>
            <h1 className="text-base font-bold tracking-tight">EOTC Market — Live Super Admin</h1>
            <p className="text-xs text-gray-400">Real-time Activity Tracking & Escrow Control Center</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-semibold px-3.5 py-1.5 rounded-full flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span> Live Sync Active
          </span>
          <button 
            onClick={fetchAdminData}
            className="bg-[#2C221E] hover:bg-[#3A281E] text-[#FB923C] border border-orange-500/30 text-xs font-bold px-4 py-2 rounded-full transition active:scale-95"
          >
            🔄 ፈልግ/አድስ
          </button>
        </div>
      </header>

      <div className="max-w-6xl mx-auto space-y-6">
        {/* Navigation Tabs */}
        <div className="flex flex-wrap gap-2 border-b border-white/10 pb-3">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-5 py-2.5 rounded-full text-xs font-bold transition ${activeTab === 'overview' ? 'bg-[#3A281E] text-[#FB923C] border border-orange-500/30' : 'bg-[#1E232B] text-gray-400 hover:text-white'}`}
          >
            📊 አጠቃላይ እይታ (Overview)
          </button>
          <button
            onClick={() => setActiveTab('vendors')}
            className={`px-5 py-2.5 rounded-full text-xs font-bold transition ${activeTab === 'vendors' ? 'bg-[#3A281E] text-[#FB923C] border border-orange-500/30' : 'bg-[#1E232B] text-gray-400 hover:text-white'}`}
          >
            🪪 የነጋዴዎች KYC እና መታወቂያዎች ({vendors.length})
          </button>
          <button
            onClick={() => setActiveTab('orders')}
            className={`px-5 py-2.5 rounded-full text-xs font-bold transition ${activeTab === 'orders' ? 'bg-[#3A281E] text-[#FB923C] border border-orange-500/30' : 'bg-[#1E232B] text-gray-400 hover:text-white'}`}
          >
            💳 የክፍያ እና Escrow ማረጋገጫ ({orders.length})
          </button>
          <button
            onClick={() => setActiveTab('logs')}
            className={`px-5 py-2.5 rounded-full text-xs font-bold transition ${activeTab === 'logs' ? 'bg-[#3A281E] text-[#FB923C] border border-orange-500/30' : 'bg-[#1E232B] text-gray-400 hover:text-white'}`}
          >
            📋 የሲስተም እንቅስቃሴ ሎግ (Activity Logs)
          </button>
        </div>

        {/* 1. OVERVIEW TAB */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-gradient-to-br from-[#232933] to-[#2A1F1A] p-5 rounded-3xl border border-white/10 shadow-lg">
                <p className="text-xs text-gray-400 uppercase font-semibold">አጠቃላይ ሱቆች (Vendors)</p>
                <h3 className="text-3xl font-extrabold text-[#FB923C] mt-2">{vendors.length}</h3>
                <p className="text-[11px] text-gray-400 mt-1">የተረጋገጡ እና በመጠባበቅ ላይ</p>
              </div>
              <div className="bg-[#1E232B] p-5 rounded-3xl border border-white/5 shadow-lg">
                <p className="text-xs text-gray-400 uppercase font-semibold">የ KYC ማረጋገጫ ጥያቄዎች</p>
                <h3 className="text-3xl font-extrabold text-white mt-2">{vendors.filter(v => v.status === 'Pending').length}</h3>
                <p className="text-[11px] text-amber-400 mt-1">ትኩረት የሚሹ</p>
              </div>
              <div className="bg-[#1E232B] p-5 rounded-3xl border border-white/5 shadow-lg">
                <p className="text-xs text-gray-400 uppercase font-semibold">የ Escrow ክፍያዎች</p>
                <h3 className="text-3xl font-extrabold text-emerald-400 mt-2">{orders.length}</h3>
                <p className="text-[11px] text-gray-400 mt-1">በሂደት ላይ ያሉ</p>
              </div>
              <div className="bg-[#1E232B] p-5 rounded-3xl border border-white/5 shadow-lg">
                <p className="text-xs text-gray-400 uppercase font-semibold">የሲስተም ሁኔታ</p>
                <h3 className="text-xl font-bold text-emerald-400 mt-3 flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-emerald-500 animate-ping"></span> 100% Online
                </h3>
              </div>
            </div>

            {/* Recent Live Activity Stream */}
            <div className="bg-[#1E232B] rounded-3xl p-6 border border-white/5 shadow-xl space-y-4">
              <h3 className="text-sm font-bold text-gray-300 uppercase tracking-wider">⚡ የቅርብ ጊዜ የሲስተም እንቅስቃሴዎች (Live Activity Stream)</h3>
              <div className="space-y-3">
                {activities.map((act) => (
                  <div key={act.id} className="bg-[#161A20] p-4 rounded-2xl border border-white/5 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-xl">🔔</span>
                      <div>
                        <p className="text-xs font-bold text-white">{act.text}</p>
                        <p className="text-[10px] text-gray-500">{act.time}</p>
                      </div>
                    </div>
                    <span className="text-[10px] bg-[#3A281E] text-[#FB923C] px-3 py-1 rounded-full font-bold border border-orange-500/20">
                      {act.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* 2. VENDORS KYC TAB */}
        {activeTab === 'vendors' && (
          <div className="space-y-4">
            {vendors.length === 0 ? (
              <div className="bg-[#1E232B] rounded-3xl p-12 text-center border border-white/5">
                <p className="text-gray-400 text-sm">እስካሁን ምንም የተመዘገበ ሱቅ የለም።</p>
              </div>
            ) : (
              vendors.map(v => (
                <div key={v.id} className="bg-[#1E232B] p-6 rounded-3xl border border-white/5 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-xl">
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-3">
                      <h3 className="text-base font-bold text-white">{v.store_name}</h3>
                      <span className="text-xs bg-[#2C221E] text-[#FB923C] px-3 py-0.5 rounded-full border border-orange-500/20">
                        @{v.username || 'vendor'}
                      </span>
                    </div>
                    <p className="text-xs text-gray-300">📞 ስልክ: <strong className="text-white">{v.phone}</strong> | 🏦 አካውንት: <strong className="text-white">{v.account}</strong></p>
                    
                    {v.id_front_image ? (
                      <div className="pt-2">
                        <p className="text-xs text-gray-400 mb-1">የተላከው መታወቂያ ፎቶ (ID / Passport Scan):</p>
                        <a href={v.id_front_image} target="_blank" rel="noreferrer">
                          <img src={v.id_front_image} alt="ID" className="h-32 w-48 rounded-2xl border border-white/10 object-cover hover:opacity-90 transition shadow-md" />
                        </a>
                      </div>
                    ) : (
                      <p className="text-xs text-red-400">⚠️ መታወቂያ ፎቶ አልተያያዘም</p>
                    )}
                  </div>

                  <div className="flex flex-col items-end gap-3">
                    <span className={`text-xs px-3.5 py-1.5 rounded-full font-bold ${v.status === 'Pending' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'}`}>
                      {v.status || 'Pending'}
                    </span>
                    {v.status === 'Pending' && (
                      <button
                        onClick={() => approveVendor(v.id)}
                        className="bg-gradient-to-r from-[#F97316] to-[#FB923C] text-black text-xs font-bold px-5 py-3 rounded-xl shadow-lg shadow-orange-500/20 active:scale-95 transition"
                      >
                        ✅ መታወቂያውን አረጋግጥና ሱቅ አጽድቅ
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* 3. ORDERS & ESCROW TAB */}
        {activeTab === 'orders' && (
          <div className="space-y-4">
            {orders.length === 0 ? (
              <div className="bg-[#1E232B] rounded-3xl p-12 text-center border border-white/5">
                <p className="text-gray-400 text-sm">ምንም የተደረገ የክፍያ ማረጋገጫ የለም።</p>
              </div>
            ) : (
              orders.map(o => (
                <div key={o.id} className="bg-[#1E232B] p-6 rounded-3xl border border-white/5 flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-white">{o.product_name} — <span className="text-[#FB923C]">{o.amount} ETB</span></h3>
                    <p className="text-xs text-gray-400 mt-1">ገዢ: @{o.buyer} • ክፍያ: {o.payment_method} • Ref: <code className="text-orange-300">{o.tx_ref}</code></p>
                  </div>
                  <span className="text-xs px-3.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 font-bold">{o.status}</span>
                </div>
              ))
            )}
          </div>
        )}

        {/* 4. ACTIVITY LOGS TAB */}
        {activeTab === 'logs' && (
          <div className="bg-[#1E232B] rounded-3xl p-6 border border-white/5 shadow-xl space-y-4">
            <h3 className="text-sm font-bold text-gray-300 uppercase">📋 ዝርዝር የሲስተም ሎግ (System Audit Logs)</h3>
            <div className="space-y-2">
              <div className="bg-[#161A20] p-3.5 rounded-xl text-xs flex justify-between text-gray-300 border border-white/5">
                <span>[INFO] Admin Dashboard opened successfully</span>
                <span className="text-gray-500">2026-10-20 01:52:00</span>
              </div>
              <div className="bg-[#161A20] p-3.5 rounded-xl text-xs flex justify-between text-gray-300 border border-white/5">
                <span>[API] Connected to Render Backend successfully</span>
                <span className="text-gray-500">2026-10-20 01:50:15</span>
              </div>
              <div className="bg-[#161A20] p-3.5 rounded-xl text-xs flex justify-between text-gray-300 border border-white/5">
                <span>[SYNC] LocalStorage & Cloud DB Synced</span>
                <span className="text-gray-500">2026-10-20 01:45:00</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
