import React, { useState, useEffect } from 'react';
import { API_BASE_URL } from './config';

export default function App() {
  const [activeTab, setActiveTab] = useState('vendors');
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(false);

  // ከ Backend መረጃዎችን ለመቀበል (API Call)
  useEffect(() => {
    setLoading(true);
    fetch(`${API_BASE_URL}/admin/vendors`) // በባክ-ኢንድዎ መሰረት የኤፒአይ ሊንኩን ማስተካከል ይቻላል
      .then(res => res.json())
      .then(data => {
        setVendors(data);
        setLoading(false);
      })
      .catch(err => {
        console.log("API connection info:", err);
        setLoading(false);
      });
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 text-gray-900 font-sans">
      {/* Top Header */}
      <header className="bg-blue-600 text-white shadow-md py-4 px-6 flex justify-between items-center">
        <h1 className="text-xl font-bold">🛡️ EOTC Market - Super Admin Dashboard</h1>
        <span className="text-sm bg-blue-700 px-3 py-1 rounded-full">Online</span>
      </header>

      {/* Main Container */}
      <div className="flex">
        {/* Sidebar Navigation */}
        <aside className="w-64 bg-white shadow-md min-h-screen p-4">
          <nav className="space-y-2">
            <button
              onClick={() => setActiveTab('vendors')}
              className={`w-full text-left px-4 py-2 rounded-lg font-medium transition ${
                activeTab === 'vendors' ? 'bg-blue-600 text-white' : 'hover:bg-gray-100 text-gray-700'
              }`}
            >
              🏪 ሱቆች እና KYC ማጽደቂያ
            </button>
            <button
              onClick={() => setActiveTab('payments')}
              className={`w-full text-left px-4 py-2 rounded-lg font-medium transition ${
                activeTab === 'payments' ? 'bg-blue-600 text-white' : 'hover:bg-gray-100 text-gray-700'
              }`}
            >
              💰 የቴሌብር/ባንክ ክፍያዎች
            </button>
            <button
              onClick={() => setActiveTab('settings')}
              className={`w-full text-left px-4 py-2 rounded-lg font-medium transition ${
                activeTab === 'settings' ? 'bg-blue-600 text-white' : 'hover:bg-gray-100 text-gray-700'
              }`}
            >
              ⚙️ ሲስተም ሴቲንግ
            </button>
          </nav>
        </aside>

        {/* Content Area */}
        <main className="flex-1 p-8">
          {activeTab === 'vendors' && (
            <div>
              <h2 className="text-2xl font-bold mb-4">የነጋዴዎች ምዝገባ እና ማረጋገጫ (Vendor KYC)</h2>
              <p className="text-gray-600 mb-6">አዲስ ሱቅ ለመክፈት የጠየቁ ሰዎችን መረጃ እዚህ አረጋግጦ ማጽደቅ ይቻላል።</p>
              
              <div className="bg-white rounded-lg shadow overflow-hidden">
                <div className="p-6 border-b">
                  <h3 className="font-semibold text-lg">የመጡ ጥያቄዎች</h3>
                </div>
                {loading ? (
                  <p className="p-6 text-gray-500">መረጃ በመጫን ላይ...</p>
                ) : (
                  <div className="p-6 text-gray-500">
                    {vendors.length === 0 ? (
                      <p>እስካሁን የተመዘገበ አዲስ ነጋዴ የለም ወይም ከባክ-ኢንድ ጋር ግንኙነት እየተጠበቀ ነው።</p>
                    ) : (
                      <ul>{/* ሱቆች ሲኖሩ እዚህ ይዘረዘራሉ */}</ul>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'payments' && (
            <div>
              <h2 className="text-2xl font-bold mb-4">የክፍያ ማረጋገጫዎች (Payments & Escrow)</h2>
              <p className="text-gray-600 mb-6">በቴሌብር እና በንግድ ባንክ የተደረጉ ግብይቶችን መቆጣጠሪያ ክፍል።</p>
              <div className="bg-white rounded-lg shadow p-6">
                <p className="text-gray-500">ምንም አዲስ የክፍያ ማረጋገጫ ጥያቄ የለም።</p>
              </div>
            </div>
          )}

          {activeTab === 'settings' && (
            <div>
              <h2 className="text-2xl font-bold mb-4">የሲስተም ማስተካከያ</h2>
              <div className="bg-white rounded-lg shadow p-6">
                <p className="text-gray-700">Backend API URL: <code className="bg-gray-100 px-2 py-1 rounded text-blue-600">{API_BASE_URL}</code></p>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
