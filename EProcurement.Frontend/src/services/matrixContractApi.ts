// src/services/matrixContractApi.ts (Disesuaikan)

import { toast } from 'sonner';
import {
    MatrixContractCondition,
    MatrixConditionApiData,
    MatrixConditionCreatePayload,
    MatrixConditionUpdatePayload,
    MatrixConditionReorderPayload,
    mapApiConditionToMatrixCondition,
} from '../types/matrixContractTypes';

const API_BASE = import.meta.env.VITE_API_BASE_URL;

if (!API_BASE) {
    console.error("VITE_API_BASE_URL is not defined in environment variables!");
}

const CONDITION_ENDPOINT = `${API_BASE}/MatrixContractCondition`;
const REORDER_ENDPOINT = `${API_BASE}/MatrixContractCondition/Reorder`;

const getCurrentUserId = (): string => 'CURRENT_ADMIN_ID'; 

export async function fetchAllMatrixConditions(): Promise<MatrixContractCondition[]> {
    try {
        const response = await fetch(CONDITION_ENDPOINT);

        if (response.ok) {
            const apiData: MatrixConditionApiData[] = await response.json();
            apiData.sort((a, b) => a.OrderNo - b.OrderNo);
            return apiData.map(mapApiConditionToMatrixCondition);
        } else {
            const errorData = await response.json();
            const errorMessage = errorData.detail || errorData.title || `Error ${response.status}: Failed to fetch matrix conditions.`;
            console.error('API Error Response:', errorData);
            throw new Error(errorMessage);
        }
    } catch (err) {
        console.error('Network or unknown error during fetch:', err);
        toast.error('Failed to connect to server or unknown error.');
        return [];
    }
}

export async function createMatrixCondition(
    condition: { code: string, label: string, description: string | null, isActive: boolean, order: number },
    currentUserId: string 
): Promise<MatrixContractCondition> {
    
    const finalPayload: MatrixConditionCreatePayload = {
        code: condition.code,
        label: condition.label,
        description: condition.description || null,
        isActive: condition.isActive,
        orderNo: condition.order,
        createdBy: currentUserId,
    };

    try {
        const response = await fetch(CONDITION_ENDPOINT, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(finalPayload),
        });

        const responseData = await response.json();
        const actualApiData = responseData.data || responseData;

        if (response.ok && (response.status === 201 || response.status === 200)) {
            return mapApiConditionToMatrixCondition(actualApiData as MatrixConditionApiData);
        } else {
            const errorMessage = actualApiData.detail || actualApiData.title || `Error ${response.status}: Failed to create condition.`;
            console.error('API Error Response:', actualApiData);
            throw new Error(errorMessage);
        }
    } catch (error) {
        console.error('Error creating matrix condition:', error);
        throw new Error('Server connection or unidentified error during creation.');
    }
}

export async function updateMatrixConditionApi(
    id: string, 
    updates: { 
        code?: string, 
        label?: string, 
        description?: string | null, 
        isActive?: boolean, 
        order?: number,
        actionType?: 'deactivate' | 'permanentDelete' | 'update' 
    },
    currentApiData: MatrixConditionApiData,
    currentUserId: string 
): Promise<MatrixContractCondition> {

    const matrixContractID = parseInt(id); 
    const action = updates.actionType ?? 'update';
    
    const isSoftDeleteValue = action === 'permanentDelete';
    let isActiveValue = updates.isActive ?? currentApiData.isActive;
    let deletedAtValue: string | null = null;
    let deletedByValue: string | null = null;
    
    // --- Logika Perbedaan Deactivate vs Permanent Delete ---
    if (isSoftDeleteValue) {
        isActiveValue = false; // Harus false
        deletedAtValue = new Date().toISOString(); 
        deletedByValue = currentUserId;
    } else if (action === 'deactivate') {
        isActiveValue = false; // Harus false
        deletedAtValue = null; 
        deletedByValue = null;
    } else if (updates.isActive === true) {
        // Jika diaktifkan kembali, reset kolom delete
        deletedAtValue = null; 
        deletedByValue = null;
    } else {
        // Update biasa, pertahankan status deleted yang ada (kecuali diisi null dari FE)
        deletedAtValue = currentApiData.deletedAt;
        deletedByValue = currentApiData.deletedBy;
    }
    // --- Akhir Logika Perbedaan ---

    // Menggunakan nama properti CamelCase untuk payload JSON (sesuai API DTO)
    const finalPayload = {
        matrixContractID: matrixContractID,
        code: updates.code ?? currentApiData.code,
        label: updates.label ?? currentApiData.label,
        description: updates.description === undefined ? currentApiData.description : updates.description,
        orderNo: updates.order ?? currentApiData.orderNo,
        
        isSoftDelete: isSoftDeleteValue,
        isActive: isActiveValue, 
        updatedBy: currentUserId,
        
        // PASTIKAN JIKA NULL, KITA KIRIM NULL
        deletedAt: deletedAtValue, 
        deletedBy: deletedByValue,
    };
    
    // ... (Logika fetch API tetap sama) ...
    try {
        const response = await fetch(`${CONDITION_ENDPOINT}/${matrixContractID}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(finalPayload),
        });

        // ... (Penanganan response) ...
    } catch (error) {
        // ... (Penanganan error) ...
    }
}

export async function reorderMatrixConditionsApi(conditionIds: string[], currentUserId: string): Promise<void> {
    
    const orderItems = conditionIds.map((idString, index) => ({
        MatrixContractID: parseInt(idString),
        OrderNo: index + 1, // Urutan baru (1, 2, 3, ...)
    }));
    
    const finalPayload: MatrixConditionReorderPayload = {
        orderItems: orderItems, // Asumsi MatrixConditionReorderPayload sudah diupdate
        UpdatedBy: currentUserId, 
    };

    try {
        const response = await fetch(REORDER_ENDPOINT, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(finalPayload),
        });

        if (response.ok && response.status === 200) {
            return;
        } else {
            const errorData = await response.json();
            const errorMessage = errorData.detail || errorData.title || `Error ${response.status}: Failed to reorder conditions.`;
            console.error('API Error Response:', errorData);
            throw new Error(errorMessage);
        }
    } catch (error) {
        console.error('Error during reorder:', error);
        throw new Error('Server connection or unidentified error during reorder.');
    }
}

export async function getMatrixConditionById(id: string): Promise<MatrixConditionApiData> {
    const matrixContractID = parseInt(id);
    try {
        const response = await fetch(`${CONDITION_ENDPOINT}/${matrixContractID}`);

        if (response.ok) {
            const apiData: MatrixConditionApiData = await response.json();
            return apiData;
        } else {
            const errorData = await response.json();
            const errorMessage = errorData.detail || errorData.title || `Error ${response.status}: Failed to fetch condition ID ${id}.`;
            throw new Error(errorMessage);
        }
    } catch (err) {
        console.error('Network or unknown error during fetch by ID:', err);
        throw new Error('Failed to connect to server or unknown error.');
    }
}