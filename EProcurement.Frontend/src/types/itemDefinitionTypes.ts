// src/types/itemDefinitionTypes.ts

export type ItemCategory = 'tor' | 'ter';

export interface ItemDefinition {
    id: string; 
    code: string;
    label: string;
    category: ItemCategory;
    order: number;
    isActive: boolean;
    validationSource?: string; 
    createdDate: string; 
    updatedDate?: string;
}

export interface ItemDefinitionApiData {
    itemDefinitionID: number;
    code: string;
    label: string;
    category: string; 
    order: number;
    isActive: boolean;
    validationSource?: string | null;
    createdDate: string; 
    createdBy: string;
    updatedAt?: string | null;
    updatedBy?: string | null;
    deletedAt?: string | null;
    deletedBy?: string | null;
}

export interface ItemDefinitionCreatePayload {
    code: string;
    label: string;
    category: string; // 'tor' atau 'ter'
    order: number;
    isActive: boolean;
    validationSource?: string | null;
    createdBy: string;
}

export interface ItemDefinitionUpdatePayload {
    itemDefinitionID: number;
    code: string; 
    label: string;
    category: string;
    order: number;
    isActive: boolean;
    validationSource?: string | null;
    updatedBy: string;
    // Flags for Soft Delete/Hard Delete (asumsi hanya delete yang permanen)
    isDeleted: boolean;
    deletedBy?: string | null;
}

export interface ItemDefinitionReorderItemRequest { 
    itemDefinitionID: number;
    orderNo: number; // Harus 'orderNo' (CamelCase)
}

export interface ItemDefinitionReorderPayload {
    orderItems: ItemDefinitionReorderItemRequest[];
    updatedBy: string;
}

// --- Fungsi Mapper ---
export const mapApiItemToDefinition = (
    apiData: ItemDefinitionApiData
): ItemDefinition => {
    const formatDate = (dateString: string | null | undefined): string | undefined => {
        if (!dateString) return undefined;
        return dateString.split('T')[0];
    };

    return {
        id: apiData.itemDefinitionID.toString(),
        code: apiData.code,
        label: apiData.label,
        category: apiData.category.toLowerCase() as ItemCategory, // Pastikan lowercase di FE
        order: apiData.order,
        isActive: apiData.isActive,
        validationSource: apiData.validationSource ?? undefined,
        createdDate: formatDate(apiData.createdDate)!,
        updatedDate: formatDate(apiData.updatedAt),
    };
};