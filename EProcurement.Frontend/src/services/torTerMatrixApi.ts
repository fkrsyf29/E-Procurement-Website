// src/services/torTerMatrixApi.ts

import { MatrixAssignmentDto, MatrixSaveRequest } from '../types/torTerMatrixTypes';

const API_BASE = import.meta.env.VITE_API_BASE_URL;

export async function fetchMatrixBySubId(subClassificationId: number): Promise<MatrixAssignmentDto[]> {
    const response = await fetch(`${API_BASE}/TorTerMatrix/SubClassification/${subClassificationId}`);
    if (!response.ok) throw new Error('Failed to fetch matrix configuration');
    return response.json();
}

export async function saveMatrixApi(data: MatrixSaveRequest) {
    const response = await fetch(`${API_BASE}/TorTerMatrix`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    });
    if (!response.ok) throw new Error('Failed to save matrix configuration');
    return response.json();
}