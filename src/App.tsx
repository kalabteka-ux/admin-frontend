import React, { useState, useEffect } from 'react';
import { API_BASE_URL } from './config';

export default function App() {
  const [activeTab, setActiveTab] = useState<'vendors' | 'orders'>('vendors');
  const [vendors, setVendors] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);

  const fetchAdminData = () => {
    const localVendors = JSON.parse(localStorage.getItem('eotc_admin_vendors') || '[]');
    setVendors(localVendors);
  };

  useEffect(() => {
    fetchAdminData();
    const interval = setInterval(fetchAdminData, 3000);
    return () => clearInterval(interval);
  }, []);

  // አድሚኑ ሱቁን ሲያጸድቅ (Approve Vendor)
  const approveVendor = (id: number) => {
    const updated = vendors.map(v => v.id === id ? { ...v, status: 'Approved ✅' } : v);
    setVendors(updated);
    localStorage.setItem('eotc_admin_vendors', JSON.stringify(updated));
  };

  return (
    <div className="min-h-screen bg-[#161A20] text-white p-4 md:p-8 font-sans selection:bg-orange-500/30 selection:text-orange-100">
      {/* Top Header (Mirai Style) */}
      <header className="bg-[#1E232B] border border-white/5 rounded-3xl px-6 py-4 flex flex-col md:flex-row items-center justify-between gap-4 mb-6 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#F97316] to-[#FB923C] flex items-center justify-center font-bold text-black text-lg shadow-lg shadow-orange-500/20">
            ✥
          </div>
          <div>
            <h1 className="text-base font-bold tracking-tight">EOTC Market — Super Admin Dashboard</h1>
            <p className="text-xs text-gray-400">Review Vendor KYC IDs & Grant Selling Permissions</p>
          </div>
        </div>

        <button 
          onClick={fetchAdminData} 
          className="bg-[#2C221E] hover:bg-[#3A281E] text-[#FB923C] border border-orange-500/30 text-xs font-bold px-4 py-2.5 rounded-full transition active:scale-95 flex items-center gap-2"
        >
          <span>🔄</span> ዳታውን አድስ (Refresh)
        </button>
      </header>

      <div className="max-w-5xl mx-auto space-y-6">
        {/* Navigation Tabs */}
        <div className="flex gap-3 border-b border-white/10 pb-3">
          <button
            onClick={() => setActiveTab('vendors')}
            className={`px-5 py-2.5 rounded-full text-xs font-bold transition ${
              activeTab === 'vendors' ? 'bg-[#3A281E] text-[#FB923C] border border-orange-500/30' : 'bg-[#1E232B] text-gray-400 hover:text-white'
            }`}
          >
            🪪 የነጋዴዎች KYC እና መታወቂያዎች ({vendors.length})
          </button>
          <button
            onClick={() => setActiveTab('orders')}
            className={`px-5 py-2.5 rounded-full text-xs font-bold transition ${
              activeTab === 'orders' ? 'bg-[#3A281E] text-[#FB923C] border border-orange-500/30' : 'bg-[#1E232B] text-gray-400 hover:text-white'
            }`}
          >
            💳 የቴሌብር / CBE ክፍያዎች ({orders.length})
          </button>
        </div>

        {/* VENDORS KYC LIST */}
        {activeTab === 'vendors' && (
          <div className="space-y-4">
            {vendors.length === 0 ? (
              <div className="bg-[#1E232B] rounded-3xl p-12 text-center border border-white/5 space-y-2 shadow-lg">
                <span className="text-3xl">🪪</span>
                <p className="text-gray-400 text-sm">እስካሁን ምንም አዲስ የ KYC ምዝገባ ጥያቄ አልመጣም።</p>
                <p className="text-xs text-gray-500">ነጋዴዎች ሚኒ አፑ ላይ ሱቅ እና መታወቂያ ሲያስገቡ እዚህ በቀጥታ ይመጣሉ።</p>
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

                    <p className="text-xs text-gray-300">📞 <strong>ስልክ:</strong> {v.phone} | 🏦 <strong>አካውንት:</strong> {v.account}</p>

                    {v.id_front_image ? (
                      <div className="pt-2">
                        <p className="text-xs text-gray-400 mb-1">የተላከው መታወቂያ ፎቶ (ID / Passport Scan):</p>
                        <a href={v.id_front_image} target="_blank" rel="noreferrer">
                          <img src={v.id_front_image} alt="Vendor ID" className="h-32 w-48 rounded-2xl border border-white/10 object-cover hover:opacity-90 transition shadow-md" />
                        </a>
                      </div>
                    ) : (
                      <p className="text-xs text-red-400">⚠️ መታወቂያ ፎቶ አልተያያዘም</p>
                    )}
                  </div>

                  <div className="flex flex-col items-end gap-3 w-full md:w-auto">
                    <span className={`text-xs px-3.5 py-1.5 rounded-full font-bold ${v.status === 'Pending' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'}`}>
                      {v.status || 'Pending'}
                    </span>

                    {v.status === 'Pending' && (
                      <button
                        onClick={() => approveVendor(v.id)}
                        className="w-full md:w-auto bg-gradient-to-r from-[#F97316] to-[#FB923C] text-black text-xs font-bold px-5 py-3 rounded-xl shadow-lg shadow-orange-500/20 active:scale-95 transition"
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

        {/* ORDERS & PAYMENTS TAB */}
        {activeTab === 'orders' && (
          <div className="space-y-4">
            <div className="bg-[#1E232B] rounded-3xl p-12 text-center border border-white/5 space-y-2 shadow-lg">
              <span className="text-3xl">💳</span>
              <p className="text-gray-400 text-sm">እስካሁን ምንም የተደረገ የክፍያ ማረጋገጫ ጥያቄ የለም።</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
