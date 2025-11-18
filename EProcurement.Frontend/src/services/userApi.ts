// src/services/userApi.ts

import { User, UserRole, Jobsite, Department } from '../types';
import { FALLBACK_USERS, mapApiUserToDefinition } from '../data/mockData'; 
import { toast } from 'sonner@2.0.3';

// Definisikan base URL API Anda di sini
const API_BASE = import.meta.env.VITE_API_BASE_URL; 

if (!API_BASE) {
    console.error("VITE_API_BASE_URL is not defined in environment variables!");
}

export async function fetchApiUsers(): Promise<User[]> {
  try {
    const usersRes = await fetch(`${API_BASE}/User`);

    if (usersRes.ok) {
      const usersData = await usersRes.json();
      return usersData.map(mapApiUserToDefinition); 
    } else {
      console.warn('Gagal fetch users dari API. Menggunakan data default.');
      toast.error('Gagal ambil data User dari server, menggunakan data default');
      return FALLBACK_USERS as User[]; // Menggunakan data fallback
    }
  } catch (err) {
    console.error('Koneksi ke server gagal:', err);
    toast.error('Koneksi ke server gagal, menggunakan data default');
    return FALLBACK_USERS as User[]; // Menggunakan data fallback
  }
}

// // Anda juga bisa memindahkan FALLBACK_USERS, jobsites, dan departments di sini, 
// // atau ke file konfigurasi/mock terpisah yang diimpor.

// // Contoh fungsi lain yang bisa dipindahkan
// export async function createUser(userData: Omit<User, 'userID' | 'lastPasswordChange'>): Promise<User> {
//   // Logika POST ke API
//   console.log('API: Creating user', userData);
//   // ... fetch(..., { method: 'POST', body: JSON.stringify(userData) })
//   return { ...userData, userID: Date.now().toString(), lastPasswordChange: new Date().toISOString().split('T')[0] } as User; // Mock response
// }

// export async function updateUser(user: User): Promise<User> {
//   // Logika PUT ke API
//   console.log('API: Updating user', user);
//   // ... fetch(..., { method: 'PUT', body: JSON.stringify(user) })
//   return user; // Mock response
// }

// export async function deleteUser(userId: string): Promise<void> {
//   // Logika DELETE ke API
//   console.log('API: Deleting user', userId);
//   // ... fetch(..., { method: 'DELETE' })
//   return; // Mock response
// }

// export async function resetUserPassword(userId: string, newPassword: string): Promise<void> {
//   // Logika PATCH/PUT untuk reset password
//   console.log(`API: Resetting password for ${userId}`);
//   // ... fetch(..., { method: 'PATCH', body: JSON.stringify({ newPassword }) })
//   return; // Mock response
// }