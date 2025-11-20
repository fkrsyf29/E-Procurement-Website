// src/services/roleApi.ts

import { RoleDefinition } from '../types';
import { defaultRoles, mapApiRoleToDefinition } from '../data/rolesData'; 
import { toast } from 'sonner';

// Definisikan base URL API Anda di sini
const API_BASE = import.meta.env.VITE_API_BASE_URL; 

if (!API_BASE) {
    console.error("VITE_API_BASE_URL is not defined in environment variables!");
}

export async function fetchApiRoles(): Promise<RoleDefinition[]> {
  try {
    const rolesRes = await fetch(`${API_BASE}/Role`);

    if (rolesRes.ok) {
      const rolesData = await rolesRes.json();
      return rolesData.map(mapApiRoleToDefinition); 
    } else {
      console.warn('Gagal fetch users dari API. Menggunakan data default.');
      toast.error('Gagal ambil data User dari server, menggunakan data default');
      return defaultRoles as RoleDefinition[]; // Menggunakan data fallback
    }
  } catch (err) {
    console.error('Koneksi ke server gagal:', err);
    toast.error('Koneksi ke server gagal, menggunakan data default');
    return defaultRoles as RoleDefinition[]; // Menggunakan data fallback
  }
}
