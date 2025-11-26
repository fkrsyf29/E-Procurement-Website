export interface ReferenceDataItem {
  id: string;
  value: string;
  abbreviation?: string; // Optional abbreviation for auto-generation (e.g., jobsite codes)
  description?: string; // Optional description (e.g., for KBLI, Material Group)
  isActive: boolean;
  order: number;
  createdAt: string;
  updatedAt: string;
}

export interface ReferenceDataCategory {
  code: string;
  name: string;
  description: string;
  items: ReferenceDataItem[];
}