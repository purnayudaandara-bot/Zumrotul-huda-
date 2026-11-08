import test from 'node:test';
import assert from 'node:assert/strict';
import {
  generateRegistrationCode,
  cleanIndonesianPhone,
  buildSubmissionWhatsAppUrl,
  buildPaymentReminderWhatsAppUrl,
  getPaymentDeadlineInfo,
  calculatePPDBStats,
  type RegistrationRecord,
} from './ppdbLogic';

test('generateRegistrationCode creates expected format for each program', () => {
  assert.equal(generateRegistrationCode('PAUD', 0, 2026), 'ZH-2026-PAUD-001');
  assert.equal(generateRegistrationCode('PONTREN_PUTRA', 14, 2026), 'ZH-2026-SANTRI-PA-015');
  assert.equal(generateRegistrationCode('PONTREN_PUTRI', 99, 2026), 'ZH-2026-SANTRI-PI-100');
});

test('cleanIndonesianPhone normalizes Indonesian numbers to 62 prefix', () => {
  assert.equal(cleanIndonesianPhone('089635988413'), '6289635988413');
  assert.equal(cleanIndonesianPhone('+62 812-9799-2940'), '6281297992940');
  assert.equal(cleanIndonesianPhone('0822-6084-7038'), '6282260847038');
  assert.equal(cleanIndonesianPhone('6289635988413'), '6289635988413');
});

test('buildSubmissionWhatsAppUrl points to designated admin number 089635988413 and contains student info', () => {
  const dummy: RegistrationRecord = {
    id: 'ZH-2026-PAUD-001',
    createdAt: '2026-06-01T10:00:00.000Z',
    program: 'PAUD',
    studentName: 'Muhammad Rizky Alfatih',
    nik: '3276011234560001',
    gender: 'L',
    birthPlace: 'Depok',
    birthDate: '2022-05-15',
    fatherName: 'Ahmad Fauzi',
    motherName: 'Siti Rahma',
    guardianPhone: '081234567890',
    parentAddress: 'Jl. Cagar Alam Selatan RT 02/05 Depok',
    documents: [],
    verificationStatus: 'MENUNGGU_VERIFIKASI',
    paymentStatus: 'GRATIS',
    totalFee: 0,
    paidAmount: 0,
    googleDriveUrl: 'https://drive.google.com/drive/folders/test123',
  };

  const url = buildSubmissionWhatsAppUrl(dummy);
  assert.ok(url.startsWith('https://api.whatsapp.com/send?phone=6289635988413'));
  assert.ok(url.includes('ZH-2026-PAUD-001'));
  assert.ok(url.includes('MUHAMMAD%20RIZKY%20ALFATIH') || url.includes('MUHAMMAD'));
  assert.ok(url.includes('drive.google.com'));
});

test('buildPaymentReminderWhatsAppUrl builds reminder directed to guardian phone', () => {
  const dummy: RegistrationRecord = {
    id: 'ZH-2026-SANTRI-PA-002',
    createdAt: '2026-06-01T10:00:00.000Z',
    program: 'PONTREN_PUTRA',
    studentName: 'Faris Al-Ghifari',
    nik: '3276019876540002',
    gender: 'L',
    birthPlace: 'Bogor',
    birthDate: '2014-08-20',
    fatherName: 'Bambang',
    motherName: 'Nurhaliza',
    guardianPhone: '085712345678',
    parentAddress: 'Depok',
    documents: [],
    verificationStatus: 'TERVERIFIKASI',
    paymentStatus: 'BELUM_LUNAS',
    totalFee: 1500000,
    paidAmount: 500000,
    paymentDueDate: '2026-07-15',
  };

  const url = buildPaymentReminderWhatsAppUrl(dummy, 'Harap konfirmasi sebelum rapat wali santri');
  assert.ok(url.startsWith('https://api.whatsapp.com/send?phone=6285712345678'));
  assert.ok(url.includes('PENGINGAT'));
  assert.ok(url.includes('Faris'));
  assert.ok(url.includes('1.000.000'));
});

test('getPaymentDeadlineInfo handles PAUD free promo and due dates', () => {
  const paudRec: RegistrationRecord = {
    id: 'ZH-2026-PAUD-001',
    createdAt: '2026-06-01',
    program: 'PAUD',
    studentName: 'Alya',
    nik: '123',
    gender: 'P',
    birthPlace: 'Depok',
    birthDate: '2023-01-01',
    fatherName: 'F',
    motherName: 'M',
    guardianPhone: '081',
    parentAddress: 'Depok',
    documents: [],
    verificationStatus: 'DITERIMA',
    paymentStatus: 'GRATIS',
    totalFee: 0,
    paidAmount: 0,
  };

  assert.equal(getPaymentDeadlineInfo(paudRec).status, 'GRATIS');

  const refDate = new Date('2026-07-01T00:00:00');
  
  const pontrenDueSoon: RegistrationRecord = {
    ...paudRec,
    program: 'PONTREN_PUTRA',
    paymentStatus: 'BELUM_LUNAS',
    totalFee: 1000000,
    paidAmount: 0,
    paymentDueDate: '2026-07-03',
  };
  assert.equal(getPaymentDeadlineInfo(pontrenDueSoon, refDate).status, 'SEGERA');

  const pontrenOverdue: RegistrationRecord = {
    ...pontrenDueSoon,
    paymentDueDate: '2026-06-25',
  };
  assert.equal(getPaymentDeadlineInfo(pontrenOverdue, refDate).status, 'TERLAMBAT');
});

test('calculatePPDBStats aggregates registration numbers accurately', () => {
  const list: RegistrationRecord[] = [
    {
      id: 'ZH-1',
      createdAt: '2026-01-01',
      program: 'PAUD',
      studentName: 'A',
      nik: '1',
      gender: 'L',
      birthPlace: 'D',
      birthDate: '2022',
      fatherName: 'F',
      motherName: 'M',
      guardianPhone: '08',
      parentAddress: 'A',
      documents: [],
      verificationStatus: 'TERVERIFIKASI',
      paymentStatus: 'GRATIS',
      totalFee: 0,
      paidAmount: 0,
      googleDriveUrl: 'https://drive.google.com/test',
    },
    {
      id: 'ZH-2',
      createdAt: '2026-01-01',
      program: 'PONTREN_PUTRA',
      studentName: 'B',
      nik: '2',
      gender: 'L',
      birthPlace: 'D',
      birthDate: '2012',
      fatherName: 'F',
      motherName: 'M',
      guardianPhone: '08',
      parentAddress: 'A',
      documents: [],
      verificationStatus: 'MENUNGGU_VERIFIKASI',
      paymentStatus: 'BELUM_LUNAS',
      totalFee: 1500000,
      paidAmount: 500000,
    },
    {
      id: 'ZH-3',
      createdAt: '2026-01-01',
      program: 'PONTREN_PUTRI',
      studentName: 'C',
      nik: '3',
      gender: 'P',
      birthPlace: 'D',
      birthDate: '2013',
      fatherName: 'F',
      motherName: 'M',
      guardianPhone: '08',
      parentAddress: 'A',
      documents: [],
      verificationStatus: 'BERKAS_KURANG',
      paymentStatus: 'LUNAS',
      totalFee: 1500000,
      paidAmount: 1500000,
    },
  ];

  const stats = calculatePPDBStats(list);
  assert.equal(stats.total, 3);
  assert.equal(stats.paudCount, 1);
  assert.equal(stats.pontrenPaCount, 1);
  assert.equal(stats.pontrenPiCount, 1);
  assert.equal(stats.verifiedCount, 1);
  assert.equal(stats.pendingVerificationCount, 1);
  assert.equal(stats.needDocsCount, 1);
  assert.equal(stats.unpaidCount, 1);
  assert.equal(stats.withDriveLinkCount, 1);
});
