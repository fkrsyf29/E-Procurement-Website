export interface Permission { 
    id: string; 
    label: string; 
    category: string 
}

export interface PermissionFromApi {
  permissionID: number;
  code: string;
  name: string;
  description: string | null;
  permissionCategoryID: number;
  category: string;
  isActive: boolean;
  createdAt: string;
  createdBy: string;
  updatedAt: string | null;
  updatedBy: string | null;
  deletedAt: string | null;
  deletedBy: string | null;
}
