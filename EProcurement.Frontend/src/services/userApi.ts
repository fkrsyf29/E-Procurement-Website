// src/services/userApi.ts

import { User, UserRole, Jobsite, Department } from '../types';
import { FALLBACK_USERS, mapApiUserToDefinition } from '../data/mockData'; 
import { toast } from 'sonner';

// Definisikan base URL API Anda di sini
const API_BASE = import.meta.env.VITE_API_BASE_URL; 
const LOGIN_ENDPOINT = '/Auth/Login';
const REFRESH_ENDPOINT = '/Auth/refresh';
const GET_USER_INFO_ENDPOINT = '/Auth/userinfo';

if (!API_BASE) {
    console.error("VITE_API_BASE_URL is not defined in environment variables!");
}

/**
 * Mengambil daftar User dari API. Digunakan untuk User Management.
 * @returns Promise<User[]> Daftar pengguna atau data fallback.
 */
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

/**
 * Mengirim kredensial untuk login dan menerima data pengguna serta token.
 * @param username Username pengguna.
 * @param password Password pengguna.
 * @returns Promise<{ user: User }> Objek berisi token dan data User.
 * @throws Error jika login gagal (status kode non-2xx).
 */
export async function loginUser(username: string, password: string): Promise<{ token: string, user: User }> {
    const url = `${API_BASE}${LOGIN_ENDPOINT}`;
    console.log(`[API] Attempting login to: ${url}`);

    const response = await fetch(url, {
        method: 'POST', 
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
    });

    if (!response.ok) {
        let message = `Login failed. Status: ${response.status}`;
        try {
            const errorData = await response.json();
            message = errorData.message || errorData.error || message;
        } catch (e) { }
        
        console.error(`[API Error] Login: ${message}`);
        throw new Error(message); 
    }

    const data = await response.json();
    console.log('[API Success] Login successful. Data received.');
    
    const apiUserData = data.user || data;
    const definedUser: User = mapApiUserToDefinition(apiUserData);
    
    const token = data.accessToken;
    if (!token) {
        throw new Error('Login sukses, tetapi server tidak mengembalikan Access Token.');
    }
    
    return { token, user: definedUser };
}

export async function fetchCurrentUser(token: string): Promise<User | null> {
    if (!token) {
        return null;
    }

    const callUserinfoApi = async (tokenToUse: string) => {
        const userinfoUrl = `${API_BASE}${GET_USER_INFO_ENDPOINT}`;
        return fetch(userinfoUrl, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${tokenToUse}`, 
            },
        });
    }

    let userResponse = await callUserinfoApi(token);
    if (userResponse.status === 401) {
        console.log('[Auth] Access Token 401. Mencoba Refresh Sesi...');

        const newToken = await attemptTokenRefresh();
        
        if (!newToken) {
            return null; 
        }

        userResponse = await callUserinfoApi(newToken);
        
        if (!userResponse.ok) {
            console.error('[Auth] Panggilan API kedua gagal setelah refresh.');
            return null;
        }
    }
    
    if (!userResponse.ok) { 
        return null; 
    }

    try {
        const userData = await userResponse.json();
        return mapApiUserToDefinition(userData.user || userData); 
    } catch (err) {
        console.error('[Auth] Gagal parsing data user setelah verifikasi:', err);
        return null;
    }
}

/**
 * Memanggil endpoint /refresh untuk menukar HttpOnly Refresh Token dengan Access Token baru.
 * @returns Promise<string | null> Access Token baru jika refresh berhasil.
 */
async function attemptTokenRefresh(): Promise<string | null> {
    const url = `${API_BASE}${REFRESH_ENDPOINT}`;
    console.log('[Auth] Mencoba Refresh Token...');

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            console.error(`[Auth] Refresh Token gagal: Status ${response.status}`);
            return null; 
        }

        const data = await response.json();
        const newAccessToken = data.accessToken;

        if (!newAccessToken) {
            console.error('[Auth] Refresh berhasil, tetapi AccessToken kosong.');
            return null;
        }

        localStorage.setItem('authToken', newAccessToken);
        console.log('✅ [Auth] Access Token baru berhasil disimpan.');
        
        return newAccessToken;

    } catch (error) {
        console.error('[Auth] Network error saat refresh:', error);
        return null;
    }
}