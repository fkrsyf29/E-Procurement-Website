// src/services/userApi.ts

import { User, apiUser } from '../types';
import { mapApiUserToDefinition } from '../data/mockData';
import { toast } from 'sonner';

// Definisikan base URL API Anda di sini
const API_BASE = import.meta.env.VITE_API_BASE_URL;
const LOGIN_ENDPOINT = '/Auth/Login';
const REFRESH_ENDPOINT = '/Auth/refresh';
const GET_USER_INFO_ENDPOINT = '/Auth/userinfo';

if (!API_BASE) {
    console.error("VITE_API_BASE_URL is not defined in environment variables!");
}

interface SsoUserResponse {
    nrp: string;
    fullName: string;
    userEmail: string;
}

interface UserCreatePayload {
    username: string;
    name: string;
    password?: string; // Diperlukan saat create, opsional saat update
    roleID: number;
    jobsiteID: number | null;
    departmentID: number | null;
    email: string;
    phone: string;
    createdBy: string;
}

interface UpdateUserPayload {
    userID: number; // Harus ada untuk PUT
    username: string;
    name: string;
    roleID: number;
    jobsiteID: number | null;
    departmentID: number | null;
    email: string;
    phone: string;
    isActive: boolean; // Asumsikan user aktif saat di-edit/update
    updatedBy: string;
    isDeleted: boolean; // Dapat digunakan untuk soft delete
    deletedBy: string | null;
}

/**
 * Mengambil daftar User dari API. Digunakan untuk User Management.
 * @returns Promise<User[]> Daftar pengguna atau data fallback.
 */
export async function fetchApiUsers(): Promise<User[] | null> {
    try {
        const usersRes = await fetch(`${API_BASE}/User`);

        if (usersRes.ok) {
            const usersData = await usersRes.json();
            return usersData.map(mapApiUserToDefinition);
        } else {
            console.warn('Gagal fetch users dari API.');
            toast.error('Gagal ambil data User dari server.');
            return null;
        }
    } catch (err) {
        console.error('Koneksi ke server gagal:', err);
        toast.error('Koneksi ke server gagal');
        return null;
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
    console.warn(`[API] Attempting login to: ${url}`);

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
    console.warn('[API Success] Login successful. Data received.');

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
        console.warn('[Auth] Access Token 401. Mencoba Refresh Sesi...');

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
    console.warn('[Auth] Mencoba Refresh Token...');

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
        console.warn('✅ [Auth] Access Token baru berhasil disimpan.');

        return newAccessToken;

    } catch (error) {
        console.error('[Auth] Network error saat refresh:', error);
        return null;
    }
}

export async function fetchUserFromSSO(username: string): Promise<SsoUserResponse> {

    if (!username) {
        throw new Error("Username cannot be empty.");
    }

    const url = `${API_BASE}/Auth/userinfo-sso/${username}`;

    try {
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'accept': '*/*',
            },
        });

        const responseData = await response.json();

        if (response.ok && responseData.success === true && responseData.user) {
            return responseData.user as SsoUserResponse;

        } else {
            const message = responseData.message || `User with username ${username} not found.`;
            toast.warning(`SSO Lookup Failed: ${message}`);
            throw new Error(`User not found: ${message}`);
        }

    } catch (error) {
        const networkError = error instanceof Error ? error.message : 'Unknown error.';
        console.error('SSO API Connection Failed:', error);
        toast.error(`SSO connection error: ${networkError}`);
        throw new Error(`Koneksi ke server SSO gagal: ${networkError}`);
    }
}

export async function createApiUser(payload: UserCreatePayload): Promise<{ userId: number }> {
    const url = `${API_BASE}/User`; // Asumsi endpoint POST adalah /User

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
        });

        const responseData = await response.json();

        if (response.ok && (response.status === 201 || response.status === 200)) {
            return responseData.data || responseData;
        } else {
            const errorMessage = responseData.message || `Error ${response.status}: Gagal membuat pengguna.`;
            toast.error(errorMessage);
            throw new Error(errorMessage);
        }
    } catch (error) {
        console.error('API Error during user creation:', error);
        throw new Error(`Koneksi server gagal saat membuat pengguna: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
}

export async function updateApiUser(payload: UpdateUserPayload): Promise<{ userId: number, message: string }> {
    const url = `${API_BASE}/User/${payload.userID}`;

    try {
        const response = await fetch(url, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
        });

        const responseData = await response.json();

        if (response.ok && (response.status === 200 || response.status === 204)) {
            const resultData = responseData.data || responseData;

            if (typeof resultData.userId !== 'number' && typeof payload.userID === 'number') {
                resultData.userId = payload.userID;
            }

            return {
                userId: resultData.userId,
                message: responseData.message || `User ${payload.userID} berhasil diperbarui.`
            };

        } else {
            const errorMessage = responseData.message || `Error ${response.status}: Gagal memperbarui pengguna.`;
            toast.error(errorMessage);
            throw new Error(errorMessage);
        }
    } catch (error) {
        console.error('API Error during user update:', error);
        throw new Error(`Koneksi server gagal saat memperbarui pengguna: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
}