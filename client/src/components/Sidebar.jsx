import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Cpu, Camera, TrendingUp, Lightbulb, BarChart2, History, ChevronLeft, ChevronRight, Leaf, Plus, Pencil } from 'lucide-react';
import { useFarm } from '../contexts/FarmContext';
import FarmModal from './FarmModal';

const NAV = [
  { to: '/dashboard/overview',         icon: LayoutDashboard, label: 'Overview' },
  { to: '/dashboard/sensor',           icon: Cpu,             label: 'Sensor Data' },
  { to: '/dashboard/image-analysis',   icon: Camera,          label: 'Image Analysis' },
  { to: '/dashboard/yield-prediction', icon: TrendingUp,      label: 'Yield Prediction' },
  { to: '/dashboard/recommendations',  icon: Lightbulb,       label: 'Recommendations' },
  { to: '/dashboard/analytics',        icon: BarChart2,       label: 'Analytics' },
  { to: '/dashboard/history',          icon: History,         label: 'History' },
];

// On small screens the sidebar is an off-canvas drawer controlled by the dashboard layout
export default function Sidebar({ mobileOpen = false, onClose = () => {} }) {
  const [collapsed, setCollapsed] = useState(false);
  const showLabels = !collapsed || mobileOpen;
  const { farms, activeFarm, setActiveFarm, refreshFarms } = useFarm();
  // null = closed, 'new' = create, farm object = edit
  const [farmModal, setFarmModal] = useState(null);

  async function handleFarmSaved(farm) {
    setFarmModal(null);
    setActiveFarm(farm);
    await refreshFarms();
  }

  return (
    <>
    <aside className={`fixed inset-y-0 left-0 z-40 w-64 flex flex-col bg-mlima text-white transition-all duration-300 overflow-y-auto
      ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}
      md:static md:translate-x-0 md:min-h-screen md:overflow-visible ${collapsed ? 'md:w-16' : 'md:w-64'} flex-shrink-0`}>
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 py-5 border-b border-white/10">
        <div className="p-2 bg-maize rounded-xl flex-shrink-0">
          <Leaf size={18} className="text-mlima" aria-hidden="true" />
        </div>
        {showLabels && <span className="font-display font-bold text-xl">SoilAI</span>}
      </div>

      {/* Farm Selector */}
      {showLabels && (
        <div className="px-3 py-3 border-b border-white/10">
          <label htmlFor="active-farm" className="text-xs text-white/60 block mb-1">Active farm</label>
          <select
            id="active-farm"
            value={activeFarm?.id || ''}
            onChange={(e) => {
              const f = farms.find((f) => f.id === e.target.value);
              if (f) setActiveFarm(f);
            }}
            className="w-full bg-primary-900 border border-white/15 rounded-lg px-2 py-1.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-maize"
          >
            {farms.map((f) => (
              <option key={f.id} value={f.id}>{f.name}</option>
            ))}
          </select>
          <div className="flex gap-2 mt-2">
            <button onClick={() => setFarmModal('new')}
              className="flex-1 flex items-center justify-center gap-1 py-1 text-xs text-white/80 border border-white/15 rounded-lg hover:bg-white/10 hover:text-white">
              <Plus size={12} /> New farm
            </button>
            {activeFarm && (
              <button onClick={() => setFarmModal(activeFarm)}
                className="flex-1 flex items-center justify-center gap-1 py-1 text-xs text-white/80 border border-white/15 rounded-lg hover:bg-white/10 hover:text-white">
                <Pencil size={12} /> Edit
              </button>
            )}
          </div>
        </div>
      )}


      {/* Nav */}
      <nav className="flex-1 py-4 space-y-1 px-2">
        {NAV.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            onClick={onClose}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all text-sm font-medium
              ${isActive ? 'bg-white text-mlima font-semibold' : 'text-white/70 hover:bg-white/10 hover:text-white'}`
            }
          >
            <Icon size={18} className="flex-shrink-0" />
            {showLabels && <span>{label}</span>}
          </NavLink>
        ))}
      </nav>

      {/* Collapse toggle */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="hidden md:flex items-center justify-center py-4 border-t border-white/10 text-white/60 hover:text-white transition-colors"
      >
        {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
      </button>
    </aside>

    {/* Outside <aside>: its transform would trap a fixed-position modal */}
    {farmModal && (
      <FarmModal farm={farmModal === 'new' ? null : farmModal} onClose={() => setFarmModal(null)} onSaved={handleFarmSaved} />
    )}
    </>
  );
}
