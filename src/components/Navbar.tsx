import React from 'react';
import { FileText, Search, Shield, Image as ImageIcon, Phone, CheckCircle } from 'lucide-react';
import { ADMIN_WHATSAPP_NUMBER } from '../utils/ppdbLogic';

export type ActiveTab = 'form' | 'check' | 'flyer' | 'admin';

interface NavbarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  isAdminLoggedIn: boolean;
  onLogoutAdmin: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  isAdminLoggedIn,
  onLogoutAdmin,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-emerald-100 shadow-sm">
      {/* Top green announcement bar */}
      <div className="bg-gradient-to-r from-emerald-800 via-emerald-700 to-green-800 text-white text-xs py-1.5 px-4 font-medium">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-amber-400 text-emerald-950">
              PROMO PPDB 2026/2027
            </span>
            <span>✨ PAUD Zumrotul Huda: <strong>Gratis Uang Pangkal & Gratis SPP!</strong></span>
          </div>
          <div className="flex items-center gap-4">
            <a
              href={`https://api.whatsapp.com/send?phone=6289635988413&text=${encodeURIComponent("Assalamu'alaikum Admin PPDB Zumrotul Huda, saya ingin bertanya seputar pendaftaran.")}`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 hover:text-amber-200 transition-colors"
            >
              <Phone className="w-3.5 h-3.5" />
              <span>Pusat Informasi WA: <strong>{ADMIN_WHATSAPP_NUMBER}</strong></span>
            </a>
          </div>
        </div>
      </div>

      {/* Main navigation container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo & Brand Identity */}
          <div 
            onClick={() => setActiveTab('form')}
            className="flex items-center gap-3.5 cursor-pointer group select-none"
          >
            <div className="relative">
              <img
                src="/assets/aistudio/20260523_081213_224076f2.jpg"
                alt="Logo Yayasan Zumrotul Huda"
                className="w-13 h-13 sm:w-14 sm:h-14 object-contain rounded-full shadow-sm ring-2 ring-emerald-500/30 group-hover:scale-105 transition-transform"
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                  Pondok Pesantren & PAUD
                </span>
                <span className="text-[11px] text-gray-500 hidden sm:inline">Kota Depok</span>
              </div>
              <h1 className="text-lg sm:text-xl font-extrabold text-gray-900 tracking-tight leading-tight group-hover:text-emerald-800 transition-colors">
                ZUMROTUL HUDA
              </h1>
              <p className="text-xs text-gray-600 hidden sm:block">
                Penerimaan Peserta Didik Baru & Santri/Santriwati T.A. 2026/2027
              </p>
            </div>
          </div>

          {/* Navigation Items */}
          <nav className="flex items-center gap-1 sm:gap-2">
            <button
              onClick={() => setActiveTab('form')}
              className={`flex items-center gap-1.5 px-3 py-2 sm:px-4 sm:py-2.5 rounded-lg text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                activeTab === 'form'
                  ? 'bg-emerald-700 text-white shadow-md shadow-emerald-700/20'
                  : 'text-gray-700 hover:bg-emerald-50 hover:text-emerald-800'
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>Formulir PPDB</span>
            </button>

            <button
              onClick={() => setActiveTab('check')}
              className={`flex items-center gap-1.5 px-3 py-2 sm:px-4 sm:py-2.5 rounded-lg text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                activeTab === 'check'
                  ? 'bg-emerald-700 text-white shadow-md shadow-emerald-700/20'
                  : 'text-gray-700 hover:bg-emerald-50 hover:text-emerald-800'
              }`}
            >
              <Search className="w-4 h-4" />
              <span>Cek Status</span>
            </button>

            <button
              onClick={() => setActiveTab('flyer')}
              className={`flex items-center gap-1.5 px-3 py-2 sm:px-4 sm:py-2.5 rounded-lg text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                activeTab === 'flyer'
                  ? 'bg-emerald-700 text-white shadow-md shadow-emerald-700/20'
                  : 'text-gray-700 hover:bg-emerald-50 hover:text-emerald-800'
              }`}
            >
              <ImageIcon className="w-4 h-4" />
              <span>Brosur</span>
            </button>

            <button
              onClick={() => setActiveTab('admin')}
              className={`flex items-center gap-1.5 px-3 py-2 sm:px-4 sm:py-2.5 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
                activeTab === 'admin'
                  ? 'bg-slate-900 text-white shadow-md'
                  : 'text-slate-700 bg-slate-100 hover:bg-slate-200'
              }`}
            >
              <Shield className="w-4 h-4 text-emerald-500" />
              <span>Dasbor Admin</span>
              {isAdminLoggedIn && (
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              )}
            </button>
          </nav>
        </div>
      </div>
    </header>
  );
};
