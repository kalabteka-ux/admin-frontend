import React, { useState, useEffect } from 'react';
import { API_BASE_URL } from './config';

export default function App() {
  const [activeTab, setActiveTab] = useState<'vendors' | 'orders'>('vendors');
  const [vendors, setVendors] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);

  const fetchAdminData = async () => {
    let apiVendors = [];
    try {
      const res = await fetch(`${API_BASE_URL}/vendors`);
      const data = await res.json();
      if (Array.isArray(data)) apiVendors = data;
    } catch {}

    // ከ LocalStorage የተያዙትንም (Fallback) ጭምር በማቀላቀል ማሳየት
    const localVendors = JSON.parse(localStorage.getItem('eotc_admin_vendors') || '[]');
    
    // ሁለቱን አቀናጅቶ ማሳየት (Duplicate እንዳይኖር)
    const combined = [...apiVendors];
    localVendors.forEach((lv: any) => {
      if (!combined.some(v => v.store_name === lv.store_name)) {
        combined.push(lv);
      }
    });

    setVendors(combined);
  };

  useEffect(() => {
    fetchAdminData();
    const interval = setInterval(fetchAdminData, 3000); // በየ 3 ሰከንዱ ማደስ
    return () => clearInterval(interval);
  }, []);

  const approveVendor = (id: number) => {
    setVendors(vendors.map(v => v.id === id ? { ...v, status: 'Approved ✅' } : v));
    // LocalStorage ላይም Status ማስተካከል
    const local = JSON.parse(localStorage.getItem('eotc_admin_vendors') || '[]');
    const updated = local.map((v: any) => v.id === id ? { ...v, status: 'Approved ✅' } : v);
    localStorage.setItem('eotc_admin_vendors', JSON.stringify(updated));
  };

  return (
    <div className="min-h-screen bg-[#161A20] text-white p-6 font-sans">
      <header className="bg-[#1E232B] border border-white/5 rounded-3xl px-6 py-4 flex items-center justify-between mb-6 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-[#FB923C] flex items-center justify-center font-bold text-black text-lg">✥</div>
          <div>
            <h1 className="text-base font-bold">EOTC Market — Super Admin Dashboard</h1>
            <p className="text-xs text-gray-400">Live KYC & ID Verification Center</p>
          </div>
        </div>
        <button onClick={fetchAdminData} className="bg-[#2C221E] text-[#FB923C] border border-orange-500/30 text-xs font-bold px-4 py-2.5 rounded-full">
          🔄 Refresh
        </button>
      </header>

      <div className="max-w-5xl mx-auto space-y-6">
        <div className="flex gap-3 border-b border-white/10 pb-3">
          <button className="px-5 py-2.5 rounded-full text-xs font-bold bg-[#3A281E] text-[#FB923C] border border-orange-500/30">
            🪪 የነጋዴዎች KYC እና መታወቂያዎች ({vendors.length})
          </button>
        </div>

        <div className="space-y-4">
          {vendors.length === 0 ? (
            <div className="bg-[#1E232B] rounded-3xl p-12 text-center border border-white/5">
              <p className="text-gray-400 text-sm">እስካሁን ምንም አዲስ የ KYC ምዝገባ ጥያቄ አልመጣም።</p>
              <p className="text-xs text-gray-500 mt-1">ሚኒ አፑ ላይ ሱቅ እና መታወቂያ ሲያስገቡ ወዲያውኑ እዚህ ይመጣል።</p>
            </div>
          ) : (
            vendors.map(v => (
              <div key={v.id} className="bg-[#1E232B] p-6 rounded-3xl border border-white/5 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-lg">
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <h3 className="text-base font-bold text-white">{v.store_name}</h3>
                    <span className="text-xs bg-[#2C221E] text-[#FB923C] px-3 py-0.5 rounded-full">@{v.username}</span>
                  </div>
                  <p className="text-xs text-gray-300">📞 ስልክ: {v.phone} | 🏦 አካውንት: {v.account}</p>
                  
                  {v.id_front_image ? (
                    <div className="pt-2">
                      <p className="text-xs text-gray-400 mb-1">የተላከው መታወቂያ ፎቶ (ID Scan):</p>
                      <a href={v.id_front_image} target="_blank" rel="noreferrer">
                        <img src={v.id_front_image} alt="ID" className="h-32 w-48 rounded-2xl border border-white/10 object-cover shadow-md" />
                      </a>
                    </div>
                  ) : (
                    <p className="text-xs text-red-400">⚠️ መታወቂያ ፎቶ የለውም</p>
                  )}
                </div>

                <div className="flex flex-col items-end gap-3">
                  <span className={`text-xs px-3.5 py-1.5 rounded-full font-bold ${v.status === 'Pending' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' : 'bg-emerald-500/20 text-emerald-300'}`}>
                    {v.status || 'Pending'}
                  </span>
                  {v.status === 'Pending' && (
                    <button onClick={() => approveVendor(v.id)} className="bg-[#FB923C] text-black text-xs font-bold px-5 py-3 rounded-xl shadow-lg">
                      ✅ መታወቂያውን አረጋግጥና ሱቅ አጽድቅ
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
