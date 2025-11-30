// src/types/matrixContractTypes.ts

export interface MatrixContractCondition {
    id: string; // Menggunakan MatrixContractID (string)
    code: string;
    label: string;
    description?: string;
    isActive: boolean;
    order: number; // Menggunakan OrderNo
    createdDate: string; // Tanggal saja (YYYY-MM-DD)
    updatedDate?: string; // Tanggal saja (YYYY-MM-DD)
}

export interface MatrixConditionCreatePayload {
    code: string; // Nama Kolom API/DB
    label: string;
    description: string | null;
    orderNo: number; // Nama Kolom API/DB
    isActive: boolean;
    createdBy: string; // Nama Kolom API/DB
}

export interface MatrixConditionUpdatePayload {
    matrixContractID: number; // ID internal (number) jika API membutuhkan
    code: string;
    label: string;
    description: string | null;
    orderNo: number;
    isActive: boolean;
    updatedBy: string;
    // Flags untuk Soft Delete (jika API Anda menggunakan DeletedAt/DeletedBy)
    deletedAt?: string | null; 
    deletedBy?: string | null;
}

export interface MatrixConditionReorderPayload {
    conditionIds: number[]; // Array of condition IDs (number) in new order
    UpdatedBy: string;
}

export interface MatrixConditionApiData {
    matrixContractID: number; 
    code: string;
    label: string;
    description: string | null;
    orderNo: number; // Nama Kolom DB/API
    isActive: boolean;
    createdAt: string; // datetime2 ISO string
    createdBy: string;
    updatedAt?: string | null; // datetime2 ISO string
    updatedBy?: string | null;
    deletedAt?: string | null;
    deletedBy?: string | null;
}

export const mapApiConditionToMatrixCondition = (
    apiData: MatrixConditionApiData
): MatrixContractCondition => {
    const formatDate = (dateString: string | null | undefined): string | undefined => {
        if (!dateString) return undefined;
        // Asumsi string ISO 8601 (e.g., "2025-11-23T07:12:13.456Z")
        return dateString.split('T')[0];
    };

    return {
        id: (apiData as any).matrixContractID.toString(), 
        code: apiData.code,
        label: apiData.label,
        description: apiData.description ?? undefined, 
        isActive: apiData.isActive,
        order: apiData.orderNo, 
        createdDate: formatDate(apiData.createdAt)!, 
        updatedDate: formatDate(apiData.updatedAt),
    };
};