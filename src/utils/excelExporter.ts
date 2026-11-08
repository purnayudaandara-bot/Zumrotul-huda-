import * as XLSX from 'xlsx';
import { RegistrationRecord, formatRupiah } from './ppdbLogic';

export function exportRegistrationsToExcel(records: RegistrationRecord[], filename = 'Data-PPDB-Zumrotul-Huda.xlsx'): void {
  // Transform records into flat rows suitable for administrative reporting
  const rows = records.map((r, index) => {
    return {
      'No': index + 1,
      'No. Registrasi': r.id,
      'Tanggal Daftar': new Date(r.createdAt).toLocaleDateString('id-ID'),
      'Program': r.program === 'PAUD' 
        ? 'PAUD Zumrotul Huda' 
        : r.program === 'PONTREN_PUTRA' 
          ? 'Pondok Pesantren Putra' 
          : 'Pondok Pesantren Putri',
      'Nama Calon Siswa / Santri': r.studentName,
      'Nama Panggilan': r.nickname || '',
      'NIK': r.nik,
      'NISN': r.nisn || '',
      'Jenis Kelamin': r.gender === 'L' ? 'Laki-laki' : 'Perempuan',
      'Tempat Lahir': r.birthPlace,
      'Tanggal Lahir': r.birthDate,
      'Usia (Th)': r.ageYears || '',
      'Anak Ke-': r.childNumber || '',
      'Jml Saudara': r.totalSiblings || '',
      'Hafalan (Juz)': r.memorizationJuz || 0,
      'Asal Sekolah': r.previousSchool || '',
      'Pilihan Asrama': r.roomChoice || '',
      'Nama Ayah': r.fatherName,
      'Pekerjaan Ayah': r.fatherJob || '',
      'Nama Ibu': r.motherName,
      'Pekerjaan Ibu': r.motherJob || '',
      'No. WhatsApp Wali': r.guardianPhone,
      'Alamat': r.parentAddress,
      'Kecamatan': r.district || '',
      'Kota/Kabupaten': r.city || '',
      'Link Google Drive': r.googleDriveUrl || '',
      'Jml Berkas Terunggah': r.documents.length,
      'Status Verifikasi': r.verificationStatus,
      'Catatan Verifikasi': r.verificationNotes || '',
      'Status Pembayaran': r.paymentStatus,
      'Total Biaya': r.program === 'PAUD' ? 'GRATIS' : formatRupiah(r.totalFee),
      'Jumlah Bayar': r.program === 'PAUD' ? 'GRATIS' : formatRupiah(r.paidAmount),
      'Sisa Tagihan': r.program === 'PAUD' ? 'GRATIS' : formatRupiah(Math.max(0, r.totalFee - r.paidAmount)),
      'Tenggat Pembayaran': r.paymentDueDate || '',
      'Catatan Biaya': r.paymentNotes || '',
    };
  });

  const worksheet = XLSX.utils.json_to_sheet(rows);

  // Set column widths for readability
  worksheet['!cols'] = [
    { wch: 5 },  // No
    { wch: 22 }, // No. Registrasi
    { wch: 14 }, // Tanggal Daftar
    { wch: 24 }, // Program
    { wch: 30 }, // Nama Lengkap
    { wch: 15 }, // Nama Panggilan
    { wch: 18 }, // NIK
    { wch: 14 }, // NISN
    { wch: 13 }, // Jenis Kelamin
    { wch: 15 }, // Tempat Lahir
    { wch: 14 }, // Tanggal Lahir
    { wch: 10 }, // Usia
    { wch: 10 }, // Anak Ke
    { wch: 12 }, // Jml Saudara
    { wch: 14 }, // Hafalan
    { wch: 22 }, // Asal Sekolah
    { wch: 16 }, // Asrama
    { wch: 22 }, // Nama Ayah
    { wch: 18 }, // Pekerjaan Ayah
    { wch: 22 }, // Nama Ibu
    { wch: 18 }, // Pekerjaan Ibu
    { wch: 18 }, // WhatsApp
    { wch: 35 }, // Alamat
    { wch: 16 }, // Kecamatan
    { wch: 16 }, // Kota
    { wch: 40 }, // Link Drive
    { wch: 18 }, // Jml Berkas
    { wch: 20 }, // Status Verifikasi
    { wch: 30 }, // Catatan Verifikasi
    { wch: 18 }, // Status Bayar
    { wch: 16 }, // Total Biaya
    { wch: 16 }, // Bayar
    { wch: 16 }, // Sisa
    { wch: 16 }, // Tenggat
    { wch: 30 }, // Catatan Biaya
  ];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Data PPDB');

  XLSX.writeFile(workbook, filename);
}
