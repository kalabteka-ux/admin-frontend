import React, { useState, useEffect } from 'react';
import { API_BASE_URL } from './config';

export default function App() {
  const [activeTab, setActiveTab] = useState<'vendors' | 'orders'>('vendors');
  const [vendors, setVendors] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [serverStatus, setServerStatus] = useState<'checking' | 'online' | 'offline'>('checking');
  const [manualStore, setManualStore] = useState('');
  const [manualUser, setManualUser] = useState('');

  const fetchAdminData = async () => {
    // 1. Check & Fetch from Render Backend
    let apiVendors: any[] = [];
    let apiOrders: any[] = [];
    try {
      const vRes = await fetch(`${API_BASE_URL}/vendors`);
      if (vRes.ok) {
        setServerStatus('online');
        const vData = await vRes.json();
        if (Array.isArray(vData)) apiVendors = vData;
      } else {
        setServerStatus('offline');
      }

      const oRes = await fetch(`${API_BASE_URL}/orders`);
      if (oRes.ok) {
        const oData = await oRes.json();
        if (Array.isArray(oData)) apiOrders = oData;
      }
    } catch {
      setServerStatus('offline');
    }

    // 2. Merge with LocalStorage fallback
    const localVendors = JSON.parse(localStorage.getItem('eotc_admin_vendors') || '[]');
    const combinedVendors = [...apiVendors];
    localVendors.forEach((lv: any) => {
      if (!combinedVendors.some(v => v.store_name === lv.store_name && v.phone === lv.phone)) {
        combinedVendors.push(lv);
      }
    });
    setVendors(combinedVendors);

    const localOrders = JSON.parse(localStorage.getItem('eotc_admin_orders') || '[]');
    const combinedOrders = [...apiOrders];
    localOrders.forEach((lo: any) => {
      if (!combinedOrders.some(o => o.tx_ref === lo.tx_ref)) {
        combinedOrders.push(lo);
      }
    });
    setOrders(combinedOrders);
  };

  useEffect(() => {
    fetchAdminData();
    const interval = setInterval(fetchAdminData, 4000);
    return () => clearInterval(interval);
  }, []);

  const approveVendor = async (id: number) => {
    setVendors(vendors.map(v => v.id === id ? { ...v, status: 'Approved ✅' } : v));
    try {
      await fetch(`${API_BASE_URL}/vendors/${id}/approve`, { method: 'POST' });
    } catch {}
    const local = JSON.parse(localStorage.getItem('eotc_admin_vendors') || '[]');
    localStorage.setItem('eotc_admin_vendors', JSON.stringify(local.map((v: any) => v.id === id ? { ...v, status: 'Approved ✅' } : v)));
  };

  // በቀጥታ በ Username ሱቅ የማጽደቂያ ፈጣን መንገድ
  const handleQuickApprove = async () => {
    if (!manualUser.trim()) return;
    const cleanUser = manualUser.replace('@', '').trim();
    try {
      const res = await fetch(`${API_BASE_URL}/vendors`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          store_name: manualStore || `${cleanUser} Store`,
          username: cleanUser,
          phone: "Verified by Admin",
          account: "Verified",
          id_front_image: ""
        })
      });
      if (res.ok) {
        const created = await res.json();
        await fetch(`${API_BASE_URL}/vendors/${created.id}/approve`, { method: 'POST' });
      }
    } catch {}
    setManualStore('');
    setManualUser('');
    fetchAdminData();
  };

  const approveOrder = async (id: number) => {
    setOrders(orders.map(o => o.id === id ? { ...o, status: 'ተረጋግጧል (Verified ✅)' } : o));
    try {
      await fetch(`${API_BASE_URL}/orders/${id}/approve`, { method: 'POST' });
    } catch {}
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
            <h1 className="text-base font-bold tracking-tight">EOTC Market — Super Admin Dashboard</h1>
            <p className="text-xs text-gray-400">
              Server: <code className="text-orange-300">{API_BASE_URL}</code>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className={`text-xs font-bold px-3.5 py-2 rounded-full border ${
            serverStatus === 'online'
              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
              : 'bg-red-500/10 text-red-400 border-red-500/30'
          }`}>
            {serverStatus === 'online' ? '● Render Server Online' : '⚠️ Server Offline / Check config.ts'}
          </span>

          <button
            onClick={fetchAdminData}
            className="bg-[#2C221E] hover:bg-[#3A281E] text-[#FB923C] border border-orange-500/30 text-xs font-bold px-4 py-2.5 rounded-full transition active:scale-95 flex items-center gap-2"
          >
            <span>🔄</span> ዳታውን አድስ (Refresh)
          </button>
        </div>
      </header>

      <div className="max-w-5xl mx-auto space-y-6">
        {/* Quick Manual Vendor Approval Box */}
        <div className="bg-[#1E232B] p-4 rounded-3xl border border-white/5 flex flex-col md:flex-row items-center justify-between gap-3">
          <div className="text-xs text-gray-300">
            ⚡ <strong>ፈጣን የሱቅ ማጽደቂያ፦</strong> የነጋዴውን የቴሌግራም Username በማስገባት ወዲያውኑ እቃ እንዲጭን መፍቀድ ይችላሉ፦
          </div>
          <div className="flex gap-2 w-full md:w-auto">
            <input
              value={manualUser}
              onChange={e => setManualUser(e.target.value)}
              type="text"
              placeholder="@username (ለምሳሌ: kalab)"
              className="bg-[#161A20] text-white text-xs rounded-xl px-3.5 py-2.5 border border-white/10 focus:border-[#FB923C] focus:outline-none"
            />
            <button
              onClick={handleQuickApprove}
              className="bg-gradient-to-r from-[#F97316] to-[#FB923C] text-black text-xs font-bold px-4 py-2.5 rounded-xl whitespace-nowrap active:scale-95 transition"
            >
              ✅ ወዲያውኑ አጽድቅ
            </button>
          </div>
        </div>

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
            💳 የቴሌብር / CBE ክፍያ ማረጋገጫ ({orders.length})
          </button>
        </div>

        {/* VENDORS KYC LIST */}
        {activeTab === 'vendors' && (
          <div className="space-y-4">
            {vendors.length === 0 ? (
              <div className="bg-[#1E232B] rounded-3xl p-12 text-center border border-white/5 space-y-2 shadow-lg">
                <span className="text-3xl">🪪</span>
                <p className="text-gray-400 text-sm">እስካሁን ምንም አዲስ የ KYC ምዝገባ ጥያቄ አልመጣም።</p>
              </div>
            ) : (
              vendors.map(v => (
                <div key={v.id} className="bg-[#1E232B] p-6 rounded-3xl border border-white/5 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-xl">
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-3 flex-wrap">
                      <h3 className="text-base font-bold text-white">{v.store_name}</h3>
                      <span className="text-xs bg-[#2C221E] text-[#FB923C] px-3 py-0.5 rounded-full border border-orange-500/20">
                        @{v.username || 'vendor'}
                      </span>
                    </div>
                    <p className="text-xs text-gray-300">📞 <strong>ስልክ:</strong> {v.phone} | 🏦 <strong>አካውንት:</strong> {v.account}</p>
                    {v.id_front_image && (
                      <div className="pt-2">
                        <a href={v.id_front_image} target="_blank" rel="noreferrer">
                          <img src={v.id_front_image} alt="Vendor ID" className="h-32 w-48 rounded-2xl border border-white/10 object-cover shadow-md" />
                        </a>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col items-end gap-3 w-full md:w-auto">
                    <span className={`text-xs px-3.5 py-1.5 rounded-full font-bold ${v.status === 'Pending' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'}`}>
                      {v.status || 'Pending'}
                    </span>
                    {v.status === 'Pending' && (
                      <button
                        onClick={() => approveVendor(v.id)}
                        className="w-full md:w-auto bg-gradient-to-r from-[#F97316] to-[#FB923C] text-black text-xs font-bold px-5 py-3 rounded-xl shadow-lg active:scale-95 transition"
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

        {/* ORDERS TAB */}
        {activeTab === 'orders' && (
          <div className="space-y-4">
            {orders.length === 0 ? (
              <div className="bg-[#1E232B] rounded-3xl p-12 text-center border border-white/5 space-y-2 shadow-lg">
                <span className="text-3xl">💳</span>
                <p className="text-gray-400 text-sm">እስካሁን ምንም የተደረገ የክፍያ ማረጋገጫ ጥያቄ የለም።</p>
              </div>
            ) : (
              orders.map(o => (
                <div key={o.id} className="bg-[#1E232B] p-6 rounded-3xl border border-white/5 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-xl">
                  <div className="space-y-1.5">
                    <h3 className="text-base font-bold text-white">
                      {o.product_name} — <span className="text-[#FB923C] font-extrabold">{o.amount} ETB</span>
                    </h3>
                    <p className="text-xs text-gray-300">👤 ገዢ፦ <strong className="text-white">@{o.buyer}</strong></p>
                    <p className="text-xs text-gray-300">
                      🏦 የክፍያ መንገድ፦ <strong className="text-[#FB923C]">{o.payment_method}</strong> | 🔢 Ref፦ <code className="bg-[#161A20] text-orange-300 px-2 py-0.5 rounded">{o.tx_ref}</code>
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-3">
                    <span className="text-xs px-3.5 py-1.5 rounded-full font-bold bg-amber-500/20 text-amber-300">
                      {o.status}
                    </span>
                    {(!o.status.includes('ተረጋግጧል') && !o.status.includes('Verified')) && (
                      <button
                        onClick={() => approveOrder(o.id)}
                        className="bg-emerald-500 text-black text-xs font-bold px-5 py-3 rounded-xl"
                      >
                        ✅ ክፍያውን አረጋግጥ
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
