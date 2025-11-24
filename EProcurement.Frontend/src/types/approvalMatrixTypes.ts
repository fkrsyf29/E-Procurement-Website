// src/types/approvalMatrixTypes.ts

export interface ApprovalStepDto {
  stepID?: number; // Optional karena null saat create baru
  matrixID?: number;
  stepNumber: number;
  stepName: string;
  approvalRoleID: number; // Menggunakan ID, bukan nama role
  roleName?: string;      // Untuk display di tabel (dari join BE)
}

export interface ApprovalMatrixDto {
  matrixID: number;
  departmentID: number;
  departmentName: string;
  jobsiteID: number;
  jobsiteName: string;
  amountMin: number;
  amountMax: number | null;
  groupName: string;
  isActive: boolean;
  approvalPath: ApprovalStepDto[];
  createdDate?: string;
  updatedDate?: string;
}

// Payload untuk Save (Create/Update)
export interface ApprovalStepRequest {
  stepNumber: number;
  stepName: string;
  approvalRoleID: number;
}

export interface ApprovalMatrixSaveRequest {
  matrixID?: number | null; // Null = Create, Ada Nilai = Update
  departmentID: number;
  jobsiteID: number;
  amountMin: number;
  amountMax: number | null;
  groupName: string;
  isActive: boolean;
  user: string; // CreatedBy/UpdatedBy
  steps: ApprovalStepRequest[];
}