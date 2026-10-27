import React from 'react';
import { LogOut, Menu, Wifi, WifiOff } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useFarm } from '../contexts/FarmContext';

export default function Navbar({ isDeviceOnline, onMenuClick }) {
  const { user, logout } = useAuth();
  const { activeFarm } = useFarm();

  return (
    <header className="bg-white border-b border-gray-200 px-4 md:px-6 py-3 flex items-center justify-between gap-3 sticky top-0 z-10">
      <div className="flex items-center gap-3 min-w-0">
        <button onClick={onMenuClick} className="md:hidden p-2 -ml-2 rounded-xl hover:bg-gray-100 text-gray-600" aria-label="Open menu">
          <Menu size={20} />
        </button>
        <div className="min-w-0">
          <h1 className="text-base font-semibold text-gray-800 truncate">
            {activeFarm?.name || 'Soil Microbiome AI'}
          </h1>
          {activeFarm && (
            <p className="text-xs text-gray-400 capitalize truncate">{activeFarm.location} · {activeFarm.cropType?.toLowerCase()}</p>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2 md:gap-3 flex-shrink-0">
        {/* Device online status */}
        <div className={`flex items-center gap-1.5 text-xs font-medium px-2 py-1 rounded-full ${isDeviceOnline ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
          {isDeviceOnline ? <Wifi size={13} /> : <WifiOff size={13} />}
          <span className="hidden sm:inline">{isDeviceOnline ? 'Device Online' : 'No Device'}</span>
        </div>

        {/* User */}
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-semibold text-sm">
            {user?.name?.[0]?.toUpperCase() || 'U'}
          </div>
          {user && <span className="text-sm font-medium text-gray-700 hidden sm:block">{user.name}</span>}
        </div>

        {/* Logout */}
        <button
          onClick={logout}
          className="p-2 rounded-xl hover:bg-red-50 text-gray-400 hover:text-red-600 transition-colors"
          title="Logout"
        >
          <LogOut size={18} />
        </button>
      </div>
    </header>
  );
}
