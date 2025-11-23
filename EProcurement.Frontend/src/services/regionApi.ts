// src/services/regionApi.ts

import { toast } from 'sonner';
import { Regions } from '../types';

// Definisikan base URL API Anda di sini
const API_BASE = import.meta.env.VITE_API_BASE_URL; 

if (!API_BASE) {
    console.error("VITE_API_BASE_URL is not defined in environment variables!");
}

export async function fetchApiRegion(): Promise<Regions[] | null> {
  try {
    const resp = await fetch(`${API_BASE}/Region`);

    if (resp.ok) {
      const data = await resp.json();
      return data; 
    } else {
      console.warn('Gagal fetch Region dari API.');
      return null;
    }
  } catch (err) {
    console.error('Koneksi ke server gagal:', err);
    toast.error('Koneksi ke server gagal.');
    return null; 
  }
}