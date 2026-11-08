import React, { useState } from 'react';
import { Navbar, ActiveTab } from './components/Navbar';
import { RegistrationForm } from './components/RegistrationForm';
import { StatusChecker } from './components/StatusChecker';
import { AdminDashboard } from './components/AdminDashboard';
import { FlyerModal } from './components/FlyerModal';
import { SuccessRegistrationModal } from './components/SuccessRegistrationModal';
import { PrintTemplate } from './components/PrintTemplate';
import { RegistrationRecord, ADMIN_WHATSAPP_NUMBER } from './utils/ppdbLogic';
import { 
  Heart, 
  MapPin, 
  Phone, 
  Mail, 
  Sparkles, 
  ShieldCheck, 
  CheckCircle2, 
  Baby, 
  GraduationCap 
} from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('form');
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
  
  // Modals & Print record
  const [newlyRegisteredRecord, setNewlyRegisteredRecord] = useState<RegistrationRecord | null>(null);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [recordToPrint, setRecordToPrint] = useState<RegistrationRecord | null>(null);
  const [isFlyerModalOpen, setIsFlyerModalOpen] = useState(false);

  // Handle successful registration submission
  const handleRegistrationSuccess = (record: RegistrationRecord) => {
    setNewlyRegisteredRecord(record);
    setRecordToPrint(record);
    setIsSuccessModalOpen(true);
  };

  // Trigger print dialog
  const handlePrintRecord = (record: RegistrationRecord) => {
    setRecordToPrint(record);
    setTimeout(() => {
      window.print();
    }, 150);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 font-sans antialiased selection:bg-emerald-500 selection:text-white">
      {/* Printable Template (hidden on screen, visible during print) */}
      <PrintTemplate record={recordToPrint} />

      {/* Main Top Navigation */}
      <div className="no-print">
        <Navbar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          isAdminLoggedIn={isAdminLoggedIn}
          onLogoutAdmin={() => setIsAdminLoggedIn(false)}
        />
      </div>

      {/* Main Content Area */}
      <main className="flex-1 no-print">
        {activeTab === 'form' && (
          <RegistrationForm
            onSuccess={handleRegistrationSuccess}
            onOpenFlyers={() => setIsFlyerModalOpen(true)}
          />
        )}

        {activeTab === 'check' && (
          <StatusChecker onPrintRecord={handlePrintRecord} />
        )}

        {activeTab === 'flyer' && (
          <div className="max-w-6xl mx-auto py-8 px-4 sm:px-6">
            <div className="text-center mb-8">
              <span className="text-xs font-bold uppercase tracking-widest text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                Pondok Pesantren & PAUD Zumrotul Huda Depok
              </span>
              <h2 className="text-3xl font-black text-gray-900 mt-2">
                Brosur & Fasilitas Pendidikan
              </h2>
              <p className="text-sm text-gray-600 max-w-xl mx-auto mt-1">
                Langkah kecil hari ini, masa depan besar nanti. Belajar sambil bermain, bernuansa Islami, lingkungan aman & nyaman.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
              {/* Poster 1 */}
              <div className="bg-white rounded-3xl p-5 shadow-lg border border-gray-200 hover:shadow-xl transition-all">
                <div className="rounded-2xl overflow-hidden border border-gray-100 bg-emerald-50/30 flex justify-center p-2">
                  <img
                    src="/assets/aistudio/IMG-20260622-WA0003_38d499a4.jpg"
                    alt="Poster PAUD Zumrotul Huda 1"
                    className="rounded-xl max-h-[550px] w-auto object-contain hover:scale-[1.02] transition-transform"
                  />
                </div>
                <div className="mt-4">
                  <span className="text-xs font-bold uppercase text-amber-600 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200">
                    Promo Spesial 2026/2027
                  </span>
                  <h3 className="font-extrabold text-lg text-gray-900 mt-1">
                    PAUD Zumrotul Huda - Gratis Uang Pangkal & SPP
                  </h3>
                  <p className="text-xs text-gray-600 mt-1">
                    Penerimaan Siswa Baru: Usia minimal 3 tahun, bernuansa Islami, aman & nyaman bagi tumbuh kembang ananda tercinta.
                  </p>
                </div>
              </div>

              {/* Poster 2 */}
              <div className="bg-white rounded-3xl p-5 shadow-lg border border-gray-200 hover:shadow-xl transition-all">
                <div className="rounded-2xl overflow-hidden border border-gray-100 bg-blue-50/30 flex justify-center p-2">
                  <img
                    src="/assets/aistudio/IMG-20260622-WA0001_22bbd00f.jpg"
                    alt="Poster PAUD Zumrotul Huda 2"
                    className="rounded-xl max-h-[550px] w-auto object-contain hover:scale-[1.02] transition-transform"
                  />
                </div>
                <div className="mt-4">
                  <span className="text-xs font-bold uppercase text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200">
                    Generasi Berakhlak Mulia
                  </span>
                  <h3 className="font-extrabold text-lg text-gray-900 mt-1">
                    Tumbuh Bahagia & Berkarya
                  </h3>
                  <p className="text-xs text-gray-600 mt-1">
                    Kurikulum bermain bermakna, pembiasaan hafalan surat pendek, doa harian, dan adab santri sejak dini.
                  </p>
                </div>
              </div>
            </div>

            {/* CTA bottom */}
            <div className="mt-10 bg-gradient-to-r from-emerald-800 to-green-700 rounded-2xl p-6 sm:p-8 text-white flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <h3 className="text-xl font-bold">Tertarik Mendaftarkan Ananda?</h3>
                <p className="text-xs sm:text-sm text-emerald-100 mt-1">
                  Pendaftaran dapat dilakukan secara digital sekarang juga. Kuota penerimaan terbatas!
                </p>
              </div>
              <button
                onClick={() => setActiveTab('form')}
                className="px-6 py-3 rounded-xl bg-amber-400 hover:bg-amber-300 text-emerald-950 font-black text-sm shadow-md transition-colors cursor-pointer shrink-0"
              >
                Buka Formulir Pendaftaran Online
              </button>
            </div>
          </div>
        )}

        {activeTab === 'admin' && (
          <AdminDashboard
            isAdminLoggedIn={isAdminLoggedIn}
            setIsAdminLoggedIn={setIsAdminLoggedIn}
            onPrintRecord={handlePrintRecord}
          />
        )}
      </main>

      {/* Success Registration Confirmation Modal */}
      <SuccessRegistrationModal
        record={newlyRegisteredRecord}
        isOpen={isSuccessModalOpen}
        onClose={() => setIsSuccessModalOpen(false)}
        onPrint={() => {
          if (newlyRegisteredRecord) {
            handlePrintRecord(newlyRegisteredRecord);
          }
        }}
      />

      {/* Official Flyer Modal */}
      <FlyerModal
        isOpen={isFlyerModalOpen}
        onClose={() => setIsFlyerModalOpen(false)}
        onGoToForm={() => setActiveTab('form')}
      />

      {/* Footer */}
      <footer className="bg-slate-900 text-white border-t border-slate-800 mt-16 no-print">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            {/* Col 1: Identity */}
            <div className="md:col-span-2 space-y-3">
              <div className="flex items-center gap-3">
                <img
                  src="/assets/aistudio/20260523_081213_224076f2.jpg"
                  alt="Logo Zumrotul Huda"
                  className="w-12 h-12 object-contain rounded-full bg-white/10 p-1"
                />
                <div>
                  <h4 className="font-black text-lg text-white">YAYASAN PONDOK PESANTREN ZUMROTUL HUDA</h4>
                  <p className="text-xs text-emerald-400 font-semibold">Pendidikan Anak Usia Dini & Pondok Pesantren</p>
                </div>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed max-w-md">
                Lembaga pendidikan Islam terpadu yang membimbing santri putra, santriwati putri, serta peserta didik usia dini dengan mengedepankan akhlak mulia, hafalan Al-Qur'an, dan kajian keilmuan Islam berkarakter.
              </p>
              <div className="pt-2 flex items-center gap-2 text-xs text-amber-300 font-semibold">
                <Sparkles className="w-4 h-4" />
                <span>Motto: "Langkah kecil hari ini, masa depan besar nanti"</span>
              </div>
            </div>

            {/* Col 2: Program PPDB */}
            <div>
              <h5 className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-3">
                Program Penerimaan (PPDB)
              </h5>
              <ul className="text-xs text-slate-400 space-y-2">
                <li>• PAUD Zumrotul Huda (Promo Gratis SPP & Uang Pangkal)</li>
                <li>• Santri Putra Pondok Pesantren</li>
                <li>• Santriwati Putri Pondok Pesantren</li>
                <li>• Program Tahfidzul Qur'an & Kitab Kuning</li>
                <li>• Kelas Diniyah & Pengajian Reguler</li>
              </ul>
            </div>

            {/* Col 3: Kontak & Lokasi */}
            <div>
              <h5 className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-3">
                Sekretariat & Kontak
              </h5>
              <ul className="text-xs text-slate-400 space-y-2.5">
                <li className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>Jl. Cagar Alam Selatan Gg. Balong Sari II, Pancoran Mas, Kota Depok</span>
                </li>
                <li className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-emerald-400 shrink-0" />
                  <a href={`https://api.whatsapp.com/send?phone=6289635988413`} className="hover:text-emerald-300 font-mono">
                    WA Admin PPDB: <strong>{ADMIN_WHATSAPP_NUMBER}</strong>
                  </a>
                </li>
                <li className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Bu Dyas: 0822-6084-7038</span>
                </li>
                <li className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Bu Yani: 0812-9799-2940</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="pt-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
            <p>© 2026 Yayasan Pondok Pesantren Zumrotul Huda Depok. Sistem Pendaftaran Digital.</p>
            <div className="flex items-center gap-4">
              <button 
                onClick={() => setActiveTab('admin')} 
                className="text-slate-400 hover:text-emerald-400 font-medium cursor-pointer"
              >
                Panel Dasbor Admin
              </button>
              <span>•</span>
              <button 
                onClick={() => setActiveTab('check')} 
                className="text-slate-400 hover:text-emerald-400 font-medium cursor-pointer"
              >
                Cek Status Pendaftaran
              </button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
