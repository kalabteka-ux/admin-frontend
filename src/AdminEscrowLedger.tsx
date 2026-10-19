// ==============================================================
// FOLDER: admin-frontend
// FILE: src/AdminEscrowLedger.tsx
// ==============================================================
import React, { useEffect, useState } from 'react';
import { Lock, CheckCircle2 } from 'lucide-react';
import { API_BASE_URL } from './config';

interface OrderLedger {
  id: string;
  orderCode: string;
  shopName: string;
  grossAmountEtb: number;
  platformCommissionEtb: number; // 1.5%
  vendorNetEtb: number;          // 98.5%
  paymentMethod: 'TELEBIRR' | 'CBE_BIRR';
  status: 'ESCROW_LOCKED' | 'DELIVERED';
}

export const AdminEscrowLedger: React.FC = () => {
  const [orders, setOrders] = useState<OrderLedger[]>([
    {
      id: 'ord_1',
      orderCode: 'EOTC-9021',
      shopName: 'Debre Damo Artisan Guild',
      grossAmountEtb: 6550.0,
      platformCommissionEtb: 98.25,
      vendorNetEtb: 6451.75,
      paymentMethod: 'TELEBIRR',
      status: 'ESCROW_LOCKED',
    },
    {
      id: 'ord_2',
      orderCode: 'EOTC-9022',
      shopName: 'St. George Ecclesiastical Crafts',
      grossAmountEtb: 3400.0,
      platformCommissionEtb: 51.0,
      vendorNetEtb: 3349.0,
      paymentMethod: 'CBE_BIRR',
      status: 'DELIVERED',
    },
    {
      id: 'ord_3',
      orderCode: 'EOTC-9023',
      shopName: 'Abba Samuel Sacred Vestments',
      grossAmountEtb: 14200.0,
      platformCommissionEtb: 213.0,
      vendorNetEtb: 13987.0,
      paymentMethod: 'TELEBIRR',
      status: 'ESCROW_LOCKED',
    },
  ]);

  const releaseEscrow = async (orderId: string) => {
    try {
      await fetch(`${API_BASE_URL}/api/admin/orders/${orderId}/release`, { method: 'POST' });
    } catch {
      console.log('Simulated release');
    }
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status: 'DELIVERED' } : o))
    );
  };

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-bold text-white">Escrow & 1.5% Commission Split Ledger</h2>
        <p className="text-xs text-gray-400">Audit all incoming Telebirr and CBE Birr transaction splits.</p>
      </div>

      <div className="bg-[#111814] border border-[#1E2B23] rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-gray-300">
            <thead className="bg-[#16221C] text-gray-400 uppercase tracking-wider text-[10px]">
              <tr>
                <th className="p-3.5">Order</th>
                <th className="p-3.5">Store</th>
                <th className="p-3.5">Gateway</th>
                <th className="p-3.5">Gross (ETB)</th>
                <th className="p-3.5 text-amber-400">1.5% Platform Cut</th>
                <th className="p-3.5 text-emerald-400">98.5% Seller Split</th>
                <th className="p-3.5">Escrow State</th>
                <th className="p-3.5">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1E2B23]">
              {orders.map((o) => (
                <tr key={o.id} className="hover:bg-[#16221C]/50">
                  <td className="p-3.5 font-mono font-bold text-white">#{o.orderCode}</td>
                  <td className="p-3.5 font-medium">{o.shopName}</td>
                  <td className="p-3.5">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${o.paymentMethod === 'TELEBIRR' ? 'bg-[#0072CE]/20 text-[#64B5F6]' : 'bg-[#7A1442]/20 text-fuchsia-300'}`}>
                      {o.paymentMethod}
                    </span>
                  </td>
                  <td className="p-3.5 font-bold text-white">{o.grossAmountEtb.toLocaleString()}</td>
                  <td className="p-3.5 font-black text-amber-400">{o.platformCommissionEtb.toFixed(2)}</td>
                  <td className="p-3.5 font-black text-emerald-400">{o.vendorNetEtb.toFixed(2)}</td>
                  <td className="p-3.5">
                    {o.status === 'ESCROW_LOCKED' ? (
                      <span className="flex items-center gap-1 text-cyan-400 text-[11px] font-semibold">
                        <Lock className="w-3 h-3" /> Locked
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-emerald-400 text-[11px] font-semibold">
                        <CheckCircle2 className="w-3 h-3" /> Released
                      </span>
                    )}
                  </td>
                  <td className="p-3.5">
                    {o.status === 'ESCROW_LOCKED' && (
                      <button
                        onClick={() => releaseEscrow(o.id)}
                        className="bg-[#0F8A52] hover:bg-[#28B473] text-white px-2.5 py-1 rounded-lg text-[10px] font-bold"
                      >
                        Release 98.5%
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};