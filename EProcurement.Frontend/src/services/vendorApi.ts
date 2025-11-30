import { toast } from 'sonner';
import { VendorRecord } from '../types'; // Pastikan path ini sesuai dengan file types.ts Anda
import { fetchSystemDataApi } from './systemDataApi'; // Import service system data untuk helper

const API_BASE = import.meta.env.VITE_API_BASE_URL;

if (!API_BASE) {
  console.error("VITE_API_BASE_URL is not defined in environment variables!");
}

// --- INTERFACES FOR PAYLOADS ---
// Payload ini harus cocok dengan DTO "VendorUpdateRequest" di Backend C#
export interface UpdateVendorPayload {
  contactPerson: string;
  contactEmail: string;
  contactPhone: string;
  
  rating: number;
  isActive: boolean;
  isPreferred: boolean;
  
  companySize: string;
  yearEstablished: number | null;
  
  siup: string;
  creditLimit: number | null;
  paymentTerms: string;
  notes: string;
  
  updatedBy: string;

  // Arrays of IDs
  subClassificationIds: number[];
  kbliIds: string[]; // Ingat: KBLI ID di backend adalah string
  brandIds: number[];
}

// --- API FUNCTIONS ---

/**
 * Get All Vendors (GET /api/vendor)
 */
export async function fetchVendorsApi(): Promise<VendorRecord[]> {
  try {
    const response = await fetch(`${API_BASE}/vendor`); // Route: [Route("api/[controller]")] -> api/vendor

    if (!response.ok) {
      throw new Error(`Failed to fetch vendors. Status: ${response.status}`);
    }

    const data: VendorRecord[] = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching vendors:', error);
    toast.error('Gagal mengambil data vendor.');
    throw error;
  }
}

/**
 * Sync Vendors from External DB (POST /api/vendor/sync)
 */
export async function syncVendorsApi(): Promise<void> {
  try {
    const response = await fetch(`${API_BASE}/vendor/sync`, {
      method: 'POST',
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Synchronization failed');
    }

    // Sukses, tidak perlu return data body jika hanya status ok
  } catch (error) {
    console.error('Error syncing vendors:', error);
    throw error; // Biarkan UI yang menangani toast error
  }
}

/**
 * Update Vendor Enrichment (PUT /api/vendor/{id})
 */
export async function updateVendorApi(
  id: number, 
  payload: UpdateVendorPayload
): Promise<void> {
  try {
    const response = await fetch(`${API_BASE}/vendor/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Failed to update vendor');
    }
  } catch (error) {
    console.error(`Error updating vendor ${id}:`, error);
    throw error;
  }
}

// ============================================================================
// HELPER FUNCTIONS (System Data Extraction)
// Mengambil data KBLI dan Brand dari System Data API yang sudah ada
// ============================================================================

// Definisikan KODE KATEGORI sesuai yang ada di database System Data Anda
const CATEGORY_CODE_BRAND = 'EXT_BRAND'; // Sesuaikan dengan DB (misal: 'BRAND' atau 'EXTERNAL_BRAND')
const CATEGORY_CODE_KBLI = 'KBLI';       // Sesuaikan dengan DB

/**
 * Mengambil daftar Brand Aktif dari System Data
 * Mengembalikan array object { value: ID, label: Name }
 */
export async function getActiveExternalBrands() {
  const allSystemData = await fetchSystemDataApi();
  
  if (!allSystemData) return [];

  // 1. Cari kategori Brand
  const brandCategory = allSystemData.find(c => c.code === CATEGORY_CODE_BRAND);
  if (!brandCategory) return [];

  // 2. Filter item yang Active & Map ke format dropdown
  return brandCategory.items
    .filter(item => item.isActive)
    .map(item => ({
      id: parseInt(item.id), // Pastikan ID dikonversi ke number jika di DB SystemData ID-nya string tapi di VendorBrand integer
      name: item.value
    }));
}

/**
 * Mengambil daftar KBLI Aktif dari System Data
 * Mengembalikan array object { code: string, description: string }
 */
export async function getActiveKBLICodes() {
  const allSystemData = await fetchSystemDataApi();
  
  if (!allSystemData) return [];

  // 1. Cari kategori KBLI
  const kbliCategory = allSystemData.find(c => c.code === CATEGORY_CODE_KBLI);
  if (!kbliCategory) return [];

  // 2. Filter Active & Map
  return kbliCategory.items
    .filter(item => item.isActive)
    .map(item => ({
      code: item.value,       // Asumsi 'value' menyimpan Kode KBLI (misal "46591")
      description: item.description || item.value // Deskripsi KBLI
    }));
}