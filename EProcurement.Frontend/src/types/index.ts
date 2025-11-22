// ./types/index.ts

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
  | 'Sourcing';

export type ProposalStatus =
  | 'Draft'
  | 'On Verification'
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
  | 'Rejected';

// export type Jobsite = 
//   | 'ADMO MINING'
//   | 'ADMO HAULING'
//   | 'SERA'
//   | 'MACO MINING'
//   | 'MACO HAULING'
//   | 'JAHO'
//   | 'NARO';

// export type Department =
//   | 'Plant'
//   | 'Logistic'
//   | 'HR'
//   | 'GA'
//   | 'SHE'
//   | 'Finance'
//   | 'Production'
//   | 'Engineering'
//   | 'IT';

export interface User {
  userID: string;
  username: string;
  password: string;
  name: string;
  roleName: UserRole;
  jobsite?: Jobsites;
  department?: Departments;
  email?: string;
  phone?: string;
  lastPasswordChange?: string;
  passwordResetToken?: string;
  passwordResetExpiry?: string;
}

export interface Proposal {
  id: string;
  proposalNo: string;
  title: string;
  description?: string; // Procurement objective
  category: string;
  classification: string;
  subClassification: string;
  categories?: Array<{ code: string; name: string }>; // Full category objects with codes
  classifications?: Array<{ code: string; name: string }>; // Full classification objects with codes
  subClassifications?: Array<{ code: string; name: string }>; // For multiple sub-classifications
  tor: string;
  ter: string;
  vendorList: string[];
  jobsite: Jobsites; // Procurement jobsite (where the work will be done)
  department: Departments;
  workLocation?: string;
  creator: string;
  creatorId: string;
  creatorJobsite?: Jobsites; // Creator's jobsite - used for approval routing
  creatorDepartment?: Departments; // Creator's department - used for approval routing
  creatorGroup?: string; // e.g., "Creator plant Development"
  amount: number;
  estimatedCost?: number; // Same as amount, for display purposes
  transactionValue?: number; // Rounded amount for contract evaluation
  createdDate: string;
  status: ProposalStatus;
  currentApprover?: string;
  approvalMatrixId?: string; // Reference to the approval matrix used
  approvalPath?: ApprovalStep[]; // Dynamic approval path determined by matrix
  currentStep?: number; // Current step in the approval path
  history: ApprovalHistory[];
  comments?: string;

  // Extended fields from ProposalForm
  scopeOfWork?: string;
  analysis?: string;
  fundingBudget?: boolean;
  fundingNonBudget?: boolean;
  contractType?: 'Contractual' | 'Non-Contractual';
  contractualType?: string;
  contractPeriod?: string;
  penalty?: string;
  contractTermination?: string;
  regulations?: string;
  attachments?: string[]; // File paths or URLs

  // Matrix conditions for contract type determination (dynamic)
  matrixConditions?: Record<string, boolean>; // Dynamic key-value pairs for matrix conditions
  isTransactionValueExceeded?: boolean; // Auto-checked when Estimated Cost > USD 200,000
  isDurationExceeded?: boolean; // Auto-checked when Duration > 6 months
  durationMonths?: number; // Duration in months for service items

  // Legacy matrix conditions (for backward compatibility with existing proposals)
  matrixValueAbove200k?: boolean;
  matrixDurationAbove6Months?: boolean;
  matrixLongTermAgreement?: boolean;
  matrixRiskAbove1?: boolean;

  // Detailed TOR/TER items
  torItems?: TORItem[];
  terItems?: TERItem[];

  // Vendor recommendation workflow
  vendorConfirmationStatus?: 'Pending' | 'Confirmed' | 'Additional Requested' | 'Completed';
  vendorRequestSubmitted?: boolean;
  vendorRequestId?: string; // Reference to VendorRecommendation
  vendorsConfirmedBy?: string; // User who confirmed vendors are sufficient
  vendorsConfirmedDate?: string;
  vendorsCompletedBy?: string; // User who marked as completed after additional vendors
  vendorsCompletedDate?: string;

  // ✅ Vendor data from VendorRecommendation (copied when accepted)
  recommendedVendors?: AddedVendorDetail[]; // Auto-fetched vendors based on sub-classification
  additionalVendors?: AddedVendorDetail[]; // Manually added vendors by Sourcing team
  vendorRecommendation?: VendorRecommendation; // Full vendor recommendation object for approval tracking

  // Budget Items
  budgetItems?: BudgetItem[]; // Selected materials with qty and estimated price

  // TOR Specifications for Vendor Matching (NEW - Nov 12, 2025)
  kbliCodes?: string[]; // Multiple KBLI codes from TOR
  brandSpecifications?: string[]; // Multiple brands from TOR

  approvers?: string
}

export interface ApprovalHistory {
  id?: string;
  stage?: string;
  approver?: string;
  by?: string; // Alternative to approver
  roleName?: string | UserRole;
  action?: 'Approved' | 'Rejected' | 'Pending' | 'Created' | 'Submitted';
  comment?: string;
  comments?: string; // Alternative to comment
  date?: string;
}

// TOR/TER Item structures
export interface TORItem {
  id: string;
  label: string;
  enabled: boolean;
  parameter: string;
  requirement: string;
  description: string;
  remarks: string;
}

export interface TERItem {
  id: string;
  label: string;
  enabled: boolean;
  parameter: string;
  requirement: string;
  description: string;
  remarks: string;
  uploadedFile?: string; // File path or URL
}

// Budget Item for Proposal
export interface BudgetItem {
  id: string;
  materialId: string; // Reference to Material
  materialCode: string;
  materialDescription: string;
  description?: string; // Alternative to materialDescription
  uom: string;
  unit?: string; // Alternative to uom
  brand: string;
  qty: number;
  quantity?: number; // Alternative to qty
  estimatedPrice: number;
  unitPrice?: number; // Alternative to estimatedPrice
  totalPrice?: number; // Calculated field
  subClassification: string;
  plant?: string; // Plant from material
  currency?: string; // Currency (default USD)
  contractType?: string; // Contractual or Non-Contractual
  contractNo?: string; // Contract number if applicable
  contractName?: string; // Contract name if applicable
  unique?: 'Yes' | 'No'; // ✅ NEW: Unique field (Nov 13, 2025)
  // ✅ NEW: Placeholders for guide text from Materials Management (Nov 12, 2025)
  placeholderQty?: number; // Guide qty from Materials Management
  placeholderPrice?: number; // Guide price from Materials Management
  placeholderUnique?: 'Yes' | 'No'; // ✅ NEW: Guide unique from Materials Management (Nov 13, 2025)
}

// Approval Matrix Types
// export type ApprovalRole =
//   | 'UH User'
//   | 'SH User'
//   | 'Manager Site'
//   | 'DH User'
//   | 'DIV User'
//   | 'Chief Operation Site'
//   | 'Dir User'
//   | 'President Director'
//   | 'Chief Operational Site';

export interface ApprovalStep {
  stepNumber: number;
  stepName: string; // e.g., "Verificator", "Viewer 1", "Viewer 2", "Approval 1", "Approval 2"
  roleName: ApprovalRoles;
}

export interface ApprovalMatrix {
  id: string;
  department: Departments;
  jobsite: Jobsites;
  amountMin: number;
  amountMax: number | null; // null means infinity
  group: string; // e.g., "Creator plant Development"
  approvalPath: ApprovalStep[];
  createdDate: string;
  updatedDate?: string;
}

// Vendor Recommendation Types (formerly Vendor Request)
export type VendorRecommendationStatus =
  | 'Pending'                        // Initial state - waiting for Sourcing to start
  | 'In Progress'                    // Sourcing is working on it
  | 'Waiting Dept Head Approval'     // Submitted to Sourcing Dept Head
  | 'Waiting Division Head Approval' // Approved by Dept Head, waiting for Div Head
  | 'Under Planner Review'           // Approved by both, sent to Planner
  | 'Under Buyer Review'             // Planner approved, sent to Buyer
  | 'Revision Required'              // Dept/Div Head rejected, needs revision
  | 'Accepted'                       // Buyer/Planner accepted vendor recommendation
  | 'Revised'                        // Buyer/Planner requested revision
  | 'Completed'                      // Both Planner & Buyer approved (legacy status)
  | 'Rejected';                      // Permanently rejected

// Added Vendor Details Interface (Updated: Contact Person instead of Address/NPWP/Status)
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
  requestedBy: string;           // User ID who requested (Planner/Buyer)
  requestedByName: string;       // User name who requested
  requestedByRole: string;       // Role: Planner or Buyer
  requestDate: string;
  status: VendorRecommendationStatus;
  category: string;
  classification: string;
  subClassification: string;
  estimatedCost: number;
  jobsite: Jobsite;
  department: Department;
  reason?: string;               // Why additional vendors needed

  // Sourcing work
  assignedTo?: string;           // Sourcing team member assigned
  assignedToName?: string;
  startedDate?: string;
  recommendedVendors?: AddedVendorDetail[];  // AUTO-FETCHED: System-recommended vendors from database
  addedVendors?: string[];       // LEGACY: New vendors added by Sourcing (simple names)
  addedVendorsDetails?: AddedVendorDetail[]; // NEW: Full vendor details manually added by Sourcing
  sourcingNotes?: string;        // Notes from Sourcing team
  supportingDocuments?: Array<{  // Supporting documents uploaded by Sourcing
    name: string;
    size: number;
    type: string;
    uploadDate: string;
  }>;

  // Approval workflow
  submittedForApprovalDate?: string;
  deptHeadApprovedBy?: string;
  deptHeadApprovedByName?: string;
  deptHeadApprovedDate?: string;
  deptHeadComments?: string;
  divHeadApprovedBy?: string;
  divHeadApprovedByName?: string;
  divHeadApprovedDate?: string;
  divHeadComments?: string;

  // Planner/Buyer review
  plannerReviewedBy?: string;
  plannerReviewedByName?: string;
  plannerReviewDate?: string;
  plannerDecision?: 'Approved' | 'Rejected';
  plannerComments?: string;
  buyerReviewedBy?: string;
  buyerReviewedByName?: string;
  buyerReviewDate?: string;
  buyerDecision?: 'Approved' | 'Rejected';
  buyerComments?: string;

  // Completion
  completedDate?: string;
  revisionCount?: number;        // Number of times sent back for revision
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

// Legacy type alias for backward compatibility
export type VendorRequest = VendorRecommendation;
export type VendorRequestStatus = VendorRecommendationStatus;

// Material Management Types
export interface Material {
  id: string;
  material: string;                    // Material Code e.g., "10212-986"
  materialDescription: string;         // Material Description e.g., "HOSE"
  baseUnitOfMeasure: string;          // UoM e.g., "EA", "KIT", "NF"
  extMaterialGroup: string;           // External Brand e.g., "SANDVIK", "KOMATSU"
  valuationClass: string;             // Valuation Class e.g., "M001"
  materialGroup: string;              // Material Group Code e.g., "Z01017"
  materialGroupDescription: string;   // Material Group Description (auto-filled from materialGroup)
  subClassification: string;          // Sub-Classification e.g., "M 01 01-Component and Sub Component"
  jobsite: string;                    // Jobsite e.g., "ADMO MINING", "JAHO"
  plant: string;                      // Plant Code (auto-filled from jobsite abbreviation) e.g., "40AB", "40A0"
  createdDate: string;
  updatedDate?: string;

  // Annual Purchase Plan fields (NEW - Nov 12, 2025)
  qty?: number;                       // Quantity
  estimatedPrice?: number;            // Estimated Price (USD)
  contractType?: 'Contractual' | 'Non-Contractual'; // Contract Type
  vendorName?: string;                // Vendor Name
  contractNumber?: string;            // Contract Number
  contractName?: string;              // Contract Name (NEW - Nov 12, 2025)
  contractStartDate?: string;         // Start of Contract (ISO date string)
  contractEndDate?: string;           // End of Contract (ISO date string)
  unique?: 'Yes' | 'No';              // Unique field (NEW - Nov 13, 2025)

  // Legacy field for backward compatibility
  company?: string;                   // @deprecated Use jobsite instead
}

// Material Item for Proposal (Selected Material)
export interface ProposalMaterialItem {
  materialId: string;
  material: string;
  materialDescription: string;
  uom: string;
  extMaterialGroup: string;  // Brand/Manufacturer
  quantity: number;
  estimatedUnitPrice?: number;
  estimatedTotalPrice?: number;
  remarks?: string;
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

export interface Departments {
  departmentID: string;
  code: string;
  name: string;
  isActive: boolean;
  createdAt: string;
  createdBy: string;
}

export interface Jobsites {
  jobsiteID: string;
  code: string;
  name: string;
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
  isSystemGenerated: boolean; // True for auto-generated roles, false for custom roles
  createdDate: string;
  updatedDate?: string;
  relatedApprovalRole?: string; // Maps to ApprovalRole in approval matrix
}

export const mapApiRoleToDefinition = (apiRole: any): RoleDefinition => ({
  id: apiRole.roleID,
  code: apiRole.code,
  name: apiRole.name,
  description: apiRole.description ?? '',
  permissions: apiRole.permission ?? [],                       // array string permission
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

export interface apiUser {
  userID: number;
  username: string;
  password: string;
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
}

