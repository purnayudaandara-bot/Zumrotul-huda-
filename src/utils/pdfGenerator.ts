import { jsPDF } from 'jspdf';
import { RegistrationRecord, formatRupiah, ADMIN_WHATSAPP_NUMBER } from './ppdbLogic';

export function generateRegistrationPdf(record: RegistrationRecord): void {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  // Primary Theme Colors (Forest Green & Gold from Zumrotul Huda emblem)
  const primaryGreen = [19, 114, 53] as const; // #137235
  const darkGreen = [11, 74, 34] as const; // #0b4a22
  const goldAccent = [212, 160, 23] as const; // #d4a017
  const softBg = [245, 248, 245] as const;

  // Outer Border & Decorative Frame
  doc.setDrawColor(...primaryGreen);
  doc.setLineWidth(1.2);
  doc.rect(8, 8, pageWidth - 16, pageHeight - 16);
  doc.setDrawColor(...goldAccent);
  doc.setLineWidth(0.4);
  doc.rect(9.5, 9.5, pageWidth - 19, pageHeight - 19);

  // Header Banner Background
  doc.setFillColor(...primaryGreen);
  doc.rect(10, 10, pageWidth - 20, 32, 'F');

  // Gold accent line under header
  doc.setFillColor(...goldAccent);
  doc.rect(10, 42, pageWidth - 20, 2, 'F');

  // Header Text
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.text('YAYASAN PONDOK PESANTREN ZUMROTUL HUDA DEPOK', pageWidth / 2, 19, { align: 'center' });

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  const programTitle = record.program === 'PAUD'
    ? 'PAUD ZUMROTUL HUDA (Penerimaan Siswa Baru T.A. 2026/2027)'
    : record.program === 'PONTREN_PUTRA'
      ? 'PONDOK PESANTREN ZUMROTUL HUDA - SANTRI PUTRA'
      : 'PONDOK PESANTREN ZUMROTUL HUDA - SANTRIWATI PUTRI';
  doc.text(programTitle, pageWidth / 2, 26, { align: 'center' });

  doc.setFontSize(8);
  doc.text('Alamat: Jl. Cagar Alam Selatan Gg. Balong Sari II, Pancoran Mas, Kota Depok | WA: ' + ADMIN_WHATSAPP_NUMBER, pageWidth / 2, 33, { align: 'center' });

  // Document Title
  doc.setTextColor(...darkGreen);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.text('BUKTI PENDAFTARAN DIGITAL CALON PESERTA DIDIK / SANTRI', pageWidth / 2, 51, { align: 'center' });

  // Registration ID Box
  doc.setFillColor(...softBg);
  doc.setDrawColor(...primaryGreen);
  doc.setLineWidth(0.5);
  doc.roundedRect(14, 55, pageWidth - 28, 14, 2, 2, 'FD');

  doc.setFontSize(9);
  doc.setTextColor(70, 70, 70);
  doc.text('NOMOR REGISTRASI:', 18, 62);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(...primaryGreen);
  doc.text(record.id, 56, 63);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(70, 70, 70);
  doc.text('TANGGAL DAFTAR:', 125, 62);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(30, 30, 30);
  const regDate = new Date(record.createdAt).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
  doc.text(regDate, 160, 62);

  let currentY = 75;

  // Helper function to render section header
  const renderSectionHeader = (title: string) => {
    doc.setFillColor(...primaryGreen);
    doc.rect(14, currentY, pageWidth - 28, 6.5, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.text(title, 18, currentY + 4.8);
    currentY += 9;
  };

  // Helper function to render table row
  const renderRow = (label: string, value: string, isAlternate = false) => {
    if (isAlternate) {
      doc.setFillColor(248, 250, 248);
      doc.rect(14, currentY - 3.5, pageWidth - 28, 5.5, 'F');
    }
    doc.setTextColor(60, 60, 60);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.text(label, 18, currentY);
    doc.text(':', 68, currentY);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(25, 25, 25);

    // Split long text
    const maxWidth = pageWidth - 28 - 72;
    const splitText = doc.splitTextToSize(value || '-', maxWidth);
    doc.text(splitText, 72, currentY);
    
    currentY += Math.max(5.5, splitText.length * 4.5);
  };

  // 1. BIODATA CALON SISWA / SANTRI
  renderSectionHeader('A. BIODATA CALON PESERTA DIDIK / SANTRI');
  renderRow('Nama Lengkap', record.studentName.toUpperCase(), true);
  if (record.nickname) renderRow('Nama Panggilan', record.nickname);
  renderRow('Nomor Induk Kependudukan (NIK)', record.nik, true);
  if (record.nisn) renderRow('NISN', record.nisn);
  renderRow('Jenis Kelamin', record.gender === 'L' ? 'Laki-laki' : 'Perempuan', true);
  renderRow('Tempat, Tanggal Lahir', `${record.birthPlace}, ${record.birthDate}`);
  if (record.ageYears) renderRow('Usia Saat Mendaftar', `${record.ageYears} Tahun`, true);
  if (record.childNumber) renderRow('Anak ke- / Jumlah Saudara', `Anak ke-${record.childNumber} dari ${record.totalSiblings || '-'} bersaudara`);
  if (record.previousSchool) renderRow('Asal Sekolah Sebelumnya', record.previousSchool, true);
  if (record.memorizationJuz) renderRow('Hafalan Al-Qur\'an', `${record.memorizationJuz} Juz`);
  if (record.roomChoice) renderRow('Pilihan Asrama', record.roomChoice, true);
  if (record.hobbies) renderRow('Hobi / Minat', record.hobbies);
  if (record.healthNotes) renderRow('Catatan Kesehatan', record.healthNotes, true);

  currentY += 2;

  // 2. DATA ORANG TUA / WALI
  renderSectionHeader('B. DATA ORANG TUA / WALI');
  renderRow('Nama Ayah Kandung', record.fatherName, true);
  if (record.fatherJob) renderRow('Pekerjaan Ayah', record.fatherJob);
  renderRow('Nama Ibu Kandung', record.motherName, true);
  if (record.motherJob) renderRow('Pekerjaan Ibu', record.motherJob);
  renderRow('No. WhatsApp / HP Aktif', `${record.guardianPhone} (Wali)`, true);
  renderRow('Alamat Lengkap Domisili', `${record.parentAddress}${record.district ? ', Kec. ' + record.district : ''}${record.city ? ', ' + record.city : ''}`);

  currentY += 2;

  // 3. STATUS BERKAS & GOOGLE DRIVE
  renderSectionHeader('C. BERKAS PERSYARATAN & VERIFIKASI');
  const docsList = record.documents.map(d => d.name).join(', ') || 'Belum ada berkas fisik diunggah langsung';
  renderRow('Dokumen Terlampir', docsList, true);
  if (record.googleDriveUrl) {
    renderRow('Tautan Berkas Google Drive', record.googleDriveUrl);
  }
  renderRow('Status Verifikasi', record.verificationStatus, true);
  if (record.verificationNotes) {
    renderRow('Catatan Verifikasi Panitia', record.verificationNotes);
  }

  currentY += 2;

  // 4. STATUS PEMBIAYAAN / PROMOSI
  renderSectionHeader('D. STATUS PEMBIAYAAN');
  if (record.program === 'PAUD') {
    renderRow('Skema Pembiayaan', 'GRATIS UANG PANGKAL & GRATIS SPP (Program Promosi PPDB 2026/2027)', true);
    renderRow('Biaya Pendaftaran', 'Rp 0 (GRATIS)');
  } else {
    renderRow('Status Pembayaran', record.paymentStatus, true);
    renderRow('Total Biaya Administrasi', formatRupiah(record.totalFee));
    renderRow('Telah Dibayarkan', formatRupiah(record.paidAmount), true);
    const sisa = Math.max(0, record.totalFee - record.paidAmount);
    renderRow('Sisa Tagihan', formatRupiah(sisa));
    if (record.paymentDueDate) {
      renderRow('Tenggat Pelunasan', record.paymentDueDate, true);
    }
  }

  // Verification Box & Signatures at bottom
  const signY = Math.min(currentY + 5, pageHeight - 48);

  // Information & Notes
  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'italic');
  doc.setTextColor(90, 90, 90);
  doc.text('* Bukti pendaftaran ini sah dan diterbitkan secara digital oleh Sistem Informasi PPDB Zumrotul Huda.', 14, signY);
  doc.text('* Bawa dokumen asli (Akta Kelahiran, KK, Pas Foto 3x4) saat verifikasi fisik/masuk pertama kali.', 14, signY + 4);

  // Signatures
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(20, 20, 20);

  // Left: Wali Santri
  doc.text('Depok, ' + regDate, 25, signY + 12);
  doc.text('Orang Tua / Wali Santri,', 25, signY + 16);
  doc.line(25, signY + 34, 75, signY + 34);
  doc.text(`( ${record.fatherName || record.motherName || 'Wali Santri'} )`, 25, signY + 38);

  // Right: Panitia PPDB
  doc.text('Panitia PPDB Zumrotul Huda,', 135, signY + 16);
  // Stamp simulation
  doc.setDrawColor(...primaryGreen);
  doc.setLineWidth(0.4);
  doc.roundedRect(135, signY + 18, 48, 14, 2, 2);
  doc.setFontSize(7);
  doc.setTextColor(...primaryGreen);
  doc.text('TERVERIFIKASI SISTEM DIGITAL', 137, signY + 23);
  doc.text('PANITIA PPDB ZUMROTUL HUDA', 137, signY + 27);
  doc.text('WA: 089635988413', 137, signY + 30);

  doc.setFontSize(8.5);
  doc.setTextColor(20, 20, 20);
  doc.line(135, signY + 34, 185, signY + 34);
  doc.text('( Panitia Penerimaan PPDB )', 135, signY + 38);

  // Save the PDF
  const filename = `Bukti-PPDB-ZumrotulHuda-${record.id}.pdf`;
  doc.save(filename);
}

export function generateSummaryReportPdf(records: RegistrationRecord[], filterLabel = 'Semua Program'): void {
  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const primaryGreen = [19, 114, 53] as const;

  // Header
  doc.setFillColor(...primaryGreen);
  doc.rect(10, 10, pageWidth - 20, 20, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.text('REKAPITULASI PENDAFTARAN PPDB YAYASAN PONDOK PESANTREN ZUMROTUL HUDA', pageWidth / 2, 18, { align: 'center' });
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text(`Filter: ${filterLabel} | Total Data: ${records.length} Pendaftar | Dicetak pada: ${new Date().toLocaleString('id-ID')}`, pageWidth / 2, 25, { align: 'center' });

  // Table Headers
  let y = 36;
  doc.setFillColor(235, 243, 236);
  doc.rect(10, y - 4, pageWidth - 20, 8, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(...primaryGreen);

  doc.text('No', 12, y);
  doc.text('No. Registrasi', 20, y);
  doc.text('Program', 48, y);
  doc.text('Nama Lengkap', 78, y);
  doc.text('L/P', 130, y);
  doc.text('Wali Santri', 140, y);
  doc.text('No. WhatsApp', 180, y);
  doc.text('Status Berkas', 215, y);
  doc.text('Biaya / Bayar', 245, y);

  doc.setDrawColor(200, 200, 200);
  doc.setLineWidth(0.2);
  doc.line(10, y + 4, pageWidth - 10, y + 4);

  y += 9;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(40, 40, 40);

  records.forEach((r, idx) => {
    if (y > 185) {
      doc.addPage();
      y = 20;
    }

    if (idx % 2 === 1) {
      doc.setFillColor(248, 250, 248);
      doc.rect(10, y - 3.5, pageWidth - 20, 6.5, 'F');
    }

    doc.text(String(idx + 1), 12, y);
    doc.text(r.id, 20, y);
    doc.text(r.program, 48, y);
    doc.text(r.studentName.slice(0, 28), 78, y);
    doc.text(r.gender, 130, y);
    doc.text((r.fatherName || r.motherName || '-').slice(0, 20), 140, y);
    doc.text(r.guardianPhone || '-', 180, y);
    doc.text(r.verificationStatus, 215, y);
    
    const feeText = r.program === 'PAUD' ? 'GRATIS' : `${formatRupiah(r.paidAmount)} / ${formatRupiah(r.totalFee)}`;
    doc.text(feeText, 245, y);

    y += 6.5;
  });

  doc.save(`Laporan-PPDB-ZumrotulHuda-${Date.now()}.pdf`);
}
