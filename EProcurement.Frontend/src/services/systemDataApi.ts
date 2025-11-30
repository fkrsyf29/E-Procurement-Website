// src/services/systemDataApi.ts

import { ReferenceDataCategory, ReferenceDataItem } from '../types/systemDataTypes'; // Import Type dari file data yang sudah ada
import { toast } from 'sonner';

// Base URL API
const API_BASE = import.meta.env.VITE_API_BASE_URL;

if (!API_BASE) {
  console.error("VITE_API_BASE_URL is not defined in environment variables!");
}


export interface CreateSystemDataItemPayload {
  value: string;
  abbreviation?: string; // Optional (untuk Jobsite/Dept)
  description?: string;  // Optional (untuk KBLI/MatGroup)
  user: string;
  isActive: boolean;
}

export interface UpdateSystemDataItemPayload {
  value: string;
  abbreviation?: string;
  description?: string;
  isActive: boolean;
  user: string;
}

export interface ReorderSystemDataPayload {
  itemIds: string[]; // List ID yang sudah diurutkan
}

export async function fetchSystemDataApi(): Promise<ReferenceDataCategory[] | null> {
  try {
    const response = await fetch(`${API_BASE}/system-data`);

    if (response.ok) {
      const data: ReferenceDataCategory[] = await response.json();
      return data;
    } else {
      console.warn(`Gagal fetch system data. Status: ${response.status}`);
      toast.error('Gagal mengambil data sistem dari server.');
      return null; 
    }
  } catch (err) {
    console.error('Koneksi ke server gagal (System Data):', err);
    toast.error('Koneksi server gagal.');
    return null; 
  }
}

/**
 * Membuat Item Baru dalam Kategori tertentu
 */
export async function createSystemDataItemApi(
  categoryCode: string,
  payload: CreateSystemDataItemPayload
): Promise<ReferenceDataItem> {
  try {
    const response = await fetch(`${API_BASE}/system-data/${categoryCode}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const responseData = await response.json();

    if (response.ok) {
      // Return data item yang baru dibuat dari server
      return responseData;
    } else {
      const errorMessage = responseData.message || responseData.title || 'Gagal membuat item.';
      throw new Error(errorMessage);
    }
  } catch (error) {
    console.error(`Error creating item in ${categoryCode}:`, error);
    if (error instanceof Error) throw error;
    throw new Error('Terjadi kesalahan saat membuat data.');
  }
}

/**
 * Update Item yang sudah ada
 */
export async function updateSystemDataItemApi(
  categoryCode: string,
  id: string,
  payload: UpdateSystemDataItemPayload
): Promise<boolean> {
  try {
    // ID dikirim di URL untuk identifikasi resource
    const response = await fetch(`${API_BASE}/system-data/${categoryCode}/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (response.ok) {
      return true;
    } else {
      const responseData = await response.json().catch(() => ({})); // Handle jika response body kosong
      const errorMessage = responseData.message || `Gagal update item (${response.status})`;
      throw new Error(errorMessage);
    }
  } catch (error) {
    console.error(`Error updating item ${id}:`, error);
    throw error;
  }
}

/**
 * Delete Item
 */
export async function deleteSystemDataItemApi(
  categoryCode: string,
  id: string,
  user: string
): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE}/system-data/${categoryCode}/${id}/${user}`, {
      method: 'DELETE',
    });

    if (response.ok) {
      return true;
    } else {
      const responseData = await response.json().catch(() => ({}));
      const errorMessage = responseData.message || `Gagal menghapus item (${response.status})`;
      throw new Error(errorMessage);
    }
  } catch (error) {
    console.error(`Error deleting item ${id}:`, error);
    throw error;
  }
}

/**
 * Reorder (Mengubah urutan) Item
 */
export async function reorderSystemDataItemsApi(
  categoryCode: string,
  itemIds: string[]
): Promise<boolean> {
  try {
    const payload: ReorderSystemDataPayload = { itemIds };
    
    const response = await fetch(`${API_BASE}/system-data/${categoryCode}/reorder`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (response.ok) {
      return true;
    } else {
      throw new Error('Gagal menyimpan urutan baru.');
    }
  } catch (error) {
    console.error(`Error reordering ${categoryCode}:`, error);
    throw error;
  }
}