import { RoleDefinition, Permission, PermissionFromApi } from '../types';

// All active departments
const DEPARTMENTS = [
  'Plant',
  'Logistic',
  'HR',
  'GA',
  'SHE',
  'Finance',
  'Production',
  'Engineering',
  'IT'
];

// All active jobsites
const JOBSITES = [
  'ADMO MINING',
  'ADMO HAULING',
  'SERA',
  'MACO MINING',
  'MACO HAULING',
  'JAHO',
  'NARO'
];

// Chief Operations by region
const CHIEF_OPERATIONS = [
  { region: 'ADMO', description: 'Chief Operation for ADMO sites (ADMO MINING, ADMO HAULING)' },
  { region: 'SERA', description: 'Chief Operation for SERA site' },
  { region: 'MACO', description: 'Chief Operation for MACO sites (MACO MINING, MACO HAULING)' }
];

// ==================== STATIC ROLES (System-wide) ====================

const STATIC_ROLES: RoleDefinition[] = [
  {
    id: 'role_001',
    name: 'Administrator',
    description: 'System administrator with full access to all features and super user approval rights',
    permissions: ['manage_users', 'manage_roles', 'manage_system', 'approve_all', 'view_all', 'edit_all', 'manage_data'],
    canApprove: true,
    canCreate: true,
    canView: true,
    category: 'System',
    isActive: true,
    isSystemGenerated: true,
    createdDate: '2025-01-01',
    updatedDate: '2025-11-10',
  },
  {
    id: 'role_002',
    name: 'President Director',
    description: 'Highest level approval authority across all departments and sites',
    permissions: ['view_all_proposals', 'approve_president_level', 'reject_proposals', 'view_all_reports'],
    canApprove: true,
    canCreate: false,
    canView: true,
    category: 'Approval',
    isActive: true,
    isSystemGenerated: true,
    createdDate: '2025-01-01',
    updatedDate: '2025-11-10',
    relatedApprovalRole: 'President Director',
  },
  {
    id: 'role_003',
    name: 'Sourcing Department Head',
    description: 'Head of Sourcing Department with approval authority for vendor recommendations',
    permissions: ['view_all_sourcing', 'approve_sourcing', 'manage_sourcing_team', 'view_sourcing_reports'],
    canApprove: true,
    canCreate: false,
    canView: true,
    category: 'Sourcing',
    isActive: true,
    isSystemGenerated: true,
    createdDate: '2025-01-01',
    updatedDate: '2025-11-10',
    relatedApprovalRole: 'DH User',
  },
  {
    id: 'role_004',
    name: 'Procurement Division Head',
    description: 'Division Head of Procurement with final procurement approval for vendor recommendations',
    permissions: ['view_all_procurement', 'approve_procurement', 'manage_division', 'view_procurement_reports'],
    canApprove: true,
    canCreate: false,
    canView: true,
    category: 'Sourcing',
    isActive: true,
    isSystemGenerated: true,
    createdDate: '2025-01-01',
    updatedDate: '2025-11-10',
    relatedApprovalRole: 'DIV User',
  },
  {
    id: 'role_005',
    name: 'Buyer',
    description: 'Reviews vendor recommendations and manages purchasing execution',
    permissions: ['view_approved_proposals', 'review_vendors', 'manage_sourcing'],
    canApprove: false,
    canCreate: false,
    canView: true,
    category: 'Sourcing',
    isActive: true,
    isSystemGenerated: true,
    createdDate: '2025-01-01',
    updatedDate: '2025-11-10',
  },
  {
    id: 'role_006',
    name: 'Planner',
    description: 'Reviews vendor recommendations and plans procurement activities',
    permissions: ['view_approved_proposals', 'review_vendors', 'create_procurement_plan'],
    canApprove: false,
    canCreate: false,
    canView: true,
    category: 'Sourcing',
    isActive: true,
    isSystemGenerated: true,
    createdDate: '2025-01-01',
    updatedDate: '2025-11-10',
  },
  {
    id: 'role_007',
    name: 'Sourcing',
    description: 'Handles sourcing process, vendor evaluation, and recommendation creation',
    permissions: ['view_approved_proposals', 'manage_sourcing', 'upload_documents', 'create_vendor_recommendations'],
    canApprove: false,
    canCreate: false,
    canView: true,
    category: 'Sourcing',
    isActive: true,
    isSystemGenerated: true,
    createdDate: '2025-01-07',
    updatedDate: '2025-11-10',
  },
];

// ==================== ROLE GENERATORS ====================

let roleIdCounter = 1000;

function generateRoleId(): string {
  roleIdCounter++;
  return `role_${roleIdCounter.toString().padStart(6, '0')}`;
}

// Creator roles: Create proposals for specific department and jobsite
function generateCreatorRoles(): RoleDefinition[] {
  const roles: RoleDefinition[] = [];
  
  for (const department of DEPARTMENTS) {
    for (const jobsite of JOBSITES) {
      roles.push({
        id: generateRoleId(),
        name: `Creator ${department} Department ${jobsite}`,
        description: `Creates and submits proposals for ${department} Department at ${jobsite} jobsite`,
        permissions: ['create_proposal', 'view_own_proposals', 'edit_draft_proposals'],
        canApprove: false,
        canCreate: true,
        canView: true,
        category: 'System',
        isActive: true,
        isSystemGenerated: true,
        createdDate: '2025-11-10',
      });
    }
  }
  
  return roles;
}

// Unit Head roles: First approval level
function generateUnitHeadRoles(): RoleDefinition[] {
  const roles: RoleDefinition[] = [];
  
  for (const department of DEPARTMENTS) {
    for (const jobsite of JOBSITES) {
      roles.push({
        id: generateRoleId(),
        name: `Unit Head ${department} Department ${jobsite}`,
        description: `Unit Head level approval for ${department} Department at ${jobsite}`,
        permissions: ['view_proposals', 'approve_unit_level', 'reject_proposals'],
        canApprove: true,
        canCreate: false,
        canView: true,
        category: 'Approval',
        isActive: true,
        isSystemGenerated: true,
        createdDate: '2025-11-10',
        relatedApprovalRole: 'UH User',
      });
    }
  }
  
  return roles;
}

// Section Head roles: Second approval level
function generateSectionHeadRoles(): RoleDefinition[] {
  const roles: RoleDefinition[] = [];
  
  for (const department of DEPARTMENTS) {
    for (const jobsite of JOBSITES) {
      roles.push({
        id: generateRoleId(),
        name: `Section Head ${department} Department ${jobsite}`,
        description: `Section Head level approval for ${department} Department at ${jobsite}`,
        permissions: ['view_proposals', 'approve_section_level', 'reject_proposals'],
        canApprove: true,
        canCreate: false,
        canView: true,
        category: 'Approval',
        isActive: true,
        isSystemGenerated: true,
        createdDate: '2025-11-10',
        relatedApprovalRole: 'SH User',
      });
    }
  }
  
  return roles;
}

// Department Head roles: Department level approval
function generateDepartmentHeadRoles(): RoleDefinition[] {
  const roles: RoleDefinition[] = [];
  
  for (const department of DEPARTMENTS) {
    for (const jobsite of JOBSITES) {
      roles.push({
        id: generateRoleId(),
        name: `Department Head ${department} Department ${jobsite}`,
        description: `Department Head level approval for ${department} Department at ${jobsite}`,
        permissions: ['view_proposals', 'approve_department_level', 'reject_proposals', 'view_department_reports'],
        canApprove: true,
        canCreate: false,
        canView: true,
        category: 'Approval',
        isActive: true,
        isSystemGenerated: true,
        createdDate: '2025-11-10',
        relatedApprovalRole: 'DH User',
      });
    }
  }
  
  return roles;
}

// Manager roles: Manager level approval (optional in some flows)
function generateManagerRoles(): RoleDefinition[] {
  const roles: RoleDefinition[] = [];
  
  for (const department of DEPARTMENTS) {
    for (const jobsite of JOBSITES) {
      roles.push({
        id: generateRoleId(),
        name: `Manager ${department} Department ${jobsite}`,
        description: `Manager level approval for ${department} Department at ${jobsite}`,
        permissions: ['view_proposals', 'approve_manager_level', 'reject_proposals'],
        canApprove: true,
        canCreate: false,
        canView: true,
        category: 'Approval',
        isActive: true,
        isSystemGenerated: true,
        createdDate: '2025-11-10',
        relatedApprovalRole: 'Manager User',
      });
    }
  }
  
  return roles;
}

// Chief Operation roles: Regional operation level approval
function generateChiefOperationRoles(): RoleDefinition[] {
  const roles: RoleDefinition[] = [];
  
  for (const co of CHIEF_OPERATIONS) {
    roles.push({
      id: generateRoleId(),
      name: `Chief Operation ${co.region}`,
      description: co.description,
      permissions: ['view_all_proposals', 'approve_operation_level', 'reject_proposals', 'view_site_reports'],
      canApprove: true,
      canCreate: false,
      canView: true,
      category: 'Approval',
      isActive: true,
      isSystemGenerated: true,
      createdDate: '2025-11-10',
      relatedApprovalRole: 'Chief Operation Site',
    });
  }
  
  return roles;
}

// Division Head roles: Division-wide approval (cross jobsite)
function generateDivisionHeadRoles(): RoleDefinition[] {
  const roles: RoleDefinition[] = [];
  
  for (const department of DEPARTMENTS) {
    roles.push({
      id: generateRoleId(),
      name: `${department} Division Head`,
      description: `Division Head level approval for ${department} Division across all jobsites`,
      permissions: ['view_all_proposals', 'approve_division_level', 'reject_proposals', 'view_division_reports'],
      canApprove: true,
      canCreate: false,
      canView: true,
      category: 'Approval',
      isActive: true,
      isSystemGenerated: true,
      createdDate: '2025-11-10',
      relatedApprovalRole: 'DIV User',
    });
  }
  
  return roles;
}

// Director roles: Director level approval (cross jobsite)
function generateDirectorRoles(): RoleDefinition[] {
  const roles: RoleDefinition[] = [];
  
  for (const department of DEPARTMENTS) {
    roles.push({
      id: generateRoleId(),
      name: `${department} Director`,
      description: `Director level approval for ${department} operations across all sites`,
      permissions: ['view_all_proposals', 'approve_director_level', 'reject_proposals', 'view_all_reports'],
      canApprove: true,
      canCreate: false,
      canView: true,
      category: 'Approval',
      isActive: true,
      isSystemGenerated: true,
      createdDate: '2025-11-10',
      relatedApprovalRole: 'Dir User',
    });
  }
  
  return roles;
}
export const mapApiRoleToDefinition = (apiRole: any): RoleDefinition => ({
  id: apiRole.code,                                            // pakai code sebagai id (string)
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


// ==================== GENERATE ALL ROLES ====================

export const defaultRoles: RoleDefinition[] = [
  ...STATIC_ROLES,                    // 7 static roles
  ...generateCreatorRoles(),          // 9 departments × 7 jobsites = 63 roles
  ...generateUnitHeadRoles(),         // 9 departments × 7 jobsites = 63 roles
  ...generateSectionHeadRoles(),      // 9 departments × 7 jobsites = 63 roles
  ...generateDepartmentHeadRoles(),   // 9 departments × 7 jobsites = 63 roles
  ...generateManagerRoles(),          // 9 departments × 7 jobsites = 63 roles
  ...generateChiefOperationRoles(),   // 3 roles (ADMO, SERA, MACO)
  ...generateDivisionHeadRoles(),     // 9 roles (one per department)
  ...generateDirectorRoles(),         // 9 roles (one per department)
];

// Total: 7 + 63 + 63 + 63 + 63 + 63 + 3 + 9 + 9 = 343 roles

// ==================== HELPER FUNCTIONS ====================

// Get active roles only
export function getActiveRoles(): RoleDefinition[] {
  return defaultRoles.filter(role => role.isActive);
}

// Get role by name
export function getRoleByName(name: string): RoleDefinition | undefined {
  return defaultRoles.find(role => role.name === name);
}

// Get roles by category
export function getRolesByCategory(category: RoleDefinition['category']): RoleDefinition[] {
  return defaultRoles.filter(role => role.category === category && role.isActive);
}

// Get role statistics
export function getRoleStatistics() {
  const activeRoles = getActiveRoles();
  
  return {
    totalRoles: defaultRoles.length,
    activeRoles: activeRoles.length,
    inactiveRoles: defaultRoles.length - activeRoles.length,
    staticRoles: STATIC_ROLES.length,
    creatorRoles: defaultRoles.filter(r => r.name.startsWith('Creator') && r.isActive).length,
    unitHeadRoles: defaultRoles.filter(r => r.name.startsWith('Unit Head') && r.isActive).length,
    sectionHeadRoles: defaultRoles.filter(r => r.name.startsWith('Section Head') && r.isActive).length,
    departmentHeadRoles: defaultRoles.filter(r => r.name.startsWith('Department Head') && r.isActive).length,
    managerRoles: defaultRoles.filter(r => r.name.startsWith('Manager') && r.isActive).length,
    chiefOperationRoles: defaultRoles.filter(r => r.name.startsWith('Chief Operation') && r.isActive).length,
    divisionHeads: defaultRoles.filter(r => r.name.includes('Division Head') && !r.name.startsWith('Department Head') && r.isActive).length,
    directorRoles: defaultRoles.filter(r => r.name.includes('Director') && !r.name.includes('President') && r.isActive).length,
    byCategory: {
      System: getRolesByCategory('System').length,
      Approval: getRolesByCategory('Approval').length,
      Sourcing: getRolesByCategory('Sourcing').length,
      Custom: getRolesByCategory('Custom').length,
    }
  };
}

// Export configuration for reference
export const ROLE_CONFIG = {
  departments: DEPARTMENTS,
  jobsites: JOBSITES,
  chiefOperations: CHIEF_OPERATIONS,
  totalCombinations: {
    creators: DEPARTMENTS.length * JOBSITES.length,
    unitHeads: DEPARTMENTS.length * JOBSITES.length,
    sectionHeads: DEPARTMENTS.length * JOBSITES.length,
    departmentHeads: DEPARTMENTS.length * JOBSITES.length,
    managers: DEPARTMENTS.length * JOBSITES.length,
    chiefOperations: CHIEF_OPERATIONS.length,
    divisionHeads: DEPARTMENTS.length,
    directors: DEPARTMENTS.length,
    total: (DEPARTMENTS.length * JOBSITES.length * 5) + CHIEF_OPERATIONS.length + (DEPARTMENTS.length * 2) + 7
  }
};

// Export total count
export const totalRoles = defaultRoles.length;

