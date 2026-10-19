import React, { useState, useEffect } from 'react';
import { API_BASE_URL } from './config';

export default function App() {
  const [vendors, setVendors] = useState<any[]>([]);

  const fetchVendors = () => {
    const localVendors = JSON.parse(localStorage.getItem('eotc_admin_vendors') || '[]');
    setVendors(localVendors);
  };

  useEffect(() => {
    fetchVendors();
    const interval = setInterval(fetchVendors, 3000);
    return () => clearInterval(interval);
  }, []);

  // አድሚኑ ሱቁን ሲያጸድቅ (Approve Vendor)
  const approveVendor = (id: number) => {
    const updated = vendors.map(v => v.id === id ? { ...v, status: 'Approved ✅' } : v);
    setVendors(updated);
    localStorage.setItem('eotc_admin_vendors', JSON.stringify(updated));
  };

  return (
    <div className="min-h-screen bg-[#161A20] text-white p-6 font-sans">
      <header className="bg-[#1E232B] border border-white/5 rounded-3xl px-6 py-4 flex items-center justify-between mb-6 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-[#FB923C] flex items-center justify-center font-bold text-black text-lg">✥</div>
          <div>
            <h1 className="text-base font-bold">EOTC Market — Super Admin KYC Approval</h1>
            <p className="text-xs text-gray-400">Review IDs and grant selling permissions</p>
          </div>
        </div>
        <button onClick={fetchVendors} className="bg-[#2C221E] text-[#FB923C] border border-orange-500/30 text-xs font-bold px-4 py-2.5 rounded-full">
          🔄 Refresh
        </button>
      </header>

      <div className="max-w-4xl mx-auto space-y-4">
        <h2 className="text-sm font-bold text-gray-400 uppercase">የተመዝጋቢዎች መታወቂያ እና ሱቅ ማረጋገጫ ({vendors.length})</h2>

        {vendors.length === 0 ? (
          <div className="bg-[#1E232B] rounded-3xl p-12 text-center border border-white/5">
            <p className="text-gray-400 text-sm">እስካሁን ምንም አዲስ ምዝገባ የለም።</p>
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
                
                {v.id_front_image && (
                  <div className="pt-2">
                    <p className="text-xs text-gray-400 mb-1">የተላከው መታወቂያ ፎቶ (ID Scan):</p>
                    <a href={v.id_front_image} target="_blank" rel="noreferrer">
                      <img src={v.id_front_image} alt="ID" className="h-32 w-48 rounded-2xl border border-white/10 object-cover shadow-md" />
                    </a>
                  </div>
                )}
              </div>

              <div className="flex flex-col items-end gap-3">
                <span className={`text-xs px-3.5 py-1.5 rounded-full font-bold ${v.status === 'Pending' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' : 'bg-emerald-500/20 text-emerald-300'}`}>
                  {v.status || 'Pending'}
                </span>

                {v.status === 'Pending' && (
                  <button onClick={() => approveVendor(v.id)} className="bg-[#FB923C] hover:bg-orange-500 text-black text-xs font-bold px-5 py-3 rounded-xl shadow-lg transition active:scale-95">
                    ✅ ሱቁን አጽድቅ (Approve Vendor)
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
