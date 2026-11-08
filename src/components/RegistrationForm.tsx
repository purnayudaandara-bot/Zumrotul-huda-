import React, { useState } from 'react';
import { 
  GraduationCap, 
  Baby, 
  User, 
  Users, 
  Upload, 
  Link as LinkIcon, 
  CheckCircle2, 
  Sparkles, 
  ShieldCheck, 
  HelpCircle,
  FileText,
  AlertCircle
} from 'lucide-react';
import { 
  ProgramType, 
  RegistrationRecord, 
  DocumentUpload, 
  generateRegistrationCode 
} from '../utils/ppdbLogic';
import { storageService } from '../services/storageService';
import confetti from 'canvas-confetti';

interface RegistrationFormProps {
  onSuccess: (record: RegistrationRecord) => void;
  onOpenFlyers: () => void;
}

export const RegistrationForm: React.FC<RegistrationFormProps> = ({ onSuccess, onOpenFlyers }) => {
  // Form State
  const [program, setProgram] = useState<ProgramType>('PAUD');
  
  // Student Data
  const [studentName, setStudentName] = useState('');
  const [nickname, setNickname] = useState('');
  const [nik, setNik] = useState('');
  const [nisn, setNisn] = useState('');
  const [gender, setGender] = useState<'L' | 'P'>('L');
  const [birthPlace, setBirthPlace] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [childNumber, setChildNumber] = useState<number | ''>('');
  const [totalSiblings, setTotalSiblings] = useState<number | ''>('');
  const [hobbies, setHobbies] = useState('');
  const [healthNotes, setHealthNotes] = useState('');

  // Pondok Pesantren specific
  const [previousSchool, setPreviousSchool] = useState('');
  const [memorizationJuz, setMemorizationJuz] = useState<number | ''>('');
  const [roomChoice, setRoomChoice] = useState<'Asrama Penuh' | 'Non-Asrama / Kalong'>('Asrama Penuh');

  // Parents / Guardian
  const [fatherName, setFatherName] = useState('');
  const [fatherJob, setFatherJob] = useState('');
  const [motherName, setMotherName] = useState('');
  const [motherJob, setMotherJob] = useState('');
  const [guardianPhone, setGuardianPhone] = useState('');
  const [parentAddress, setParentAddress] = useState('');
  const [district, setDistrict] = useState('Pancoran Mas');
  const [city, setCity] = useState('Kota Depok');

  // Documents & Google Drive
  const [googleDriveUrl, setGoogleDriveUrl] = useState('');
  const [uploadedFiles, setUploadedFiles] = useState<{ [key: string]: { name: string; url: string } }>({});
  const [declarationChecked, setDeclarationChecked] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Handle local file selection
  const handleFileChange = (type: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert('Ukuran file maksimal 5MB');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setUploadedFiles(prev => ({
          ...prev,
          [type]: {
            name: file.name,
            url: reader.result as string,
          }
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  // Calculate age based on birthDate
  const calculateAge = (bDateStr: string): number | undefined => {
    if (!bDateStr) return undefined;
    const birth = new Date(bDateStr);
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age >= 0 ? age : undefined;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    // Form Validations
    if (!studentName.trim()) {
      setErrorMsg('Nama lengkap calon siswa/santri wajib diisi.');
      return;
    }
    if (!nik.trim() || nik.length < 10) {
      setErrorMsg('Harap masukkan NIK yang valid (minimal 10-16 digit).');
      return;
    }
    if (!birthPlace.trim() || !birthDate) {
      setErrorMsg('Tempat dan tanggal lahir wajib diisi.');
      return;
    }
    if (!fatherName.trim() && !motherName.trim()) {
      setErrorMsg('Nama Ayah atau Nama Ibu wajib diisi.');
      return;
    }
    if (!guardianPhone.trim() || guardianPhone.length < 9) {
      setErrorMsg('Nomor WhatsApp wali santri aktif wajib diisi.');
      return;
    }
    if (!parentAddress.trim()) {
      setErrorMsg('Alamat lengkap tempat tinggal wajib diisi.');
      return;
    }
    if (!declarationChecked) {
      setErrorMsg('Harap setujui pernyataan kebenaran data sebelum mengirim.');
      return;
    }

    setIsSubmitting(true);

    try {
      const records = storageService.getRecords();
      const newId = generateRegistrationCode(program, records.length, 2026);

      const docsArray: DocumentUpload[] = [];
      if (uploadedFiles['akta']) {
        docsArray.push({
          name: 'Akta Kelahiran',
          type: 'akta',
          fileName: uploadedFiles['akta'].name,
          fileUrl: uploadedFiles['akta'].url,
          uploadDate: new Date().toISOString().split('T')[0],
        });
      }
      if (uploadedFiles['kk']) {
        docsArray.push({
          name: 'Kartu Keluarga',
          type: 'kk',
          fileName: uploadedFiles['kk'].name,
          fileUrl: uploadedFiles['kk'].url,
          uploadDate: new Date().toISOString().split('T')[0],
        });
      }
      if (uploadedFiles['foto']) {
        docsArray.push({
          name: 'Pas Foto 3x4',
          type: 'foto',
          fileName: uploadedFiles['foto'].name,
          fileUrl: uploadedFiles['foto'].url,
          uploadDate: new Date().toISOString().split('T')[0],
        });
      }
      if (uploadedFiles['ijazah']) {
        docsArray.push({
          name: 'Ijazah / Rapor',
          type: 'ijazah',
          fileName: uploadedFiles['ijazah'].name,
          fileUrl: uploadedFiles['ijazah'].url,
          uploadDate: new Date().toISOString().split('T')[0],
        });
      }

      const calculatedAge = calculateAge(birthDate);

      const newRecord: RegistrationRecord = {
        id: newId,
        createdAt: new Date().toISOString(),
        program,
        studentName: studentName.trim(),
        nickname: nickname.trim(),
        nik: nik.trim(),
        nisn: nisn.trim() || undefined,
        gender,
        birthPlace: birthPlace.trim(),
        birthDate,
        ageYears: calculatedAge,
        childNumber: typeof childNumber === 'number' ? childNumber : undefined,
        totalSiblings: typeof totalSiblings === 'number' ? totalSiblings : undefined,
        hobbies: hobbies.trim() || undefined,
        healthNotes: healthNotes.trim() || undefined,
        previousSchool: previousSchool.trim() || undefined,
        memorizationJuz: typeof memorizationJuz === 'number' ? memorizationJuz : undefined,
        roomChoice: program !== 'PAUD' ? roomChoice : undefined,
        fatherName: fatherName.trim(),
        fatherJob: fatherJob.trim() || undefined,
        motherName: motherName.trim(),
        motherJob: motherJob.trim() || undefined,
        guardianPhone: guardianPhone.trim(),
        parentAddress: parentAddress.trim(),
        district: district.trim() || undefined,
        city: city.trim() || undefined,
        googleDriveUrl: googleDriveUrl.trim() || undefined,
        documents: docsArray,
        verificationStatus: 'MENUNGGU_VERIFIKASI',
        paymentStatus: program === 'PAUD' ? 'GRATIS' : 'BELUM_LUNAS',
        totalFee: program === 'PAUD' ? 0 : 1850000,
        paidAmount: 0,
        paymentDueDate: program === 'PAUD' ? undefined : '2026-11-20',
        paymentNotes: program === 'PAUD' 
          ? 'Promo PPDB PAUD: GRATIS Uang Pangkal & GRATIS SPP' 
          : 'Termasuk paket seragam, modul/kitab, dan orientasi santri baru',
      };

      // Save to centralized database
      storageService.addRecord(newRecord);

      // Trigger Confetti
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#10b981', '#fbbf24', '#3b82f6', '#059669'],
        });
      } catch (err) {
        // Safe fallback if canvas is not ready
      }

      onSuccess(newRecord);
    } catch (err) {
      console.error(err);
      setErrorMsg('Terjadi kesalahan saat memproses pendaftaran. Silakan coba lagi.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-6 px-4 sm:px-6">
      {/* Hero Welcome Card with Official Logo & Promotion */}
      <div className="bg-gradient-to-br from-emerald-900 via-emerald-800 to-teal-900 rounded-2xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden mb-8 border border-emerald-700/50">
        <div className="absolute -right-8 -bottom-8 opacity-15 pointer-events-none w-64 h-64">
          <img 
            src="/assets/aistudio/20260523_081213_224076f2.jpg" 
            alt="Watermark" 
            className="w-full h-full object-contain filter invert"
          />
        </div>

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <img
              src="/assets/aistudio/20260523_081213_224076f2.jpg"
              alt="Logo Zumrotul Huda"
              className="w-16 h-16 sm:w-20 sm:h-20 object-contain rounded-2xl bg-white/10 p-1.5 shadow-md backdrop-blur-sm border border-white/20 shrink-0"
            />
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-700/80 text-amber-300 border border-emerald-500/40 mb-2">
                <Sparkles className="w-3.5 h-3.5" />
                Penerimaan Peserta Didik & Santri Baru T.A. 2026/2027
              </div>
              <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
                Formulir Pendaftaran Digital
              </h2>
              <p className="text-emerald-100 text-sm mt-1 max-w-xl leading-relaxed">
                Yayasan Pondok Pesantren Zumrotul Huda Depok. Pengisian mudah, cetak tanda terima langsung, berkas aman di Google Drive, dan konfirmasi WhatsApp otomatis ke admin.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onOpenFlyers}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-emerald-950 font-bold text-xs sm:text-sm shadow-lg shadow-amber-400/20 transition-all hover:scale-102 shrink-0"
          >
            <Sparkles className="w-4 h-4" />
            Lihat Brosur & Promo PPDB
          </button>
        </div>
      </div>

      {/* Program Selection Cards */}
      <div className="mb-8">
        <label className="block text-sm font-bold text-gray-800 mb-3">
          1. PILIH PROGRAM PENDAFTARAN <span className="text-red-500">*</span>
        </label>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Option PAUD */}
          <div
            onClick={() => setProgram('PAUD')}
            className={`cursor-pointer rounded-xl p-5 border-2 transition-all relative ${
              program === 'PAUD'
                ? 'border-emerald-600 bg-emerald-50/70 shadow-md ring-2 ring-emerald-500/30'
                : 'border-gray-200 bg-white hover:border-emerald-300'
            }`}
          >
            {program === 'PAUD' && (
              <span className="absolute top-3 right-3 text-emerald-600">
                <CheckCircle2 className="w-5 h-5 fill-emerald-600 text-white" />
              </span>
            )}
            <div className="w-10 h-10 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center mb-3">
              <Baby className="w-6 h-6" />
            </div>
            <div className="inline-block px-2 py-0.5 rounded text-[10px] font-extrabold uppercase bg-amber-400 text-emerald-950 mb-1">
              PROMO SPESIAL
            </div>
            <h3 className="font-extrabold text-base text-gray-900">PAUD Zumrotul Huda</h3>
            <p className="text-xs text-emerald-800 font-bold mt-1">
              GRATIS Uang Pangkal & GRATIS SPP!
            </p>
            <p className="text-xs text-gray-600 mt-1 leading-relaxed">
              Usia min 3 tahun. Belajar sambil bermain, bernuansa Islami, lingkungan nyaman & aman.
            </p>
          </div>

          {/* Option Santri Putra */}
          <div
            onClick={() => {
              setProgram('PONTREN_PUTRA');
              setGender('L');
            }}
            className={`cursor-pointer rounded-xl p-5 border-2 transition-all relative ${
              program === 'PONTREN_PUTRA'
                ? 'border-emerald-600 bg-emerald-50/70 shadow-md ring-2 ring-emerald-500/30'
                : 'border-gray-200 bg-white hover:border-emerald-300'
            }`}
          >
            {program === 'PONTREN_PUTRA' && (
              <span className="absolute top-3 right-3 text-emerald-600">
                <CheckCircle2 className="w-5 h-5 fill-emerald-600 text-white" />
              </span>
            )}
            <div className="w-10 h-10 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center mb-3">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div className="inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-blue-100 text-blue-800 mb-1">
              SANTRI PUTRA
            </div>
            <h3 className="font-extrabold text-base text-gray-900">Pondok Pesantren Putra</h3>
            <p className="text-xs text-gray-600 mt-1 leading-relaxed">
              Pendidikan Tahfidzul Qur'an & Pengajian Kitab Kuning. Asrama putra dengan bimbingan ustadz.
            </p>
          </div>

          {/* Option Santri Putri */}
          <div
            onClick={() => {
              setProgram('PONTREN_PUTRI');
              setGender('P');
            }}
            className={`cursor-pointer rounded-xl p-5 border-2 transition-all relative ${
              program === 'PONTREN_PUTRI'
                ? 'border-emerald-600 bg-emerald-50/70 shadow-md ring-2 ring-emerald-500/30'
                : 'border-gray-200 bg-white hover:border-emerald-300'
            }`}
          >
            {program === 'PONTREN_PUTRI' && (
              <span className="absolute top-3 right-3 text-emerald-600">
                <CheckCircle2 className="w-5 h-5 fill-emerald-600 text-white" />
              </span>
            )}
            <div className="w-10 h-10 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center mb-3">
              <Users className="w-6 h-6" />
            </div>
            <div className="inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-purple-100 text-purple-800 mb-1">
              SANTRIWATI PUTRI
            </div>
            <h3 className="font-extrabold text-base text-gray-900">Pondok Pesantren Putri</h3>
            <p className="text-xs text-gray-600 mt-1 leading-relaxed">
              Program Tahfidz & Kepribadian Muslimah. Asrama putri terpisah dengan pengawasan ustadzah.
            </p>
          </div>
        </div>
      </div>

      {/* Main Form Body */}
      <form onSubmit={handleSubmit} className="space-y-8 bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-gray-200">
        {/* Section 2: Student Identity */}
        <div>
          <div className="flex items-center gap-2 pb-3 mb-5 border-b border-gray-200">
            <User className="w-5 h-5 text-emerald-700" />
            <h3 className="text-lg font-bold text-gray-900">
              2. Data Calon {program === 'PAUD' ? 'Siswa PAUD' : 'Santri / Santriwati'}
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1.5">
                Nama Lengkap Sesuai Akta / KK <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={studentName}
                onChange={(e) => setStudentName(e.target.value)}
                placeholder="Contoh: Muhammad Rizky Alfatih"
                className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1.5">
                Nama Panggilan
              </label>
              <input
                type="text"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                placeholder="Contoh: Rizky"
                className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1.5">
                Jenis Kelamin <span className="text-red-500">*</span>
              </label>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value as 'L' | 'P')}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm"
              >
                <option value="L">Laki-laki</option>
                <option value="P">Perempuan</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1.5">
                NIK Calon Siswa (16 Digit) <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                maxLength={16}
                value={nik}
                onChange={(e) => setNik(e.target.value.replace(/[^0-9]/g, ''))}
                placeholder="327601xxxxxxxxxx"
                className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1.5">
                NISN (Opsional jika sudah ada)
              </label>
              <input
                type="text"
                value={nisn}
                onChange={(e) => setNisn(e.target.value)}
                placeholder="Nomor Induk Siswa Nasional"
                className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1.5">
                Tempat Lahir <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={birthPlace}
                onChange={(e) => setBirthPlace(e.target.value)}
                placeholder="Contoh: Depok / Jakarta / Bogor"
                className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1.5">
                Tanggal Lahir <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                required
                value={birthDate}
                onChange={(e) => setBirthDate(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm"
              />
              {birthDate && (
                <p className="text-xs text-emerald-700 mt-1 font-semibold">
                  Usia perkiraan: {calculateAge(birthDate)} Tahun
                  {program === 'PAUD' && (calculateAge(birthDate) || 0) < 3 && (
                    <span className="text-amber-600 block">
                      ⚠️ Catatan: Syarat minimal usia PAUD adalah 3 tahun saat mulai ajaran.
                    </span>
                  )}
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1.5">
                Anak Ke-
              </label>
              <input
                type="number"
                min={1}
                max={20}
                value={childNumber}
                onChange={(e) => setChildNumber(e.target.value ? parseInt(e.target.value) : '')}
                placeholder="Contoh: 1"
                className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1.5">
                Dari Berapa Bersaudara
              </label>
              <input
                type="number"
                min={1}
                max={20}
                value={totalSiblings}
                onChange={(e) => setTotalSiblings(e.target.value ? parseInt(e.target.value) : '')}
                placeholder="Contoh: 3"
                className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm"
              />
            </div>

            {/* Pondok Pesantren specific fields */}
            {program !== 'PAUD' && (
              <>
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1.5">
                    Asal Sekolah Sebelumnya
                  </label>
                  <input
                    type="text"
                    value={previousSchool}
                    onChange={(e) => setPreviousSchool(e.target.value)}
                    placeholder="Contoh: SDIT / MI Nurul Falah / SDN 1"
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1.5">
                    Hafalan Al-Qur'an (Juz yang sudah dihafal)
                  </label>
                  <input
                    type="number"
                    min={0}
                    max={30}
                    value={memorizationJuz}
                    onChange={(e) => setMemorizationJuz(e.target.value ? parseInt(e.target.value) : '')}
                    placeholder="Contoh: 1 (Juz 30) atau 0 jika belum"
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1.5">
                    Pilihan Fasilitas Asrama
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <label className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer ${
                      roomChoice === 'Asrama Penuh' ? 'border-emerald-600 bg-emerald-50/50' : 'border-gray-200'
                    }`}>
                      <input
                        type="radio"
                        name="roomChoice"
                        value="Asrama Penuh"
                        checked={roomChoice === 'Asrama Penuh'}
                        onChange={() => setRoomChoice('Asrama Penuh')}
                        className="text-emerald-600 focus:ring-emerald-500"
                      />
                      <div>
                        <span className="text-sm font-bold text-gray-900 block">Asrama Penuh (Mukim)</span>
                        <span className="text-xs text-gray-500">Tinggal di pondok pesantren 24 jam dengan konsumsi & kajian rutin</span>
                      </div>
                    </label>

                    <label className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer ${
                      roomChoice === 'Non-Asrama / Kalong' ? 'border-emerald-600 bg-emerald-50/50' : 'border-gray-200'
                    }`}>
                      <input
                        type="radio"
                        name="roomChoice"
                        value="Non-Asrama / Kalong"
                        checked={roomChoice === 'Non-Asrama / Kalong'}
                        onChange={() => setRoomChoice('Non-Asrama / Kalong')}
                        className="text-emerald-600 focus:ring-emerald-500"
                      />
                      <div>
                        <span className="text-sm font-bold text-gray-900 block">Non-Asrama (Santri Kalong)</span>
                        <span className="text-xs text-gray-500">Pulang pergi untuk warga sekitar Cagar Alam & Depok</span>
                      </div>
                    </label>
                  </div>
                </div>
              </>
            )}

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1.5">
                Hobi / Minat Khusus
              </label>
              <input
                type="text"
                value={hobbies}
                onChange={(e) => setHobbies(e.target.value)}
                placeholder="Contoh: Menggambar, Hadroh, Membaca"
                className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1.5">
                Catatan Kesehatan / Alergi
              </label>
              <input
                type="text"
                value={healthNotes}
                onChange={(e) => setHealthNotes(e.target.value)}
                placeholder="Contoh: Alergi seafood / Tidak ada riwayat penyakit"
                className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm"
              />
            </div>
          </div>
        </div>

        {/* Section 3: Parent & Guardian Details */}
        <div>
          <div className="flex items-center gap-2 pb-3 mb-5 border-b border-gray-200">
            <Users className="w-5 h-5 text-emerald-700" />
            <h3 className="text-lg font-bold text-gray-900">
              3. Data Orang Tua / Wali Santri
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1.5">
                Nama Ayah Kandung <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={fatherName}
                onChange={(e) => setFatherName(e.target.value)}
                placeholder="Contoh: Deni Setiawan"
                className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1.5">
                Pekerjaan Ayah
              </label>
              <input
                type="text"
                value={fatherJob}
                onChange={(e) => setFatherJob(e.target.value)}
                placeholder="Contoh: Karyawan Swasta / Wiraswasta / PNS"
                className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1.5">
                Nama Ibu Kandung <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={motherName}
                onChange={(e) => setMotherName(e.target.value)}
                placeholder="Contoh: Nurul Hidayati"
                className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1.5">
                Pekerjaan Ibu
              </label>
              <input
                type="text"
                value={motherJob}
                onChange={(e) => setMotherJob(e.target.value)}
                placeholder="Contoh: Ibu Rumah Tangga / Guru / Pedagang"
                className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1.5">
                Nomor WhatsApp Aktif Wali Santri <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-3 text-sm font-semibold text-gray-500">
                  🇮🇩 +62 / 0
                </span>
                <input
                  type="tel"
                  required
                  value={guardianPhone}
                  onChange={(e) => setGuardianPhone(e.target.value)}
                  placeholder="81288992211 atau 081288992211"
                  className="w-full pl-22 pr-4 py-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm font-medium"
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Penting: Nomor ini digunakan untuk pengiriman konfirmasi pendaftaran otomatis dan informasi jadwal.
              </p>
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1.5">
                Alamat Lengkap Tempat Tinggal <span className="text-red-500">*</span>
              </label>
              <textarea
                required
                rows={2}
                value={parentAddress}
                onChange={(e) => setParentAddress(e.target.value)}
                placeholder="Nama Jalan, No. Rumah, RT/RW, Kelurahan (Contoh: Jl. Cagar Alam Selatan Gg. Balong Sari II RT 02/RW 07)"
                className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1.5">
                Kecamatan
              </label>
              <input
                type="text"
                value={district}
                onChange={(e) => setDistrict(e.target.value)}
                placeholder="Contoh: Pancoran Mas / Beji / Sukmajaya"
                className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1.5">
                Kota / Kabupaten
              </label>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="Contoh: Kota Depok"
                className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm"
              />
            </div>
          </div>
        </div>

        {/* Section 4: Document Verification & Google Drive Integration */}
        <div>
          <div className="flex items-center gap-2 pb-3 mb-5 border-b border-gray-200">
            <Upload className="w-5 h-5 text-emerald-700" />
            <div className="flex-1">
              <h3 className="text-lg font-bold text-gray-900">
                4. Berkas Persyaratan & Integrasi Google Drive
              </h3>
              <p className="text-xs text-gray-500">
                Sesuai syarat brosur PPDB Zumrotul Huda: Akta Kelahiran, KK, Pas Foto 3x4 berwarna.
              </p>
            </div>
          </div>

          {/* Google Drive Integration Highlight Box */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-4 sm:p-5 mb-6">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-white shadow-sm border border-blue-100 text-blue-600 shrink-0">
                <LinkIcon className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <h4 className="font-bold text-sm text-blue-900 flex items-center gap-2">
                  Tautan Berkas Google Drive (Penyimpanan Terpusat & Rapi)
                  <span className="text-[10px] bg-blue-200 text-blue-900 px-2 py-0.5 rounded font-bold uppercase">
                    Rekomendasi
                  </span>
                </h4>
                <p className="text-xs text-blue-800/80 mt-1">
                  Anda dapat mengunggah berkas scan (Akta, KK, Foto) ke Google Drive Anda, lalu masukkan link folder atau filenya di sini agar panitia dapat memverifikasi secara langsung dan aman.
                </p>

                <div className="mt-3">
                  <input
                    type="url"
                    value={googleDriveUrl}
                    onChange={(e) => setGoogleDriveUrl(e.target.value)}
                    placeholder="https://drive.google.com/drive/folders/... atau link file dokumen"
                    className="w-full px-3.5 py-2.5 rounded-lg border border-blue-300 focus:ring-2 focus:ring-blue-500 bg-white text-sm"
                  />
                  <div className="flex items-center gap-1.5 text-[11px] text-blue-700 mt-1.5">
                    <HelpCircle className="w-3.5 h-3.5" />
                    <span>Pastikan hak akses link Google Drive disetel ke <strong>"Siapa saja yang memiliki tautan (Anyone with link)"</strong>.</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Local Upload alternative */}
          <div className="space-y-3">
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide">
              Atau Unggah Berkas Langsung dari Perangkat (Format JPG/PNG/PDF, Maks 5MB):
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Akta */}
              <div className="p-3 border border-gray-200 rounded-xl bg-gray-50 hover:bg-white transition-colors">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold text-gray-800">1. Akta Kelahiran</span>
                  {uploadedFiles['akta'] && (
                    <span className="text-emerald-600 text-xs font-semibold flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Terunggah
                    </span>
                  )}
                </div>
                <input
                  type="file"
                  accept="image/*,application/pdf"
                  onChange={(e) => handleFileChange('akta', e)}
                  className="text-xs text-gray-500 file:mr-2 file:py-1 file:px-2.5 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100 cursor-pointer w-full"
                />
                {uploadedFiles['akta'] && (
                  <p className="text-[11px] text-gray-600 truncate mt-1">
                    {uploadedFiles['akta'].name}
                  </p>
                )}
              </div>

              {/* KK */}
              <div className="p-3 border border-gray-200 rounded-xl bg-gray-50 hover:bg-white transition-colors">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold text-gray-800">2. Kartu Keluarga (KK)</span>
                  {uploadedFiles['kk'] && (
                    <span className="text-emerald-600 text-xs font-semibold flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Terunggah
                    </span>
                  )}
                </div>
                <input
                  type="file"
                  accept="image/*,application/pdf"
                  onChange={(e) => handleFileChange('kk', e)}
                  className="text-xs text-gray-500 file:mr-2 file:py-1 file:px-2.5 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100 cursor-pointer w-full"
                />
                {uploadedFiles['kk'] && (
                  <p className="text-[11px] text-gray-600 truncate mt-1">
                    {uploadedFiles['kk'].name}
                  </p>
                )}
              </div>

              {/* Pas Foto 3x4 */}
              <div className="p-3 border border-gray-200 rounded-xl bg-gray-50 hover:bg-white transition-colors">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold text-gray-800">3. Pas Foto 3x4</span>
                  {uploadedFiles['foto'] && (
                    <span className="text-emerald-600 text-xs font-semibold flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Terunggah
                    </span>
                  )}
                </div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileChange('foto', e)}
                  className="text-xs text-gray-500 file:mr-2 file:py-1 file:px-2.5 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100 cursor-pointer w-full"
                />
                {uploadedFiles['foto'] && (
                  <p className="text-[11px] text-gray-600 truncate mt-1">
                    {uploadedFiles['foto'].name}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Declaration Checkbox */}
        <div className="bg-emerald-50/60 border border-emerald-200 rounded-xl p-4">
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              required
              checked={declarationChecked}
              onChange={(e) => setDeclarationChecked(e.target.checked)}
              className="mt-0.5 rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4"
            />
            <span className="text-xs sm:text-sm text-gray-800 leading-snug">
              Saya menyatakan bahwa data yang diisikan di atas adalah <strong>benar dan sesuai dokumen asli</strong>. Saya bersedia mengikuti tata tertib penerimaan dan pembelajaran di lingkungan Yayasan Pondok Pesantren Zumrotul Huda Depok.
            </span>
          </label>
        </div>

        {/* Error message */}
        {errorMsg && (
          <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs sm:text-sm">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Submit Button */}
        <div className="pt-2">
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full flex items-center justify-center gap-3 py-4 px-6 rounded-xl bg-gradient-to-r from-emerald-700 via-emerald-600 to-green-700 hover:from-emerald-800 hover:to-green-800 text-white font-extrabold text-base sm:text-lg shadow-xl shadow-emerald-700/25 transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 cursor-pointer"
          >
            <ShieldCheck className="w-5 h-5 text-amber-300" />
            <span>{isSubmitting ? 'Memproses Pendaftaran...' : 'Kirim Pendaftaran & Generate Bukti PDF'}</span>
          </button>
          <p className="text-center text-xs text-gray-500 mt-2">
            Setelah dikirim, Bukti PDF dapat langsung dicetak atau dikirimkan ke WhatsApp Panitia <strong>089635988413</strong>.
          </p>
        </div>
      </form>
    </div>
  );
};
