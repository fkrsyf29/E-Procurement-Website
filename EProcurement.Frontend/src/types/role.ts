// src/types/role.ts
export interface ApiRole {
  roleID: number;
  code: string;
  name: string;
  description: string;
  category: string;
  approvalRole: string | null;
  canApprove: boolean;
  canCreate: boolean;
  canView: boolean;
  isActive: boolean;
  isSystemGenerated: boolean;
  permissionId: number[];
  permission: string[];
  createdAt: string;
  createdBy: string;
  updatedAt: string | null;
  updatedBy: string | null;
  deletedAt: string | null;
  deletedBy: string | null;
}

export interface RoleDefinition {
  id: string;
  name: string;
  description: string;
  permissions: string[];
  canApprove: boolean;
  canCreate: boolean;
  canView: boolean;
  category: 'System' | 'Approval' | 'Sourcing' | 'Custom';
  isActive: boolean;
  isSystemGenerated: boolean; // True for auto-generated roles, false for custom roles
  createdDate: string;
  updatedDate?: string;
  relatedApprovalRole?: string; // Maps to ApprovalRole in approval matrix
}
