// src/services/permissionApi.ts

import { Permission} from '../types';
import { toast } from 'sonner';

// Definisikan base URL API Anda di sini
const API_BASE = import.meta.env.VITE_API_BASE_URL; 

if (!API_BASE) {
    console.error("VITE_API_BASE_URL is not defined in environment variables!");
}

export async function fetchApiPermissions(): Promise<Permission[] | null> {
  try {
    const permissionsRes = await fetch(`${API_BASE}/Permission`);

    if (permissionsRes.ok) {
      const permissionsData = await permissionsRes.json();
      return permissionsData; 
    } else {
      console.warn('Gagal fetch permission dari API. Menggunakan data default.');
      return null; 
    }
  } catch (err) {
    console.error('Koneksi ke server gagal:', err);
    toast.error('Koneksi ke server gagal, menggunakan data default');
    return null; 
  }
}