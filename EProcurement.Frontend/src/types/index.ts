// src/types/index.ts

// ==========================================
// 1. USER, AUTH & ROLES ENUMS
// ==========================================

export type UserRole =
  | 'Administrator'
  | 'Creator Plant Department JAHO'
  | 'Unit Head Plant Department JAHO'
  | 'Section Head Plant Department JAHO'
  | 'Department Head Plant Department JAHO'
  | 'Plant Division Head'
  | 'Plant Director'
  | 'President Director'
  | 'Sourcing Department Head'
  | 'Procurement Division Head'
  | 'Buyer'
  | 'Planner'
  | 'Sourcing'
  // Tambahan Generic Roles untuk Testing
  | 'Staff / Creator'
  | 'Manager Site'
  | 'Buyer Site'
  | 'Sourcing Staff'
  | 'Manager'
  | 'Staff';

export interface User {
  userID: string;
  username: string;
  password?: string;
  name: string;
  roleName: string; // String agar fleksibel menerima role custom dari DB
  
  // Support object dari mock atau struktur API
  jobsite?: Jobsites | { jobsiteID: string; code: string; name: string; isActive: boolean } | any;
  department?: Departments | { departmentID: string; code: string; name: string; isActive: boolean } | any;
  
  email?: string;
  phone?: string;
  lastPasswordChange?: string;
  passwordResetToken?: string;
  passwordResetExpiry?: string;
  token?: string;

  // ✅ FIELD BARU: List Permission untuk Logic UI
  permissions: string[]; 
}

// Interface untuk response API User (Raw)
export interface apiUser {
  userID: number;
  username: string;
  password?: string;
  name: string;
  roleName: string;
  jobsite: string | null;
  department: string | null;
  email: string | null;
  phone: string | null;
  lastPasswordChange: string;
  createdAt: string;
  createdBy: string | null;
  updatedAt: string | null;
  updatedBy: string | null;
  deletedAt: string | null;
  deletedBy: string | null;
  
  permissions?: string[]; 
}

// ==========================================
// 2. MASTER DATA TYPES
// ==========================================

export interface Jobsites {
  jobsiteID: string;
  code: string;
  name: string;
  isActive: boolean;
  createdAt?: string;
  createdBy?: string;
}

export interface Departments {
  departmentID: string;
  code: string;
  name: string;
  isActive: boolean;
  createdAt?: string;
  createdBy?: string;
}

export interface Regions {
  regionID: string;
  name: string;
  description: string;
  isActive: boolean;
  createdAt: string;
  createdBy: string;
}

export interface ApprovalRoles {
  approvalRoleID: string;
  code: string;
  name: string;
  isActive: boolean;
  createdAt: string;
  createdBy: string;
}

export interface RoleCategories {
  roleCategoryID: string;
  code: string;
  name: string;
  isActive: boolean;
  createdAt: string;
  createdBy: string;
}

export interface PermissionCategories {
  permissionCategoryID: string;
  code: string;
  name: string;
  isActive: boolean;
  createdAt: string;
  createdBy: string;
}

export interface Permission {
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

// ==========================================
// 3. ROLE MANAGEMENT TYPES
// ==========================================

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
  code: string;
  name: string;
  description: string;
  permissions: string[];
  canApprove: boolean;
  canCreate: boolean;
  canView: boolean;
  category: RoleCategories;
  isActive: boolean;
  isSystemGenerated: boolean;
  createdDate: string;
  updatedDate?: string;
  relatedApprovalRole?: string;
}

export const mapApiRoleToDefinition = (apiRole: any): RoleDefinition => ({
  id: apiRole.roleID,
  code: apiRole.code,
  name: apiRole.name,
  description: apiRole.description ?? '',
  permissions: apiRole.permission ?? [],
  canApprove: apiRole.canApprove ?? false,
  canCreate: apiRole.canCreate ?? false,
  canView: apiRole.canView ?? true,
  category: (apiRole.category ?? 'Custom') as RoleDefinition['category'],
  isActive: apiRole.isActive ?? true,
  isSystemGenerated: apiRole.isSystemGenerated ?? false,
  createdDate: apiRole.createdAt
    ? apiRole.createdAt.split('T')[0]
    : new Date().toISOString().split('T')[0],
  updatedDate: apiRole.updatedAt
    ? apiRole.updatedAt.split('T')[0]
    : undefined,
  relatedApprovalRole: apiRole.approvalRole ?? undefined,
});

// ==========================================
// 4. PROPOSAL & WORKFLOW TYPES (UPDATED)
// ==========================================

export type ProposalStatus =
  | 'Draft'
  | 'In Progress' // Status universal dari BE
  | 'On Verification' // Legacy support
  | 'On Review 1'
  | 'On Review 2'
  | 'On Approval 1'
  | 'On Approval 2'
  | 'On Sourcing Approval'
  | 'On Procurement Approval'
  | 'On Unit Head Approval'
  | 'On Section Head Approval'
  | 'On Department Head Approval'
  | 'On Manager Approval'
  | 'On Division Head Approval'
  | 'On Chief Operation Approval'
  | 'On Director Approval'
  | 'On President Director Approval'
  | 'Approved'
  | 'Rejected'
  | 'Cancelled';

export interface Proposal {
  id: string;
  proposalNo: string;
  title: string;
  amount: number;
  status: ProposalStatus;
  
  // Classification
  category: string;
  classification: string;
  subClassification: string;
  
  // Details
  description?: string; // Procurement Objective
  scopeOfWork?: string;
  analysis?: string;
  
  // Master Data Relations 
  // (Mapped dari String Backend ke Object di Frontend Service)
  jobsite: Jobsites; 
  department: Departments;
  workLocation?: string;
  
  // Creator Info
  creator: string;
  creatorId: string;
  createdDate: string;
  
  // Workflow Info (New from Backend)
  currentStepName?: string; 
  requiredRoleName?: string;
  currentApprover?: string; // Legacy field support
  
  // Complex Data
  budgetItems: BudgetItem[];
  torItems?: TORItem[];
  terItems?: TERItem[];
  history: ApprovalHistory[];
  
  // Sourcing Status
  vendorConfirmationStatus?: 'Pending' | 'Confirmed' | 'Additional Requested' | 'Completed';
  vendorsConfirmedBy?: string;
  vendorsConfirmedDate?: string;
  vendorsCompletedBy?: string;
  vendorsCompletedDate?: string;
  
  // Vendor Data (Sourcing Result)
  recommendedVendors?: AddedVendorDetail[];
  additionalVendors?: AddedVendorDetail[];
  vendorRecommendation?: VendorRecommendation; // Full object linkage
  
  // Legacy / Form Fields (Optional/Temporary)
  vendorList?: string[];
  contractType?: string; // 'Contractual' / 'Non-Contractual'
  contractualType?: string;
  contractPeriod?: string;
  fundingBudget?: boolean;
  fundingNonBudget?: boolean;
  penalty?: string;
  contractTermination?: string;
  regulations?: string;
  attachments?: string[];
  
  // Form Logic Helpers
  subClassifications?: any[]; 
  categories?: any[];
  classifications?: any[];
  kbliCodes?: string[];
  brandSpecifications?: string[];
  isTransactionValueExceeded?: boolean;
  isDurationExceeded?: boolean;
  durationMonths?: number;
  matrixConditions?: Record<string, boolean>;
  vendorRequestSubmitted?: boolean;
  
  // Legacy pointers
  creatorJobsite?: Jobsites;
  creatorDepartment?: Departments;
  creatorGroup?: string;
}

export interface ApprovalHistory {
  id?: string;
  stage?: string;     // Mapped from StepName
  approver?: string;  // Mapped from ActorName
  roleName?: string;  // Mapped from RoleName
  action?: string;    // 'Approved', 'Rejected', 'Created'
  comment?: string;
  date?: string;      // ActionDate
  
  // Legacy support
  by?: string;
  comments?: string;
}

export interface BudgetItem {
  id: string;
  materialId?: string;
  materialCode?: string;
  materialDescription: string;
  qty: number;
  estimatedPrice: number;
  totalPrice: number;
  uom: string;
  currency: string;
  
  // Fields for Material Master sync / Form
  description?: string;
  unit?: string;
  brand?: string;
  quantity?: number;
  unitPrice?: number;
  subClassification?: string;
  plant?: string;
  contractType?: string;
  contractNo?: string;
  contractName?: string;
  unique?: 'Yes' | 'No';
  placeholderQty?: number;
  placeholderPrice?: number;
  placeholderUnique?: 'Yes' | 'No';
}

export interface TORItem {
  id: string;
  label: string;
  enabled: boolean;
  parameter: string;
  requirement: string;
  description: string;
  remarks: string;
}

export interface TERItem extends TORItem {
  uploadedFile?: string;
}

export interface ApprovalStep {
  stepNumber: number;
  stepName: string;
  roleName: ApprovalRoles;
}

export interface ApprovalMatrix {
  id: string;
  department: Departments;
  jobsite: Jobsites;
  amountMin: number;
  amountMax: number | null;
  group: string;
  approvalPath: ApprovalStep[];
  createdDate: string;
  updatedDate?: string;
}

// ==========================================
// 5. SOURCING & VENDOR RECOMMENDATION
// ==========================================

export type VendorRecommendationStatus =
  | 'Pending'
  | 'In Progress'
  | 'Waiting Dept Head Approval'
  | 'Waiting Division Head Approval'
  | 'Under Planner Review'
  | 'Under Buyer Review'
  | 'Revision Required'
  | 'Accepted'
  | 'Revised'
  | 'Completed'
  | 'Rejected';

export interface AddedVendorDetail {
  vendorName: string;
  contactPerson?: string;
  phoneNumber?: string;
  email?: string;
}

export interface VendorRecommendation {
  id: string;
  proposalId: string;
  proposalNo: string;
  proposalTitle: string;
  
  status: VendorRecommendationStatus;
  
  requestedBy: string;
  requestedByName: string;
  requestedByRole: string;
  requestDate: string;
  reason?: string;
  
  // Context
  estimatedCost: number;
  jobsite?: any; // String name or object
  department?: any; // String name or object
  category?: string;
  classification?: string;
  subClassification?: string;

  // Sourcing Execution
  assignedTo?: string;
  assignedToName?: string;
  sourcingNotes?: string;
  startedDate?: string;
  submittedForApprovalDate?: string;
  
  // Vendors
  recommendedVendors?: AddedVendorDetail[];
  addedVendors?: string[]; // Legacy string array
  addedVendorsDetails?: AddedVendorDetail[];
  
  // Documents
  supportingDocuments?: Array<{
    name: string;
    size: number;
    type: string;
    uploadDate: string;
  }>;
  
  // Approvals
  deptHeadApprovedBy?: string;
  deptHeadApprovedByName?: string;
  deptHeadApprovedDate?: string;
  deptHeadComments?: string;
  
  divHeadApprovedBy?: string;
  divHeadApprovedByName?: string;
  divHeadApprovedDate?: string;
  divHeadComments?: string;
  
  // Reviews
  plannerReviewedByName?: string;
  plannerReviewedBy?: string;
  plannerReviewDate?: string;
  plannerDecision?: string;
  plannerComments?: string;
  
  buyerReviewedByName?: string;
  buyerReviewedBy?: string;
  buyerReviewDate?: string;
  buyerDecision?: string;
  buyerComments?: string;
  
  completedDate?: string;
  revisionCount?: number;
  revisionHistory?: RevisionHistoryItem[];
}

export interface RevisionHistoryItem {
  revisionNumber: number;
  requestedBy: string;
  requestedByName: string;
  requestedDate: string;
  reason: string;
  resolvedBy?: string;
  resolvedByName?: string;
  resolvedDate?: string;
  resolution?: string;
}

// Aliases
export type VendorRequest = VendorRecommendation;
export type VendorRequestStatus = VendorRecommendationStatus;

// ==========================================
// 6. VENDOR DATABASE
// ==========================================

export interface SubClassificationObj {
  subClassificationID: number;
  subClassificationCode: string | null;
  subClassificationName: string | null;
  classificationName: string | null;
  categoryName: string | null;
}

export interface KbliObj {
  kbliId: string;
  description: string | null;
  code: string | null;
}

export interface BrandObj {
  externalBrandID: number;
  brandName: string | null;
}

export interface VendorCapability {
  subClassifications: SubClassificationObj[];
  kbliCodes: KbliObj[];
  brands: BrandObj[];
}

export interface VendorRecord {
  vendorId: number;
  externalVendorId: string;
  vendorCode: string;
  vendorName: string;
  
  contactPerson: string | null;
  phoneNumber: string | null;
  email: string | null;
  address: string | null;
  website: string | null;
  
  rating: number | null;
  isActive: boolean;
  isPreferred: boolean;
  
  companySize: string | null;
  yearEstablished: number | null;
  npwp: string | null;
  siup: string | null;
  creditLimit: number | null;
  paymentTerms: string | null;
  notes: string | null;
  
  createdAt: string;
  updatedAt: string;
  
  capabilities: VendorCapability;
}

// ==========================================
// 7. MATERIAL MANAGEMENT
// ==========================================

export interface Material {
  id: string;
  material: string;
  materialCode?: string; // Backend field
  materialDescription: string;
  description?: string; // Backend field
  baseUnitOfMeasure: string;
  
  // Master IDs
  uomId?: number;
  uomName?: string;
  externalBrandId?: number | null;
  externalBrandName?: string;
  valuationClassId?: number | null;
  valuationClassName?: string;
  materialGroupId?: number | null;
  materialGroupName?: string;
  materialGroupDesc?: string;
  subClassificationId?: number | null;
  subClassificationName?: string;
  jobsiteId?: number;
  jobsiteName?: string;
  departmentId?: number;
  departmentName?: string;
  
  // Legacy fields
  extMaterialGroup: string;
  valuationClass: string;
  materialGroup: string;
  materialGroupDescription: string;
  subClassification: string;
  jobsite: string;
  plant: string;
  createdDate: string;
  updatedDate?: string;
  
  qty?: number;
  estimatedPrice?: number;
  contractType?: 'Contractual' | 'Non-Contractual';
  contractTypeId?: number | null;
  contractTypeName?: string;
  vendorId?: number;
  vendorName?: string;
  contractNumber?: string;
  contractName?: string;
  contractStartDate?: string;
  contractEndDate?: string;
  unique?: 'Yes' | 'No';
  isUnique?: boolean;
  isActive?: boolean;
  createdBy?: string;
  updatedBy?: string;
  
  company?: string;
}

export interface ProposalMaterialItem {
  materialId: string;
  material: string;
  materialDescription: string;
  uom: string;
  extMaterialGroup: string;
  quantity: number;
  estimatedUnitPrice?: number;
  estimatedTotalPrice?: number;
  remarks?: string;
}