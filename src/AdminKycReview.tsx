// ==============================================================
// FOLDER: admin-frontend
// FILE: src/AdminKycReview.tsx
// ==============================================================
import React, { useEffect, useState } from 'react';
import { Check, X, ExternalLink, BadgeCheck } from 'lucide-react';
import { API_BASE_URL } from './config';

interface KycItem {
  id: string;
  vendorName: string;
  telegramUsername: string;
  docType: 'FAYDA_ID' | 'PASSPORT';
  idNumber: string;
  fullNameOnId: string;
  documentFrontUrl: string;
  status: string;
}

export const AdminKycReview: React.FC = () => {
  const [submissions, setSubmissions] = useState<KycItem[]>([
    {
      id: 'kyc_101',
      vendorName: 'Debre Damo Artisan Guild',
      telegramUsername: 'debre_damo_crafts',
      docType: 'FAYDA_ID',
      idNumber: 'ET-FAYDA-94021948',
      fullNameOnId: 'Hailemariam Teklehaimanot',
      documentFrontUrl: 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=600&q=80',
      status: 'PENDING',
    },
    {
      id: 'kyc_102',
      vendorName: 'Axum Sacred Cross Carvers',
      telegramUsername: 'axum_crosses',
      docType: 'PASSPORT',
      idNumber: 'EP8492014',
      fullNameOnId: 'Betelehem Yohannes',
      documentFrontUrl: 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=600&q=80',
      status: 'PENDING',
    },
  ]);

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/admin/kyc/pending`)
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) setSubmissions(data);
      })
      .catch(() => console.log('Using default KYC items'));
  }, []);

  const handleReview = async (id: string, action: 'APPROVE' | 'REJECT', reason?: string) => {
    try {
      await fetch(`${API_BASE_URL}/api/v1/kyc/${id}/review`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, reason }),
      });
    } catch {
      console.log('Simulating review locally');
    }
    setSubmissions((prev) => prev.filter((item) => item.id !== id));
  };

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-bold text-white">Ethiopian Fayda ID & Passport Verification</h2>
        <p className="text-xs text-gray-400">Review and verify vendor identity documents prior to marketplace storefront activation.</p>
      </div>

      {submissions.length === 0 ? (
        <div className="bg-[#111814] border border-[#1E2B23] p-8 rounded-2xl text-center">
          <BadgeCheck className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
          <p className="text-sm font-bold text-white">All KYC Submissions Cleared</p>
          <p className="text-xs text-gray-400 mt-1">No seller verifications currently waiting in the queue.</p>
        </div>
      ) : (
        <div className="grid gap-3">
          {submissions.map((sub) => (
            <div key={sub.id} className="bg-[#111814] border border-[#1E2B23] p-5 rounded-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-bold text-white">{sub.vendorName}</h4>
                  <span className="text-[10px] font-bold bg-amber-500/20 text-[#FFC947] border border-amber-500/30 px-2 py-0.5 rounded-full">
                    {sub.docType === 'FAYDA_ID' ? 'Fayda National ID' : 'Ethiopian Passport'}
                  </span>
                </div>
                <p className="text-xs text-gray-300">Legal Name: <strong className="text-white">{sub.fullNameOnId}</strong></p>
                <p className="text-xs text-emerald-400 font-mono">ID Number: {sub.idNumber}</p>
                <p className="text-[11px] text-gray-500">Telegram: @{sub.telegramUsername}</p>
              </div>

              <div className="flex items-center gap-2">
                <a
                  href={sub.documentFrontUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="bg-[#1A2620] hover:bg-[#25352C] border border-[#1E2B23] text-gray-200 px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5"
                >
                  <ExternalLink className="w-3.5 h-3.5" /> Inspect ID
                </a>
                <button
                  onClick={() => handleReview(sub.id, 'APPROVE')}
                  className="bg-[#0F8A52] hover:bg-[#28B473] text-white px-4 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5"
                >
                  <Check className="w-3.5 h-3.5" /> Approve Store
                </button>
                <button
                  onClick={() => {
                    const reason = prompt('Rejection Reason:');
                    if (reason) handleReview(sub.id, 'REJECT', reason);
                  }}
                  className="bg-rose-950/60 hover:bg-rose-900 border border-rose-500/40 text-rose-300 px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5"
                >
                  <X className="w-3.5 h-3.5" /> Reject
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};