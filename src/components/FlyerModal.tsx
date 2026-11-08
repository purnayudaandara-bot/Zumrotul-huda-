import React, { useState } from 'react';
import { Sparkles, MapPin, Phone, CheckCircle2, X, Download, ExternalLink, Calendar, Heart, Shield } from 'lucide-react';
import { ADMIN_WHATSAPP_NUMBER } from '../utils/ppdbLogic';

interface FlyerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGoToForm: () => void;
}

export const FlyerModal: React.FC<FlyerModalProps> = ({ isOpen, onClose, onGoToForm }) => {
  const [activeFlyerIndex, setActiveFlyerIndex] = useState(0);

  const flyers = [
    {
      title: 'Brosur Resmi PPDB PAUD Zumrotul Huda (T.A. 2026/2027)',
      src: '/assets/aistudio/IMG-20260622-WA0003_38d499a4.jpg',
      theme: 'Taman Bermain Islami & Ramah Anak',
    },
    {
      title: 'Brosur PPDB Edisi Generasi Kreatif & Berakhlak Mulia',
      src: '/assets/aistudio/IMG-20260622-WA0001_22bbd00f.jpg',
      theme: 'Petualangan Sains & Karakter Santri Cilik',
    },
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5">
      <div className="relative bg-white rounded-3xl max-w-4xl w-full shadow-2xl border border-gray-200 overflow-hidden max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-800 via-emerald-700 to-green-700 p-4 sm:p-5 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <img
              src="/assets/aistudio/20260523_081213_224076f2.jpg"
              alt="Logo Zumrotul Huda"
              className="w-10 h-10 object-contain rounded-full bg-white/20 p-1"
            />
            <div>
              <h3 className="font-extrabold text-base sm:text-lg">
                Brosur & Informasi Resmi PPDB Zumrotul Huda
              </h3>
              <p className="text-xs text-emerald-100">
                Tahun Ajaran 2026/2027 • Pondok Pesantren & PAUD Depok
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="overflow-y-auto p-4 sm:p-6 space-y-6">
          {/* Tabs for Flyer Switching */}
          <div className="flex items-center gap-2 p-1 bg-gray-100 rounded-xl">
            {flyers.map((f, idx) => (
              <button
                key={idx}
                onClick={() => setActiveFlyerIndex(idx)}
                className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition-all ${
                  activeFlyerIndex === idx
                    ? 'bg-emerald-700 text-white shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Poster {idx + 1}: {idx === 0 ? 'Taman Bermain' : 'Astronot Cilik'}
              </button>
            ))}
          </div>

          {/* Active Flyer Image View */}
          <div className="bg-emerald-950/5 rounded-2xl p-2 sm:p-4 border border-emerald-100 flex flex-col items-center">
            <img
              src={flyers[activeFlyerIndex].src}
              alt={flyers[activeFlyerIndex].title}
              className="max-h-[500px] w-auto object-contain rounded-xl shadow-lg border border-gray-200"
            />
            <p className="text-xs font-semibold text-gray-700 mt-2 text-center">
              {flyers[activeFlyerIndex].title}
            </p>
          </div>

          {/* Key Points Summary from the Posters */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Promo Card */}
            <div className="bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200 rounded-2xl p-4">
              <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-400 text-emerald-950 uppercase tracking-wide mb-2">
                PROMO PENDAFTARAN PAUD
              </span>
              <h4 className="text-base font-extrabold text-amber-950">
                🎉 GRATIS UANG PANGKAL & GRATIS SPP!
              </h4>
              <p className="text-xs text-amber-900/80 mt-1">
                Mari bergabung bersama kami untuk memberikan pendidikan terbaik bagi putra-putri Anda. Kuota terbatas!
              </p>
              <ul className="text-xs text-amber-950/90 mt-3 space-y-1 font-medium">
                <li>✨ Usia Minimal 3 Tahun</li>
                <li>✨ Belajar Sambil Bermain</li>
                <li>✨ Bernuansa Islami</li>
                <li>✨ Lingkungan Aman & Nyaman</li>
              </ul>
            </div>

            {/* Syarat & Kontak Card */}
            <div className="bg-emerald-50/70 border border-emerald-200 rounded-2xl p-4">
              <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-700 text-white uppercase tracking-wide mb-2">
                SYARAT & PENDAFTARAN
              </span>
              <ul className="text-xs text-emerald-950 space-y-1.5 font-medium">
                <li className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                  <span>Usia minimal 3 tahun</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                  <span>Fotokopi Akta Kelahiran</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                  <span>Fotokopi Kartu Keluarga (KK)</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                  <span>Pas foto berwarna ukuran 3x4</span>
                </li>
              </ul>

              <div className="mt-3 pt-3 border-t border-emerald-200/60 text-xs">
                <span className="font-bold text-emerald-900 block mb-1">Kontak Pendaftaran Resmi:</span>
                <div className="flex flex-wrap gap-2 text-[11px]">
                  <a
                    href="https://api.whatsapp.com/send?phone=6282260847038"
                    target="_blank"
                    rel="noreferrer"
                    className="text-emerald-800 hover:underline font-semibold"
                  >
                    📞 Bu Dyas: 0822-6084-7038
                  </a>
                  <span>•</span>
                  <a
                    href="https://api.whatsapp.com/send?phone=6281297992940"
                    target="_blank"
                    rel="noreferrer"
                    className="text-emerald-800 hover:underline font-semibold"
                  >
                    📞 Bu Yani: 0812-9799-2940
                  </a>
                  <span>•</span>
                  <a
                    href={`https://api.whatsapp.com/send?phone=6289635988413`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-emerald-800 hover:underline font-bold"
                  >
                    📱 WA PPDB: {ADMIN_WHATSAPP_NUMBER}
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Location info */}
          <div className="flex items-start gap-3 p-4 rounded-xl bg-gray-50 border border-gray-200 text-xs">
            <MapPin className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
            <div>
              <strong className="text-gray-900 block">Informasi Pendaftaran Langsung & Lokasi:</strong>
              <p className="text-gray-600 mt-0.5">
                Pondok Pesantren Zumrotul Huda, Jl. Cagar Alam Selatan Gg. Balong Sari II, Pancoran Mas, Kota Depok.
              </p>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="bg-gray-50 p-4 border-t border-gray-200 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <button
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold text-xs cursor-pointer"
          >
            Tutup
          </button>

          <button
            onClick={() => {
              onClose();
              onGoToForm();
            }}
            className="px-5 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold text-xs sm:text-sm shadow-md transition-colors cursor-pointer"
          >
            Isi Formulir Pendaftaran Sekarang →
          </button>
        </div>
      </div>
    </div>
  );
};
