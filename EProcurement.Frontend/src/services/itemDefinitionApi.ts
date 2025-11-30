// src/services/itemDefinitionApi.ts

import { toast } from 'sonner';
import {
    ItemDefinition,
    ItemDefinitionApiData,
    ItemDefinitionCreatePayload,
    ItemDefinitionUpdatePayload,
    ItemDefinitionReorderPayload,
    mapApiItemToDefinition,
    ItemCategory,
} from '../types/itemDefinitionTypes';

const API_BASE = import.meta.env.VITE_API_BASE_URL;

if (!API_BASE) {
    console.error("VITE_API_BASE_URL is not defined in environment variables!");
}

const ITEM_ENDPOINT = `${API_BASE}/ItemDefinition`;
const REORDER_ENDPOINT = `${API_BASE}/ItemDefinition/Reorder`;

// --- Fetch All Definitions ---
export async function fetchAllItemDefinitions(): Promise<ItemDefinition[]> {
    try {
        const response = await fetch(ITEM_ENDPOINT);

        if (response.ok) {
            const apiData: ItemDefinitionApiData[] = await response.json();
            // Sorting dilakukan oleh BE, tapi kita sort lagi di FE untuk amannya
            apiData.sort((a, b) => a.order - b.order);
            return apiData.map(mapApiItemToDefinition);
        } else {
            const errorData = await response.json();
            throw new Error(errorData.detail || errorData.title || `Failed to fetch definitions.`);
        }
    } catch (err) {
        console.error('API Error:', err);
        toast.error('Gagal mengambil data definisi item.');
        return [];
    }
}

// --- Create New Definition ---
export async function createItemDefinition(
    input: { 
        code: string, 
        label: string, 
        category: ItemCategory, 
        order: number, 
        isActive: boolean, 
        validationSource?: string | null 
    },
    currentUserId: string
): Promise<ItemDefinition> {

    const finalPayload: ItemDefinitionCreatePayload = {
        code: input.code,
        label: input.label,
        category: input.category.toUpperCase(), // Kirim UPPERCASE ke DB
        order: input.order,
        isActive: input.isActive,
        validationSource: input.validationSource || null,
        createdBy: currentUserId,
    };

    try {
        const response = await fetch(ITEM_ENDPOINT, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(finalPayload),
        });

        const responseData = await response.json();
        const actualApiData = responseData.data || responseData;

        if (response.ok && (response.status === 201 || response.status === 200)) {
            toast.success('Item definition created successfully.');
            return mapApiItemToDefinition(actualApiData as ItemDefinitionApiData);
        } else {
            throw new Error(actualApiData.detail || actualApiData.title || `Failed to create item.`);
        }
    } catch (error) {
        console.error('Error creating item:', error);
        throw error;
    }
}

// --- Update Existing Definition ---
export async function updateItemDefinition(
    id: string,
    updates: { code?: string, label?: string, isActive?: boolean, validationSource?: string | null },
    currentApiData: ItemDefinitionApiData,
    currentUserId: string,
    isDeleted: boolean
): Promise<ItemDefinition> {

    const itemDefinitionID = parseInt(id);

    // Payload lengkap yang dibutuhkan oleh PUT endpoint
    const finalPayload: ItemDefinitionUpdatePayload = {
        itemDefinitionID: itemDefinitionID,
        code: updates.code ?? currentApiData.code,
        label: updates.label ?? currentApiData.label,
        category: currentApiData.category,
        order: currentApiData.order,
        isActive: updates.isActive ?? currentApiData.isActive,
        validationSource: updates.validationSource === undefined ? currentApiData.validationSource : updates.validationSource,
        updatedBy: currentUserId,


        isDeleted: isDeleted,
        deletedBy: isDeleted ? currentUserId : null,
    };

    try {
        const response = await fetch(`${ITEM_ENDPOINT}/${itemDefinitionID}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(finalPayload),
        });

        const responseData = await response.json();
        const actualApiData = responseData.data || responseData;

        if (response.ok && response.status === 200) {
            if (!actualApiData || !actualApiData.itemDefinitionID) {
                throw new Error(`Item updated successfully, but failed to retrieve final data from API.`);
            }

            if (isDeleted) {
                toast.success('Item definition deleted successfully.');
            }
            else {
                toast.success('Item definition updated successfully.');
            }
            return mapApiItemToDefinition(actualApiData as ItemDefinitionApiData);
        } else {
            throw new Error(actualApiData.detail || actualApiData.title || `Failed to update item.`);
        }
    } catch (error) {
        console.error('Error updating item:', error);
        throw error;
    }
}

export async function deleteItemDefinition(id: string): Promise<void> {
    try {
        const currentApiData = await getItemDefinitionById(id);

        const updates = { isActive: false };

        await updateItemDefinition(id, updates, currentApiData, "SYSTEM_DELETER");

    } catch (error) {
        console.error('Error in deleteItemDefinition proxy:', error);
        throw error;
    }
}

// --- Reorder Definitions ---
export async function reorderItemDefinitions(definitions: ItemDefinition[], currentUserId: string): Promise<void> {
    const orderItems: ItemDefinitionReorderPayload['orderItems'] = definitions.map((item, index) => ({
        itemDefinitionID: parseInt(item.id),
        orderNo: index + 1,
    }));

    const finalPayload: ItemDefinitionReorderPayload = {
        orderItems: orderItems,
        updatedBy: currentUserId,
    };

    try {
        const response = await fetch(REORDER_ENDPOINT, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(finalPayload),
        });

        if (response.ok && response.status === 200) {
            toast.success('Order updated successfully');
            return;
        } else {
            const errorData = await response.json();
            throw new Error(errorData.detail || errorData.title || `Failed to reorder items.`);
        }
    } catch (error) {
        console.error('Error reordering items:', error);
        throw error;
    }
}

// --- Helper untuk mendapatkan data API lama
export async function getItemDefinitionById(id: string): Promise<ItemDefinitionApiData> {
    const itemDefinitionID = parseInt(id);
    const response = await fetch(`${ITEM_ENDPOINT}/${itemDefinitionID}`);
    if (!response.ok) throw new Error("Failed to fetch current item data.");
    return (await response.json()) as ItemDefinitionApiData;
}