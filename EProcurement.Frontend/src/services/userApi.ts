import { User, apiUser } from '../types';
import { toast } from 'sonner';

const API_BASE = import.meta.env.VITE_API_BASE_URL;
const LOGIN_ENDPOINT = '/Auth/Login';
const REFRESH_ENDPOINT = '/Auth/refresh';
const GET_USER_INFO_ENDPOINT = '/Auth/userinfo';

if (!API_BASE) {
  console.error("VITE_API_BASE_URL is not defined!");
}

// ✅ FIX: Gunakan tipe 'apiUser' di sini agar import tidak unused
const mapApiUserToUser = (apiData: apiUser): User => {
  // Pastikan permissions selalu array, jangan biarkan undefined
  const perms = Array.isArray(apiData.permissions) ? apiData.permissions : [];

  return {
    // Handle ID yang bisa number dari API tapi string di Frontend
    userID: apiData.userID?.toString() || '0',
    username: apiData.username || '',
    name: apiData.name || '',
    roleName: apiData.roleName || '',
    
    // Handle Jobsite/Dept yang dari API berupa string name
    // Kita ubah jadi object agar sesuai interface User FE
    jobsite: apiData.jobsite ? { 
      jobsiteID: '0', 
      code: apiData.jobsite, 
      name: apiData.jobsite, 
      isActive: true 
    } : undefined,

    department: apiData.department ? { 
      departmentID: '0', 
      code: apiData.department, 
      name: apiData.department, 
      isActive: true 
    } : undefined,

    email: apiData.email || '',
    phone: apiData.phone || '',
    lastPasswordChange: apiData.lastPasswordChange,
    
    // ✅ KUNCI: Ambil permission dari response BE
    permissions: perms 
  };
};

interface UserCreatePayload {
  username: string;
  name: string;
  password?: string;
  roleID: number;
  jobsiteID: number | null;
  departmentID: number | null;
  email: string;
  phone: string;
  createdBy: string;
}

interface UpdateUserPayload {
  userID: number;
  username: string;
  name: string;
  roleID: number;
  jobsiteID: number | null;
  departmentID: number | null;
  email: string;
  phone: string;
  isActive: boolean;
  updatedBy: string;
  isDeleted: boolean;
  deletedBy: string | null;
}

// GET ALL USERS
export async function fetchApiUsers(): Promise<User[] | null> {
  try {
    const usersRes = await fetch(`${API_BASE}/User`);
    if (usersRes.ok) {
      const usersData: apiUser[] = await usersRes.json(); // Explicit type casting
      // Gunakan mapper lokal
      return usersData.map(mapApiUserToUser);
    } else {
      console.warn('Gagal fetch users dari API.');
      toast.error('Gagal ambil data User dari server.');
      return null;
    }
  } catch (err) {
    console.error('Koneksi ke server gagal:', err);
    return null;
  }
}

// LOGIN USER
export async function loginUser(username: string, password: string): Promise<{ token: string, user: User }> {
  const url = `${API_BASE}${LOGIN_ENDPOINT}`;
  
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  });

  if (!response.ok) {
    let message = `Login failed. Status: ${response.status}`;
    try {
      const errorData = await response.json();
      message = errorData.message || errorData.error || message;
    } catch (e) { }
    throw new Error(message);
  }

  const data = await response.json();
  
  // Backend response structure: { success: true, accessToken: "...", user: { ... } }
  const apiUserData: apiUser = data.user; // Explicit type
  const definedUser: User = mapApiUserToUser(apiUserData);

  const token = data.accessToken;
  if (!token) {
    throw new Error('Login sukses, tetapi server tidak mengembalikan Access Token.');
  }

  return { token, user: definedUser };
}

// GET CURRENT USER (SESSION CHECK)
export async function fetchCurrentUser(token: string): Promise<User | null> {
  if (!token) return null;

  const callUserinfoApi = async (tokenToUse: string) => {
    const userinfoUrl = `${API_BASE}${GET_USER_INFO_ENDPOINT}`;
    return fetch(userinfoUrl, {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${tokenToUse}` },
    });
  }

  let userResponse = await callUserinfoApi(token);

  // Handle Token Expired (Refresh Token Logic)
  if (userResponse.status === 401) {
    console.warn('[Auth] Access Token 401. Mencoba Refresh Sesi...');
    const newToken = await attemptTokenRefresh();
    if (!newToken) return null;
    userResponse = await callUserinfoApi(newToken);
    if (!userResponse.ok) return null;
  }

  if (!userResponse.ok) return null;

  try {
    const responseData = await userResponse.json();
    // Backend response: { success: true, user: { ... } }
    const rawUser: apiUser = responseData.user || responseData;
    return mapApiUserToUser(rawUser);
  } catch (err) {
    console.error('[Auth] Gagal parsing data user:', err);
    return null;
  }
}

// REFRESH TOKEN HELPER
async function attemptTokenRefresh(): Promise<string | null> {
  const url = `${API_BASE}${REFRESH_ENDPOINT}`;
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });

    if (!response.ok) return null;

    const data = await response.json();
    const newAccessToken = data.accessToken;

    if (!newAccessToken) return null;

    localStorage.setItem('authToken', newAccessToken);
    return newAccessToken;
  } catch (error) {
    return null;
  }
}

// SSO (Legacy Support if needed)
export async function fetchUserFromSSO(username: string): Promise<any> {
    // Implementation same as before if needed
    return null; 
}

// CREATE USER (ADMIN)
export async function createApiUser(payload: UserCreatePayload): Promise<{ userId: number }> {
    const url = `${API_BASE}/User`;
    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
        });
        const responseData = await response.json();
        if (response.ok) return responseData.data || responseData;
        throw new Error(responseData.message || 'Gagal membuat pengguna.');
    } catch (error: any) {
        toast.error(error.message);
        throw error;
    }
}

// UPDATE USER (ADMIN)
export async function updateApiUser(payload: UpdateUserPayload): Promise<{ userId: number, message: string }> {
    const url = `${API_BASE}/User/${payload.userID}`;
    try {
        const response = await fetch(url, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
        });
        const responseData = await response.json();
        if (response.ok) return { userId: payload.userID, message: 'Success' };
        throw new Error(responseData.message || 'Gagal update pengguna.');
    } catch (error: any) {
        toast.error(error.message);
        throw error;
    }
}