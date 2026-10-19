import React, { useState, useEffect } from 'react';
import { API_BASE_URL } from './config';

export default function App() {
  const [activeTab, setActiveTab] = useState<'vendors' | 'orders'>('vendors');
  const [vendors, setVendors] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);

  const fetchAll = () => {
    fetch(`${API_BASE_URL}/vendors`).then(r => r.json()).then(d => { if (Array.isArray(d)) setVendors(d); }).catch(() => {});
    fetch(`${API_BASE_URL}/orders`).then(r => r.json()).then(d => { if (Array.isArray(d)) setOrders(d); }).catch(() => {});
  };

  useEffect(() => {
    fetchAll();
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
      <header className="bg-[#1E232B] border-b border-white/5 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#F97316] to-[#FB923C] flex items-center justify-center font-bold text-black">✥</div>
          <div>
            <h1 className="text-base font-bold">EOTC Market — Super Admin</h1>
            <p className="text-xs text-gray-400">National ID / Passport KYC & Escrow Control</p>
          </div>
        </div>
        <button onClick={fetchAll} className="bg-[#2C221E] text-[#FB923C] border border-orange-500/30 text-xs font-semibold px-3.5 py-1.5 rounded-full">
          🔄 Refresh Data
        </button>
      </header>

      <div className="max-w-5xl mx-auto p-6 space-y-6">
        <div className="flex gap-3 border-b border-white/10 pb-3">
          <button onClick={() => setActiveTab('vendors')} className={`px-5 py-2.5 rounded-full text-xs font-bold ${activeTab === 'vendors' ? 'bg-[#3A281E] text-[#FB923C] border border-orange-500/30' : 'bg-[#1E232B] text-gray-400'}`}>
            🪪 የነጋዴዎች KYC እና መታወቂያ ({vendors.length})
          </button>
          <button onClick={() => setActiveTab('orders')} className={`px-5 py-2.5 rounded-full text-xs font-bold ${activeTab === 'orders' ? 'bg-[#3A281E] text-[#FB923C] border border-orange-500/30' : 'bg-[#1E232B] text-gray-400'}`}>
            💳 የቴሌብር / CBE ክፍያዎች ({orders.length})
          </button>
        </div>

        {activeTab === 'vendors' && (
          <div className="space-y-4">
            {vendors.length === 0 ? (
              <p className="text-gray-500 text-sm">ምንም አዲስ የ KYC ጥያቄ የለም።</p>
            ) : vendors.map(v => (
              <div key={v.id} className="bg-[#1E232B] p-5 rounded-2xl border border-white/5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div className="space-y-1">
                  <h3 className="text-sm font-bold text-white">{v.store_name} <span className="text-xs text-[#FB923C]">(@{v.username})</span></h3>
                  <p className="text-xs text-gray-300">🪪 <strong>{v.id_type}:</strong> <code className="text-orange-300">{v.id_number}</code></p>
                  <p className="text-xs text-gray-400">📞 ስልክ: {v.phone} • 🏦 ሂሳብ: {v.account}</p>
                  {v.id_front_image && (
                    <div className="pt-2">
                      <img src={v.id_front_image} alt="National ID" className="h-28 rounded-xl border border-white/10 object-cover" />
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs px-3 py-1 rounded-full bg-[#262C36] text-gray-300">{v.status}</span>
                  {v.status === 'Pending' && (
                    <button onClick={() => approveVendor(v.id)} className="bg-gradient-to-r from-[#F97316] to-[#FB923C] text-black text-xs font-bold px-4 py-2.5 rounded-xl">
                      መታወቂያውን አረጋግጥና አጽድቅ (Approve)
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'orders' && (
          <div className="space-y-3">
            {orders.length === 0 ? (
              <p className="text-gray-500 text-sm">ምንም አዲስ ክፍያ የለም።</p>
            ) : orders.map(o => (
              <div key={o.id} className="bg-[#1E232B] p-5 rounded-2xl border border-white/5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div>
                  <h3 className="text-sm font-bold text-white">{o.product_name} — <span className="text-[#FB923C]">{o.amount} ETB</span></h3>
                  <p className="text-xs text-gray-400 mt-1">ገዢ: @{o.buyer} • ክፍያ: <strong className="text-white">{o.payment_method}</strong> • Ref: <code className="text-orange-300">{o.tx_ref}</code></p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs px-3 py-1 rounded-full bg-[#262C36] text-gray-300">{o.status}</span>
                  {o.status === 'Pending Approval' && (
                    <button onClick={() => approveOrder(o.id)} className="bg-emerald-500 text-black text-xs font-bold px-4 py-2 rounded-xl">
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
