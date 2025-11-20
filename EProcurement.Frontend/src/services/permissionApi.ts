// src/services/permissionApi.ts

import { Permission} from '../types';
import { FALLBACK_PERMISSIONS,mapApiPermissionToDefinition } from '../data/rolesData'; 
import { toast } from 'sonner';

// Definisikan base URL API Anda di sini
const API_BASE = import.meta.env.VITE_API_BASE_URL; 

if (!API_BASE) {
    console.error("VITE_API_BASE_URL is not defined in environment variables!");
}

export async function fetchApiPermissions(): Promise<Permission[]> {
  try {
    const permissionsRes = await fetch(`${API_BASE}/Permission`);

    if (permissionsRes.ok) {
      const permissionsData = await permissionsRes.json();
      return permissionsData.map(mapApiPermissionToDefinition); 
    } else {
      console.warn('Gagal fetch permission dari API. Menggunakan data default.');
      return FALLBACK_PERMISSIONS as Permission[]; // Menggunakan data fallback
    }
  } catch (err) {
    console.error('Koneksi ke server gagal:', err);
    toast.error('Koneksi ke server gagal, menggunakan data default');
    return FALLBACK_PERMISSIONS as Permission[]; // Menggunakan data fallback
  }
}