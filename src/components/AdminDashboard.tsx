import React, { useState, useEffect } from 'react';
import { 
  Shield, 
  Lock, 
  Unlock, 
  Users, 
  Baby, 
  GraduationCap, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  FileSpreadsheet, 
  FileText, 
  Search, 
  Filter, 
  FolderOpen, 
  Send, 
  Calendar, 
  CreditCard, 
  ExternalLink,
  Edit,
  Trash2,
  RefreshCw,
  Eye,
  Check,
  X,
  Printer
} from 'lucide-react';
import { 
  RegistrationRecord, 
  ProgramType, 
  VerificationStatus, 
  PaymentStatus,
  formatRupiah,
  calculatePPDBStats,
  getPaymentDeadlineInfo,
  buildPaymentReminderWhatsAppUrl,
  ADMIN_WHATSAPP_NUMBER
} from '../utils/ppdbLogic';
import { storageService } from '../services/storageService';
import { exportRegistrationsToExcel } from '../utils/excelExporter';
import { generateSummaryReportPdf, generateRegistrationPdf } from '../utils/pdfGenerator';

interface AdminDashboardProps {
  isAdminLoggedIn: boolean;
  setIsAdminLoggedIn: (val: boolean) => void;
  onPrintRecord: (record: RegistrationRecord) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  isAdminLoggedIn,
  setIsAdminLoggedIn,
  onPrintRecord,
}) => {
  // Auth state
  const [passwordInput, setPasswordInput] = useState('');
  const [authError, setAuthError] = useState('');

  // Records state
  const [records, setRecords] = useState<RegistrationRecord[]>(storageService.getRecords());
  const [searchQuery, setSearchQuery] = useState('');
  const [programFilter, setProgramFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [paymentFilter, setPaymentFilter] = useState<string>('ALL');

  // Selected modals
  const [selectedRecordForDocs, setSelectedRecordForDocs] = useState<RegistrationRecord | null>(null);
  const [selectedRecordForPayment, setSelectedRecordForPayment] = useState<RegistrationRecord | null>(null);
  const [paymentReminderNote, setPaymentReminderNote] = useState('');

  // Sync with storage events
  useEffect(() => {
    const handleUpdate = () => {
      setRecords(storageService.getRecords());
    };
    window.addEventListener('ppdb_records_updated', handleUpdate);
    return () => window.removeEventListener('ppdb_records_updated', handleUpdate);
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordInput.trim() === 'admin123' || passwordInput.trim() === '123456') {
      setIsAdminLoggedIn(true);
      setAuthError('');
    } else {
      setAuthError('Password salah. Gunakan password demo: admin123');
    }
  };

  const handleLogout = () => {
    setIsAdminLoggedIn(false);
    setPasswordInput('');
  };

  // Update record verification status
  const handleUpdateStatus = (id: string, newStatus: VerificationStatus, notes?: string) => {
    storageService.updateRecord(id, {
      verificationStatus: newStatus,
      verificationNotes: notes !== undefined ? notes : undefined,
      verifiedBy: 'Admin Panitia PPDB',
      verifiedAt: new Date().toISOString(),
    });
    setRecords(storageService.getRecords());
    if (selectedRecordForDocs && selectedRecordForDocs.id === id) {
      setSelectedRecordForDocs(prev => prev ? { ...prev, verificationStatus: newStatus, verificationNotes: notes } : null);
    }
  };

  // Update payment info
  const handleUpdatePayment = (id: string, paidAmount: number, dueDate: string, notes: string) => {
    const record = records.find(r => r.id === id);
    if (!record) return;

    let newStatus: PaymentStatus = 'BELUM_LUNAS';
    if (record.program === 'PAUD' || record.totalFee === 0) {
      newStatus = 'GRATIS';
    } else if (paidAmount >= record.totalFee) {
      newStatus = 'LUNAS';
    }

    storageService.updateRecord(id, {
      paidAmount,
      paymentDueDate: dueDate,
      paymentNotes: notes,
      paymentStatus: newStatus,
    });
    setRecords(storageService.getRecords());
    setSelectedRecordForPayment(null);
  };

  // Delete record with confirmation
  const handleDelete = (id: string, name: string) => {
    if (window.confirm(`Hapus pendaftaran ${id} atas nama "${name}"? Tindakan ini tidak dapat dibatalkan.`)) {
      storageService.deleteRecord(id);
      setRecords(storageService.getRecords());
    }
  };

  // Reset to default seed records
  const handleResetSeeds = () => {
    if (window.confirm('Muat ulang data contoh resmi (5 pendaftar PAUD & Pondok Pesantren)? Data pendaftar yang belum disimpan akan ter-reset.')) {
      const refreshed = storageService.resetToDefault();
      setRecords(refreshed);
    }
  };

  // Filter logic
  const filteredRecords = records.filter(r => {
    if (programFilter !== 'ALL' && r.program !== programFilter) return false;
    if (statusFilter !== 'ALL' && r.verificationStatus !== statusFilter) return false;
    if (paymentFilter !== 'ALL') {
      if (paymentFilter === 'GRATIS' && r.paymentStatus !== 'GRATIS') return false;
      if (paymentFilter === 'LUNAS' && r.paymentStatus !== 'LUNAS') return false;
      if (paymentFilter === 'BELUM_LUNAS' && (r.paymentStatus === 'LUNAS' || r.paymentStatus === 'GRATIS')) return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const match = 
        r.id.toLowerCase().includes(q) ||
        r.studentName.toLowerCase().includes(q) ||
        (r.guardianPhone && r.guardianPhone.includes(q)) ||
        (r.fatherName && r.fatherName.toLowerCase().includes(q)) ||
        (r.nik && r.nik.includes(q));
      if (!match) return false;
    }
    return true;
  });

  const stats = calculatePPDBStats(records);

  // If not logged in, render authentication gate
  if (!isAdminLoggedIn) {
    return (
      <div className="max-w-md mx-auto my-12 px-4">
        <div className="bg-white rounded-3xl p-8 shadow-xl border border-gray-200">
          <div className="text-center mb-6">
            <div className="w-16 h-16 rounded-2xl bg-slate-900 text-emerald-400 flex items-center justify-center mx-auto mb-4 shadow-lg">
              <Shield className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-black text-gray-900">Login Administrator</h2>
            <p className="text-xs text-gray-500 mt-1">
              Dasbor Pemantauan Real-time & Verifikasi Dokumen PPDB Zumrotul Huda
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1.5">
                Password Administrator <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="password"
                  required
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  placeholder="Masukkan password admin"
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm"
                />
                <Lock className="w-4 h-4 text-gray-400 absolute right-3.5 top-3.5" />
              </div>
            </div>

            {authError && (
              <p className="text-xs text-red-600 bg-red-50 p-2.5 rounded-lg border border-red-200">
                {authError}
              </p>
            )}

            <button
              type="submit"
              className="w-full py-3.5 px-4 rounded-xl bg-slate-900 hover:bg-black text-white font-extrabold text-sm shadow-md transition-colors cursor-pointer"
            >
              Masuk ke Dasbor Admin
            </button>
          </form>

          <div className="mt-6 pt-5 border-t border-gray-100 text-center text-xs text-gray-500">
            <span>Password Demo Bawaan: </span>
            <code className="font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
              admin123
            </code>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 space-y-8">
      {/* Top Admin Bar */}
      <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30 shrink-0">
            <Shield className="w-8 h-8" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500 text-slate-950 uppercase">
                Admin Terhubung Real-Time
              </span>
              <span className="text-xs text-slate-400">Pondok Pesantren Zumrotul Huda</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black mt-1">
              Dasbor Manajemen PPDB 2026/2027
            </h2>
            <p className="text-xs sm:text-sm text-slate-300">
              Basis data terpusat, verifikasi berkas Google Drive, rekapitulasi, & pengingat tenggat pembayaran.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => exportRegistrationsToExcel(filteredRecords)}
            className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition-colors cursor-pointer"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Ekspor Excel (.xlsx)</span>
          </button>

          <button
            onClick={() => generateSummaryReportPdf(filteredRecords, programFilter)}
            className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs border border-slate-700 transition-colors cursor-pointer"
          >
            <FileText className="w-4 h-4" />
            <span>Ekspor Rekap PDF</span>
          </button>

          <button
            onClick={handleResetSeeds}
            title="Muat ulang data contoh pendaftar"
            className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-colors cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" />
          </button>

          <button
            onClick={handleLogout}
            className="px-3.5 py-2.5 rounded-xl bg-red-900/40 hover:bg-red-800 text-red-200 font-bold text-xs border border-red-700/50 transition-colors cursor-pointer"
          >
            Keluar
          </button>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        {/* Total */}
        <div className="bg-white rounded-2xl p-4 border border-gray-200 shadow-sm">
          <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wide block">
            Total Pendaftar
          </span>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-2xl sm:text-3xl font-black text-gray-900">{stats.total}</span>
            <span className="text-xs text-emerald-600 font-bold">100%</span>
          </div>
          <span className="text-[11px] text-gray-400 mt-1 block">Semua Program</span>
        </div>

        {/* PAUD */}
        <div className="bg-emerald-50/70 rounded-2xl p-4 border border-emerald-200 shadow-sm">
          <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wide block">
            PAUD (Gratis SPP)
          </span>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-2xl sm:text-3xl font-black text-emerald-900">{stats.paudCount}</span>
            <Baby className="w-5 h-5 text-emerald-600" />
          </div>
          <span className="text-[11px] text-emerald-700 mt-1 block">Promo 2026/2027</span>
        </div>

        {/* Pontren Putra */}
        <div className="bg-blue-50/70 rounded-2xl p-4 border border-blue-200 shadow-sm">
          <span className="text-[11px] font-bold text-blue-800 uppercase tracking-wide block">
            Santri Putra
          </span>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-2xl sm:text-3xl font-black text-blue-900">{stats.pontrenPaCount}</span>
            <GraduationCap className="w-5 h-5 text-blue-600" />
          </div>
          <span className="text-[11px] text-blue-700 mt-1 block">Pondok Putra</span>
        </div>

        {/* Pontren Putri */}
        <div className="bg-purple-50/70 rounded-2xl p-4 border border-purple-200 shadow-sm">
          <span className="text-[11px] font-bold text-purple-800 uppercase tracking-wide block">
            Santriwati Putri
          </span>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-2xl sm:text-3xl font-black text-purple-900">{stats.pontrenPiCount}</span>
            <Users className="w-5 h-5 text-purple-600" />
          </div>
          <span className="text-[11px] text-purple-700 mt-1 block">Pondok Putri</span>
        </div>

        {/* Terverifikasi */}
        <div className="bg-green-50/70 rounded-2xl p-4 border border-green-200 shadow-sm">
          <span className="text-[11px] font-bold text-green-800 uppercase tracking-wide block">
            Terverifikasi / Lulus
          </span>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-2xl sm:text-3xl font-black text-green-900">{stats.verifiedCount}</span>
            <CheckCircle2 className="w-5 h-5 text-green-600" />
          </div>
          <span className="text-[11px] text-green-700 mt-1 block">Berkas Valid</span>
        </div>

        {/* Tagihan Belum Lunas */}
        <div className="bg-amber-50/70 rounded-2xl p-4 border border-amber-200 shadow-sm">
          <span className="text-[11px] font-bold text-amber-800 uppercase tracking-wide block">
            Belum Lunas Biaya
          </span>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-2xl sm:text-3xl font-black text-amber-900">{stats.unpaidCount}</span>
            <Clock className="w-5 h-5 text-amber-600" />
          </div>
          <span className="text-[11px] text-amber-700 mt-1 block">Butuh Pengingat WA</span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari nama siswa, no registrasi, NIK, atau nama orang tua..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-xs sm:text-sm"
            />
          </div>

          {/* Filters */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Program Filter */}
            <select
              value={programFilter}
              onChange={(e) => setProgramFilter(e.target.value)}
              className="px-3 py-2.5 rounded-xl border border-gray-300 text-xs font-semibold text-gray-700 focus:ring-2 focus:ring-emerald-500"
            >
              <option value="ALL">Semua Program</option>
              <option value="PAUD">PAUD Zumrotul Huda</option>
              <option value="PONTREN_PUTRA">Santri Putra (Pesantren)</option>
              <option value="PONTREN_PUTRI">Santriwati Putri (Pesantren)</option>
            </select>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2.5 rounded-xl border border-gray-300 text-xs font-semibold text-gray-700 focus:ring-2 focus:ring-emerald-500"
            >
              <option value="ALL">Semua Status Berkas</option>
              <option value="MENUNGGU_VERIFIKASI">Menunggu Verifikasi</option>
              <option value="TERVERIFIKASI">Terverifikasi</option>
              <option value="DITERIMA">Diterima</option>
              <option value="BERKAS_KURANG">Berkas Kurang</option>
            </select>

            {/* Payment Filter */}
            <select
              value={paymentFilter}
              onChange={(e) => setPaymentFilter(e.target.value)}
              className="px-3 py-2.5 rounded-xl border border-gray-300 text-xs font-semibold text-gray-700 focus:ring-2 focus:ring-emerald-500"
            >
              <option value="ALL">Semua Status Biaya</option>
              <option value="GRATIS">Gratis (Promo PAUD)</option>
              <option value="LUNAS">Lunas</option>
              <option value="BELUM_LUNAS">Belum Lunas</option>
            </select>
          </div>
        </div>

        <div className="text-xs text-gray-500 flex items-center justify-between">
          <span>Menampilkan <strong>{filteredRecords.length}</strong> dari <strong>{records.length}</strong> pendaftar</span>
          {(programFilter !== 'ALL' || statusFilter !== 'ALL' || paymentFilter !== 'ALL' || searchQuery) && (
            <button
              onClick={() => {
                setProgramFilter('ALL');
                setStatusFilter('ALL');
                setPaymentFilter('ALL');
                setSearchQuery('');
              }}
              className="text-emerald-700 font-bold hover:underline cursor-pointer"
            >
              Reset Filter
            </button>
          )}
        </div>
      </div>

      {/* Main Registrations Table */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-gray-50 border-b border-gray-200 text-gray-700 uppercase tracking-wider text-[11px] font-bold">
              <tr>
                <th className="py-3.5 px-4">No. Registrasi</th>
                <th className="py-3.5 px-4">Calon Siswa / Santri</th>
                <th className="py-3.5 px-4">Program</th>
                <th className="py-3.5 px-4">Wali & WhatsApp</th>
                <th className="py-3.5 px-4">Google Drive & Berkas</th>
                <th className="py-3.5 px-4">Status Seleksi</th>
                <th className="py-3.5 px-4">Biaya & Tenggat</th>
                <th className="py-3.5 px-4 text-right">Aksi Manajemen</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 font-medium">
              {filteredRecords.length > 0 ? (
                filteredRecords.map((record) => {
                  const deadline = getPaymentDeadlineInfo(record);

                  return (
                    <tr key={record.id} className="hover:bg-gray-50/80 transition-colors">
                      {/* ID */}
                      <td className="py-3.5 px-4 font-mono font-bold text-emerald-800 whitespace-nowrap">
                        {record.id}
                        <span className="block text-[10px] text-gray-400 font-sans font-normal">
                          {new Date(record.createdAt).toLocaleDateString('id-ID')}
                        </span>
                      </td>

                      {/* Student info */}
                      <td className="py-3.5 px-4">
                        <strong className="text-gray-900 block font-bold">{record.studentName}</strong>
                        <span className="text-[11px] text-gray-500">
                          {record.gender === 'L' ? 'Laki-laki' : 'Perempuan'} • NIK: {record.nik}
                        </span>
                      </td>

                      {/* Program */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                          record.program === 'PAUD'
                            ? 'bg-emerald-100 text-emerald-800'
                            : record.program === 'PONTREN_PUTRA'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-purple-100 text-purple-800'
                        }`}>
                          {record.program === 'PAUD' ? 'PAUD' : record.program === 'PONTREN_PUTRA' ? 'Pontren Putra' : 'Pontren Putri'}
                        </span>
                      </td>

                      {/* Guardian */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="text-gray-900">{record.fatherName || record.motherName}</div>
                        <a
                          href={`https://api.whatsapp.com/send?phone=${record.guardianPhone.replace(/[^0-9]/g, '')}`}
                          target="_blank"
                          rel="noreferrer"
                          className="text-[11px] text-emerald-700 hover:underline font-mono inline-flex items-center gap-1"
                        >
                          📱 {record.guardianPhone}
                        </a>
                      </td>

                      {/* Google Drive & Docs */}
                      <td className="py-3.5 px-4">
                        <button
                          onClick={() => setSelectedRecordForDocs(record)}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 font-semibold text-[11px] border border-blue-200 cursor-pointer"
                        >
                          <FolderOpen className="w-3.5 h-3.5" />
                          <span>{record.documents.length} Dokumen {record.googleDriveUrl ? '+ Drive' : ''}</span>
                        </button>
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <select
                          value={record.verificationStatus}
                          onChange={(e) => handleUpdateStatus(record.id, e.target.value as VerificationStatus)}
                          className={`text-xs font-bold px-2 py-1 rounded-lg border focus:ring-2 focus:ring-emerald-500 ${
                            record.verificationStatus === 'DITERIMA'
                              ? 'bg-green-50 text-green-800 border-green-300'
                              : record.verificationStatus === 'TERVERIFIKASI'
                                ? 'bg-blue-50 text-blue-800 border-blue-300'
                                : record.verificationStatus === 'BERKAS_KURANG'
                                  ? 'bg-amber-50 text-amber-800 border-amber-300'
                                  : 'bg-gray-50 text-gray-700 border-gray-300'
                          }`}
                        >
                          <option value="MENUNGGU_VERIFIKASI">Menunggu Verifikasi</option>
                          <option value="TERVERIFIKASI">Berkas Terverifikasi</option>
                          <option value="DITERIMA">Lulus / Diterima</option>
                          <option value="BERKAS_KURANG">Berkas Kurang</option>
                          <option value="DITOLAK">Ditolak</option>
                        </select>
                      </td>

                      {/* Payment info & deadline */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        {record.program === 'PAUD' ? (
                          <span className="inline-block px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-100 text-emerald-800">
                            GRATIS (Promo)
                          </span>
                        ) : (
                          <div>
                            <span className={`inline-block px-2 py-0.5 rounded text-[11px] font-bold border ${deadline.badgeClass}`}>
                              {deadline.label}
                            </span>
                            <div className="text-[11px] text-gray-500 mt-0.5">
                              {formatRupiah(record.paidAmount)} / {formatRupiah(record.totalFee)}
                            </div>
                          </div>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Payment reminder button */}
                          {record.program !== 'PAUD' && record.paidAmount < record.totalFee && (
                            <button
                              onClick={() => {
                                setSelectedRecordForPayment(record);
                                setPaymentReminderNote('');
                              }}
                              title="Kelola Pembayaran & Kirim Pengingat WhatsApp"
                              className="p-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 cursor-pointer"
                            >
                              <CreditCard className="w-4 h-4" />
                            </button>
                          )}

                          {/* Print record */}
                          <button
                            onClick={() => onPrintRecord(record)}
                            title="Cetak Bukti Pendaftaran"
                            className="p-1.5 rounded-lg bg-gray-50 hover:bg-gray-100 text-gray-700 border border-gray-200 cursor-pointer"
                          >
                            <Printer className="w-4 h-4" />
                          </button>

                          {/* PDF download */}
                          <button
                            onClick={() => generateRegistrationPdf(record)}
                            title="Unduh PDF Resmi"
                            className="p-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 cursor-pointer"
                          >
                            <FileText className="w-4 h-4" />
                          </button>

                          {/* Delete */}
                          <button
                            onClick={() => handleDelete(record.id, record.studentName)}
                            title="Hapus Data"
                            className="p-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-gray-500">
                    Tidak ada data pendaftar yang cocok dengan filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Document Verification & Google Drive Inspection */}
      {selectedRecordForDocs && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="relative bg-white rounded-3xl max-w-2xl w-full shadow-2xl border border-gray-200 overflow-hidden">
            <div className="bg-slate-900 text-white p-6 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <FolderOpen className="w-6 h-6 text-emerald-400" />
                <div>
                  <h3 className="text-lg font-bold">Verifikasi Dokumen & Google Drive</h3>
                  <p className="text-xs text-slate-300">
                    {selectedRecordForDocs.studentName} ({selectedRecordForDocs.id})
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedRecordForDocs(null)}
                className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-5">
              {/* Google Drive Link Box */}
              <div className="p-4 rounded-2xl bg-blue-50 border border-blue-200">
                <span className="text-xs font-bold uppercase tracking-wider text-blue-900 block mb-1">
                  Integrasi Google Drive:
                </span>
                {selectedRecordForDocs.googleDriveUrl ? (
                  <div className="flex items-center justify-between gap-3 mt-2">
                    <span className="text-xs text-blue-800 truncate font-mono bg-white p-2 rounded-lg border border-blue-200 flex-1">
                      {selectedRecordForDocs.googleDriveUrl}
                    </span>
                    <a
                      href={selectedRecordForDocs.googleDriveUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shrink-0 shadow-sm"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>Buka di Google Drive</span>
                    </a>
                  </div>
                ) : (
                  <p className="text-xs text-gray-500 italic mt-1">
                    Pendaftar tidak mencantumkan tautan Google Drive khusus. Berkas diunggah langsung ke sistem.
                  </p>
                )}
              </div>

              {/* Uploaded Documents List */}
              <div>
                <span className="text-xs font-bold uppercase tracking-wide text-gray-700 block mb-2">
                  Berkas Terlampir ({selectedRecordForDocs.documents.length}):
                </span>
                {selectedRecordForDocs.documents.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {selectedRecordForDocs.documents.map((doc, idx) => (
                      <div key={idx} className="p-3 rounded-xl border border-gray-200 bg-gray-50 flex items-start gap-3">
                        <FileText className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
                        <div className="flex-1 min-w-0">
                          <strong className="text-xs text-gray-900 block truncate">{doc.name}</strong>
                          <span className="text-[11px] text-gray-500 block truncate">{doc.fileName || 'file.pdf'}</span>
                          {doc.fileUrl && (
                            <a
                              href={doc.fileUrl}
                              download={doc.fileName || 'berkas'}
                              className="text-[11px] text-emerald-700 font-bold hover:underline inline-block mt-1"
                            >
                              Lihat / Unduh Berkas
                            </a>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-amber-700 bg-amber-50 p-3 rounded-xl border border-amber-200">
                    Belum ada berkas fisik yang diunggah. Silakan hubungi wali santri melalui WhatsApp untuk meminta kelengkapan berkas.
                  </p>
                )}
              </div>

              {/* Verification Notes */}
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1.5">
                  Catatan Verifikasi Panitia
                </label>
                <textarea
                  rows={2}
                  defaultValue={selectedRecordForDocs.verificationNotes || ''}
                  id="verificationNotesInput"
                  placeholder="Contoh: Berkas Akta dan KK lengkap dan valid. Lulus verifikasi administrasi."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-xs sm:text-sm"
                />
              </div>

              {/* Status Action Buttons */}
              <div className="pt-2 flex flex-wrap items-center justify-between gap-2">
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      const notes = (document.getElementById('verificationNotesInput') as HTMLTextAreaElement)?.value;
                      handleUpdateStatus(selectedRecordForDocs.id, 'DITERIMA', notes);
                      setSelectedRecordForDocs(null);
                    }}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-green-600 hover:bg-green-700 text-white font-bold text-xs"
                  >
                    <Check className="w-4 h-4" />
                    <span>Setujui & Terima (Lulus)</span>
                  </button>

                  <button
                    onClick={() => {
                      const notes = (document.getElementById('verificationNotesInput') as HTMLTextAreaElement)?.value;
                      handleUpdateStatus(selectedRecordForDocs.id, 'BERKAS_KURANG', notes || 'Berkas belum lengkap.');
                      setSelectedRecordForDocs(null);
                    }}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs"
                  >
                    <AlertTriangle className="w-4 h-4" />
                    <span>Minta Perbaikan Berkas</span>
                  </button>
                </div>

                <button
                  onClick={() => setSelectedRecordForDocs(null)}
                  className="px-4 py-2 rounded-xl bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold text-xs"
                >
                  Tutup
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Payment Due Date & WhatsApp Reminder */}
      {selectedRecordForPayment && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="relative bg-white rounded-3xl max-w-xl w-full shadow-2xl border border-gray-200 overflow-hidden">
            <div className="bg-amber-500 text-slate-950 p-6 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <CreditCard className="w-6 h-6" />
                <div>
                  <h3 className="text-lg font-black">Kelola Biaya & Pengingat Tenggat Waktu</h3>
                  <p className="text-xs font-semibold">
                    {selectedRecordForPayment.studentName} ({selectedRecordForPayment.id})
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedRecordForPayment(null)}
                className="p-2 rounded-full bg-black/10 hover:bg-black/20 text-slate-950"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-3 bg-gray-50 p-4 rounded-xl border border-gray-200 text-xs">
                <div>
                  <span className="text-gray-500 block">Total Tagihan:</span>
                  <strong className="text-base text-gray-900">{formatRupiah(selectedRecordForPayment.totalFee)}</strong>
                </div>
                <div>
                  <span className="text-gray-500 block">Sisa Pembayaran:</span>
                  <strong className="text-base text-red-600">
                    {formatRupiah(Math.max(0, selectedRecordForPayment.totalFee - selectedRecordForPayment.paidAmount))}
                  </strong>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1.5">
                  Jumlah yang Telah Dibayar (Rp)
                </label>
                <input
                  type="number"
                  id="paidAmountInput"
                  defaultValue={selectedRecordForPayment.paidAmount}
                  step={50000}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1.5">
                  Tenggat Waktu Pelunasan (Due Date)
                </label>
                <input
                  type="date"
                  id="dueDateInput"
                  defaultValue={selectedRecordForPayment.paymentDueDate || '2026-11-20'}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1.5">
                  Pesan Tambahan Pengingat WhatsApp
                </label>
                <textarea
                  rows={2}
                  value={paymentReminderNote}
                  onChange={(e) => setPaymentReminderNote(e.target.value)}
                  placeholder="Contoh: Mohon selesaikan pelunasan sebelum serah terima seragam dan kitab santri."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-xs sm:text-sm"
                />
              </div>

              {/* Action Buttons */}
              <div className="pt-2 space-y-2">
                <button
                  type="button"
                  onClick={() => {
                    const waUrl = buildPaymentReminderWhatsAppUrl(selectedRecordForPayment, paymentReminderNote);
                    window.open(waUrl, '_blank');
                  }}
                  className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-green-600 hover:bg-green-700 text-white font-extrabold text-sm shadow-md cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                  <span>Kirim Notifikasi Pengingat ke WhatsApp Wali Santri</span>
                </button>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      const paid = parseFloat((document.getElementById('paidAmountInput') as HTMLInputElement)?.value || '0');
                      const due = (document.getElementById('dueDateInput') as HTMLInputElement)?.value;
                      handleUpdatePayment(selectedRecordForPayment.id, paid, due, paymentReminderNote);
                    }}
                    className="flex-1 py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-black text-white font-bold text-xs"
                  >
                    Simpan Perubahan Biaya
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedRecordForPayment(null)}
                    className="px-4 py-2.5 rounded-xl bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold text-xs"
                  >
                    Batal
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
