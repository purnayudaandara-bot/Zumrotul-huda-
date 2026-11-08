import React, { useState } from 'react';
import { 
  Search, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  Printer, 
  Download, 
  MessageSquare, 
  FileText, 
  FolderOpen,
  Calendar,
  CreditCard
} from 'lucide-react';
import { 
  RegistrationRecord, 
  formatRupiah, 
  getPaymentDeadlineInfo, 
  ADMIN_WHATSAPP_NUMBER 
} from '../utils/ppdbLogic';
import { storageService } from '../services/storageService';
import { generateRegistrationPdf } from '../utils/pdfGenerator';

interface StatusCheckerProps {
  onPrintRecord: (record: RegistrationRecord) => void;
}

export const StatusChecker: React.FC<StatusCheckerProps> = ({ onPrintRecord }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [foundRecords, setFoundRecords] = useState<RegistrationRecord[] | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    const results = storageService.searchRecords(searchQuery);
    setFoundRecords(results);
    setHasSearched(true);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'DITERIMA':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-extrabold bg-green-100 text-green-800 border border-green-300">
            <CheckCircle2 className="w-3.5 h-3.5" /> DITERIMA (LULUS SELEKSI)
          </span>
        );
      case 'TERVERIFIKASI':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-800 border border-blue-300">
            <CheckCircle2 className="w-3.5 h-3.5" /> BERKAS TERVERIFIKASI
          </span>
        );
      case 'BERKAS_KURANG':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-300">
            <AlertTriangle className="w-3.5 h-3.5" /> PERLU PERBAIKAN BERKAS
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-gray-100 text-gray-800 border border-gray-300">
            <Clock className="w-3.5 h-3.5" /> MENUNGGU VERIFIKASI PANITIA
          </span>
        );
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-800 mb-3 shadow-inner">
          <Search className="w-6 h-6" />
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
          Cek Status Pendaftaran & Cetak Bukti
        </h2>
        <p className="text-gray-600 text-sm mt-1 max-w-lg mx-auto">
          Masukkan <strong>Nomor Registrasi</strong> (contoh: <code>ZH-2026-PAUD-001</code>) atau <strong>Nomor WhatsApp / NIK</strong> yang didaftarkan.
        </p>
      </div>

      {/* Search Input Box */}
      <form onSubmit={handleSearch} className="max-w-2xl mx-auto mb-10">
        <div className="flex gap-2 p-1.5 rounded-2xl bg-white border-2 border-emerald-500 shadow-lg shadow-emerald-500/10 focus-within:ring-4 focus-within:ring-emerald-500/20">
          <div className="flex-1 flex items-center pl-3">
            <Search className="w-5 h-5 text-gray-400 mr-2 shrink-0" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Contoh: ZH-2026-PAUD-001 atau 081288992211"
              className="w-full bg-transparent border-none focus:outline-none text-sm sm:text-base font-medium text-gray-900 placeholder:text-gray-400"
            />
          </div>
          <button
            type="submit"
            className="px-6 py-3 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-sm shadow-md transition-colors cursor-pointer shrink-0"
          >
            Cari Data
          </button>
        </div>

        {/* Quick helper shortcuts */}
        <div className="flex flex-wrap items-center justify-center gap-2 mt-3 text-xs text-gray-500">
          <span>Contoh data tersedia:</span>
          <button
            type="button"
            onClick={() => {
              setSearchQuery('ZH-2026-PAUD-001');
              setFoundRecords(storageService.searchRecords('ZH-2026-PAUD-001'));
              setHasSearched(true);
            }}
            className="px-2.5 py-1 rounded bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-mono font-semibold"
          >
            ZH-2026-PAUD-001
          </button>
          <button
            type="button"
            onClick={() => {
              setSearchQuery('ZH-2026-SANTRI-PA-001');
              setFoundRecords(storageService.searchRecords('ZH-2026-SANTRI-PA-001'));
              setHasSearched(true);
            }}
            className="px-2.5 py-1 rounded bg-blue-50 hover:bg-blue-100 text-blue-800 font-mono font-semibold"
          >
            ZH-2026-SANTRI-PA-001
          </button>
          <button
            type="button"
            onClick={() => {
              setSearchQuery('ZH-2026-SANTRI-PI-001');
              setFoundRecords(storageService.searchRecords('ZH-2026-SANTRI-PI-001'));
              setHasSearched(true);
            }}
            className="px-2.5 py-1 rounded bg-purple-50 hover:bg-purple-100 text-purple-800 font-mono font-semibold"
          >
            ZH-2026-SANTRI-PI-001
          </button>
        </div>
      </form>

      {/* Search Results */}
      {hasSearched && (
        <div className="space-y-6">
          {foundRecords && foundRecords.length > 0 ? (
            foundRecords.map((record) => {
              const deadline = getPaymentDeadlineInfo(record);

              return (
                <div
                  key={record.id}
                  className="bg-white rounded-2xl p-6 sm:p-7 shadow-md border border-gray-200 transition-all hover:border-emerald-300"
                >
                  {/* Card Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-gray-100">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-sm sm:text-base font-extrabold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                          {record.id}
                        </span>
                        <span className="text-xs text-gray-500">
                          Didaftarkan: {new Date(record.createdAt).toLocaleDateString('id-ID', { dateStyle: 'long' })}
                        </span>
                      </div>
                      <h3 className="text-xl font-black text-gray-900 mt-2">
                        {record.studentName}
                      </h3>
                      <p className="text-xs text-gray-600 font-medium">
                        Program: <strong className="text-emerald-700">{record.program === 'PAUD' ? 'PAUD Zumrotul Huda (Promo Gratis SPP)' : record.program === 'PONTREN_PUTRA' ? 'Pondok Pesantren Putra' : 'Pondok Pesantren Putri'}</strong>
                      </p>
                    </div>

                    <div className="sm:text-right">
                      <div className="mb-1">{getStatusBadge(record.verificationStatus)}</div>
                      <span className={`inline-block px-2.5 py-0.5 rounded text-[11px] font-bold border ${deadline.badgeClass}`}>
                        Biaya: {deadline.label}
                      </span>
                    </div>
                  </div>

                  {/* Progress Step Flow */}
                  <div className="py-5">
                    <span className="text-xs font-bold uppercase tracking-wider text-gray-500 block mb-3">
                      Tahapan Proses Pendaftaran:
                    </span>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs">
                      {/* Step 1 */}
                      <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900">
                        <div className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center mx-auto mb-1 text-[11px] font-bold">
                          ✓
                        </div>
                        <span className="font-bold block">1. Formulir Terkirim</span>
                        <span className="text-[10px] text-emerald-700">Tersimpan Digital</span>
                      </div>

                      {/* Step 2 */}
                      <div className={`p-2.5 rounded-xl border ${
                        record.verificationStatus === 'DITERIMA' || record.verificationStatus === 'TERVERIFIKASI'
                          ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                          : record.verificationStatus === 'BERKAS_KURANG'
                            ? 'bg-amber-50 border-amber-200 text-amber-900'
                            : 'bg-gray-50 border-gray-200 text-gray-600'
                      }`}>
                        <div className={`w-5 h-5 rounded-full flex items-center justify-center mx-auto mb-1 text-[11px] font-bold ${
                          record.verificationStatus === 'DITERIMA' || record.verificationStatus === 'TERVERIFIKASI'
                            ? 'bg-emerald-600 text-white'
                            : 'bg-gray-300 text-gray-700'
                        }`}>
                          2
                        </div>
                        <span className="font-bold block">2. Verifikasi Berkas</span>
                        <span className="text-[10px]">
                          {record.verificationStatus === 'BERKAS_KURANG' ? 'Perlu Perbaikan' : 'Google Drive / Fisik'}
                        </span>
                      </div>

                      {/* Step 3 */}
                      <div className={`p-2.5 rounded-xl border ${
                        record.verificationStatus === 'DITERIMA'
                          ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                          : 'bg-gray-50 border-gray-200 text-gray-600'
                      }`}>
                        <div className={`w-5 h-5 rounded-full flex items-center justify-center mx-auto mb-1 text-[11px] font-bold ${
                          record.verificationStatus === 'DITERIMA'
                            ? 'bg-emerald-600 text-white'
                            : 'bg-gray-300 text-gray-700'
                        }`}>
                          3
                        </div>
                        <span className="font-bold block">3. Penetapan Status</span>
                        <span className="text-[10px]">
                          {record.verificationStatus === 'DITERIMA' ? 'Resmi Diterima' : 'Dalam Proses'}
                        </span>
                      </div>

                      {/* Step 4 */}
                      <div className={`p-2.5 rounded-xl border ${
                        record.program === 'PAUD' || record.paymentStatus === 'LUNAS'
                          ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                          : 'bg-gray-50 border-gray-200 text-gray-600'
                      }`}>
                        <div className={`w-5 h-5 rounded-full flex items-center justify-center mx-auto mb-1 text-[11px] font-bold ${
                          record.program === 'PAUD' || record.paymentStatus === 'LUNAS'
                            ? 'bg-emerald-600 text-white'
                            : 'bg-gray-300 text-gray-700'
                        }`}>
                          4
                        </div>
                        <span className="font-bold block">4. Siap Belajar</span>
                        <span className="text-[10px]">
                          {record.program === 'PAUD' ? 'Gratis SPP Aktif' : record.paymentStatus === 'LUNAS' ? 'Administrasi Lunas' : 'Menunggu Pelunasan'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Notes & Verification Comments */}
                  {record.verificationNotes && (
                    <div className="mb-5 p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs">
                      <strong>Catatan Tim Verifikasi PPDB:</strong> {record.verificationNotes}
                    </div>
                  )}

                  {/* Google Drive Link info */}
                  {record.googleDriveUrl && (
                    <div className="mb-5 flex items-center justify-between p-3 rounded-xl bg-blue-50 border border-blue-200 text-xs">
                      <div className="flex items-center gap-2 text-blue-900">
                        <FolderOpen className="w-4 h-4 text-blue-600" />
                        <span>Link Berkas Google Drive Terhubung: <code className="font-mono text-[11px]">{record.googleDriveUrl.slice(0, 40)}...</code></span>
                      </div>
                      <a
                        href={record.googleDriveUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="px-3 py-1 rounded bg-blue-600 text-white font-bold hover:bg-blue-700"
                      >
                        Buka Drive
                      </a>
                    </div>
                  )}

                  {/* Actions for applicant */}
                  <div className="pt-4 border-t border-gray-100 flex flex-wrap items-center justify-between gap-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        onClick={() => onPrintRecord(record)}
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs shadow-sm transition-colors cursor-pointer"
                      >
                        <Printer className="w-3.5 h-3.5" />
                        Cetak Formulir Resmi
                      </button>

                      <button
                        onClick={() => generateRegistrationPdf(record)}
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs shadow-sm transition-colors cursor-pointer"
                      >
                        <Download className="w-3.5 h-3.5" />
                        Unduh PDF
                      </button>
                    </div>

                    <a
                      href={`https://api.whatsapp.com/send?phone=6289635988413&text=${encodeURIComponent(`Assalamu'alaikum Admin PPDB Zumrotul Huda, saya ingin mengonfirmasi status pendaftaran ananda ${record.studentName} (${record.id}).`)}`}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-green-600 hover:bg-green-700 text-white font-bold text-xs shadow-sm transition-colors"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      Hubungi Admin WA (089635988413)
                    </a>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="bg-white rounded-2xl p-8 text-center border border-gray-200">
              <AlertTriangle className="w-12 h-12 text-amber-500 mx-auto mb-3" />
              <h3 className="text-lg font-bold text-gray-900">Data Tidak Ditemukan</h3>
              <p className="text-xs sm:text-sm text-gray-600 max-w-md mx-auto mt-1">
                Tidak ada pendaftaran yang cocok dengan kata kunci <strong>"{searchQuery}"</strong>. Pastikan Nomor Registrasi atau Nomor WhatsApp sesuai saat pengisian formulir.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
