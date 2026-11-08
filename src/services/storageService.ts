import { RegistrationRecord } from '../utils/ppdbLogic';
import { INITIAL_SEED_RECORDS } from '../types/ppdb';

const STORAGE_KEY = 'ppdb_zumrotul_huda_records_v1';

export const storageService = {
  getRecords(): RegistrationRecord[] {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_SEED_RECORDS));
        return INITIAL_SEED_RECORDS;
      }
      return JSON.parse(stored);
    } catch (e) {
      console.error('Error reading localStorage, using initial seeds', e);
      return INITIAL_SEED_RECORDS;
    }
  },

  saveRecords(records: RegistrationRecord[]) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
      window.dispatchEvent(new CustomEvent('ppdb_records_updated', { detail: records }));
    } catch (e) {
      console.error('Error saving records to localStorage', e);
    }
  },

  addRecord(record: RegistrationRecord): RegistrationRecord {
    const existing = this.getRecords();
    const updated = [record, ...existing];
    this.saveRecords(updated);
    return record;
  },

  updateRecord(id: string, updates: Partial<RegistrationRecord>): RegistrationRecord | null {
    const existing = this.getRecords();
    const index = existing.findIndex((r) => r.id === id);
    if (index === -1) return null;

    const updatedRecord = { ...existing[index], ...updates };
    existing[index] = updatedRecord;
    this.saveRecords(existing);
    return updatedRecord;
  },

  deleteRecord(id: string): boolean {
    const existing = this.getRecords();
    const filtered = existing.filter((r) => r.id !== id);
    if (filtered.length !== existing.length) {
      this.saveRecords(filtered);
      return true;
    }
    return false;
  },

  getRecordById(id: string): RegistrationRecord | undefined {
    const records = this.getRecords();
    return records.find(
      (r) => r.id.toLowerCase() === id.trim().toLowerCase()
    );
  },

  searchRecords(query: string): RegistrationRecord[] {
    const records = this.getRecords();
    const q = query.toLowerCase().trim();
    if (!q) return records;

    return records.filter(
      (r) =>
        r.id.toLowerCase().includes(q) ||
        r.studentName.toLowerCase().includes(q) ||
        (r.guardianPhone && r.guardianPhone.includes(q)) ||
        (r.fatherName && r.fatherName.toLowerCase().includes(q)) ||
        (r.motherName && r.motherName.toLowerCase().includes(q)) ||
        (r.nik && r.nik.includes(q))
    );
  },

  resetToDefault() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_SEED_RECORDS));
    window.dispatchEvent(new CustomEvent('ppdb_records_updated', { detail: INITIAL_SEED_RECORDS }));
    return INITIAL_SEED_RECORDS;
  },
};
