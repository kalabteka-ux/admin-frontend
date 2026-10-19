// ==============================================================
// FOLDER: admin-frontend
// FILE: src/AdminPayouts.tsx
// ==============================================================
import React, { useState } from 'react';
import { Send, CheckCircle2 } from 'lucide-react';

interface PayoutRequest {
  id: string;
  vendorName: string;
  amountEtb: number;
  channel: 'TELEBIRR' | 'CBE_BIRR';
  accountNumber: string;
  status: 'PENDING' | 'DISPATCHED';
}

export const AdminPayouts: React.FC = () => {
  const [payouts, setPayouts] = useState<PayoutRequest[]>([
    {
      id: 'pay_1',
      vendorName: 'Debre Damo Artisan Guild',
      amountEtb: 6451.75,
      channel: 'TELEBIRR',
      accountNumber: '+251911482910',
      status: 'PENDING',
    },
    {
      id: 'pay_2',
      vendorName: 'St. George Ecclesiastical Crafts',
      amountEtb: 3349.0,
      channel: 'CBE_BIRR',
      accountNumber: '1000192841029',
      status: 'PENDING',
    },
  ]);

  const dispatchPayout = (id: string) => {
    setPayouts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, status: 'DISPATCHED' } : p))
    );
  };

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-bold text-white">Vendor Payout Dispatches</h2>
        <p className="text-xs text-gray-400">Review and dispatch seller withdrawals to Telebirr and CBE bank accounts.</p>
      </div>

      <div className="grid gap-3">
        {payouts.map((p) => (
          <div key={p.id} className="bg-[#111814] border border-[#1E2B23] p-4 rounded-2xl flex justify-between items-center">
            <div>
              <h4 className="text-sm font-bold text-white">{p.vendorName}</h4>
              <p className="text-xs text-[#FFC947] font-black mt-0.5">{p.amountEtb.toLocaleString()} ETB</p>
              <p className="text-[11px] text-gray-400 mt-1">
                Channel: <strong className="text-gray-300">{p.channel}</strong> ({p.accountNumber})
              </p>
            </div>

            {p.status === 'PENDING' ? (
              <button
                onClick={() => dispatchPayout(p.id)}
                className="bg-[#0F8A52] hover:bg-[#28B473] text-white px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5"
              >
                <Send className="w-3.5 h-3.5" /> Dispatch Payout
              </button>
            ) : (
              <span className="flex items-center gap-1 text-emerald-400 text-xs font-bold bg-[#084E2E] px-3 py-1 rounded-xl">
                <CheckCircle2 className="w-3.5 h-3.5" /> Dispatched
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};