// src/services/categoryApi.ts

import { CategoryDto } from '../types/categoryTypes';

const API_BASE = import.meta.env.VITE_API_BASE_URL;

// --- FETCH ---
export async function fetchCategoryHierarchy(): Promise<CategoryDto[]> {
    const response = await fetch(`${API_BASE}/CategoryManagement/Hierarchy`);
    if (!response.ok) throw new Error('Failed to fetch category hierarchy');
    return response.json();
}

// --- CATEGORY ---
export async function createCategoryApi(data: { code: string, name: string, user: string }) {
    const response = await fetch(`${API_BASE}/CategoryManagement/Category`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    });
    if (!response.ok) throw new Error('Failed to create category');
    return response.json();
}

export async function updateCategoryApi(id: number, data: any) { // data includes isActive, isDeleted etc
    const response = await fetch(`${API_BASE}/CategoryManagement/Category/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    });
    if (!response.ok) throw new Error('Failed to update category');
    return response.json();
}

// --- CLASSIFICATION ---
export async function createClassificationApi(data: { categoryID: number, code: string, name: string, user: string }) {
    const response = await fetch(`${API_BASE}/CategoryManagement/Classification`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    });
    if (!response.ok) throw new Error('Failed to create classification');
    return response.json();
}

export async function updateClassificationApi(id: number, data: any) {
    const response = await fetch(`${API_BASE}/CategoryManagement/Classification/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    });
    if (!response.ok) throw new Error('Failed to update classification');
    return response.json();
}

// --- SUBCLASSIFICATION ---
export async function createSubClassificationApi(data: { classificationID: number, code: string, name: string, user: string }) {
    const response = await fetch(`${API_BASE}/CategoryManagement/SubClassification`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    });
    if (!response.ok) throw new Error('Failed to create sub-classification');
    return response.json();
}

export async function updateSubClassificationApi(id: number, data: any) {
    const response = await fetch(`${API_BASE}/CategoryManagement/SubClassification/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    });
    if (!response.ok) throw new Error('Failed to update sub-classification');
    return response.json();
}