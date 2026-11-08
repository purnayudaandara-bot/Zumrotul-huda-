import React from 'react';
import { 
  CheckCircle, 
  Printer, 
  Download, 
  MessageSquare, 
  ExternalLink, 
  X, 
  Share2, 
  Sparkles, 
  FileText,
  Calendar,
  AlertCircle
} from 'lucide-react';
import { RegistrationRecord, buildSubmissionWhatsAppUrl, ADMIN_WHATSAPP_NUMBER } from '../utils/ppdbLogic';
import { generateRegistrationPdf } from '../utils/pdfGenerator';

interface SuccessRegistrationModalProps {
  record: RegistrationRecord | null;
  isOpen: boolean;
  onClose: () => void;
  onPrint: () => void;
}

export const SuccessRegistrationModal: React.FC<SuccessRegistrationModalProps> = ({
  record,
  isOpen,
  onClose,
  onPrint,
}) => {
  if (!isOpen || !record) return null;

  const whatsappUrl = buildSubmissionWhatsAppUrl(record);

  const handleDownloadPdf = () => {
    generateRegistrationPdf(record);
  };

  const handleSendWhatsApp = () => {
    window.open(whatsappUrl, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="relative bg-white rounded-3xl max-w-2xl w-full shadow-2xl border border-emerald-100 overflow-hidden transform transition-all animate-in fade-in zoom-in-95 duration-200">
        {/* Top Header Card */}
        <div className="bg-gradient-to-r from-emerald-800 via-emerald-700 to-green-700 p-6 sm:p-7 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-amber-300 border border-white/20 shrink-0">
              <CheckCircle className="w-8 h-8 fill-amber-300 text-emerald-900" />
            </div>
            <div>
              <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-400 text-emerald-950 uppercase tracking-wide mb-1">
                Pendaftaran Berhasil Diterima
              </div>
              <h2 className="text-xl sm:text-2xl font-black">
                Selamat! Data Telah Terdaftar
              </h2>
              <p className="text-xs sm:text-sm text-emerald-100">
                Pondok Pesantren & PAUD Zumrotul Huda Depok
              </p>
            </div>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 sm:p-7 space-y-6">
          {/* Key ID Banner */}
          <div className="bg-emerald-50 border-2 border-dashed border-emerald-300 rounded-2xl p-4 text-center">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-800 block">
              Nomor Registrasi PPDB Anda
            </span>
            <span className="text-2xl sm:text-3xl font-black text-emerald-900 tracking-tight my-1 block font-mono">
              {record.id}
            </span>
            <p className="text-xs text-gray-600">
              Simpan nomor registrasi ini untuk mengecek status seleksi atau mencetak ulang formulir.
            </p>
          </div>

          {/* Quick Summary Grid */}
          <div className="grid grid-cols-2 gap-3 text-xs sm:text-sm bg-gray-50 rounded-xl p-4 border border-gray-200">
            <div>
              <span className="text-gray-500 block text-[11px]">Nama Calon:</span>
              <strong className="text-gray-900 font-bold">{record.studentName}</strong>
            </div>
            <div>
              <span className="text-gray-500 block text-[11px]">Program:</span>
              <strong className="text-emerald-700 font-bold">
                {record.program === 'PAUD' ? 'PAUD Zumrotul Huda' : record.program === 'PONTREN_PUTRA' ? 'Pesantren Putra' : 'Pesantren Putri'}
              </strong>
            </div>
            <div>
              <span className="text-gray-500 block text-[11px]">Nama Wali & Kontak:</span>
              <span className="text-gray-800">{record.fatherName || record.motherName} ({record.guardianPhone})</span>
            </div>
            <div>
              <span className="text-gray-500 block text-[11px]">Status Biaya:</span>
              <span className="inline-block px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-100 text-emerald-800">
                {record.program === 'PAUD' ? 'GRATIS (Promo PPDB)' : 'Menunggu Konfirmasi'}
              </span>
            </div>
          </div>

          {/* Notification Info Alert */}
          <div className="flex items-start gap-3 p-3.5 rounded-xl bg-blue-50 border border-blue-200 text-blue-900 text-xs leading-relaxed">
            <AlertCircle className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
            <div>
              <strong>Langkah Selanjutnya:</strong> Silakan klik tombol di bawah untuk mengirim data langsung ke WhatsApp Panitia <strong>089635988413</strong> dan unduh/cetak Bukti Pendaftaran Resmi ber-KOP Lembaga.
            </div>
          </div>

          {/* Action Buttons: WhatsApp, Print, PDF */}
          <div className="space-y-3 pt-2">
            {/* 1. WhatsApp Button (Primary Requirement) */}
            <button
              onClick={handleSendWhatsApp}
              className="w-full flex items-center justify-center gap-3 py-3.5 px-5 rounded-xl bg-green-600 hover:bg-green-700 text-white font-extrabold text-sm sm:text-base shadow-lg shadow-green-600/30 transition-all hover:scale-[1.01] active:scale-[0.99] cursor-pointer"
            >
              <MessageSquare className="w-5 h-5 fill-white" />
              <span>Kirim Otomatis ke WhatsApp Admin ({ADMIN_WHATSAPP_NUMBER})</span>
            </button>

            {/* 2. Print & PDF Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                onClick={onPrint}
                className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-xs sm:text-sm shadow-md transition-all hover:scale-[1.01] cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                <span>Cetak Bukti Pendaftaran</span>
              </button>

              <button
                onClick={handleDownloadPdf}
                className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs sm:text-sm shadow-md transition-all hover:scale-[1.01] cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>Unduh File PDF Resmi</span>
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-100 px-6 py-4 flex items-center justify-between border-t border-gray-200 text-xs text-gray-500">
          <span>Pondok Pesantren Zumrotul Huda Depok</span>
          <button
            onClick={onClose}
            className="font-bold text-emerald-800 hover:text-emerald-900 cursor-pointer underline"
          >
            Selesai & Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
