// src/services/permissionCategoryApi.ts

import { toast } from 'sonner';
import { PermissionCategories } from '../types';

// Definisikan base URL API Anda di sini
const API_BASE = import.meta.env.VITE_API_BASE_URL; 

if (!API_BASE) {
    console.error("VITE_API_BASE_URL is not defined in environment variables!");
}

export async function fetchApiPermissionCategory(): Promise<PermissionCategories[] | null> {
  try {
    const response = await fetch(`${API_BASE}/PermissionCategory`);

    if (response.ok) {
      const resultData = await response.json();
      return resultData; 
    } else {
      console.warn('Gagal fetch Permission Category dari API.');
      return null;
    }
  } catch (err) {
    console.error('Koneksi ke server gagal:', err);
    toast.error('Koneksi ke server gagal.');
    return null; 
  }
}