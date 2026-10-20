import React, { useState, useEffect, useRef } from 'react';
import { API_BASE_URL } from './config';

export default function App() {
  const [activeTab, setActiveTab] = useState<'vendors' | 'products' | 'publish' | 'orders'>('vendors');
  const [vendors, setVendors] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [serverStatus, setServerStatus] = useState<'checking' | 'online' | 'offline'>('checking');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [feedbackInputs, setFeedbackInputs] = useState<{ [key: string]: string }>({});

  const [cameraOpen, setCameraOpen] = useState(false);
  const [activePhotoSlot, setActivePhotoSlot] = useState<'image1' | 'image2' | 'image3'>('image1');
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [newProd, setNewProd] = useState({
    name: '',
    price: '',
    category: 'መጽሐፍት',
    condition: 'አዲስ',
    city: 'አዲስ አበባ',
    location: 'ቦሌ',
    delivery_fee: '0',
    quantity: '1',
    image1: '',
    image2: '',
    image3: '',
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

  const handleGalleryUpload = (e: React.ChangeEvent<HTMLInputElement>, slot: 'image1' | 'image2' | 'image3') => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = 400;
        canvas.height = img.height * (400 / img.width);
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, canvas.width, canvas.height);
        const base64 = canvas.toDataURL('image/jpeg', 0.7);
        setNewProd(prev => ({ ...prev, [slot]: base64 }));
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const startCamera = async (slot: 'image1' | 'image2' | 'image3') => {
    setActivePhotoSlot(slot);
    setCameraOpen(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: 'environment' }, width: { ideal: 640 }, height: { ideal: 480 } },
        audio: false
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
    } catch {
      setCameraOpen(false);
      alert("⚠️ ካሜራ መክፈት አልተቻለም።");
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setCameraOpen(false);
  };

  const captureFromCamera = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = 400;
    canvas.height = (video.videoHeight || 300) * (400 / (video.videoWidth || 400));
    const ctx = canvas.getContext('2d');
    ctx?.drawImage(video, 0, 0, canvas.width, canvas.height);
    const base64 = canvas.toDataURL('image/jpeg', 0.7);

    setNewProd(prev => ({ ...prev, [activePhotoSlot]: base64 }));
    stopCamera();
  };

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

  const handleAdminPublishProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProd.name || !newProd.price || !newProd.city || !newProd.location) {
      return alert("⚠️ እባክዎ የእቃውን ስም፣ ዋጋ፣ ከተማ እና አድራሻ ይሙሉ!");
    }
    try {
      const res = await fetch(`${API_BASE_URL}/products`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newProd,
          image: newProd.image1 || newProd.image2 || newProd.image3 || ''
        })
      });
      if (res.ok) {
        alert("🎉 እቃው በተሳካ ሁኔታ ተጭኗል!");
        setNewProd({
          name: '',
          price: '',
          category: 'መጽሐፍት',
          condition: 'አዲስ',
          city: 'አዲስ አበባ',
          location: 'ቦሌ',
          delivery_fee: '0',
          quantity: '1',
          image1: '',
          image2: '',
          image3: '',
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
      alert("⚠️ እቃውን መጫን አልተቻለም።");
    }
  };

  const approveOrder = async (id: number) => {
    setOrders(orders.map(o => o.id === id ? { ...o, status: 'Released to Vendor ✅' } : o));
    try { await fetch(`${API_BASE_URL}/orders/${id}/approve`, { method: 'POST' }); } catch {}
  };

  return (
    <div className="min-h-screen bg-[#161A20] text-white p-4 md:p-8 font-sans">
      {cameraOpen && (
        <div className="fixed inset-0 z-50 bg-black/95 flex flex-col items-center justify-center p-4">
          <div className="w-full max-w-sm bg-[#1E232B] rounded-3xl p-4 border border-orange-500/40 space-y-4 text-center shadow-2xl">
            <h3 className="text-sm font-bold text-[#FB923C]">ካሜራ</h3>
            <div className="relative w-full h-64 bg-black rounded-2xl overflow-hidden border border-[#FB923C]">
              <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
            </div>
            <div className="flex gap-3">
              <button onClick={stopCamera} className="flex-1 bg-[#262C36] text-gray-300 text-xs font-bold py-3 rounded-xl">ሰርዝ</button>
              <button onClick={captureFromCamera} className="flex-1 bg-[#FB923C] text-black text-xs font-bold py-3 rounded-xl">📸 ፎቶ አንሳ</button>
            </div>
          </div>
        </div>
      )}

      <header className="bg-[#1E232B] border border-white/5 rounded-3xl px-6 py-4 flex flex-col md:flex-row items-center justify-between gap-4 mb-6 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#F97316] to-[#FB923C] flex items-center justify-center font-bold text-black text-lg shadow-lg">
            ✥
          </div>
          <div>
            <h1 className="text-base font-bold tracking-tight">EOTC Market — Super Admin Dashboard</h1>
            <p className="text-xs text-gray-400">Vendor KYC, Telebirr/Bank & Back ID Sync Dashboard</p>
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
            🪪 1. የሻጮች KYC እና የባንክ መረጃ ({vendors.length})
          </button>
          <button onClick={() => setActiveTab('publish')} className={`px-5 py-2.5 rounded-full text-xs font-bold ${activeTab === 'publish' ? 'bg-[#3A281E] text-[#FB923C] border border-orange-500/30' : 'bg-[#1E232B] text-gray-400'}`}>
            ➕ 2. እቃ/መጽሐፍ መጫኛ
          </button>
          <button onClick={() => setActiveTab('products')} className={`px-5 py-2.5 rounded-full text-xs font-bold ${activeTab === 'products' ? 'bg-[#3A281E] text-[#FB923C] border border-orange-500/30' : 'bg-[#1E232B] text-gray-400'}`}>
            📦 3. የእቃዎች ዝርዝር ({products.length})
          </button>
          <button onClick={() => setActiveTab('orders')} className={`px-5 py-2.5 rounded-full text-xs font-bold ${activeTab === 'orders' ? 'bg-[#3A281E] text-[#FB923C] border border-orange-500/30' : 'bg-[#1E232B] text-gray-400'}`}>
            💳 4. የ Escrow ትዕዛዞች ({orders.length})
          </button>
        </div>

        {/* TAB 1: VENDORS KYC & BANK INFO DISPLAY (Fixed Telebirr & Back ID) */}
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
                        👤 @{v.username}
                      </span>
                    </div>

                    <p className="text-xs text-gray-300">
                      📞 <strong>ስልክ፦</strong> {v.phone}
                    </p>

                    {/* የቴሌብር እና የባንክ አካውንቶች በግልጽ እንዲታዩ */}
                    <div className="bg-[#161A20] p-3.5 rounded-xl border border-orange-500/30 space-y-1.5 text-xs">
                      <p className="text-[#FB923C] font-bold">💳 የሻጭ የክፍያ አካውንቶች፦</p>
                      <p>📱 <strong>ቴሌብር (Telebirr):</strong> <code className="text-orange-300">{v.telebirr_account || 'አልተመዘገበም'}</code></p>
                      <p>🏦 <strong>ንግድ ባንክ (CBE):</strong> <code className="text-orange-300">{v.cbe_account || v.account || 'አልተመዘገበም'}</code></p>
                      <p>🏦 <strong>አቢሲኒያ (Abyssinia):</strong> <code className="text-orange-300">{v.abyssinia_account || 'አልተመዘገበም'}</code></p>
                    </div>

                    {/* የፊት እና የኋላ መታወቂያ ፎቶዎች (የጀርባ ፎቶ ጥቁር እንዳይሆን በትክክል ተስተካክሏል) */}
                    <div className="pt-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="bg-[#161A20] p-3 rounded-2xl border border-white/15">
                        <p className="text-[11px] text-[#FB923C] font-bold mb-2">🪪 መታወቂያ ፊት (Front)</p>
                        {v.id_front_image ? (
                          <img onClick={() => setSelectedImage(v.id_front_image)} src={v.id_front_image} alt="ID Front" className="h-36 w-full rounded-xl object-cover cursor-pointer shadow border border-white/10" />
                        ) : (
                          <p className="text-xs text-gray-500 py-8 text-center">ፎቶ የለም</p>
                        )}
                      </div>

                      <div className="bg-[#161A20] p-3 rounded-2xl border border-white/15">
                        <p className="text-[11px] text-[#FB923C] font-bold mb-2">🪪 መታወቂያ ኋላ (Back)</p>
                        {v.id_back_image ? (
                          <img onClick={() => setSelectedImage(v.id_back_image)} src={v.id_back_image} alt="ID Back" className="h-36 w-full rounded-xl object-cover cursor-pointer shadow border border-white/10 bg-white/5" />
                        ) : (
                          <p className="text-xs text-gray-500 py-8 text-center">የኋላ ፎቶ የለም</p>
                        )}
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
                        🗑️ ውድቅ
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* TAB 2: PUBLISH PRODUCT */}
        {activeTab === 'publish' && (
          <div className="bg-[#1E232B] p-6 rounded-3xl border border-white/5 max-w-2xl mx-auto space-y-4 shadow-xl">
            <h3 className="text-sm font-bold text-[#FB923C]">📸 እቃ ወይም መጽሐፍ መጫኛ</h3>
            
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
                <input value={newProd.name} onChange={e => setNewProd({...newProd, name: e.target.value})} type="text" placeholder="የእቃው ስም" className="w-full bg-[#161A20] text-white text-xs rounded-xl px-3.5 py-3 border border-white/10 mt-1" />
              </div>

              <div className="bg-[#161A20] p-4 rounded-2xl border border-orange-500/30 space-y-3">
                <p className="text-xs font-bold text-[#FB923C]">📸 የእቃ ፎቶ (ከጋለሪ ወይም በካሜራ)</p>
                <div className="flex gap-2">
                  <button type="button" onClick={() => startCamera('image1')} className="bg-[#3A281E] text-[#FB923C] text-xs font-bold px-3 py-2.5 rounded-xl border border-orange-500/30">📸 ካሜራ</button>
                  <label className="flex-1 bg-[#1E232B] border border-white/10 text-gray-300 text-xs font-bold py-2.5 px-3 rounded-xl flex items-center justify-center cursor-pointer">
                    🖼️ ከጋለሪ ምረጥ
                    <input type="file" accept="image/*" onChange={e => handleGalleryUpload(e, 'image1')} className="hidden" />
                  </label>
                </div>
                {newProd.image1 && <img src={newProd.image1} alt="" className="h-20 w-32 rounded-lg object-cover mt-1 border border-white/10" />}
              </div>

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

              <button type="submit" className="w-full bg-gradient-to-r from-[#F97316] to-[#FB923C] text-black text-xs font-bold py-3.5 rounded-xl shadow-lg mt-2">
                🚀 እቃውን ወደ ገበያ ጫን
              </button>
            </form>
          </div>
        )}

        {/* TAB 3: PRODUCTS */}
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
                    <p className="text-[11px] text-gray-400">📍 {p.city || 'አ.አ'}, {p.location} • @{p.seller_username}</p>
                  </div>
                </div>
                <button onClick={() => deleteProduct(p.id)} className="bg-red-500/10 text-red-400 text-xs font-bold px-3 py-2 rounded-xl">🗑️ አጥፋ</button>
              </div>
            ))}
          </div>
        )}

        {/* TAB 4: ORDERS */}
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
                        ✅ ገንዘቡን ለሻጭ ልቀቅ
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
