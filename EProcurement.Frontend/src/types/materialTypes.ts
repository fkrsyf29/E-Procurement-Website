// src/types/materialTypes.ts

/**
 * Material: Representasi data material yang digunakan di Frontend.
 * Object ini berisi gabungan antara ID (untuk logic) dan Nama (untuk display)
 * yang biasanya didapat dari hasil JOIN di backend.
 */
export interface Material {
  // Primary Key
  id: string; // Mapping dari MaterialID (INT di DB)

  // --- Core Material Data ---
  materialCode: string; // NVARCHAR(50)
  description: string;  // NVARCHAR(255)

  // --- Relasi Master Data (Foreign Keys) ---
  // Field ID wajib ada (NOT NULL di DB), Name optional (tergantung join BE)
  
  uomId: number;
  uomName?: string; // e.g. "EA", "SET"

  externalBrandId?: number | null;
  externalBrandName?: string; // e.g. "Caterpillar"

  valuationClassId?: number | null;
  valuationClassName?: string; // e.g. "Z001"

  materialGroupId?: number | null;
  materialGroupName?: string; // e.g. "M01"
  materialGroupDesc?: string; // e.g. "Spareparts"

  subClassificationId?: number | null;
  subClassificationName?: string;

  jobsiteId: number;
  jobsiteName?: string; // e.g. "ADMO MINING"

  departmentId: number; // Pengganti 'Plant'
  departmentName?: string; // e.g. "Plant" atau "Logistics"

  // --- Annual Purchase Plan / Procurement Data ---
  qty: number;
  estimatedPrice: number; // Decimal(18,2)

  contractTypeId?: number | null;
  contractTypeName?: string; // 'Contractual' / 'Non-Contractual'

  // --- Contract Details ---
  vendorId: number; // FK ke tabel Vendor
  vendorName?: string; // Nama vendor untuk display

  contractNumber?: string;
  contractName?: string;
  contractStartDate?: string; // ISO Date String (YYYY-MM-DD)
  contractEndDate?: string;   // ISO Date String (YYYY-MM-DD)

  // --- Flags & Meta ---
  isUnique: boolean; // Mapping dari BIT DB (true/false)
  isActive: boolean;
  
  createdDate: string; // ISO DateTime
  updatedDate?: string; // ISO DateTime
  createdBy: string;
  updatedBy?: string;
}

/**
 * Payload untuk membuat Material baru (POST).
 * Fokus pada pengiriman ID relasi.
 */
export interface MaterialCreatePayload {
  materialCode: string;
  description: string;
  
  // Foreign Keys (INT)
  uomId: number;
  externalBrandId?: number | null;
  valuationClassId?: number | null;
  materialGroupId?: number | null;
  subClassificationId?: number | null;
  jobsiteId: number;
  departmentId: number;

  // Transaction Data
  qty: number;
  estimatedPrice: number;
  contractTypeId?: number | null;

  // Contract Data
  vendorId: number; // Wajib ada (sesuai schema DB: VendorID INT NOT NULL)
  contractNumber?: string;
  contractName?: string;
  contractStartDate?: string | null; 
  contractEndDate?: string | null;   

  // Flags
  isUnique: boolean;
  
  // Audit
  createdBy: string;
}

/**
 * Payload untuk update Material (PUT).
 * Wajib menyertakan ID Material.
 */
export interface MaterialUpdatePayload extends Partial<MaterialCreatePayload> {
  materialId: number; // ID Int dari DB
  
  // Audit Trail
  updatedBy: string;
  
  // Soft Delete Flags
  isDeleted?: boolean;
  deletedBy?: string | null;
  isActive?: boolean;
}