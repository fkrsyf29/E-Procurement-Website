// src/services/materialApi.ts

import { toast } from 'sonner';
import { Material, MaterialCreatePayload, MaterialUpdatePayload } from '../types/materialTypes';

// Pastikan URL Base ada di .env
const API_BASE = import.meta.env.VITE_API_BASE_URL;
const ENDPOINT = `${API_BASE}/Material`;

if (!API_BASE) {
  console.error("VITE_API_BASE_URL is not defined!");
}

// --- MAPPER FUNCTION ---
// Berfungsi mengubah format JSON dari Backend (Database) menjadi format interface Frontend.
// Penting: Menangani kemungkinan nama field PascalCase (dari C#) atau camelCase.
const mapApiToMaterial = (data: any): Material => {
  return {
    id: String(data.materialID || data.materialId),
    
    // Core Data
    materialCode: data.materialCode,
    description: data.description,

    // Relasi Master (Foreign Keys & Display Names)
    // Kita ambil ID-nya, dan Nama-nya (jika Backend melakukan Include/Join)
    uomId: data.uomID || data.uomId,
    uomName: data.uomName || data.uom?.name || '',

    externalBrandId: data.externalBrandID || data.externalBrandId,
    externalBrandName: data.externalBrandName || data.externalBrand?.name || '',

    valuationClassId: data.valuationClassID || data.valuationClassId,
    valuationClassName: data.valuationClassName || data.valuationClass?.code || '',

    materialGroupId: data.materialGroupID || data.materialGroupId,
    materialGroupName: data.materialGroupName || data.materialGroup?.code || '',
    materialGroupDesc: data.materialGroupDesc || data.materialGroup?.description || '',

    subClassificationId: data.subClassificationID || data.subClassificationId,
    subClassificationName: data.subClassificationName || data.subClassification?.name || '',

    jobsiteId: data.jobsiteID || data.jobsiteId,
    jobsiteName: data.jobsiteName || data.jobsite?.name || '',

    departmentId: data.departmentID || data.departmentId, // Plant / Dept
    departmentName: data.departmentName || data.department?.name || '',

    // Transaction Data
    qty: data.qty || 0,
    estimatedPrice: data.estimatedPrice || 0,
    
    contractTypeId: data.contractTypeID || data.contractTypeId,
    contractTypeName: data.contractTypeName || data.contractType?.name || '',

    // Contract / Vendor Data
    vendorId: data.vendorID || data.vendorId,
    vendorName: data.vendorName || data.vendor?.vendorName || '',

    contractNumber: data.contractNumber || '',
    contractName: data.contractName || '',
    
    // Handle Date: Ambil YYYY-MM-DD saja
    contractStartDate: data.contractStartDate ? String(data.contractStartDate).split('T')[0] : '',
    contractEndDate: data.contractEndDate ? String(data.contractEndDate).split('T')[0] : '',

    // Flags & Audit
    isUnique: data.isUnique === true,
    isActive: data.isActive ?? true,
    createdDate: data.createdDate,
    createdBy: data.createdBy,
    updatedDate: data.updatedDate,
    updatedBy: data.updatedBy
  };
};

// --- GET ALL MATERIALS ---
export async function fetchAllMaterials(): Promise<Material[]> {
  try {
    const response = await fetch(ENDPOINT);
    
    if (!response.ok) {
      throw new Error(`Gagal mengambil data material. Status: ${response.status}`);
    }
    
    const jsonResponse = await response.json();
    // Handle jika response dibungkus object { data: [...] } atau langsung array
    const list = Array.isArray(jsonResponse) ? jsonResponse : (jsonResponse.data || []);
    
    return list.map(mapApiToMaterial);
  } catch (error) {
    console.error('Fetch Material Error:', error);
    toast.error('Gagal mengambil data Annual Purchase Plan');
    return [];
  }
}

// --- CREATE MATERIAL ---
export async function createMaterialApi(payload: MaterialCreatePayload): Promise<Material> {
  try {
    const response = await fetch(ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload) // Payload sudah berisi ID (INT) sesuai types
    });

    const responseData = await response.json();

    if (!response.ok) {
      const errorMessage = responseData.message || responseData.detail || 'Gagal membuat material baru.';
      throw new Error(errorMessage);
    }

    const resultData = responseData.data || responseData;
    return mapApiToMaterial(resultData);
  } catch (error) {
    console.error('Create Material Error:', error);
    throw error;
  }
}

// --- UPDATE MATERIAL ---
export async function updateMaterialApi(payload: MaterialUpdatePayload): Promise<Material> {
  try {
    // ID dikirim di URL, Payload dikirim di Body
    const response = await fetch(`${ENDPOINT}/${payload.materialId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const responseData = await response.json();

    if (!response.ok) {
      const errorMessage = responseData.message || responseData.detail || 'Gagal update material.';
      throw new Error(errorMessage);
    }

    const resultData = responseData.data || responseData;
    return mapApiToMaterial(resultData);
  } catch (error) {
    console.error('Update Material Error:', error);
    throw error;
  }
}

// --- DELETE MATERIAL (Soft Delete) ---
export async function deleteMaterialApi(id: string, user: string): Promise<void> {
  try {
    // Payload untuk soft delete (sesuai standar logic update)
    const payload = {
      materialId: parseInt(id),
      isDeleted: true,
      deletedBy: user,
      isActive: false // Non-aktifkan data
    };

    // Menggunakan PUT ke endpoint ID untuk update status deleted
    const response = await fetch(`${ENDPOINT}/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.message || 'Gagal menghapus material.');
    }
  } catch (error) {
    console.error('Delete Material Error:', error);
    throw error;
  }
}

// --- BULK UPLOAD (Optional) ---
// Menerima array payload create
export async function bulkUploadMaterialsApi(materials: MaterialCreatePayload[]) {
  try {
    const response = await fetch(`${ENDPOINT}/Bulk`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(materials)
    });

    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.message || 'Bulk upload gagal.');
    }
    return await response.json();
  } catch (error) {
    console.error('Bulk Upload Error:', error);
    throw error;
  }
}