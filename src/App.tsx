import React, { useState, useEffect } from 'react';
import { API_BASE_URL } from './config';

export default function App() {
  const [activeTab, setActiveTab] = useState<'vendors' | 'products' | 'orders' | 'publish'>('vendors');
  const [vendors, setVendors] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [serverStatus, setServerStatus] = useState<'checking' | 'online' | 'offline'>('checking');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  // Admin Direct Product Publisher State
  const [newProd, setNewProd] = useState({
    name: '',
    price: '',
    category: 'መጽሐፍት',
    condition: 'አዲስ',
    location: 'አዲስ አበባ',
    quantity: '1',
    color: '',
    image: '',
    store_name: 'EOTC Official Store',
    seller_username: 'admin'
  });

  const fetchAdminData = async () => {
    try {
      const vRes = await fetch(`${API_BASE_URL}/vendors`);
      if (vRes.ok) {
        setServerStatus('online');
        const vData = await vRes.json();
        if (Array.isArray(vData)) setVendors(vData);
      } else {
        setServerStatus('offline');
      }

      const pRes = await fetch(`${API_BASE_URL}/products`);
      if (pRes.ok) {
        const pData = await pRes.json();
        if (Array.isArray(pData)) setProducts(pData);
      }

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

  const approveVendor = async (id: number) => {
    setVendors(vendors.map(v => v.id === id ? { ...v, status: 'Approved ✅' } : v));
    try { await fetch(`${API_BASE_URL}/vendors/${id}/approve`, { method: 'POST' }); } catch {}
  };

  const rejectVendor = async (id: number) => {
    setVendors(vendors.filter(v => v.id !== id));
    try { await fetch(`${API_BASE_URL}/vendors/${id}/reject`, { method: 'POST' }); } catch {}
  };

  const deleteProduct = async (id: number) => {
    setProducts(products.filter(p => p.id !== id));
    try { await fetch(`${API_BASE_URL}/products/${id}`, { method: 'DELETE' }); } catch {}
  };

  // አድሚኑ በቀጥታ እቃዎችን በ POST መጫኛ
  const handleAdminPublishProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProd.name || !newProd.price) {
      return alert("⚠️ እባክዎ የእቃውን ስም እና ዋጋ ያስገቡ!");
    }
    try {
      const res = await fetch(`${API_BASE_URL}/products`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newProd)
      });
      if (res.ok) {
        alert("🎉 እቃው በተሳካ ሁኔታ ወደ ገበያ ተጭኗል!");
        setNewProd({
          name: '',
          price: '',
          category: 'መጽሐፍት',
          condition: 'አዲስ',
          location: 'አዲስ አበባ',
          quantity: '1',
          color: '',
          image: '',
          store_name: 'EOTC Official Store',
          seller_username: 'admin'
        });
        fetchAdminData();
        setActiveTab('products');
      }
    } catch {
      alert("⚠️ እቃውን መጫን አልተቻለም። ሰርቨሩን ያረጋግጡ።");
    }
  };

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
      <header className="bg-[#1E232B] border border-white/5 rounded-3xl px-6 py-4 flex flex-col md:flex-row items-center justify-between gap-4 mb-6 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#F97316] to-[#FB923C] flex items-center justify-center font-bold text-black text-lg shadow-lg">
            ✥
          </div>
          <div>
            <h1 className="text-base font-bold tracking-tight">EOTC Market — Super Admin Dashboard</h1>
            <p className="text-xs text-gray-400">Vendor KYC (Front & Back ID), Product Management & Direct Publisher</p>
          </div>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <span className={`text-xs font-bold px-3.5 py-2 rounded-full border ${serverStatus === 'online' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' : 'bg-red-500/10 text-red-400 border-red-500/30'}`}>
            {serverStatus === 'online' ? '● Live Sync Active' : '⚠️ Connecting...'}
          </span>
          <button onClick={fetchAdminData} className="bg-[#2C221E] text-[#FB923C] border border-orange-500/30 text-xs font-bold px-4 py-2.5 rounded-full">
            🔄 Refresh
          </button>
        </div>
      </header>

      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex flex-wrap gap-3 border-b border-white/10 pb-3">
          <button onClick={() => setActiveTab('vendors')} className={`px-5 py-2.5 rounded-full text-xs font-bold ${activeTab === 'vendors' ? 'bg-[#3A281E] text-[#FB923C] border border-orange-500/30' : 'bg-[#1E232B] text-gray-400'}`}>
            🪪 1. የነጋዴዎች KYC (ፊት እና ኋላ) ({vendors.length})
          </button>
          <button onClick={() => setActiveTab('products')} className={`px-5 py-2.5 rounded-full text-xs font-bold ${activeTab === 'products' ? 'bg-[#3A281E] text-[#FB923C] border border-orange-500/30' : 'bg-[#1E232B] text-gray-400'}`}>
            📦 2. የእቃዎች ዝርዝር ({products.length})
          </button>
          <button onClick={() => setActiveTab('publish')} className={`px-5 py-2.5 rounded-full text-xs font-bold ${activeTab === 'publish' ? 'bg-[#3A281E] text-[#FB923C] border border-orange-500/30' : 'bg-[#1E232B] text-gray-400'}`}>
            ➕ 3. እቃ በቀጥታ መጫኛ (POST)
          </button>
          <button onClick={() => setActiveTab('orders')} className={`px-5 py-2.5 rounded-full text-xs font-bold ${activeTab === 'orders' ? 'bg-[#3A281E] text-[#FB923C] border border-orange-500/30' : 'bg-[#1E232B] text-gray-400'}`}>
            💳 4. የገዢዎች ትዕዛዝ ({orders.length})
          </button>
        </div>

        {/* TAB 1: VENDOR KYC WITH FRONT & BACK ID */}
        {activeTab === 'vendors' && (
          <div className="space-y-4">
            {vendors.length === 0 ? (
              <div className="bg-[#1E232B] rounded-3xl p-12 text-center border border-white/5">
                <p className="text-gray-400 text-sm">እስካሁን ምንም የ KYC ማመልከቻ አልመጣም።</p>
              </div>
            ) : (
              vendors.map(v => (
                <div key={v.id} className="bg-[#1E232B] p-6 rounded-3xl border border-white/5 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-xl">
                  <div className="space-y-3 flex-1">
                    <div className="flex items-center gap-3 flex-wrap">
                      <h3 className="text-base font-bold text-white">🏪 {v.store_name}</h3>
                      <span className="text-xs bg-[#2C221E] text-[#FB923C] font-bold px-3 py-1 rounded-full border border-orange-500/30">
                        👤 Username: @{v.username}
                      </span>
                    </div>

                    <p className="text-xs text-gray-300">
                      📞 <strong>ስልክ፦</strong> {v.phone} &nbsp;|&nbsp; 🏦 <strong>አካውንት፦</strong> <code className="text-orange-300">{v.account}</code>
                    </p>

                    <div className="pt-1 flex flex-wrap gap-4">
                      {v.id_front_image && (
                        <div>
                          <p className="text-[11px] text-[#FB923C] font-semibold mb-1">🪪 መታወቂያ ፊት (Front ID)</p>
                          <img onClick={() => setSelectedImage(v.id_front_image)} src={v.id_front_image} alt="ID Front" className="h-32 w-52 rounded-xl border border-orange-500/30 object-cover cursor-pointer hover:scale-105 transition shadow-lg" />
                        </div>
                      )}
                      {v.id_back_image && (
                        <div>
                          <p className="text-[11px] text-[#FB923C] font-semibold mb-1">🪪 መታወቂያ ኋላ (Back ID)</p>
                          <img onClick={() => setSelectedImage(v.id_back_image)} src={v.id_back_image} alt="ID Back" className="h-32 w-52 rounded-xl border border-orange-500/30 object-cover cursor-pointer hover:scale-105 transition shadow-lg" />
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-3 w-full md:w-auto">
                    <span className={`text-xs px-3.5 py-1.5 rounded-full font-bold ${v.status === 'Pending' ? 'bg-amber-500/20 text-amber-300' : 'bg-emerald-500/20 text-emerald-300'}`}>
                      {v.status || 'Pending'}
                    </span>
                    <div className="flex gap-2 w-full md:w-auto">
                      {v.status === 'Pending' && (
                        <button onClick={() => approveVendor(v.id)} className="bg-[#FB923C] text-black text-xs font-bold px-5 py-3 rounded-xl shadow-lg">
                          ✅ ሱቁን አጽድቅ (Approve)
                        </button>
                      )}
                      <button onClick={() => rejectVendor(v.id)} className="bg-red-500/10 text-red-400 text-xs font-bold px-4 py-3 rounded-xl">
                        🗑️ ውድቅ አድርግ
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* TAB 2: PRODUCTS */}
        {activeTab === 'products' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {products.map(p => (
              <div key={p.id} className="bg-[#1E232B] p-5 rounded-3xl border border-white/5 flex items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-[#161A20] flex items-center justify-center overflow-hidden">
                    {p.image ? <img src={p.image} alt="" className="w-full h-full object-cover" /> : <span className="text-xl">🛍️</span>}
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-white">{p.name}</h3>
                    <p className="text-xs font-extrabold text-[#FB923C]">{p.price} ETB</p>
                    <p className="text-[11px] text-gray-400">🏪 @{p.seller_username} ({p.store_name})</p>
                  </div>
                </div>
                <button onClick={() => deleteProduct(p.id)} className="bg-red-500/10 text-red-400 text-xs font-bold px-3 py-2 rounded-xl">🗑️ አጥፋ</button>
              </div>
            ))}
          </div>
        )}

        {/* TAB 3: ADMIN DIRECT PRODUCT PUBLISHER (POST) */}
        {activeTab === 'publish' && (
          <div className="bg-[#1E232B] p-6 rounded-3xl border border-white/5 max-w-xl mx-auto space-y-4 shadow-xl">
            <h3 className="text-sm font-bold text-[#FB923C]">📦 እቃ በቀጥታ በአድሚን በኩል መጫኛ (Direct Publisher)</h3>
            <form onSubmit={handleAdminPublishProduct} className="space-y-3">
              <div>
                <label className="text-xs text-gray-400">የእቃው ስም *</label>
                <input value={newProd.name} onChange={e => setNewProd({...newProd, name: e.target.value})} type="text" placeholder="ለምሳሌ፦ መጽሐፈ ሰዓታት" className="w-full bg-[#161A20] text-white text-xs rounded-xl px-3.5 py-3 border border-white/10 mt-1" />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-gray-400">ዋጋ (ETB) *</label>
                  <input value={newProd.price} onChange={e => setNewProd({...newProd, price: e.target.value})} type="number" placeholder="650" className="w-full bg-[#161A20] text-white text-xs rounded-xl px-3.5 py-3 border border-white/10 mt-1" />
                </div>
                <div>
                  <label className="text-xs text-gray-400">ምድብ (Category)</label>
                  <select value={newProd.category} onChange={e => setNewProd({...newProd, category: e.target.value})} className="w-full bg-[#161A20] text-white text-xs rounded-xl px-3.5 py-3 border border-white/10 mt-1">
                    <option value="መጽሐፍት">መጽሐፍት</option>
                    <option value="ንዋየ ቅድሳት">ንዋየ ቅድሳት</option>
                    <option value="አልባሳት">አልባሳት</option>
                    <option value="ሥዕላት">ሥዕላት</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-gray-400">ሁኔታ (Condition)</label>
                  <select value={newProd.condition} onChange={e => setNewProd({...newProd, condition: e.target.value})} className="w-full bg-[#161A20] text-white text-xs rounded-xl px-3.5 py-3 border border-white/10 mt-1">
                    <option value="አዲስ">አዲስ</option>
                    <option value="ያገለገለ">ያገለገለ</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs text-gray-400">አድራሻ (Location)</label>
                  <input value={newProd.location} onChange={e => setNewProd({...newProd, location: e.target.value})} type="text" placeholder="አ.አ, ቦሌ" className="w-full bg-[#161A20] text-white text-xs rounded-xl px-3.5 py-3 border border-white/10 mt-1" />
                </div>
              </div>

              <div>
                <label className="text-xs text-gray-400">የፎቶ URL (Image URL - አማራጭ)</label>
                <input value={newProd.image} onChange={e => setNewProd({...newProd, image: e.target.value})} type="text" placeholder="https://..." className="w-full bg-[#161A20] text-white text-xs rounded-xl px-3.5 py-3 border border-white/10 mt-1" />
              </div>

              <button type="submit" className="w-full bg-gradient-to-r from-[#F97316] to-[#FB923C] text-black text-xs font-bold py-3.5 rounded-xl shadow-lg mt-2 active:scale-95 transition">
                🚀 እቃውን ወደ ገበያ ጫን (Publish)
              </button>
            </form>
          </div>
        )}

        {/* TAB 4: ORDERS */}
        {activeTab === 'orders' && (
          <div className="space-y-4">
            {orders.length === 0 ? (
              <div className="bg-[#1E232B] rounded-3xl p-12 text-center border border-white/5">
                <p className="text-gray-400 text-sm">ምንም የገዢ ትዕዛዝ የለም።</p>
              </div>
            ) : (
              orders.map(o => (
                <div key={o.id} className="bg-[#1E232B] p-6 rounded-3xl border border-white/5 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                  <div>
                    <h3 className="text-sm font-bold text-white">{o.product_name} — <span className="text-[#FB923C]">{o.amount} ETB</span></h3>
                    <p className="text-xs text-gray-300">🛒 ገዢ: @{o.buyer} | 🏪 ሻጭ: @{o.seller_username}</p>
                    <p className="text-xs text-gray-400">Ref: <code className="text-orange-300">{o.tx_ref}</code></p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 font-bold">{o.status}</span>
                    {(!o.status.includes('ተረጋግጧል') && !o.status.includes('Verified')) && (
                      <button onClick={() => approveOrder(o.id)} className="bg-emerald-500 text-black text-xs font-bold px-4 py-2.5 rounded-xl">
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

      {selectedImage && (
        <div onClick={() => setSelectedImage(null)} className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4 cursor-pointer">
          <div className="max-w-3xl w-full text-center space-y-2">
            <img src={selectedImage} alt="Zoomed ID" className="w-full max-h-[85vh] object-contain rounded-2xl border border-white/20" />
            <p className="text-xs text-gray-300">ለመዝጋት እዚህ ላይ ይጫኑ</p>
          </div>
        </div>
      )}
    </div>
  );
}
