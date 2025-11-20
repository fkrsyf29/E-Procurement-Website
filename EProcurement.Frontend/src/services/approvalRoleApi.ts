// src/services/approvalRoleApi.ts

import { toast } from 'sonner';
import { ApprovalRole } from '../types';

// Definisikan base URL API Anda di sini
const API_BASE = import.meta.env.VITE_API_BASE_URL; 

if (!API_BASE) {
    console.error("VITE_API_BASE_URL is not defined in environment variables!");
}

export async function fetchApiApprovalRole(): Promise<ApprovalRole[] | null> {
  try {
    const response = await fetch(`${API_BASE}/ApprovalRole`);

    if (response.ok) {
      const resultData = await response.json();
      return resultData; 
    } else {
      console.warn('Gagal fetch Approval Role dari API.');
      return null;
    }
  } catch (err) {
    console.error('Koneksi ke server gagal:', err);
    toast.error('Koneksi ke server gagal.');
    return null; 
  }
}