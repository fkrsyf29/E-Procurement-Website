// src/services/approvalMatrixApi.ts

import { toast } from 'sonner';
import { ApprovalMatrixDto, ApprovalMatrixSaveRequest } from '../types/approvalMatrixTypes';

const API_BASE = import.meta.env.VITE_API_BASE_URL;

if (!API_BASE) {
    console.error("VITE_API_BASE_URL is not defined!");
}

// GET ALL
export async function fetchApprovalMatrices(): Promise<ApprovalMatrixDto[]> {
    try {
        const response = await fetch(`${API_BASE}/ApprovalMatrix`);
        if (response.ok) {
            return await response.json();
        } else {
            toast.error('Gagal mengambil data Approval Matrix');
            return [];
        }
    } catch (error) {
        console.error(error);
        toast.error('Koneksi server error');
        return [];
    }
}

// SAVE (CREATE / UPDATE)
export async function saveApprovalMatrix(data: ApprovalMatrixSaveRequest) {
    try {
        const response = await fetch(`${API_BASE}/ApprovalMatrix`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.detail || errorData.message || 'Gagal menyimpan data');
        }
        return await response.json();
    } catch (error) {
        console.error(error);
        throw error; // Lempar error agar bisa ditangkap di Component
    }
}

// DELETE
export async function deleteApprovalMatrix(id: number) {
    try {
        const response = await fetch(`${API_BASE}/ApprovalMatrix/${id}`, {
            method: 'DELETE'
        });

        if (!response.ok) {
            throw new Error('Gagal menghapus data');
        }
        return await response.json();
    } catch (error) {
        console.error(error);
        throw error;
    }
}