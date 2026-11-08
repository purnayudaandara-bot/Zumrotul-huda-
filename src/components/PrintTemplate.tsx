import React from 'react';
import { RegistrationRecord, formatRupiah, ADMIN_WHATSAPP_NUMBER } from '../utils/ppdbLogic';

interface PrintTemplateProps {
  record: RegistrationRecord | null;
}

export const PrintTemplate: React.FC<PrintTemplateProps> = ({ record }) => {
  if (!record) return null;

  const regDate = new Date(record.createdAt).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return (
    <div id="printable-registration-card" className="print-only hidden font-serif bg-white text-black p-8 max-w-4xl mx-auto">
      {/* Official Kop Surat */}
      <div className="flex items-center justify-between pb-3 border-b-4 border-double border-emerald-900 mb-6">
        <img
          src="/assets/aistudio/20260523_081213_224076f2.jpg"
          alt="Logo Yayasan Zumrotul Huda"
          className="w-24 h-24 object-contain shrink-0"
        />
        <div className="text-center flex-1 px-4">
          <h1 className="text-xl font-bold uppercase tracking-wider text-emerald-950">
            YAYASAN PONDOK PESANTREN ZUMROTUL HUDA
          </h1>
          <h2 className="text-base font-bold text-gray-900 mt-0.5">
            {record.program === 'PAUD'
              ? 'PAUD ZUMROTUL HUDA DEPOK'
              : 'PONDOK PESANTREN TAHFIDZ & DINIYAH ZUMROTUL HUDA'}
          </h2>
          <p className="text-xs text-gray-700 mt-1 leading-tight">
            Jl. Cagar Alam Selatan Gg. Balong Sari II, RT 02/RW 07, Kec. Pancoran Mas, Kota Depok, Jawa Barat<br />
            Layanan WhatsApp Panitia PPDB: <strong>{ADMIN_WHATSAPP_NUMBER}</strong> | Email/Pusat: zumrotulhuda.depok@gmail.com
          </p>
        </div>
        <div className="w-24 h-24 flex flex-col items-center justify-center border border-gray-400 rounded p-1 text-[10px] text-center shrink-0">
          <span className="font-bold text-emerald-900">VERIFIKASI RESMI</span>
          <span className="font-mono text-xs font-bold mt-1 text-gray-900">{record.id.slice(-7)}</span>
          <span className="text-[9px] text-gray-500 mt-1">PPDB 2026/2027</span>
        </div>
      </div>

      {/* Title */}
      <div className="text-center mb-6">
        <h3 className="text-base font-bold uppercase underline tracking-wide">
          BUKTI PENDAFTARAN RESMI PESERTA DIDIK / SANTRI BARU
        </h3>
        <p className="text-xs text-gray-600 mt-0.5">
          Tahun Ajaran 2026/2027
        </p>
      </div>

      {/* Registration Badge Info */}
      <div className="flex justify-between items-center bg-gray-50 p-3 rounded border border-gray-300 text-xs mb-5">
        <div>
          <span>Nomor Registrasi: </span>
          <strong className="text-sm font-mono text-emerald-900">{record.id}</strong>
        </div>
        <div>
          <span>Tanggal Pendaftaran: </span>
          <strong>{regDate}</strong>
        </div>
        <div>
          <span>Program: </span>
          <strong className="text-emerald-800">
            {record.program === 'PAUD' ? 'PAUD (Promo Bebas Biaya)' : record.program === 'PONTREN_PUTRA' ? 'Santri Putra' : 'Santriwati Putri'}
          </strong>
        </div>
      </div>

      {/* A. Biodata Calon */}
      <div className="mb-4">
        <h4 className="font-bold text-xs uppercase bg-gray-200 px-2 py-1 mb-2 border-l-4 border-emerald-800">
          A. BIODATA CALON PESERTA DIDIK / SANTRI
        </h4>
        <table className="w-full text-xs border-collapse">
          <tbody>
            <tr className="border-b border-gray-100">
              <td className="w-44 py-1.5 font-semibold text-gray-700">Nama Lengkap</td>
              <td className="w-4">:</td>
              <td className="py-1.5 font-bold uppercase">{record.studentName}</td>
            </tr>
            {record.nickname && (
              <tr className="border-b border-gray-100">
                <td className="py-1.5 font-semibold text-gray-700">Nama Panggilan</td>
                <td>:</td>
                <td className="py-1.5">{record.nickname}</td>
              </tr>
            )}
            <tr className="border-b border-gray-100">
              <td className="py-1.5 font-semibold text-gray-700">NIK (Nomor Induk Kependudukan)</td>
              <td>:</td>
              <td className="py-1.5 font-mono">{record.nik}</td>
            </tr>
            {record.nisn && (
              <tr className="border-b border-gray-100">
                <td className="py-1.5 font-semibold text-gray-700">NISN</td>
                <td>:</td>
                <td className="py-1.5 font-mono">{record.nisn}</td>
              </tr>
            )}
            <tr className="border-b border-gray-100">
              <td className="py-1.5 font-semibold text-gray-700">Jenis Kelamin</td>
              <td>:</td>
              <td className="py-1.5">{record.gender === 'L' ? 'Laki-laki' : 'Perempuan'}</td>
            </tr>
            <tr className="border-b border-gray-100">
              <td className="py-1.5 font-semibold text-gray-700">Tempat, Tanggal Lahir</td>
              <td>:</td>
              <td className="py-1.5">{record.birthPlace}, {record.birthDate} {record.ageYears ? `(${record.ageYears} Tahun)` : ''}</td>
            </tr>
            {record.childNumber && (
              <tr className="border-b border-gray-100">
                <td className="py-1.5 font-semibold text-gray-700">Anak Ke- / Jumlah Saudara</td>
                <td>:</td>
                <td className="py-1.5">Anak ke-{record.childNumber} dari {record.totalSiblings || '-'} bersaudara</td>
              </tr>
            )}
            {record.previousSchool && (
              <tr className="border-b border-gray-100">
                <td className="py-1.5 font-semibold text-gray-700">Asal Sekolah Sebelumnya</td>
                <td>:</td>
                <td className="py-1.5">{record.previousSchool}</td>
              </tr>
            )}
            {record.roomChoice && (
              <tr className="border-b border-gray-100">
                <td className="py-1.5 font-semibold text-gray-700">Pilihan Fasilitas Asrama</td>
                <td>:</td>
                <td className="py-1.5">{record.roomChoice}</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* B. Data Orang Tua */}
      <div className="mb-4">
        <h4 className="font-bold text-xs uppercase bg-gray-200 px-2 py-1 mb-2 border-l-4 border-emerald-800">
          B. DATA ORANG TUA / WALI SANTRI
        </h4>
        <table className="w-full text-xs border-collapse">
          <tbody>
            <tr className="border-b border-gray-100">
              <td className="w-44 py-1.5 font-semibold text-gray-700">Nama Ayah Kandung</td>
              <td className="w-4">:</td>
              <td className="py-1.5">{record.fatherName} {record.fatherJob ? `(${record.fatherJob})` : ''}</td>
            </tr>
            <tr className="border-b border-gray-100">
              <td className="py-1.5 font-semibold text-gray-700">Nama Ibu Kandung</td>
              <td>:</td>
              <td className="py-1.5">{record.motherName} {record.motherJob ? `(${record.motherJob})` : ''}</td>
            </tr>
            <tr className="border-b border-gray-100">
              <td className="py-1.5 font-semibold text-gray-700">Nomor WhatsApp / HP Wali</td>
              <td>:</td>
              <td className="py-1.5 font-mono">{record.guardianPhone}</td>
            </tr>
            <tr className="border-b border-gray-100">
              <td className="py-1.5 font-semibold text-gray-700">Alamat Lengkap</td>
              <td>:</td>
              <td className="py-1.5">{record.parentAddress}, Kec. {record.district || '-'}, {record.city || '-'}</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* C. Berkas & Biaya */}
      <div className="mb-6">
        <h4 className="font-bold text-xs uppercase bg-gray-200 px-2 py-1 mb-2 border-l-4 border-emerald-800">
          C. STATUS ADMINISTRASI & PEMBIAYAAN
        </h4>
        <table className="w-full text-xs border-collapse">
          <tbody>
            <tr className="border-b border-gray-100">
              <td className="w-44 py-1.5 font-semibold text-gray-700">Status Verifikasi Berkas</td>
              <td className="w-4">:</td>
              <td className="py-1.5 font-bold">
                {record.verificationStatus === 'DITERIMA' ? 'DITERIMA (BERKAS VALID)' : record.verificationStatus}
              </td>
            </tr>
            {record.googleDriveUrl && (
              <tr className="border-b border-gray-100">
                <td className="py-1.5 font-semibold text-gray-700">Google Drive Folder</td>
                <td>:</td>
                <td className="py-1.5 font-mono text-[10px] break-all">{record.googleDriveUrl}</td>
              </tr>
            )}
            <tr className="border-b border-gray-100">
              <td className="py-1.5 font-semibold text-gray-700">Status Biaya Pendidikan</td>
              <td>:</td>
              <td className="py-1.5">
                {record.program === 'PAUD' ? (
                  <strong className="text-emerald-800">GRATIS UANG PANGKAL & GRATIS SPP (Program Promosi PPDB 2026/2027)</strong>
                ) : (
                  <span>
                    Total: {formatRupiah(record.totalFee)} | Terbayar: {formatRupiah(record.paidAmount)} | Status: {record.paymentStatus}
                  </span>
                )}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Signatures & Stamps */}
      <div className="pt-4 flex justify-between items-end text-xs">
        <div className="text-center w-60">
          <p>Depok, {regDate}</p>
          <p className="mt-1">Orang Tua / Wali Santri,</p>
          <div className="h-20"></div>
          <p className="font-bold border-t border-black pt-1">
            ( {record.fatherName || record.motherName || 'Wali Santri'} )
          </p>
        </div>

        <div className="text-center w-64 border border-dashed border-emerald-800 p-2 rounded">
          <p className="text-[10px] font-bold text-emerald-900">PANITIA PPDB ZUMROTUL HUDA</p>
          <p className="text-[9px] text-gray-600">Terdaftar Digital & Terverifikasi</p>
          <div className="my-2 py-1 bg-emerald-50 text-emerald-900 font-mono font-bold text-[11px]">
            WA: {ADMIN_WHATSAPP_NUMBER}
          </div>
          <p className="text-[9px] text-gray-500">Pondok Pesantren Zumrotul Huda Depok</p>
        </div>

        <div className="text-center w-60">
          <p>Mengetahui,</p>
          <p className="mt-1">Ketua Panitia PPDB 2026/2027,</p>
          <div className="h-20"></div>
          <p className="font-bold border-t border-black pt-1">
            ( Ustadz / Ustadzah Panitia )
          </p>
        </div>
      </div>
    </div>
  );
};
