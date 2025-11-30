// src/types/torTerMatrixTypes.ts

export interface MatrixAssignmentDto {
    assignmentID: number;
    subClassificationID: number;
    itemDefinitionID: number;
    itemCode: string;
    itemCategory: 'tor' | 'ter';
    
    defaultParameter?: string;
    defaultRequirement?: string;
    defaultDescription?: string;
}

export interface MatrixSaveRequestItem {
    itemDefinitionID: number;
    defaultParameter?: string;
    defaultRequirement?: string;
    defaultDescription?: string;
}

export interface MatrixSaveRequest {
    subClassificationID: number;
    items: MatrixSaveRequestItem[];
    createdBy: string;
}