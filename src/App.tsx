import React, { useState, useEffect } from 'react';
import { API_BASE_URL } from './config';

export default function App() {
  const [activeTab, setActiveTab] = useState<'vendors' | 'products' | 'publish' | 'orders'>('publish');
  const [vendors, setVendors] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [serverStatus, setServerStatus] = useState<'checking' | 'online' | 'offline'>('checking');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [feedbackInputs, setFeedbackInputs] = useState<{ [key: string]: string }>({});

  // 📦 ሙሉ የተደራጀ የእቃ እና የመጽሐፍት መጫኛ ፎርም (Product Publisher State)
  const [newProd, setNewProd] = useState({
    name: '',
    price: '',
    category: 'መጽሐፍት',
    condition: 'አዲስ',
    city: 'አዲስ አበባ',
    location: 'ቦሌ',
    delivery_fee: '0',
    quantity: '1',
    image: '',
    store_name: 'EOTC Official Store',
    seller_username: 'admin',
    // 📚 መጽሐፍት
    author: '',
    pub_year: '',
    publisher: '',
    book_sub_category: 'መንፈሳዊ',
    // 👗 አልባሳት
    size: 'M',
    color: 'ጥቁር',
    // ⛪ ንዋየ ቅድሳት / ሥዕላት
    material: 'ወርቅ/ብር',
    dimension: 'መካከለኛ'
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

  const sendVendorFeedback = async (id: number) => {
    const message = feedbackInputs[id];
    if (!message) return alert("⚠️ እባክዎ የማስተካከያ መልእክት ይጻፉ!");
    try {
      await fetch(`${API_BASE_URL}/vendors/${id}/feedback`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ admin_feedback: message })
      });
      alert("📩 የማስተካከያ መልእክቱ ለተጠቃሚው ተልኳል!");
      fetchAdminData();
    } catch {
      alert("⚠️ መላክ አልተቻለም።");
    }
  };

  const rejectVendor = async (id: number) => {
    setVendors(vendors.filter(v => v.id !== id));
    try { await fetch(`${API_BASE_URL}/vendors/${id}/reject`, { method: 'POST' }); } catch {}
  };

  const deleteProduct = async (id: number) => {
    setProducts(products.filter(p => p.id !== id));
    try { await fetch(`${API_BASE_URL}/products/${id}`, { method: 'DELETE' }); } catch {}
  };

  // 🚀 እቃዎችን በዳሽቦርዱ በኩል ሙሉ መረጃቸውን ሞልቶ መለጠፊያ (Publish)
  const handleAdminPublishProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProd.name || !newProd.price || !newProd.city || !newProd.location) {
      return alert("⚠️ እባክዎ የእቃውን ስም፣ ዋጋ፣ ከተማ እና አድራሻ (ቦታ) ይሙሉ!");
    }
    try {
      const res = await fetch(`${API_BASE_URL}/products`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newProd)
      });
      if (res.ok) {
        alert("🎉 እቃው ከተሟላ ዝርዝሩ ጋር በተሳካ ሁኔታ ወደ ገበያ ተጭኗል!");
        setNewProd({
          name: '',
          price: '',
          category: 'መጽሐፍት',
          condition: 'አዲስ',
          city: 'አዲስ አበባ',
          location: 'ቦሌ',
          delivery_fee: '0',
          quantity: '1',
          image: '',
          store_name: 'EOTC Official Store',
          seller_username: 'admin',
          author: '',
          pub_year: '',
          publisher: '',
          book_sub_category: 'መንፈሳዊ',
          size: 'M',
          color: 'ጥቁር',
          material: 'ወርቅ/ብር',
          dimension: 'መካከለኛ'
        });
        fetchAdminData();
        setActiveTab('products');
      }
    } catch {
      alert("⚠️ እቃውን መጫን አልተቻለም። ሰርቨሩን ያረጋግጡ።");
    }
  };

  const approveOrder = async (id: number) => {
    setOrders(orders.map(o => o.id === id ? { ...o, status: 'Released to Vendor ✅' } : o));
    try { await fetch(`${API_BASE_URL}/orders/${id}/approve`, { method: 'POST' }); } catch {}
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
            <p className="text-xs text-gray-400">Complete Dashboard: KYC, Product Management, Advanced Publisher & Escrow</p>
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
          <button onClick={() => setActiveTab('publish')} className={`px-5 py-2.5 rounded-full text-xs font-bold ${activeTab === 'publish' ? 'bg-[#3A281E] text-[#FB923C] border border-orange-500/30' : 'bg-[#1E232B] text-gray-400'}`}>
            ➕ 1. እቃ/መጽሐፍ በቀጥታ መጫኛ (Advanced Publisher)
          </button>
          <button onClick={() => setActiveTab('products')} className={`px-5 py-2.5 rounded-full text-xs font-bold ${activeTab === 'products' ? 'bg-[#3A281E] text-[#FB923C] border border-orange-500/30' : 'bg-[#1E232B] text-gray-400'}`}>
            📦 2. የእቃዎች ዝርዝር አስተዳደር ({products.length})
          </button>
          <button onClick={() => setActiveTab('vendors')} className={`px-5 py-2.5 rounded-full text-xs font-bold ${activeTab === 'vendors' ? 'bg-[#3A281E] text-[#FB923C] border border-orange-500/30' : 'bg-[#1E232B] text-gray-400'}`}>
            🪪 3. ሻጮች KYC እና Feedback ({vendors.length})
          </button>
          <button onClick={() => setActiveTab('orders')} className={`px-5 py-2.5 rounded-full text-xs font-bold ${activeTab === 'orders' ? 'bg-[#3A281E] text-[#FB923C] border border-orange-500/30' : 'bg-[#1E232B] text-gray-400'}`}>
            💳 4. የ Escrow ትዕዛዞች ({orders.length})
          </button>
        </div>

        {/* TAB 1: ADVANCED ADMIN PRODUCT PUBLISHER (ሁሉም fields የሚሞሉበት) */}
        {activeTab === 'publish' && (
          <div className="bg-[#1E232B] p-6 rounded-3xl border border-white/5 max-w-2xl mx-auto space-y-4 shadow-xl">
            <h3 className="text-sm font-bold text-[#FB923C]">📦 እቃ ወይም መጽሐፍ በምድብ ዝርዝራቸው ሞልቶ መጫኛ</h3>
            
            <form onSubmit={handleAdminPublishProduct} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-gray-400">ዋና ምድብ (Category)</label>
                  <select value={newProd.category} onChange={e => setNewProd({...newProd, category: e.target.value})} className="w-full bg-[#161A20] text-white text-xs rounded-xl px-3.5 py-3 border border-white/10 mt-1">
                    <option value="መጽሐፍት">መጽሐፍት</option>
                    <option value="ንዋየ ቅድሳት">ንዋየ ቅድሳት</option>
                    <option value="አልባሳት">አልባሳት</option>
                    <option value="ሥዕላት">ሥዕላት</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs text-gray-400">የእቃው ሁኔታ</label>
                  <select value={newProd.condition} onChange={e => setNewProd({...newProd, condition: e.target.value})} className="w-full bg-[#161A20] text-white text-xs rounded-xl px-3.5 py-3 border border-white/10 mt-1">
                    <option value="አዲስ">አዲስ (New)</option>
                    <option value="አሮጌ (ያገለገለ)">አሮጌ / ያገለገለ</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs text-gray-400">{newProd.category === 'መጽሐፍት' ? 'የመጽሐፉ ርዕስ *' : 'የእቃው ስም *'}</label>
                <input value={newProd.name} onChange={e => setNewProd({...newProd, name: e.target.value})} type="text" placeholder="ለምሳሌ፦ መጽሐፈ ሰዓታት" className="w-full bg-[#161A20] text-white text-xs rounded-xl px-3.5 py-3 border border-white/10 mt-1" />
              </div>

              {/* 📚 መጽሐፍ ከሆነ የሚመጡ ተጨማሪ ዝርዝሮች */}
              {newProd.category === 'መጽሐፍት' && (
                <div className="bg-[#161A20] p-4 rounded-2xl border border-orange-500/30 space-y-3">
                  <p className="text-xs font-bold text-[#FB923C]">📚 የመጽሐፍ ዝርዝር መረጃዎች (Product Details Page)</p>
                  <div className="grid grid-cols-2 gap-2">
                    <input value={newProd.author} onChange={e => setNewProd({...newProd, author: e.target.value})} type="text" placeholder="የጸሐፊው ስም" className="bg-[#1E232B] text-white text-xs rounded-xl px-3 py-2.5 border border-white/10" />
                    <input value={newProd.pub_year} onChange={e => setNewProd({...newProd, pub_year: e.target.value})} type="text" placeholder="የህትመት ዘመን (2016)" className="bg-[#1E232B] text-white text-xs rounded-xl px-3 py-2.5 border border-white/10" />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <input value={newProd.publisher} onChange={e => setNewProd({...newProd, publisher: e.target.value})} type="text" placeholder="አሳታሚ" className="bg-[#1E232B] text-white text-xs rounded-xl px-3 py-2.5 border border-white/10" />
                    <select value={newProd.book_sub_category} onChange={e => setNewProd({...newProd, book_sub_category: e.target.value})} className="bg-[#1E232B] text-white text-xs rounded-xl px-3 py-2.5 border border-white/10">
                      <option value="መንፈሳዊ">መንፈሳዊ</option>
                      <option value="የትምህርት">የትምህርት</option>
                      <option value="የሳይንስ">የሳይንስ</option>
                      <option value="ታሪክ እና ሌሎች">ታሪክ እና ሌሎች</option>
                    </select>
                  </div>
                </div>
              )}

              {/* 👗 አልባሳት ከሆነ */}
              {newProd.category === 'አልባሳት' && (
                <div className="bg-[#161A20] p-4 rounded-2xl border border-orange-500/30 space-y-3">
                  <p className="text-xs font-bold text-[#FB923C]">👗 የአልባሳት ዝርዝር</p>
                  <div className="grid grid-cols-2 gap-2">
                    <select value={newProd.size} onChange={e => setNewProd({...newProd, size: e.target.value})} className="bg-[#1E232B] text-white text-xs rounded-xl px-3 py-2.5 border border-white/10">
                      <option value="S">መጠን: S</option>
                      <option value="M">መጠን: M</option>
                      <option value="L">መጠን: L</option>
                      <option value="XL">መጠን: XL</option>
                      <option value="XXL">መጠን: XXL</option>
                    </select>
                    <input value={newProd.color} onChange={e => setNewProd({...newProd, color: e.target.value})} type="text" placeholder="ቀለም (ለምሳሌ ጥቁር)" className="bg-[#1E232B] text-white text-xs rounded-xl px-3 py-2.5 border border-white/10" />
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-gray-400">ዋጋ (ETB) *</label>
                  <input value={newProd.price} onChange={e => setNewProd({...newProd, price: e.target.value})} type="number" placeholder="650" className="w-full bg-[#161A20] text-white text-xs rounded-xl px-3.5 py-3 border border-white/10 mt-1" />
                </div>
                <div>
                  <label className="text-xs text-gray-400">የዴሊቨሪ ዋጋ (ETB)</label>
                  <input value={newProd.delivery_fee} onChange={e => setNewProd({...newProd, delivery_fee: e.target.value})} type="number" placeholder="100" className="w-full bg-[#161A20] text-white text-xs rounded-xl px-3.5 py-3 border border-white/10 mt-1" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-gray-400">የሚሸጥበት ከተማ *</label>
                  <input value={newProd.city} onChange={e => setNewProd({...newProd, city: e.target.value})} type="text" placeholder="አዲስ አበባ" className="w-full bg-[#161A20] text-white text-xs rounded-xl px-3.5 py-3 border border-white/10 mt-1" />
                </div>
                <div>
                  <label className="text-xs text-gray-400">ልዩ ቦታ/አድራሻ *</label>
                  <input value={newProd.location} onChange={e => setNewProd({...newProd, location: e.target.value})} type="text" placeholder="ቦሌ መድኃኔአለም" className="w-full bg-[#161A20] text-white text-xs rounded-xl px-3.5 py-3 border border-white/10 mt-1" />
                </div>
              </div>

              <div>
                <label className="text-xs text-gray-400">የፎቶ URL (Image URL)</label>
                <input value={newProd.image} onChange={e => setNewProd({...newProd, image: e.target.value})} type="text" placeholder="https://..." className="w-full bg-[#161A20] text-white text-xs rounded-xl px-3.5 py-3 border border-white/10 mt-1" />
              </div>

              <button type="submit" className="w-full bg-gradient-to-r from-[#F97316] to-[#FB923C] text-black text-xs font-bold py-3.5 rounded-xl shadow-lg mt-2">
                🚀 እቃውን ወደ ገበያ ጫን (Publish)
              </button>
            </form>
          </div>
        )}

        {/* TAB 2: PRODUCTS MANAGEMENT */}
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
                    <p className="text-xs font-extrabold text-[#FB923C]">{p.price} ETB {p.delivery_fee ? `(Del: ${p.delivery_fee})` : ''}</p>
                    <p className="text-[11px] text-gray-400">📍 {p.city || 'አ.አ'}, {p.location} • @{p.seller_username}</p>
                  </div>
                </div>
                <button onClick={() => deleteProduct(p.id)} className="bg-red-500/10 text-red-400 text-xs font-bold px-3 py-2 rounded-xl">🗑️ አጥፋ</button>
              </div>
            ))}
          </div>
        )}

        {/* TAB 3: VENDORS KYC & FEEDBACK */}
        {activeTab === 'vendors' && (
          <div className="space-y-4">
            {vendors.length === 0 ? (
              <div className="bg-[#1E232B] rounded-3xl p-12 text-center border border-white/5">
                <p className="text-gray-400 text-sm">ምንም የ KYC ማመልከቻ የለም።</p>
              </div>
            ) : (
              vendors.map(v => (
                <div key={v.id} className="bg-[#1E232B] p-6 rounded-3xl border border-white/5 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-xl">
                  <div className="space-y-3 flex-1">
                    <div className="flex items-center gap-3 flex-wrap">
                      <h3 className="text-base font-bold text-white">🏪 {v.store_name}</h3>
                      <span className="text-xs bg-[#2C221E] text-[#FB923C] font-bold px-3 py-1 rounded-full border border-orange-500/30">
                        👤 @{v.username}
                      </span>
                    </div>

                    <p className="text-xs text-gray-300">
                      📞 <strong>ስልክ፦</strong> {v.phone} &nbsp;|&nbsp; 📱 <strong>ቴሌብር/ባንክ፦</strong> <code className="text-orange-300">{v.telebirr_account || v.cbe_account || v.account}</code>
                    </p>

                    <div className="pt-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="bg-[#161A20] p-3 rounded-2xl border border-white/15">
                        <p className="text-[11px] text-[#FB923C] font-bold mb-2">🪪 መታወቂያ ፊት (Front)</p>
                        {v.id_front_image && <img onClick={() => setSelectedImage(v.id_front_image)} src={v.id_front_image} alt="" className="h-32 w-full rounded-xl object-cover cursor-pointer shadow" />}
                      </div>
                      <div className="bg-[#161A20] p-3 rounded-2xl border border-white/15">
                        <p className="text-[11px] text-[#FB923C] font-bold mb-2">🪪 መታወቂያ ኋላ (Back)</p>
                        {v.id_back_image && <img onClick={() => setSelectedImage(v.id_back_image)} src={v.id_back_image} alt="" className="h-32 w-full rounded-xl object-cover cursor-pointer shadow" />}
                      </div>
                    </div>

                    <div className="flex gap-2 pt-2">
                      <input 
                        type="text" 
                        placeholder="የማስተካከያ መልእክት (ለምሳሌ፦ መታወቂያው ግልጽ አይደለም)..." 
                        value={feedbackInputs[v.id] || ''}
                        onChange={e => setFeedbackInputs({...feedbackInputs, [v.id]: e.target.value})}
                        className="flex-1 bg-[#161A20] text-white text-xs rounded-xl px-3.5 py-2.5 border border-white/10"
                      />
                      <button onClick={() => sendVendorFeedback(v.id)} className="bg-[#3A281E] text-[#FB923C] border border-orange-500/30 text-xs font-bold px-4 py-2.5 rounded-xl whitespace-nowrap">
                        📩 መልእክት ላክ
                      </button>
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-3 w-full md:w-auto">
                    <span className={`text-xs px-3.5 py-1.5 rounded-full font-bold ${v.status === 'Pending' ? 'bg-amber-500/20 text-amber-300' : 'bg-emerald-500/20 text-emerald-300'}`}>
                      {v.status || 'Pending'}
                    </span>
                    <div className="flex gap-2 w-full md:w-auto">
                      {v.status === 'Pending' && (
                        <button onClick={() => approveVendor(v.id)} className="bg-[#FB923C] text-black text-xs font-bold px-5 py-3 rounded-xl shadow-lg">
                          ✅ አጽድቅ
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

        {/* TAB 4: ORDERS & ESCROW */}
        {activeTab === 'orders' && (
          <div className="space-y-4">
            {orders.length === 0 ? (
              <div className="bg-[#1E232B] rounded-3xl p-12 text-center border border-white/5">
                <p className="text-gray-400 text-sm">ምንም የትዕዛዝ ግብይት የለም።</p>
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
                    {(!o.status.includes('Released') && !o.status.includes('ተለቋል')) && (
                      <button onClick={() => approveOrder(o.id)} className="bg-emerald-500 text-black text-xs font-bold px-4 py-2.5 rounded-xl">
                        ✅ ገንዘቡን ለሻጭ ልቀቅ (Release)
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
