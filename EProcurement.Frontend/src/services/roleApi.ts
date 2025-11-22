// src/services/roleApi.ts

import { RoleDefinition, mapApiRoleToDefinition } from '../types';
import { defaultRoles } from '../data/rolesData';
import { toast } from 'sonner';

// Definisikan base URL API Anda di sini
const API_BASE = import.meta.env.VITE_API_BASE_URL;

if (!API_BASE) {
  console.error("VITE_API_BASE_URL is not defined in environment variables!");
}

interface RoleCreatePayload {
  name: string;
  description: string;
  roleCategoryId: number; // ID Kategori Peran
  approvalRoleId: number | null | undefined; // ID Peran Persetujuan
  canApprove: boolean;
  canCreate: boolean;
  canView: boolean;
  isActive?: boolean;
  isSystemGenerated?: boolean;
  permissionIds: string[]; // Array of Permission IDs
  createdBy: string; // ID pengguna yang membuat
}

interface RoleUpdatePayload {
  id: string; // ID peran (string) untuk URL
  roleId: number; // ID peran (number) untuk Body (jika diperlukan)
  name: string;
  description: string;
  roleCategoryId: number;
  approvalRoleId: number | null | undefined;
  canApprove: boolean;
  canCreate: boolean;
  canView: boolean;
  isActive: boolean;
  permissionIds: string[];
  updatedBy: string;
  // --- Flags untuk Soft Delete ---
  isDeleted: boolean;     // Digunakan untuk membedakan Update (false) dan Delete (true)
  deletedBy?: string | null; // ID pengguna jika isDeleted: true
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

export async function createRoleApi(
  payload: RoleCreatePayload,
  mapper: (apiData: any, originalPayload: RoleCreatePayload) => RoleDefinition
): Promise<RoleDefinition> {

  // Default nilai yang mungkin tidak diisi di form tapi dibutuhkan oleh API
  const finalPayload = {
    ...payload,
    isActive: payload.isActive ?? true,
    isSystemGenerated: payload.isSystemGenerated ?? false,
    // Pastikan approvalRoleId diisi null jika undefined (sesuai API)
    approvalRoleId: payload.approvalRoleId ?? null,
  };

  try {
    const response = await fetch(`${API_BASE}/Role`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(finalPayload),
    });

    const responseData = await response.json();
    const actualApiData = responseData.data || responseData;
    console.warn('API Successful Response Data:', responseData);
    console.warn('API Successful Response Data:', actualApiData);

    if (response.ok && (response.status === 201 || response.status === 200)) {
      return mapper(actualApiData, finalPayload);
    } else {
      const errorMessage = actualApiData.detail || actualApiData.title || `Error ${response.status}: Gagal membuat peran.`;
      console.error('API Error Response:', actualApiData);

      throw new Error(errorMessage);
    }

  } catch (error) {
    console.error('Network, Mapping, or unknown error during role creation:', error);

    if (error instanceof Error) {
      throw error;
    }

    throw new Error('Koneksi server atau error tak teridentifikasi saat membuat peran.');
  }
}

export async function updateRoleApi(
  payload: RoleUpdatePayload,
  mapper: (apiData: any, originalPayload: RoleUpdatePayload) => RoleDefinition
): Promise<RoleDefinition> {

  // Siapkan body payload
  const finalPayload = {
    roleId: payload.roleId,
    name: payload.name,
    description: payload.description,
    roleCategoryId: payload.roleCategoryId,
    approvalRoleId: payload.approvalRoleId ?? null,
    canApprove: payload.canApprove,
    canCreate: payload.canCreate,
    canView: payload.canView,
    isActive: payload.isActive,
    permissionIds: payload.permissionIds,
    updatedBy: payload.updatedBy,

    // Include Delete flags
    isDeleted: payload.isDeleted,
    deletedBy: payload.deletedBy ?? null,
  };

  try {
    // Menggunakan ID string dari payload untuk URL
    const response = await fetch(`${API_BASE}/Role/${payload.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(finalPayload),
    });

    const responseData = await response.json();
    const actualApiData = responseData.data || responseData;

    if (response.ok && (response.status === 200)) {
      // Update/Delete sukses (Mapper akan menggunakan payload asli)
      return mapper(actualApiData, finalPayload);
    } else {
      const errorMessage = actualApiData.detail || actualApiData.title || `Error ${response.status}: Gagal memproses peran.`;
      console.error('API Error Response:', actualApiData);
      throw new Error(errorMessage);
    }

  } catch (error) {
    console.error('Network, Mapping, or unknown error during role update/delete:', error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Koneksi server atau error tak teridentifikasi.');
  }
}