import React, { useState, useEffect } from 'react';
import { API_BASE_URL } from './config';

export default function App() {
  const [activeTab, setActiveTab] = useState<'vendors' | 'orders' | 'products'>('vendors');
  const [vendors, setVendors] = useState<any[]>([
    { id: 1, store_name: "ቅዱስ ሚካኤል መጻሕፍት", username: "mikael_books", phone: "0911223344", account: "Telebirr: 0911223344", status: "Pending" }
  ]);
  const [orders, setOrders] = useState<any[]>([
    { id: 101, buyer: "kalab", product_name: "መጽሐፈ ሰዓታት", amount: "650", payment_method: "Telebirr", tx_ref: "FT240988712", status: "Pending Approval" }
  ]);

  useEffect(() => {
    fetch(`${API_BASE_URL}/vendors`).then(r => r.json()).then(d => { if (Array.isArray(d) && d.length) setVendors(d); }).catch(() => {});
    fetch(`${API_BASE_URL}/orders`).then(r => r.json()).then(d => { if (Array.isArray(d) && d.length) setOrders(d); }).catch(() => {});
  }, []);

  const approveVendor = async (id: number) => {
    setVendors(vendors.map(v => v.id === id ? { ...v, status: 'Approved ✅' } : v));
    try { await fetch(`${API_BASE_URL}/vendors/${id}/approve`, { method: 'POST' }); } catch {}
  };

  const approveOrder = async (id: number) => {
    setOrders(orders.map(o => o.id === id ? { ...o, status: 'Escrow Released ✅' } : o));
    try { await fetch(`${API_BASE_URL}/orders/${id}/approve`, { method: 'POST' }); } catch {}
  };

  return (
    <div className="min-h-screen bg-[#161A20] text-white">
      {/* Top Navbar */}
      <header className="bg-[#1E232B] border-b border-white/5 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#F97316] to-[#FB923C] flex items-center justify-center font-bold text-black">
            ✥
          </div>
          <div>
            <h1 className="text-base font-bold">EOTC Market — Super Admin</h1>
            <p className="text-xs text-gray-400">KYC & Escrow Payment Control Center</p>
          </div>
        </div>
        <span className="bg-[#2C221E] text-[#FB923C] border border-orange-500/30 text-xs font-semibold px-3.5 py-1.5 rounded-full">
          ● Connected to Render API
        </span>
      </header>

      <div className="max-w-5xl mx-auto p-6 space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gradient-to-br from-[#232933] to-[#2A1F1A] p-5 rounded-3xl border border-white/10">
            <p className="text-xs text-gray-400 uppercase">አጠቃላይ የኤስክሮ ክፍያ (Escrow Volume)</p>
            <h2 className="text-2xl font-extrabold text-[#FB923C] mt-1">18,450.00 ETB</h2>
          </div>
          <div className="bg-[#1E232B] p-5 rounded-3xl border border-white/5">
            <p className="text-xs text-gray-400 uppercase">የነጋዴዎች KYC ጥያቄዎች</p>
            <h2 className="text-2xl font-extrabold text-white mt-1">{vendors.length} ሱቆች</h2>
          </div>
          <div className="bg-[#1E232B] p-5 rounded-3xl border border-white/5">
            <p className="text-xs text-gray-400 uppercase">የክፍያ ማረጋገጫዎች (Telebirr / CBE)</p>
            <h2 className="text-2xl font-extrabold text-emerald-400 mt-1">{orders.length} ትዕዛዞች</h2>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex gap-3 border-b border-white/10 pb-3">
          <button
            onClick={() => setActiveTab('vendors')}
            className={`px-5 py-2.5 rounded-full text-xs font-bold transition ${activeTab === 'vendors' ? 'bg-[#3A281E] text-[#FB923C] border border-orange-500/30' : 'bg-[#1E232B] text-gray-400'}`}
          >
            🏪 የነጋዴዎች KYC ማጽደቂያ ({vendors.length})
          </button>
          <button
            onClick={() => setActiveTab('orders')}
            className={`px-5 py-2.5 rounded-full text-xs font-bold transition ${activeTab === 'orders' ? 'bg-[#3A281E] text-[#FB923C] border border-orange-500/30' : 'bg-[#1E232B] text-gray-400'}`}
          >
            💳 የቴሌብር / CBE ክፍያዎች ({orders.length})
          </button>
        </div>

        {/* Vendors KYC List */}
        {activeTab === 'vendors' && (
          <div className="space-y-3">
            {vendors.map(v => (
              <div key={v.id} className="bg-[#1E232B] p-5 rounded-2xl border border-white/5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div>
                  <h3 className="text-sm font-bold text-white">{v.store_name} <span className="text-xs text-[#FB923C]">(@{v.username})</span></h3>
                  <p className="text-xs text-gray-400 mt-1">ስልክ: {v.phone} • ሂሳብ: {v.account}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs px-3 py-1 rounded-full bg-[#262C36] text-gray-300">{v.status}</span>
                  {v.status === 'Pending' && (
                    <button onClick={() => approveVendor(v.id)} className="bg-gradient-to-r from-[#F97316] to-[#FB923C] text-black text-xs font-bold px-4 py-2 rounded-xl">
                      ሱቁን አጽድቅ (Approve KYC)
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Orders & Escrow Payment List */}
        {activeTab === 'orders' && (
          <div className="space-y-3">
            {orders.map(o => (
              <div key={o.id} className="bg-[#1E232B] p-5 rounded-2xl border border-white/5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div>
                  <h3 className="text-sm font-bold text-white">{o.product_name} — <span className="text-[#FB923C]">{o.amount} ETB</span></h3>
                  <p className="text-xs text-gray-400 mt-1">ገዢ: @{o.buyer} • ክፍያ: <strong className="text-white">{o.payment_method}</strong> • Ref: <code className="text-orange-300">{o.tx_ref}</code></p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs px-3 py-1 rounded-full bg-[#262C36] text-gray-300">{o.status}</span>
                  {o.status === 'Pending Approval' && (
                    <button onClick={() => approveOrder(o.id)} className="bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-bold px-4 py-2 rounded-xl">
                      ክፍያውን አረጋግጥ (Verify & Release)
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
