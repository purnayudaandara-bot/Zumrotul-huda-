export type ProgramType = 'PAUD' | 'PONTREN_PUTRA' | 'PONTREN_PUTRI';

export type VerificationStatus = 'MENUNGGU_VERIFIKASI' | 'TERVERIFIKASI' | 'BERKAS_KURANG' | 'DITERIMA' | 'DITOLAK';

export type PaymentStatus = 'GRATIS' | 'LUNAS' | 'BELUM_LUNAS' | 'MENUNGGU_KONFIRMASI';

export interface DocumentUpload {
  name: string;
  type: 'akta' | 'kk' | 'foto' | 'ijazah' | 'lainnya';
  fileUrl?: string; // Data URL or storage path
  fileName?: string;
  uploadDate: string;
}

export interface RegistrationRecord {
  id: string; // e.g., ZH-2026-PAUD-001
  createdAt: string;
  program: ProgramType;
  
  // Student Data
  studentName: string;
  nickname?: string;
  nik: string;
  nisn?: string;
  gender: 'L' | 'P';
  birthPlace: string;
  birthDate: string;
  ageYears?: number;
  childNumber?: number;
  totalSiblings?: number;
  hobbies?: string;
  healthNotes?: string;
  
  // Pondok Pesantren specific (optional)
  previousSchool?: string;
  memorizationJuz?: number;
  roomChoice?: 'Asrama Penuh' | 'Non-Asrama / Kalong';

  // Parent/Guardian Data
  fatherName: string;
  fatherJob?: string;
  motherName: string;
  motherJob?: string;
  guardianPhone: string; // WhatsApp number
  parentAddress: string;
  district?: string; // Kecamatan
  city?: string; // Kota/Kabupaten (e.g. Depok)

  // Document Verification & Google Drive
  googleDriveUrl?: string;
  documents: DocumentUpload[];
  verificationStatus: VerificationStatus;
  verificationNotes?: string;
  verifiedBy?: string;
  verifiedAt?: string;

  // Payment & Fees
  paymentStatus: PaymentStatus;
  totalFee: number;
  paidAmount: number;
  paymentDueDate?: string; // ISO date YYYY-MM-DD
  paymentNotes?: string;
}

export const ADMIN_WHATSAPP_NUMBER = '089635988413';
export const ADMIN_PHONE_CLEAN = '6289635988413';

/**
 * Format Indonesian Rupiah
 */
export function formatRupiah(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Generate unique Registration Code
 */
export function generateRegistrationCode(program: ProgramType, existingCount: number, year = 2026): string {
  const prefix = program === 'PAUD' ? 'PAUD' : program === 'PONTREN_PUTRA' ? 'SANTRI-PA' : 'SANTRI-PI';
  const sequence = String(existingCount + 1).padStart(3, '0');
  return `ZH-${year}-${prefix}-${sequence}`;
}

/**
 * Clean phone number to Indonesian international format (628...)
 */
export function cleanIndonesianPhone(phone: string): string {
  if (!phone) return '';
  let cleaned = phone.replace(/[^0-9]/g, '');
  if (cleaned.startsWith('0')) {
    cleaned = '62' + cleaned.slice(1);
  } else if (cleaned.startsWith('+62')) {
    cleaned = cleaned.slice(1);
  } else if (!cleaned.startsWith('62')) {
    cleaned = '62' + cleaned;
  }
  return cleaned;
}

/**
 * Generate formatted WhatsApp message URL for submission to admin (089635988413)
 */
export function buildSubmissionWhatsAppUrl(data: RegistrationRecord): string {
  const programLabel = data.program === 'PAUD' 
    ? 'PAUD Zumrotul Huda (Promo Gratis SPP & Uang Pangkal)' 
    : data.program === 'PONTREN_PUTRA' 
      ? 'Santri Putra Pondok Pesantren Zumrotul Huda' 
      : 'Santriwati Putri Pondok Pesantren Zumrotul Huda';

  const driveInfo = data.googleDriveUrl && data.googleDriveUrl.trim().length > 0
    ? `📁 *Link Berkas Google Drive:* ${data.googleDriveUrl.trim()}\n`
    : `📁 *Berkas:* ${data.documents.length} dokumen diunggah di sistem\n`;

  const feeInfo = data.program === 'PAUD'
    ? '💰 *Biaya:* *GRATIS UANG PANGKAL & GRATIS SPP* (Promo PPDB 2026/2027)'
    : `💰 *Biaya Administrasi:* Total ${formatRupiah(data.totalFee)} | Terbayar: ${formatRupiah(data.paidAmount)}`;

  const text = `*PENDAFTARAN PPDB ZUMROTUL HUDA 2026/2027*
━━━━━━━━━━━━━━━━━━━━
Assalamu'alaikum Wr. Wb.
Admin PPDB Yayasan Pondok Pesantren Zumrotul Huda, saya bermaksud mengonfirmasi formulir pendaftaran digital baru:

📌 *No. Registrasi:* *${data.id}*
🎓 *Program:* ${programLabel}
👤 *Nama Calon:* *${data.studentName.toUpperCase()}*
⚧ *Jenis Kelamin:* ${data.gender === 'L' ? 'Laki-laki' : 'Perempuan'}
🎂 *TTL:* ${data.birthPlace}, ${data.birthDate}
🏠 *Alamat:* ${data.parentAddress}

👨‍👩‍👦 *Nama Orang Tua/Wali:* ${data.fatherName} / ${data.motherName}
📱 *No. WhatsApp Wali:* ${data.guardianPhone}

${driveInfo}${feeInfo}

📄 *Catatan:* Formulir pendaftaran dan bukti PDF terlampir telah digenerate melalui Aplikasi Digital PPDB Zumrotul Huda. Mohon bantuan untuk verifikasi dan konfirmasi pendaftaran. Terima kasih.
Wassalamu'alaikum Wr. Wb.`;

  return `https://api.whatsapp.com/send?phone=${ADMIN_PHONE_CLEAN}&text=${encodeURIComponent(text)}`;
}

/**
 * Generate Payment Deadline Reminder WhatsApp message for guardians
 */
export function buildPaymentReminderWhatsAppUrl(
  record: RegistrationRecord, 
  customNote?: string
): string {
  const cleanPhone = cleanIndonesianPhone(record.guardianPhone);
  const remainingFee = Math.max(0, record.totalFee - record.paidAmount);
  
  const text = `*PENGINGAT ADMINISTRASI PPDB ZUMROTUL HUDA*
━━━━━━━━━━━━━━━━━━━━
Assalamu'alaikum Wr. Wb.
Bapak/Ibu Wali dari Ananda *${record.studentName}* (${record.id}),

Kami dari Panitia Penerimaan Santri Baru Pondok Pesantren Zumrotul Huda menginformasikan mengenai rincian administrasi pendaftaran:

📌 *No. Pendaftaran:* ${record.id}
🎓 *Program:* ${record.program === 'PAUD' ? 'PAUD' : 'Pondok Pesantren'}
💵 *Sisa Tagihan:* *${formatRupiah(remainingFee)}*
🗓 *Tenggat Waktu:* *${record.paymentDueDate || 'Sebelum Awal Masuk Ajaran'}*

${customNote ? `ℹ️ *Pesan Panitia:* ${customNote}\n\n` : ''}Pembayaran dapat disalurkan melalui rekening resmi pesantren atau langsung ke kantor sekretariat Pondok Pesantren Zumrotul Huda, Jl. Cagar Alam Selatan Gg Balong Sari II Depok.

Konfirmasi bukti transfer ke nomor WhatsApp panitia: 089635988413.
Jazakumullah Khairan Katsiran.
Wassalamu'alaikum Wr. Wb.`;

  return `https://api.whatsapp.com/send?phone=${cleanPhone}&text=${encodeURIComponent(text)}`;
}

/**
 * Evaluate payment deadline urgency
 */
export function getPaymentDeadlineInfo(record: RegistrationRecord, referenceDate = new Date()): {
  status: 'GRATIS' | 'LUNAS' | 'TERLAMBAT' | 'SEGERA' | 'AMAN' | 'BELUM_DITENTUKAN';
  daysLeft?: number;
  label: string;
  badgeClass: string;
} {
  if (record.program === 'PAUD' || record.totalFee === 0) {
    return {
      status: 'GRATIS',
      label: 'Gratis Biaya (Promo PPDB)',
      badgeClass: 'bg-emerald-100 text-emerald-800 border-emerald-300',
    };
  }

  if (record.paidAmount >= record.totalFee) {
    return {
      status: 'LUNAS',
      label: 'Lunas',
      badgeClass: 'bg-green-100 text-green-800 border-green-300',
    };
  }

  if (!record.paymentDueDate) {
    return {
      status: 'BELUM_DITENTUKAN',
      label: 'Belum Ada Tenggat',
      badgeClass: 'bg-gray-100 text-gray-700 border-gray-300',
    };
  }

  const dueDate = new Date(record.paymentDueDate + 'T23:59:59');
  const now = new Date(referenceDate);
  const diffTime = dueDate.getTime() - now.getTime();
  const daysLeft = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (daysLeft < 0) {
    return {
      status: 'TERLAMBAT',
      daysLeft,
      label: `Terlambat ${Math.abs(daysLeft)} hari`,
      badgeClass: 'bg-red-100 text-red-800 border-red-300',
    };
  } else if (daysLeft <= 3) {
    return {
      status: 'SEGERA',
      daysLeft,
      label: `Segera (${daysLeft} hari lagi)`,
      badgeClass: 'bg-amber-100 text-amber-800 border-amber-300',
    };
  } else {
    return {
      status: 'AMAN',
      daysLeft,
      label: `${daysLeft} hari lagi`,
      badgeClass: 'bg-blue-100 text-blue-800 border-blue-300',
    };
  }
}

/**
 * Calculate summary statistics for Admin Dashboard
 */
export function calculatePPDBStats(records: RegistrationRecord[]) {
  const total = records.length;
  const paudCount = records.filter(r => r.program === 'PAUD').length;
  const pontrenPaCount = records.filter(r => r.program === 'PONTREN_PUTRA').length;
  const pontrenPiCount = records.filter(r => r.program === 'PONTREN_PUTRI').length;
  
  const verifiedCount = records.filter(r => r.verificationStatus === 'TERVERIFIKASI' || r.verificationStatus === 'DITERIMA').length;
  const pendingVerificationCount = records.filter(r => r.verificationStatus === 'MENUNGGU_VERIFIKASI').length;
  const needDocsCount = records.filter(r => r.verificationStatus === 'BERKAS_KURANG').length;
  
  const unpaidCount = records.filter(r => r.program !== 'PAUD' && r.paidAmount < r.totalFee).length;
  const withDriveLinkCount = records.filter(r => !!r.googleDriveUrl && r.googleDriveUrl.trim().length > 0).length;

  return {
    total,
    paudCount,
    pontrenPaCount,
    pontrenPiCount,
    verifiedCount,
    pendingVerificationCount,
    needDocsCount,
    unpaidCount,
    withDriveLinkCount,
  };
}
