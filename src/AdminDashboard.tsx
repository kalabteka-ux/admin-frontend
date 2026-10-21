import React, { useState, useEffect } from 'react';
import { API_BASE_URL } from './config';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<'products' | 'vendors' | 'bank_settings'>('products');
  const [products, setProducts] = useState<any[]>([]);
  const [vendors, setVendors] = useState<any[]>([]);
  const [notification, setNotification] = useState<string | null>(null);
  const [viewingProduct, setViewingProduct] = useState<any | null>(null);

  // 💳 የአድሚን የባንክ እና ስልክ ቁጥር ስቴት
  const [adminBank, setAdminBank] = useState({
    store_name: "EOTC Official Store",
    phone: "0910573232",
    telebirr_account: "0910573232",
    cbe_account: "",
    abyssinia_account: ""
  });

  const [prodForm, setProdForm] = useState({
    id: null as number | null,
    name: '',
    price: '',
    category: 'መጽሐፍት',
    condition: 'አዲስ',
    city: 'አዲስ አበባ',
    location: '',
    has_delivery: true,
    delivery_fee: '100',
    quantity: '1',
    image: '',
    author: '',
    pub_year: '',
    publisher: '',
    book_sub_category: 'መንፈሳዊ',
    seller_username: 'admin'
  });

  const showToast = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 4000);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const pRes = await fetch(`${API_BASE_URL}/products`);
      if (pRes.ok) setProducts(await pRes.json());
      
      const vRes = await fetch(`${API_BASE_URL}/vendors`);
      if (vRes.ok) {
        const vData = await vRes.json();
        setVendors(vData);
        const adminVendor = vData.find((v: any) => v.username?.toLowerCase() === 'admin');
        if (adminVendor) {
          setAdminBank({
            store_name: adminVendor.store_name || "EOTC Official Store",
            phone: adminVendor.phone || "0910573232",
            telebirr_account: adminVendor.telebirr_account || "0910573232",
            cbe_account: adminVendor.cbe_account || "",
            abyssinia_account: adminVendor.abyssinia_account || ""
          });
        }
      }
    } catch {}
  };

  const handleImageUpload = (file: File) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const maxDim = 800;
        const scale = img.width > maxDim ? maxDim / img.width : 1;
        canvas.width = Math.round(img.width * scale);
        canvas.height = Math.round(img.height * scale);
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.fillStyle = '#FFFFFF';
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        }
        setProdForm(prev => ({ ...prev, image: canvas.toDataURL('image/jpeg', 0.82) }));
        showToast("📸 ፎቶው በከፍተኛ ጥራት ተጭኗል!");
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleSaveAdminBank = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/vendors`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: 'admin',
          store_name: adminBank.store_name,
          phone: adminBank.phone,
          telebirr_account: adminBank.telebirr_account,
          cbe_account: adminBank.cbe_account,
          abyssinia_account: adminBank.abyssinia_account,
          id_front_image: 'admin_verified',
          id_back_image: 'admin_verified'
        })
      });
      if (res.ok) {
        const allVendors = await (await fetch(`${API_BASE_URL}/vendors`)).json();
        const adminV = allVendors.find((v: any) => v.username?.toLowerCase() === 'admin');
        if (adminV) {
          await fetch(`${API_BASE_URL}/vendors/${adminV.id}/approve`, { method: 'POST' });
        }
        showToast("✅ የአድሚን ስልክ ቁጥር እና የባንክ መረጃ ተቀምጧል!");
        fetchData();
      }
    } catch {
      showToast("⚠️ ማስቀመጥ አልተቻለም።");
    }
  };

  const handleSaveProduct = async () => {
    if (!prodForm.name.trim() || !prodForm.price || !prodForm.location.trim() || !prodForm.city.trim()) {
      return showToast("⚠️ እባክዎ የእቃ ስም፣ ዋጋ፣ ከተማ እና አድራሻ ይሙሉ!");
    }

    const finalDeliveryFee = prodForm.has_delivery ? Number(prodForm.delivery_fee || 0) : 0;
    const payload = {
      ...prodForm,
      price: Number(prodForm.price),
      delivery_fee: finalDeliveryFee,
      seller_username: 'admin',
      store_name: adminBank.store_name || "EOTC Official Store"
    };

    try {
      const url = prodForm.id ? `${API_BASE_URL}/products/${prodForm.id}` : `${API_BASE_URL}/products`;
      const method = prodForm.id ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        showToast(prodForm.id ? "✏️ ማስታወቂያው ተስተካክሏል!" : "🎉 እቃው በገበያ ላይ ተጭኗል!");
        setProdForm({
          id: null,
          name: '',
          price: '',
          category: 'መጽሐፍት',
          condition: 'አዲስ',
          city: 'አዲስ አበባ',
          location: '',
          has_delivery: true,
          delivery_fee: '100',
          quantity: '1',
          image: '',
          author: '',
          pub_year: '',
          publisher: '',
          book_sub_category: 'መንፈሳዊ',
          seller_username: 'admin'
        });
        fetchData();
      }
    } catch {
      showToast("⚠️ ማከናወን አልተቻለም።");
    }
  };

  const handleDeleteProduct = async (id: number) => {
    if (!window.confirm("እርግጠኛ ኖት ይህንን እቃ ማጥፋት ይፈልጋሉ?")) return;
    try {
      await fetch(`${API_BASE_URL}/products/${id}`, { method: 'DELETE' });
      showToast("🗑️ እቃው ተሰርዟል!");
      fetchData();
    } catch {
      showToast("⚠️ ማጥፋት አልተቻለም።");
    }
  };

  const handleApproveVendor = async (id: number) => {
    await fetch(`${API_BASE_URL}/vendors/${id}/approve`, { method: 'POST' });
    showToast("✅ ሻጩ ጸድቋል!");
    fetchData();
  };

  const handleRejectVendor = async (id: number) => {
    const feedback = prompt("እባክዎ የማስተካከያ ምክንያት ይጻፉ፦");
    if (!feedback) return;
    await fetch(`${API_BASE_URL}/vendors/${id}/feedback`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ admin_feedback: feedback })
    });
    showToast("❌ ማመልከቻው ተመልሷል።");
    fetchData();
  };

  return (
    <div className="min-h-screen bg-[#12161C] text-white p-6 font-sans">
      {notification && (
        <div className="fixed top-5 left-1/2 -translate-x-1/2 z-50 bg-[#2C221E] border border-[#FB923C] text-white px-6 py-3 rounded-2xl shadow-2xl text-xs font-semibold">
          {notification}
        </div>
      )}

      {/* 🔍 የእቃ ዝርዝር መመልከቻ ፖፕአፕ */}
      {viewingProduct && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#1E232B] w-full max-w-md rounded-3xl p-6 border border-orange-500/40 space-y-4 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="text-sm font-bold text-[#FB923C]">📦 የእቃው ሙሉ ዝርዝር መረጃ</h3>
              <button onClick={() => setViewingProduct(null)} className="text-gray-400 font-bold">✕</button>
            </div>

            <div className="h-48 rounded-2xl bg-[#161A20] overflow-hidden border border-white/10 flex items-center justify-center">
              {viewingProduct.image ? <img src={viewingProduct.image} alt="" className="w-full h-full object-cover" /> : <span className="text-5xl">🛍️</span>}
            </div>

            <div className="space-y-2 text-xs">
              <p className="text-base font-extrabold text-white">🛍️ ርዕስ/ስም፦ {viewingProduct.name}</p>
              <p className="text-sm font-bold text-[#FB923C]">💵 ዋጋ፦ {viewingProduct.price} ETB</p>
              <p className="text-gray-300">📂 ምድብ፦ {viewingProduct.category} ({viewingProduct.book_sub_category || 'አጠቃላይ'})</p>
              <p className="text-gray-300">✨ ሁኔታ፦ {viewingProduct.condition || 'አዲስ'}</p>
              <p className="text-gray-300">🏙️ ከተማ እና ቦታ፦ {viewingProduct.city}, {viewingProduct.location}</p>
              <p className="text-emerald-400 font-bold">🚚 ዴሊቨሪ፦ {Number(viewingProduct.delivery_fee || 0) > 0 ? `አለው (+${viewingProduct.delivery_fee} ETB)` : 'አልተዘጋጀም (Pickup only)'}</p>

              {viewingProduct.category === 'መጽሐፍት' && (
                <div className="bg-[#161A20] p-3 rounded-xl border border-white/10 space-y-1 mt-2">
                  <p>✍️ ጸሐፊ፦ {viewingProduct.author || 'ያልተጠቀሰ'}</p>
                  <p>📅 የህትመት ዘመን፦ {viewingProduct.pub_year || 'ያልተጠቀሰ'}</p>
                  <p>🏢 አሳታሚ፦ {viewingProduct.publisher || 'ያልተጠቀሰ'}</p>
                </div>
              )}
            </div>

            <button onClick={() => setViewingProduct(null)} className="w-full bg-[#3A281E] text-[#FB923C] border border-orange-500/30 text-xs font-bold py-3 rounded-xl">
              ዝጋ (Close)
            </button>
          </div>
        </div>
      )}

      <header className="flex justify-between items-center mb-8 border-b border-white/10 pb-4">
        <div>
          <h1 className="text-xl font-extrabold text-[#FB923C]">⚙️ EOTC Market - Admin Dashboard</h1>
          <p className="text-xs text-gray-400 mt-1">የዕቃዎች አስተዳደር፣ የነጋዴዎች KYC ማጽደቂያ እና የአድሚን የክፍያ አካውንቶች ማዋቀሪያ</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setActiveTab('products')} className={`px-4 py-2 rounded-xl text-xs font-bold ${activeTab === 'products' ? 'bg-[#3A281E] text-[#FB923C] border border-orange-500/30' : 'bg-[#1E232B] text-gray-400'}`}>
            📦 እቃዎች አስተዳደር
          </button>
          <button onClick={() => setActiveTab('vendors')} className={`px-4 py-2 rounded-xl text-xs font-bold ${activeTab === 'vendors' ? 'bg-[#3A281E] text-[#FB923C] border border-orange-500/30' : 'bg-[#1E232B] text-gray-400'}`}>
            👥 ሻጮች (KYC)
          </button>
          <button onClick={() => setActiveTab('bank_settings')} className={`px-4 py-2 rounded-xl text-xs font-bold ${activeTab === 'bank_settings' ? 'bg-[#3A281E] text-[#FB923C] border border-orange-500/30' : 'bg-[#1E232B] text-gray-400'}`}>
            💳 የእኔ የባንክ አካውንቶች
          </button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto space-y-6">
        {activeTab === 'products' && (
          <div className="space-y-6">
            <div className="bg-[#1E232B] p-6 rounded-3xl border border-white/10 space-y-4 shadow-xl">
              <h3 className="text-sm font-bold text-[#FB923C]">
                {prodForm.id ? "✏️ ማስታወቂያ ማስተካከያ (Edit)" : "📦 አዲስ እቃ መለጠፊያ (Admin Post)"}
              </h3>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] text-gray-400">ዋና ምድብ *</label>
                  <select value={prodForm.category} onChange={e => setProdForm({...prodForm, category: e.target.value})} className="w-full bg-[#161A20] text-white text-xs rounded-xl p-3 border border-white/10 mt-1">
                    <option value="መጽሐፍት">መጽሐፍት</option>
                    <option value="ንዋየ ቅድሳት">ንዋየ ቅድሳት</option>
                    <option value="አልባሳት">አልባሳት</option>
                    <option value="ሥዕላት">ሥዕላት</option>
                  </select>
                </div>
                <div>
                  <label className="text-[11px] text-gray-400">የእቃው ሁኔታ *</label>
                  <select value={prodForm.condition} onChange={e => setProdForm({...prodForm, condition: e.target.value})} className="w-full bg-[#161A20] text-white text-xs rounded-xl p-3 border border-white/10 mt-1">
                    <option value="አዲስ">አዲስ (New)</option>
                    <option value="አሮጌ (ያገለገለ)">አሮጌ / ያገለገለ</option>
                  </select>
                </div>
              </div>

              <input value={prodForm.name} onChange={e => setProdForm({...prodForm, name: e.target.value})} type="text" placeholder="የእቃው ስም *" className="w-full bg-[#161A20] text-white text-xs rounded-xl p-3.5 border border-white/10" />

              {prodForm.category === 'መጽሐፍት' && (
                <div className="bg-[#161A20]/70 p-4 rounded-2xl border border-orange-500/30 space-y-3">
                  <p className="text-xs font-bold text-[#FB923C]">📚 የመጽሐፍ ዝርዝር መሙያ</p>
                  <div className="grid grid-cols-2 gap-2">
                    <input value={prodForm.author} onChange={e => setProdForm({...prodForm, author: e.target.value})} type="text" placeholder="የጸሐፊው ስም" className="w-full bg-[#1E232B] text-white text-xs rounded-xl p-3 border border-white/10" />
                    <input value={prodForm.pub_year} onChange={e => setProdForm({...prodForm, pub_year: e.target.value})} type="text" placeholder="የህትመት ዘመን" className="w-full bg-[#1E232B] text-white text-xs rounded-xl p-3 border border-white/10" />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <input value={prodForm.publisher} onChange={e => setProdForm({...prodForm, publisher: e.target.value})} type="text" placeholder="አሳታሚ" className="w-full bg-[#1E232B] text-white text-xs rounded-xl p-3 border border-white/10" />
                    <select value={prodForm.book_sub_category} onChange={e => setProdForm({...prodForm, book_sub_category: e.target.value})} className="w-full bg-[#1E232B] text-white text-xs rounded-xl p-3 border border-white/10">
                      <option value="መንፈሳዊ">መንፈሳዊ</option>
                      <option value="የትምህርት">የትምህርት</option>
                      <option value="የሳይንስ">የሳይንስ</option>
                      <option value="ታሪክ እና ሌሎች">ታሪክ እና ሌሎች</option>
                    </select>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <input value={prodForm.price} onChange={e => setProdForm({...prodForm, price: e.target.value})} type="number" placeholder="ዋጋ (ETB) *" className="w-full bg-[#161A20] text-white text-xs rounded-xl p-3.5 border border-white/10" />
                <div className="bg-[#161A20] p-2 rounded-xl border border-white/10 flex items-center justify-between px-4">
                  <span className="text-xs text-gray-300">ዴሊቨሪ አለው?</span>
                  <input type="checkbox" checked={prodForm.has_delivery} onChange={e => setProdForm({...prodForm, has_delivery: e.target.checked})} className="w-4 h-4 accent-[#FB923C]" />
                </div>
              </div>

              {prodForm.has_delivery && (
                <input value={prodForm.delivery_fee} onChange={e => setProdForm({...prodForm, delivery_fee: e.target.value})} type="number" placeholder="የዴሊቨሪ ዋጋ (ETB)" className="w-full bg-[#161A20] text-white text-xs rounded-xl p-3.5 border border-white/10" />
              )}

              <div className="grid grid-cols-2 gap-3">
                <input value={prodForm.city} onChange={e => setProdForm({...prodForm, city: e.target.value})} type="text" placeholder="ከተማ (አ.አ) *" className="w-full bg-[#161A20] text-white text-xs rounded-xl p-3.5 border border-white/10" />
                <input value={prodForm.location} onChange={e => setProdForm({...prodForm, location: e.target.value})} type="text" placeholder="ቦታ (ቦሌ) *" className="w-full bg-[#161A20] text-white text-xs rounded-xl p-3.5 border border-white/10" />
              </div>

              <div>
                <label className="text-xs text-gray-400 block mb-1">🖼️ የእቃው ፎቶ</label>
                <input type="file" accept="image/*" onChange={e => e.target.files?.[0] && handleImageUpload(e.target.files[0])} className="w-full bg-[#161A20] text-xs text-gray-300 rounded-xl p-3 border border-white/10" />
              </div>

              {prodForm.image && <img src={prodForm.image} alt="" className="w-full h-36 object-cover rounded-xl border border-emerald-500/40" />}

              <button onClick={handleSaveProduct} className="w-full bg-[#FB923C] text-black font-bold text-xs py-4 rounded-xl shadow-lg">
                {prodForm.id ? "✏️ ማስታወቂያውን አስተካክል" : "🎉 እቃውን ወደ ገበያ ጫን"}
              </button>
            </div>

            <div className="bg-[#1E232B] p-6 rounded-3xl border border-white/10 space-y-4">
              <h3 className="text-sm font-bold text-white">📋 በገበያ ላይ ያሉ እቃዎች ({products.length})</h3>
              <div className="space-y-2">
                {products.map(p => (
                  <div key={p.id} className="bg-[#161A20] p-3 rounded-2xl flex items-center justify-between border border-white/5">
                    <div className="flex items-center gap-3 cursor-pointer" onClick={() => setViewingProduct(p)}>
                      <div className="w-12 h-12 rounded-xl overflow-hidden bg-white/10 flex items-center justify-center">
                        {p.image ? <img src={p.image} alt="" className="w-full h-full object-cover" /> : <span>🛍️</span>}
                      </div>
                      <div>
                        <p className="text-xs font-bold text-white underline decoration-[#FB923C]">{p.name}</p>
                        <p className="text-xs text-[#FB923C]">{p.price} ETB • {p.city}</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => setViewingProduct(p)} className="bg-sky-500/10 text-sky-400 text-[10px] font-bold px-3 py-2 rounded-xl">
                        🔍 ዝርዝር
                      </button>
                      <button onClick={() => setProdForm({
                        id: p.id,
                        name: p.name || '',
                        price: String(p.price || ''),
                        category: p.category || 'መጽሐፍት',
                        condition: p.condition || 'አዲስ',
                        city: p.city || 'አዲስ አበባ',
                        location: p.location || '',
                        has_delivery: Number(p.delivery_fee || 0) > 0,
                        delivery_fee: String(p.delivery_fee || '100'),
                        quantity: p.quantity || '1',
                        image: p.image || '',
                        author: p.author || '',
                        pub_year: p.pub_year || '',
                        publisher: p.publisher || '',
                        book_sub_category: p.book_sub_category || 'መንፈሳዊ',
                        seller_username: p.seller_username || 'admin'
                      })} className="bg-[#3A281E] text-[#FB923C] text-[10px] font-bold px-3 py-2 rounded-xl">
                        ✏️ Edit
                      </button>
                      <button onClick={() => handleDeleteProduct(p.id)} className="bg-red-500/10 text-red-400 text-[10px] font-bold px-3 py-2 rounded-xl">
                        🗑️ አጥፋ
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'vendors' && (
          <div className="bg-[#1E232B] p-6 rounded-3xl border border-white/10 space-y-4">
            <h3 className="text-sm font-bold text-[#FB923C]">👥 የሻጮች ማመልከቻዎች (KYC)</h3>
            {vendors.length === 0 ? (
              <p className="text-xs text-gray-500 text-center py-6">እስካሁን የተመዘገበ ሻጭ የለም።</p>
            ) : (
              <div className="space-y-3">
                {vendors.map(v => (
                  <div key={v.id} className="bg-[#161A20] p-4 rounded-2xl border border-white/5 space-y-2 text-xs">
                    <div className="flex justify-between items-center">
                      <p className="font-bold text-white">@{v.username} ({v.store_name})</p>
                      <span className={`px-2.5 py-0.5 rounded-full font-bold ${v.status === 'Approved ✅' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-amber-500/20 text-amber-300'}`}>{v.status}</span>
                    </div>
                    <p className="text-gray-300">📞 ስልክ፦ {v.phone} • ቴሌብር፦ {v.telebirr_account || 'የለ'} • CBE፦ {v.cbe_account || 'የለ'}</p>
                    <div className="flex gap-2 pt-2">
                      <button onClick={() => handleApproveVendor(v.id)} className="flex-1 bg-emerald-500 text-black font-bold py-2 rounded-xl">
                        ✅ አጽድቅ (Approve)
                      </button>
                      <button onClick={() => handleRejectVendor(v.id)} className="flex-1 bg-red-500/20 text-red-400 font-bold py-2 rounded-xl">
                        ❌ መልስ (Reject)
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'bank_settings' && (
          <div className="bg-[#1E232B] p-6 rounded-3xl border border-white/10 space-y-4 shadow-xl">
            <h3 className="text-sm font-bold text-[#FB923C]">💳 የአድሚን ስልክ ቁጥር እና የክፍያ አካውንቶች ማዋቀሪያ</h3>
            <p className="text-xs text-gray-400">እዚህ ላይ የሚያስገቧቸው ስልክ ቁጥር (0910573232 ን ጨምሮ) እና የቴሌብር/ባንክ አካውንቶች አድሚን በሚለጥፋቸው እቃዎች ላይ እንደ መክፈያ አድራሻ ያገለግላሉ።</p>

            <div className="space-y-3 pt-2">
              <div>
                <label className="text-[11px] text-gray-400">🏪 የሱቅ ስም</label>
                <input value={adminBank.store_name} onChange={e => setAdminBank({...adminBank, store_name: e.target.value})} type="text" className="w-full bg-[#161A20] text-white text-xs rounded-xl p-3.5 border border-white/10 mt-1" />
              </div>
              <div>
                <label className="text-[11px] text-gray-400">📞 የእርስዎ ስልክ ቁጥር (ለምሳሌ 0910573232)</label>
                <input value={adminBank.phone} onChange={e => setAdminBank({...adminBank, phone: e.target.value})} type="tel" className="w-full bg-[#161A20] text-white text-xs rounded-xl p-3.5 border border-white/10 mt-1" />
              </div>
              <div>
                <label className="text-[11px] text-gray-400">📱 የቴሌብር ስልክ ቁጥር</label>
                <input value={adminBank.telebirr_account} onChange={e => setAdminBank({...adminBank, telebirr_account: e.target.value})} type="tel" className="w-full bg-[#161A20] text-white text-xs rounded-xl p-3.5 border border-white/10 mt-1" />
              </div>
              <div>
                <label className="text-[11px] text-gray-400">🏦 የንግድ ባንክ (CBE) አካውንት ቁጥር</label>
                <input value={adminBank.cbe_account} onChange={e => setAdminBank({...adminBank, cbe_account: e.target.value})} type="text" className="w-full bg-[#161A20] text-white text-xs rounded-xl p-3.5 border border-white/10 mt-1" />
              </div>
              <div>
                <label className="text-[11px] text-gray-400">🏦 የአቢሲኒያ ባንክ አካውንት ቁጥር</label>
                <input value={adminBank.abyssinia_account} onChange={e => setAdminBank({...adminBank, abyssinia_account: e.target.value})} type="text" className="w-full bg-[#161A20] text-white text-xs rounded-xl p-3.5 border border-white/10 mt-1" />
              </div>

              <button onClick={handleSaveAdminBank} className="w-full bg-gradient-to-r from-[#F97316] to-[#FB923C] text-black font-bold text-xs py-4 rounded-xl shadow-lg mt-3">
                💾 መረጃዎችን በቋሚነት አስቀምጥ
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
