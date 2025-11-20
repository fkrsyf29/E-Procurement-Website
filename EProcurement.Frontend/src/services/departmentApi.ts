// src/services/departmentApi.ts

import { toast } from 'sonner';
import { Departments } from '../types';

// Definisikan base URL API Anda di sini
const API_BASE = import.meta.env.VITE_API_BASE_URL; 

if (!API_BASE) {
    console.error("VITE_API_BASE_URL is not defined in environment variables!");
}

export async function fetchApiDepartment(): Promise<Departments[] | null> {
  try {
    const departmentRes = await fetch(`${API_BASE}/Department`);

    if (departmentRes.ok) {
      const departmentData = await departmentRes.json();
      return departmentData; 
    } else {
      console.warn('Gagal fetch Department dari API.');
      return null;
    }
  } catch (err) {
    console.error('Koneksi ke server gagal:', err);
    toast.error('Koneksi ke server gagal.');
    return null; 
  }
}