import React from 'react';
import { LogOut, Menu, Wifi, WifiOff } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useFarm } from '../contexts/FarmContext';
import { useLanguage } from '../i18n/LanguageContext';
import LanguageToggle from './LanguageToggle';

export default function Navbar({ isDeviceOnline, onMenuClick }) {
  const { user, logout } = useAuth();
  const { activeFarm } = useFarm();
  const { t } = useLanguage();

  return (
    <header className="bg-white border-b border-gray-200 px-4 md:px-6 py-3 flex items-center justify-between gap-3 sticky top-0 z-10">
      <div className="flex items-center gap-3 min-w-0">
        <button onClick={onMenuClick} className="md:hidden p-2 -ml-2 rounded-xl hover:bg-gray-100 text-gray-600" aria-label={t('top.menu')}>
          <Menu size={20} />
        </button>
        <div className="min-w-0">
          <h1 className="text-base font-semibold text-mlima truncate">
            {activeFarm?.name || 'SoilAI'}
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
          <span className="hidden sm:inline">{isDeviceOnline ? t('top.deviceOnline') : t('top.noDevice')}</span>
        </div>

        <LanguageToggle className="text-mlima hover:bg-mist" />

        {/* User */}
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-maize/25 flex items-center justify-center text-mlima font-semibold text-sm">
            {user?.name?.[0]?.toUpperCase() || 'U'}
          </div>
          {user && <span className="text-sm font-medium text-gray-700 hidden sm:block">{user.name}</span>}
        </div>

        {/* Logout */}
        <button
          onClick={logout}
          className="p-2 rounded-xl hover:bg-red-50 text-gray-400 hover:text-red-600 transition-colors"
          title={t('top.logout')}
          aria-label={t('top.logout')}
        >
          <LogOut size={18} />
        </button>
      </div>
    </header>
  );
}
