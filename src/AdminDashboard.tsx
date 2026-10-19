// ==============================================================
// FOLDER: admin-frontend
// FILE: src/AdminDashboard.tsx
// ==============================================================
import React, { useEffect, useState } from 'react';
import { DollarSign, ShieldCheck, ShoppingCart, Users, TrendingUp } from 'lucide-react';
import { API_BASE_URL } from './config';

interface Metrics {
  totalGmvEtb: number;
  platformRevenueEtb: number; // 1.5%
  escrowLockedEtb: number;
  activeSellersCount: number;
  pendingKycCount: number;
  totalOrdersCount: number;
}

export const AdminDashboard: React.FC = () => {
  const [metrics, setMetrics] = useState<Metrics>({
    totalGmvEtb: 185400.0,
    platformRevenueEtb: 2781.0, // 1.5% of GMV
    escrowLockedEtb: 42300.0,
    activeSellersCount: 14,
    pendingKycCount: 3,
    totalOrdersCount: 68,
  });

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/admin/metrics`)
      .then((res) => res.json())
      .then((data) => setMetrics((prev) => ({ ...prev, ...data })))
      .catch(() => console.log('Using initial dashboard state'));
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-white">Platform Health & Commission Revenue</h2>
        <p className="text-xs text-gray-400">Real-time overview of Telebirr and CBE Birr transaction volume.</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Total GMV */}
        <div className="bg-[#111814] border border-[#1E2B23] p-5 rounded-2xl">
          <div className="flex justify-between items-center text-gray-400 mb-2">
            <span className="text-xs font-semibold">Total Gross Sales (GMV)</span>
            <TrendingUp className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-2xl font-black text-white">{metrics.totalGmvEtb.toLocaleString()} <span className="text-xs text-gray-400">ETB</span></p>
          <p className="text-[11px] text-gray-500 mt-1">{metrics.totalOrdersCount} Completed Orders</p>
        </div>

        {/* 1.5% Platform Revenue */}
        <div className="bg-[#111814] border border-amber-500/40 p-5 rounded-2xl shadow-lg shadow-amber-950/20">
          <div className="flex justify-between items-center text-amber-400 mb-2">
            <span className="text-xs font-bold">1.5% Platform Cut (Revenue)</span>
            <DollarSign className="w-4 h-4 text-amber-400" />
          </div>
          <p className="text-2xl font-black text-[#FFC947]">{metrics.platformRevenueEtb.toLocaleString()} <span className="text-xs text-amber-400">ETB</span></p>
          <p className="text-[11px] text-gray-500 mt-1">Platform Master Wallet Balance</p>
        </div>

        {/* Escrow Pool */}
        <div className="bg-[#111814] border border-[#1E2B23] p-5 rounded-2xl">
          <div className="flex justify-between items-center text-gray-400 mb-2">
            <span className="text-xs font-semibold">Funds in Escrow</span>
            <ShieldCheck className="w-4 h-4 text-cyan-400" />
          </div>
          <p className="text-2xl font-black text-cyan-400">{metrics.escrowLockedEtb.toLocaleString()} <span className="text-xs text-gray-400">ETB</span></p>
          <p className="text-[11px] text-gray-500 mt-1">Locked in Telebirr/CBE Vault</p>
        </div>

        {/* Pending KYC */}
        <div className="bg-[#111814] border border-[#1E2B23] p-5 rounded-2xl">
          <div className="flex justify-between items-center text-gray-400 mb-2">
            <span className="text-xs font-semibold">Pending Seller KYC</span>
            <Users className="w-4 h-4 text-amber-400" />
          </div>
          <p className="text-2xl font-black text-amber-400">{metrics.pendingKycCount} <span className="text-xs text-gray-400">Vendors</span></p>
          <p className="text-[11px] text-gray-500 mt-1">{metrics.activeSellersCount} Approved Active Stores</p>
        </div>
      </div>

      {/* Revenue Split Formula Explainer */}
      <div className="bg-[#111814] border border-[#1E2B23] p-5 rounded-2xl">
        <h3 className="text-sm font-bold text-white mb-2">Automated 1.5% Split Engine Rules</h3>
        <p className="text-xs text-gray-400 leading-relaxed">
          When an order is placed, 100% of the funds are locked in Escrow. Upon delivery acknowledgment:
          <br />
          • <strong className="text-amber-400">1.5%</strong> is atomically transferred to the Platform Master Wallet.
          <br />
          • <strong className="text-emerald-400">98.5%</strong> is credited to the seller's virtual balance for instant payout to Telebirr or CBE Birr.
        </p>
      </div>
    </div>
  );
};