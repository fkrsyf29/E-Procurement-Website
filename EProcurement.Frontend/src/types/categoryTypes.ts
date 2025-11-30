// src/types/categoryTypes.ts

export interface SubClassificationDto {
    subClassificationID: number;
    classificationID: number;
    code: string;
    name: string;
    isActive: boolean;
    hasTor: boolean;
    hasTer: boolean;
}

export interface ClassificationDto {
    classificationID: number;
    categoryID: number;
    code: string;
    name: string;
    isActive: boolean;
    subClassifications: SubClassificationDto[];
}

export interface CategoryDto {
    categoryID: number;
    code: string;
    name: string;
    isActive: boolean;
    classifications: ClassificationDto[];
}