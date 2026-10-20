import React, { useState, useEffect } from 'react';
import { API_BASE_URL } from './config';

export default function App() {
  const [activeTab, setActiveTab] = useState<'vendors' | 'products' | 'orders'>('vendors');
  const [vendors, setVendors] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [serverStatus, setServerStatus] = useState<'checking' | 'online' | 'offline'>('checking');
  const [manualUser, setManualUser] = useState('');
  const [selectedIdImage, setSelectedIdImage] = useState<string | null>(null);

  const fetchAdminData = async () => {
    try {
      // 1. Fetch Vendors with ID Scans
      const vRes = await fetch(`${API_BASE_URL}/vendors`);
      if (vRes.ok) {
        setServerStatus('online');
        const vData = await vRes.json();
        if (Array.isArray(vData)) setVendors(vData);
      } else {
        setServerStatus('offline');
      }

      // 2. Fetch All Vendors' Products
      const pRes = await fetch(`${API_BASE_URL}/products`);
      if (pRes.ok) {
        const pData = await pRes.json();
        if (Array.isArray(pData)) setProducts(pData);
      }

      // 3. Fetch Buyers' Orders & Escrow Transactions
      const oRes = await fetch(`${API_BASE_URL}/orders`);
      if (oRes.ok) {
        const oData = await oRes.json();
        if (Array.isArray(oData)) setOrders(oData);
      }
    } catch {
      setServerStatus('offline');
    }
  };

  useEffect(() => {
    fetchAdminData();
    const interval = setInterval(fetchAdminData, 3500);
    return () => clearInterval(interval);
  }, []);

  // 1. Vendor Controls
  const approveVendor = async (id: number) => {
    setVendors(vendors.map(v => v.id === id ? { ...v, status: 'Approved ✅' } : v));
    try { await fetch(`${API_BASE_URL}/vendors/${id}/approve`, { method: 'POST' }); } catch {}
  };

  const rejectVendor = async (id: number) => {
    setVendors(vendors.filter(v => v.id !== id));
    try { await fetch(`${API_BASE_URL}/vendors/${id}/reject`, { method: 'POST' }); } catch {}
  };

  const handleQuickApprove = async () => {
    if (!manualUser.trim()) return;
    const cleanUser = manualUser.replace('@', '').trim();
    try {
      const res = await fetch(`${API_BASE_URL}/vendors`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          store_name: `${cleanUser} Store`,
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
    setManualUser('');
    fetchAdminData();
  };

  // 2. Product Controls
  const deleteProduct = async (id: number) => {
    setProducts(products.filter(p => p.id !== id));
    try { await fetch(`${API_BASE_URL}/products/${id}`, { method: 'DELETE' }); } catch {}
  };

  // 3. Order & Escrow Controls
  const approveOrder = async (id: number) => {
    setOrders(orders.map(o => o.id === id ? { ...o, status: 'ተረጋግጧል (Verified ✅)' } : o));
    try { await fetch(`${API_BASE_URL}/orders/${id}/approve`, { method: 'POST' }); } catch {}
  };

  const cancelOrder = async (id: number) => {
    setOrders(orders.map(o => o.id === id ? { ...o, status: 'ውድቅ ተደርጓል (Cancelled ❌)' } : o));
    try { await fetch(`${API_BASE_URL}/orders/${id}/cancel`, { method: 'POST' }); } catch {}
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
            <p className="text-xs text-gray-400">Full Vendor KYC, Product Inventory & Buyer Escrow Control</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className={`text-xs font-bold px-3.5 py-2 rounded-full border ${
            serverStatus === 'online'
              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
              : 'bg-red-500/10 text-red-400 border-red-500/30'
          }`}>
            {serverStatus === 'online' ? '● Live Sync Active' : '⚠️ Connecting...'}
          </span>

          <button
            onClick={fetchAdminData}
            className="bg-[#2C221E] hover:bg-[#3A281E] text-[#FB923C] border border-orange-500/30 text-xs font-bold px-4 py-2.5 rounded-full transition active:scale-95 flex items-center gap-2"
          >
            <span>🔄</span> ዳታውን አድስ (Refresh)
          </button>
        </div>
      </header>

      <div className="max-w-6xl mx-auto space-y-6">
        {/* Quick Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-[#1E232B] p-5 rounded-3xl border border-white/5 flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-400">የነጋዴዎች KYC ማመልከቻዎች</p>
              <h2 className="text-2xl font-extrabold text-white mt-1">{vendors.length} ሱቆች</h2>
            </div>
            <span className="text-2xl bg-[#3A281E] p-3 rounded-2xl">🪪</span>
          </div>

          <div className="bg-[#1E232B] p-5 rounded-3xl border border-white/5 flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-400">በገበያ ላይ ያሉ ጠቅላላ እቃዎች</p>
              <h2 className="text-2xl font-extrabold text-[#FB923C] mt-1">{products.length} እቃዎች</h2>
            </div>
            <span className="text-2xl bg-[#3A281E] p-3 rounded-2xl">📦</span>
          </div>

          <div className="bg-[#1E232B] p-5 rounded-3xl border border-white/5 flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-400">የገዢዎች ጥያቄ እና ግብይቶች</p>
              <h2 className="text-2xl font-extrabold text-emerald-400 mt-1">{orders.length} ትዕዛዞች</h2>
            </div>
            <span className="text-2xl bg-[#3A281E] p-3 rounded-2xl">💳</span>
          </div>
        </div>

        {/* Quick Manual Approval Bar */}
        <div className="bg-[#1E232B] p-4 rounded-3xl border border-white/5 flex flex-col md:flex-row items-center justify-between gap-3">
          <div className="text-xs text-gray-300">
            ⚡ <strong>ፈጣን የሱቅ ማጽደቂያ፦</strong> የነጋዴውን Username ጽፈው በቀጥታ ማጽደቅም ይችላሉ፦
          </div>
          <div className="flex gap-2 w-full md:w-auto">
            <input
              value={manualUser}
              onChange={e => setManualUser(e.target.value)}
              type="text"
              placeholder="@username (ለምሳሌ: kalab)"
              className="bg-[#161A20] text-white text-xs rounded-xl px-3.5 py-2.5 border border-white/10 focus:border-[#FB923C] focus:outline-none flex-1"
            />
            <button
              onClick={handleQuickApprove}
              className="bg-gradient-to-r from-[#F97316] to-[#FB923C] text-black text-xs font-bold px-4 py-2.5 rounded-xl whitespace-nowrap active:scale-95 transition"
            >
              ✅ ወዲያውኑ አጽድቅ
            </button>
          </div>
        </div>

        {/* Navigation Tabs (3 Full Control Sections) */}
        <div className="flex flex-wrap gap-3 border-b border-white/10 pb-3">
          <button
            onClick={() => setActiveTab('vendors')}
            className={`px-5 py-2.5 rounded-full text-xs font-bold transition ${
              activeTab === 'vendors' ? 'bg-[#3A281E] text-[#FB923C] border border-orange-500/30' : 'bg-[#1E232B] text-gray-400 hover:text-white'
            }`}
          >
            🪪 1. የነጋዴዎች KYC እና መታወቂያዎች ({vendors.length})
          </button>

          <button
            onClick={() => setActiveTab('products')}
            className={`px-5 py-2.5 rounded-full text-xs font-bold transition ${
              activeTab === 'products' ? 'bg-[#3A281E] text-[#FB923C] border border-orange-500/30' : 'bg-[#1E232B] text-gray-400 hover:text-white'
            }`}
          >
            📦 2. የሁሉም ነጋዴዎች የእቃ ዝርዝር ({products.length})
          </button>

          <button
            onClick={() => setActiveTab('orders')}
            className={`px-5 py-2.5 rounded-full text-xs font-bold transition ${
              activeTab === 'orders' ? 'bg-[#3A281E] text-[#FB923C] border border-orange-500/30' : 'bg-[#1E232B] text-gray-400 hover:text-white'
            }`}
          >
            💳 3. የገዢዎች ጥያቄና ግብይት ቁጥጥር ({orders.length})
          </button>
        </div>

        {/* TAB 1: VENDOR KYC APPLICATIONS WITH USERNAME & ID PHOTO */}
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
                  <div className="space-y-2.5 flex-1">
                    <div className="flex items-center gap-3 flex-wrap">
                      <h3 className="text-base font-bold text-white">🏪 {v.store_name}</h3>
                      <span className="text-xs bg-[#2C221E] text-[#FB923C] font-bold px-3 py-1 rounded-full border border-orange-500/30">
                        👤 @{v.username || 'vendor'}
                      </span>
                      {v.telegram_id && (
                        <span className="text-[11px] bg-[#161A20] text-gray-400 px-2.5 py-0.5 rounded-full">
                          TG ID: {v.telegram_id}
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-gray-300">
                      📞 <strong>ስልክ ቁጥር፦</strong> {v.phone} &nbsp;|&nbsp; 🏦 <strong>የባንክ / ቴሌብር ሂሳብ፦</strong> <code className="text-orange-300">{v.account}</code>
                    </p>

                    {v.id_front_image ? (
                      <div className="pt-2">
                        <p className="text-xs text-[#FB923C] font-semibold mb-1.5">🪪 የተላከው የመታወቂያ ፎቶ (ለማጉላት ፎቶውን ይጫኑ)፦</p>
                        <img
                          onClick={() => setSelectedIdImage(v.id_front_image)}
                          src={v.id_front_image}
                          alt="Vendor ID"
                          className="h-36 w-56 rounded-2xl border-2 border-orange-500/30 object-cover cursor-pointer hover:scale-105 transition shadow-lg"
                        />
                      </div>
                    ) : (
                      <p className="text-xs text-gray-500 italic">የመታወቂያ ፎቶ አልተያያዘም (Manual Approved)</p>
                    )}
                  </div>

                  <div className="flex flex-col items-end gap-2.5 w-full md:w-auto">
                    <span className={`text-xs px-3.5 py-1.5 rounded-full font-bold ${
                      v.status === 'Pending'
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                        : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    }`}>
                      {v.status || 'Pending'}
                    </span>

                    <div className="flex gap-2 w-full md:w-auto">
                      {v.status === 'Pending' && (
                        <button
                          onClick={() => approveVendor(v.id)}
                          className="flex-1 md:flex-initial bg-gradient-to-r from-[#F97316] to-[#FB923C] text-black text-xs font-bold px-5 py-3 rounded-xl shadow-lg active:scale-95 transition"
                        >
                          ✅ መታወቂያውን አይቼ አጽድቄያለሁ (Approve)
                        </button>
                      )}
                      <button
                        onClick={() => rejectVendor(v.id)}
                        className="bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 text-xs font-bold px-4 py-3 rounded-xl transition"
                      >
                        🗑️ ሰርዝ
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* TAB 2: ALL VENDORS' PRODUCTS INVENTORY CONTROL */}
        {activeTab === 'products' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {products.map(p => (
              <div key={p.id} className="bg-[#1E232B] p-5 rounded-3xl border border-white/5 flex items-center justify-between gap-4 shadow-lg">
                <div className="flex items-center gap-4">
                  <div className="w-20 h-20 rounded-2xl bg-[#161A20] flex items-center justify-center overflow-hidden border border-white/5">
                    {p.image ? (
                      <img src={p.image} alt={p.name} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-2xl">🛍️</span>
                    )}
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-sm font-bold text-white">{p.name}</h3>
                    <p className="text-xs font-extrabold text-[#FB923C]">{p.price} ETB <span className="text-[11px] font-normal text-gray-400">• ብዛት: {p.quantity || 1}</span></p>
                    <p className="text-[11px] text-gray-300">🏪 ሻጭ: <strong className="text-orange-300">@{p.seller_username || 'owner'}</strong> ({p.store_name || 'Store'})</p>
                    <p className="text-[11px] text-gray-400">📍 {p.location || 'አዲስ አበባ'} • ሁኔታ: {p.condition || 'አዲስ'}</p>
                  </div>
                </div>

                <button
                  onClick={() => deleteProduct(p.id)}
                  className="bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 text-xs font-bold px-3.5 py-2.5 rounded-xl transition active:scale-95"
                >
                  🗑️ አጥፋ
                </button>
              </div>
            ))}
          </div>
        )}

        {/* TAB 3: BUYERS' ORDERS & ESCROW TRANSACTIONS CONTROL */}
        {activeTab === 'orders' && (
          <div className="space-y-4">
            {orders.length === 0 ? (
              <div className="bg-[#1E232B] rounded-3xl p-12 text-center border border-white/5 space-y-2 shadow-lg">
                <span className="text-3xl">💳</span>
                <p className="text-gray-400 text-sm">እስካሁን ምንም የገዢ ትዕዛዝ ወይም ክፍያ አልመጣም።</p>
              </div>
            ) : (
              orders.map(o => (
                <div key={o.id} className="bg-[#1E232B] p-6 rounded-3xl border border-white/5 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-xl">
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-bold text-white">{o.product_name}</h3>
                      <span className="text-sm font-extrabold text-[#FB923C]">{o.amount} ETB</span>
                    </div>
                    <p className="text-xs text-gray-300">
                      🛒 <strong>ገዢ፦</strong> <span className="text-emerald-400">@{o.buyer}</span> &nbsp;|&nbsp; 🏪 <strong>ሻጭ ነጋዴ፦</strong> <span className="text-orange-300">@{o.seller_username || 'store'}</span>
                    </p>
                    <p className="text-xs text-gray-300">
                      🏦 <strong>የክፍያ መንገድ፦</strong> {o.payment_method} &nbsp;|&nbsp; 🔢 <strong>የክፍያ ቁጥር (Ref)፦</strong> <code className="bg-[#161A20] text-[#FB923C] px-2.5 py-0.5 rounded font-bold">{o.tx_ref}</code>
                    </p>
                  </div>

                  <div className="flex flex-col items-end gap-2.5 w-full md:w-auto">
                    <span className="text-xs px-3.5 py-1.5 rounded-full font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                      {o.status}
                    </span>

                    <div className="flex gap-2">
                      {(!o.status.includes('ተረጋግጧል') && !o.status.includes('Verified')) && (
                        <button
                          onClick={() => approveOrder(o.id)}
                          className="bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-bold px-4 py-2.5 rounded-xl transition active:scale-95"
                        >
                          ✅ ክፍያውን አረጋግጥና ፍቀድ
                        </button>
                      )}
                      <button
                        onClick={() => cancelOrder(o.id)}
                        className="bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 text-xs font-bold px-3.5 py-2.5 rounded-xl transition"
                      >
                        ❌ ሰርዝ
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* Fullscreen ID Photo Zoom Modal */}
      {selectedIdImage && (
        <div
          onClick={() => setSelectedIdImage(null)}
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4 cursor-pointer"
        >
          <div className="max-w-2xl w-full space-y-3 text-center">
            <img src={selectedIdImage} alt="Full ID Scan" className="w-full max-h-[80vh] object-contain rounded-2xl border border-white/20" />
            <p className="text-xs text-gray-300">መታወቂያውን ለመዝጋት የትኛውም ቦታ ላይ ይጫኑ (Click anywhere to close)</p>
          </div>
        </div>
      )}
    </div>
  );
}
