export interface SubClassificationDto {
    subClassificationID: number;
    classificationID: number;
    code: string;
    name: string;
    isActive: boolean;
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