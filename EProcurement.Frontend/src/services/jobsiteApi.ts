// src/services/jobsiteApi.ts

import { toast } from 'sonner';
import { Jobsites } from '../types';

// Definisikan base URL API Anda di sini
const API_BASE = import.meta.env.VITE_API_BASE_URL; 

if (!API_BASE) {
    console.error("VITE_API_BASE_URL is not defined in environment variables!");
}

export async function fetchApiJobsite(): Promise<Jobsites[] | null> {
  try {
    const jobsiteRes = await fetch(`${API_BASE}/Jobsite`);

    if (jobsiteRes.ok) {
      const jobsiteData = await jobsiteRes.json();
      return jobsiteData; 
    } else {
      console.warn('Gagal fetch Jobsite dari API.');
      return null;
    }
  } catch (err) {
    console.error('Koneksi ke server gagal:', err);
    toast.error('Koneksi ke server gagal.');
    return null; 
  }
}