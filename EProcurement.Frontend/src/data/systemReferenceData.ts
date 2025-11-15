// Centralized System Reference Data - All dropdown and validation lists

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

// Jobsite Reference Data
export const jobsiteData: ReferenceDataItem[] = [
  { id: 'js-001', value: 'ADMO MINING', abbreviation: '40AB', isActive: true, order: 1, createdAt: '2025-01-01', updatedAt: '2025-01-01' },
  { id: 'js-002', value: 'ADMO HAULING', abbreviation: '40AC', isActive: true, order: 2, createdAt: '2025-01-01', updatedAt: '2025-01-01' },
  { id: 'js-003', value: 'SERA', abbreviation: '40AD', isActive: true, order: 3, createdAt: '2025-01-01', updatedAt: '2025-01-01' },
  { id: 'js-004', value: 'MACO MINING', abbreviation: '40AI', isActive: true, order: 4, createdAt: '2025-01-01', updatedAt: '2025-01-01' },
  { id: 'js-005', value: 'MACO HAULING', abbreviation: '40AJ', isActive: true, order: 5, createdAt: '2025-01-01', updatedAt: '2025-01-01' },
  { id: 'js-006', value: 'JAHO', abbreviation: '40A0', isActive: true, order: 6, createdAt: '2025-01-01', updatedAt: '2025-01-01' },
  { id: 'js-007', value: 'NARO', abbreviation: '4090', isActive: true, order: 7, createdAt: '2025-01-01', updatedAt: '2025-01-01' },
];

// Department Reference Data
export const departmentData: ReferenceDataItem[] = [
  { id: 'dept-001', value: 'Plant', abbreviation: 'PLANT', isActive: true, order: 1, createdAt: '2025-01-01', updatedAt: '2025-01-01' },
  { id: 'dept-002', value: 'Logistic', abbreviation: 'LOG', isActive: true, order: 2, createdAt: '2025-01-01', updatedAt: '2025-01-01' },
  { id: 'dept-003', value: 'HR', abbreviation: 'HR', isActive: true, order: 3, createdAt: '2025-01-01', updatedAt: '2025-01-01' },
  { id: 'dept-004', value: 'GA', abbreviation: 'GA', isActive: true, order: 4, createdAt: '2025-01-01', updatedAt: '2025-01-01' },
  { id: 'dept-005', value: 'SHE', abbreviation: 'SHE', isActive: true, order: 5, createdAt: '2025-01-01', updatedAt: '2025-01-01' },
  { id: 'dept-006', value: 'Finance', abbreviation: 'FIN', isActive: true, order: 6, createdAt: '2025-01-01', updatedAt: '2025-01-01' },
  { id: 'dept-007', value: 'Production', abbreviation: 'PROD', isActive: true, order: 7, createdAt: '2025-01-01', updatedAt: '2025-01-01' },
  { id: 'dept-008', value: 'Engineering', abbreviation: 'ENG', isActive: true, order: 8, createdAt: '2025-01-01', updatedAt: '2025-01-01' },
  { id: 'dept-009', value: 'IT', abbreviation: 'IT', isActive: true, order: 9, createdAt: '2025-11-07', updatedAt: '2025-11-07' },
];

// Work Location Reference Data
export const workLocationData: ReferenceDataItem[] = [
  { id: 'wl-001', value: 'PT Saptaindra Sejati Head Office', isActive: true, order: 1, createdAt: '2025-01-01', updatedAt: '2025-11-07' },
  { id: 'wl-002', value: 'Rebuild Center Narogong', isActive: true, order: 2, createdAt: '2025-01-01', updatedAt: '2025-11-07' },
  { id: 'wl-003', value: 'Franco Jobsite', isActive: true, order: 3, createdAt: '2025-01-01', updatedAt: '2025-11-07' },
  { id: 'wl-004', value: 'Loco Jakarta', isActive: true, order: 4, createdAt: '2025-01-01', updatedAt: '2025-11-07' },
  { id: 'wl-005', value: 'Loco Banjarmasin', isActive: true, order: 5, createdAt: '2025-01-01', updatedAt: '2025-11-07' },
  { id: 'wl-006', value: 'Loco Balikpapan', isActive: true, order: 6, createdAt: '2025-01-01', updatedAt: '2025-11-07' },
  { id: 'wl-007', value: 'Ex-Workshop Vendor', isActive: true, order: 7, createdAt: '2025-01-01', updatedAt: '2025-11-07' },
  { id: 'wl-008', value: 'Custom Location', isActive: true, order: 8, createdAt: '2025-01-01', updatedAt: '2025-11-07' },
];

// Contract Type Reference Data
export const contractTypeData: ReferenceDataItem[] = [
  { id: 'ct-001', value: 'Purchase Order (PO)', isActive: true, order: 1, createdAt: '2025-01-01', updatedAt: '2025-01-01' },
  { id: 'ct-002', value: 'Contractual', isActive: true, order: 2, createdAt: '2025-01-01', updatedAt: '2025-01-01' },
];

// Contractual Type Reference Data (sub-types of Contractual)
export const contractualTypeData: ReferenceDataItem[] = [
  { id: 'cst-001', value: 'Fixed Price Agreement', isActive: true, order: 1, createdAt: '2025-01-01', updatedAt: '2025-11-07' },
  { id: 'cst-002', value: 'Vendor Held Stock', isActive: true, order: 2, createdAt: '2025-01-01', updatedAt: '2025-11-07' },
  { id: 'cst-003', value: 'Consignment', isActive: true, order: 3, createdAt: '2025-01-01', updatedAt: '2025-11-07' },
  { id: 'cst-004', value: 'Service Agreement', isActive: true, order: 4, createdAt: '2025-11-07', updatedAt: '2025-11-07' },
  { id: 'cst-005', value: 'Rent Agreement', isActive: true, order: 5, createdAt: '2025-11-07', updatedAt: '2025-11-07' },
];

// User Roles Reference Data - Synced with Role Management
// Auto-generated from rolesData.ts for consistency
// Total: 343 roles (7 static + 315 dept-jobsite specific + 21 leadership)

import { defaultRoles } from './rolesData';

// Generate userRoleData from rolesData to maintain single source of truth
export const userRoleData: ReferenceDataItem[] = defaultRoles
  .filter(role => role.isActive)
  .sort((a, b) => {
    // Sort order: Static roles first, then by name
    const aStatic = ['Administrator', 'President Director', 'Sourcing Department Head', 'Procurement Division Head', 'Buyer', 'Planner', 'Sourcing'].includes(a.name);
    const bStatic = ['Administrator', 'President Director', 'Sourcing Department Head', 'Procurement Division Head', 'Buyer', 'Planner', 'Sourcing'].includes(b.name);
    
    if (aStatic && !bStatic) return -1;
    if (!aStatic && bStatic) return 1;
    return a.name.localeCompare(b.name);
  })
  .map((role, index) => ({
    id: `role-${(index + 1).toString().padStart(6, '0')}`,
    value: role.name,
    isActive: role.isActive,
    order: index + 1,
    createdAt: role.createdDate,
    updatedAt: role.updatedDate || role.createdDate,
  }));

// Funding Source Reference Data
export const fundingSourceData: ReferenceDataItem[] = [
  { id: 'fs-001', value: 'Budget', isActive: true, order: 1, createdAt: '2025-01-01', updatedAt: '2025-01-01' },
  { id: 'fs-002', value: 'Non-Budget', isActive: true, order: 2, createdAt: '2025-01-01', updatedAt: '2025-01-01' },
];

// Unit of Measure (UoM) Reference Data
export const uomData: ReferenceDataItem[] = [
  { id: 'uom-001', value: 'EA', isActive: true, order: 1, createdAt: '2025-11-11', updatedAt: '2025-11-11' },
  { id: 'uom-002', value: 'PC', isActive: true, order: 2, createdAt: '2025-11-11', updatedAt: '2025-11-11' },
  { id: 'uom-003', value: 'SET', isActive: true, order: 3, createdAt: '2025-11-11', updatedAt: '2025-11-11' },
  { id: 'uom-004', value: 'KIT', isActive: true, order: 4, createdAt: '2025-11-11', updatedAt: '2025-11-11' },
  { id: 'uom-005', value: 'UNIT', isActive: true, order: 5, createdAt: '2025-11-11', updatedAt: '2025-11-11' },
  { id: 'uom-006', value: 'KG', isActive: true, order: 6, createdAt: '2025-11-11', updatedAt: '2025-11-11' },
  { id: 'uom-007', value: 'LTR', isActive: true, order: 7, createdAt: '2025-11-11', updatedAt: '2025-11-11' },
  { id: 'uom-008', value: 'M', isActive: true, order: 8, createdAt: '2025-11-11', updatedAt: '2025-11-11' },
  { id: 'uom-009', value: 'M2', isActive: true, order: 9, createdAt: '2025-11-11', updatedAt: '2025-11-11' },
  { id: 'uom-010', value: 'M3', isActive: true, order: 10, createdAt: '2025-11-11', updatedAt: '2025-11-11' },
  { id: 'uom-011', value: 'NF', isActive: true, order: 11, createdAt: '2025-11-11', updatedAt: '2025-11-11' },
  { id: 'uom-012', value: 'BOX', isActive: true, order: 12, createdAt: '2025-11-11', updatedAt: '2025-11-11' },
  { id: 'uom-013', value: 'ROLL', isActive: true, order: 13, createdAt: '2025-11-11', updatedAt: '2025-11-11' },
  { id: 'uom-014', value: 'PAK', isActive: true, order: 14, createdAt: '2025-11-11', updatedAt: '2025-11-11' },
  { id: 'uom-015', value: 'BTL', isActive: true, order: 15, createdAt: '2025-11-11', updatedAt: '2025-11-11' },
  { id: 'uom-016', value: 'CAN', isActive: true, order: 16, createdAt: '2025-11-11', updatedAt: '2025-11-11' },
  { id: 'uom-017', value: 'PAIL', isActive: true, order: 17, createdAt: '2025-11-11', updatedAt: '2025-11-11' },
  { id: 'uom-018', value: 'DRUM', isActive: true, order: 18, createdAt: '2025-11-11', updatedAt: '2025-11-11' },
  { id: 'uom-019', value: 'TUBE', isActive: true, order: 19, createdAt: '2025-11-11', updatedAt: '2025-11-11' },
  { id: 'uom-020', value: 'HR', isActive: true, order: 20, createdAt: '2025-11-11', updatedAt: '2025-11-11' },
];

// KBLI (Klasifikasi Baku Lapangan Usaha Indonesia) Reference Data
export const kbliData: ReferenceDataItem[] = [
  { id: 'kbli-001', value: '46591', description: 'Perdagangan Besar Suku Cadang Kendaraan Bermotor', isActive: true, order: 1, createdAt: '2025-11-12', updatedAt: '2025-11-12' },
  { id: 'kbli-002', value: '46599', description: 'Perdagangan Besar Alat dan Mesin Industri Lainnya', isActive: true, order: 2, createdAt: '2025-11-12', updatedAt: '2025-11-12' },
  { id: 'kbli-003', value: '28250', description: 'Industri Mesin Pendingin dan Pemurni Udara', isActive: true, order: 3, createdAt: '2025-11-12', updatedAt: '2025-11-12' },
  { id: 'kbli-004', value: '46693', description: 'Perdagangan Besar Mesin, Peralatan dan Perlengkapan Lainnya', isActive: true, order: 4, createdAt: '2025-11-12', updatedAt: '2025-11-12' },
  { id: 'kbli-005', value: '46499', description: 'Perdagangan Besar Barang Lainnya', isActive: true, order: 5, createdAt: '2025-11-12', updatedAt: '2025-11-12' },
  { id: 'kbli-006', value: '28112', description: 'Industri Mesin dan Perlengkapan Konstruksi', isActive: true, order: 6, createdAt: '2025-11-12', updatedAt: '2025-11-12' },
  { id: 'kbli-007', value: '46190', description: 'Perdagangan Besar Berbagai Macam Barang', isActive: true, order: 7, createdAt: '2025-11-12', updatedAt: '2025-11-12' },
  { id: 'kbli-008', value: '46731', description: 'Perdagangan Besar Kayu Gergajian', isActive: true, order: 8, createdAt: '2025-11-12', updatedAt: '2025-11-12' },
  { id: 'kbli-009', value: '46739', description: 'Perdagangan Besar Bahan Konstruksi Lainnya', isActive: true, order: 9, createdAt: '2025-11-12', updatedAt: '2025-11-12' },
  { id: 'kbli-010', value: '47630', description: 'Perdagangan Eceran Peralatan Listrik Rumah Tangga', isActive: true, order: 10, createdAt: '2025-11-12', updatedAt: '2025-11-12' },
];

// External Brand Reference Data
export const externalBrandData: ReferenceDataItem[] = [
  { id: 'brand-001', value: 'SANDVIK', isActive: true, order: 1, createdAt: '2025-11-11', updatedAt: '2025-11-11' },
  { id: 'brand-002', value: 'KOMATSU', isActive: true, order: 2, createdAt: '2025-11-11', updatedAt: '2025-11-11' },
  { id: 'brand-003', value: 'CATERPILLAR', isActive: true, order: 3, createdAt: '2025-11-11', updatedAt: '2025-11-11' },
  { id: 'brand-004', value: 'HITACHI', isActive: true, order: 4, createdAt: '2025-11-11', updatedAt: '2025-11-11' },
  { id: 'brand-005', value: 'VOLVO', isActive: true, order: 5, createdAt: '2025-11-11', updatedAt: '2025-11-11' },
  { id: 'brand-006', value: 'LIEBHERR', isActive: true, order: 6, createdAt: '2025-11-11', updatedAt: '2025-11-11' },
  { id: 'brand-007', value: 'SCANIA', isActive: true, order: 7, createdAt: '2025-11-11', updatedAt: '2025-11-11' },
  { id: 'brand-008', value: 'CUMMINS', isActive: true, order: 8, createdAt: '2025-11-11', updatedAt: '2025-11-11' },
  { id: 'brand-009', value: 'WEIR', isActive: true, order: 9, createdAt: '2025-11-11', updatedAt: '2025-11-11' },
  { id: 'brand-010', value: 'METSO', isActive: true, order: 10, createdAt: '2025-11-11', updatedAt: '2025-11-11' },
  { id: 'brand-011', value: 'TEREX', isActive: true, order: 11, createdAt: '2025-11-11', updatedAt: '2025-11-11' },
  { id: 'brand-012', value: 'BELAZ', isActive: true, order: 12, createdAt: '2025-11-11', updatedAt: '2025-11-11' },
  { id: 'brand-013', value: 'SHELL', isActive: true, order: 13, createdAt: '2025-11-11', updatedAt: '2025-11-11' },
  { id: 'brand-014', value: 'CASTROL', isActive: true, order: 14, createdAt: '2025-11-11', updatedAt: '2025-11-11' },
  { id: 'brand-015', value: 'PERTAMINA', isActive: true, order: 15, createdAt: '2025-11-11', updatedAt: '2025-11-11' },
  { id: 'brand-016', value: 'GOODYEAR', isActive: true, order: 16, createdAt: '2025-11-11', updatedAt: '2025-11-11' },
  { id: 'brand-017', value: 'BRIDGESTONE', isActive: true, order: 17, createdAt: '2025-11-11', updatedAt: '2025-11-11' },
  { id: 'brand-018', value: 'MICHELIN', isActive: true, order: 18, createdAt: '2025-11-11', updatedAt: '2025-11-11' },
  { id: 'brand-019', value: 'GENERAL', isActive: true, order: 19, createdAt: '2025-11-11', updatedAt: '2025-11-11' },
  { id: 'brand-020', value: 'NON BRAND', isActive: true, order: 20, createdAt: '2025-11-11', updatedAt: '2025-11-11' },
];

// Valuation Class Reference Data
export const valuationClassData: ReferenceDataItem[] = [
  { id: 'vc-001', value: 'M001', isActive: true, order: 1, createdAt: '2025-11-11', updatedAt: '2025-11-11' },
  { id: 'vc-002', value: 'M002', isActive: true, order: 2, createdAt: '2025-11-11', updatedAt: '2025-11-11' },
  { id: 'vc-003', value: 'M003', isActive: true, order: 3, createdAt: '2025-11-11', updatedAt: '2025-11-11' },
  { id: 'vc-004', value: 'M004', isActive: true, order: 4, createdAt: '2025-11-11', updatedAt: '2025-11-11' },
  { id: 'vc-005', value: 'M005', isActive: true, order: 5, createdAt: '2025-11-11', updatedAt: '2025-11-11' },
  { id: 'vc-006', value: 'S001', isActive: true, order: 6, createdAt: '2025-11-11', updatedAt: '2025-11-11' },
  { id: 'vc-007', value: 'S002', isActive: true, order: 7, createdAt: '2025-11-11', updatedAt: '2025-11-11' },
  { id: 'vc-008', value: 'C001', isActive: true, order: 8, createdAt: '2025-11-11', updatedAt: '2025-11-11' },
  { id: 'vc-009', value: 'C002', isActive: true, order: 9, createdAt: '2025-11-11', updatedAt: '2025-11-11' },
  { id: 'vc-010', value: 'P001', isActive: true, order: 10, createdAt: '2025-11-11', updatedAt: '2025-11-11' },
];

// Material Group with Description Reference Data
export interface MaterialGroupItem extends ReferenceDataItem {
  description: string; // Material Group Description
}

export const materialGroupData: MaterialGroupItem[] = [
  { id: 'mg-001', value: 'Z01017', description: 'HEAVY CONSTRUCTION MACHINERY AND EQ/HEAVY EQ COMPONENTS', isActive: true, order: 1, createdAt: '2025-11-11', updatedAt: '2025-11-11' },
  { id: 'mg-002', value: 'Z01018', description: 'LIGHT CONSTRUCTION MACHINERY AND EQ/LIGHT EQ COMPONENTS', isActive: true, order: 2, createdAt: '2025-11-11', updatedAt: '2025-11-11' },
  { id: 'mg-003', value: 'Z01019', description: 'MINING EQUIPMENT AND COMPONENTS', isActive: true, order: 3, createdAt: '2025-11-11', updatedAt: '2025-11-11' },
  { id: 'mg-004', value: 'Z01020', description: 'VEHICLE PARTS AND ACCESSORIES', isActive: true, order: 4, createdAt: '2025-11-11', updatedAt: '2025-11-11' },
  { id: 'mg-005', value: 'Z01021', description: 'HYDRAULIC AND PNEUMATIC SYSTEMS', isActive: true, order: 5, createdAt: '2025-11-11', updatedAt: '2025-11-11' },
  { id: 'mg-006', value: 'Z01022', description: 'ELECTRICAL COMPONENTS AND SUPPLIES', isActive: true, order: 6, createdAt: '2025-11-11', updatedAt: '2025-11-11' },
  { id: 'mg-007', value: 'Z01023', description: 'LUBRICANTS AND OILS', isActive: true, order: 7, createdAt: '2025-11-11', updatedAt: '2025-11-11' },
  { id: 'mg-008', value: 'Z01024', description: 'FUEL AND ENERGY PRODUCTS', isActive: true, order: 8, createdAt: '2025-11-11', updatedAt: '2025-11-11' },
  { id: 'mg-009', value: 'Z01025', description: 'TIRES AND TUBES', isActive: true, order: 9, createdAt: '2025-11-11', updatedAt: '2025-11-11' },
  { id: 'mg-010', value: 'Z01026', description: 'SAFETY EQUIPMENT AND PPE', isActive: true, order: 10, createdAt: '2025-11-11', updatedAt: '2025-11-11' },
  { id: 'mg-011', value: 'Z01027', description: 'TOOLS AND HARDWARE', isActive: true, order: 11, createdAt: '2025-11-11', updatedAt: '2025-11-11' },
  { id: 'mg-012', value: 'Z01028', description: 'OFFICE SUPPLIES AND EQUIPMENT', isActive: true, order: 12, createdAt: '2025-11-11', updatedAt: '2025-11-11' },
  { id: 'mg-013', value: 'Z01029', description: 'CONSTRUCTION MATERIALS', isActive: true, order: 13, createdAt: '2025-11-11', updatedAt: '2025-11-11' },
  { id: 'mg-014', value: 'Z01030', description: 'CHEMICAL PRODUCTS', isActive: true, order: 14, createdAt: '2025-11-11', updatedAt: '2025-11-11' },
  { id: 'mg-015', value: 'Z01031', description: 'SERVICES - MAINTENANCE AND REPAIR', isActive: true, order: 15, createdAt: '2025-11-11', updatedAt: '2025-11-11' },
];

// All Reference Data Categories
export const referenceDataCategories: ReferenceDataCategory[] = [
  {
    code: 'jobsite',
    name: 'Jobsite',
    description: 'Project sites and operational locations',
    items: jobsiteData,
  },
  {
    code: 'department',
    name: 'Department',
    description: 'Organizational departments',
    items: departmentData,
  },
  {
    code: 'workLocation',
    name: 'Work Location',
    description: 'Physical work locations within sites',
    items: workLocationData,
  },
  {
    code: 'contractType',
    name: 'Contract Type',
    description: 'Types of procurement contracts',
    items: contractTypeData,
  },
  {
    code: 'contractualType',
    name: 'Contractual Sub-Type',
    description: 'Sub-types for contractual agreements',
    items: contractualTypeData,
  },
  {
    code: 'userRole',
    name: 'User Roles',
    description: 'System user roles and permissions',
    items: userRoleData,
  },
  {
    code: 'fundingSource',
    name: 'Funding Source',
    description: 'Budget allocation sources',
    items: fundingSourceData,
  },
  {
    code: 'uom',
    name: 'Unit of Measure',
    description: 'Standard units of measurement for materials',
    items: uomData,
  },
  {
    code: 'kbli',
    name: 'KBLI Codes',
    description: 'Klasifikasi Baku Lapangan Usaha Indonesia (Indonesian Standard Industrial Classification)',
    items: kbliData,
  },
  {
    code: 'externalBrand',
    name: 'External Brand',
    description: 'Material brands and manufacturers',
    items: externalBrandData,
  },
  {
    code: 'valuationClass',
    name: 'Valuation Class',
    description: 'Material valuation classification codes',
    items: valuationClassData,
  },
  {
    code: 'materialGroup',
    name: 'Material Group',
    description: 'Material grouping categories with descriptions',
    items: materialGroupData,
  },
];

// Helper functions to get active items
export function getActiveJobsites(): string[] {
  return jobsiteData
    .filter(item => item.isActive)
    .sort((a, b) => a.order - b.order)
    .map(item => item.value);
}

export function getActiveDepartments(): string[] {
  return departmentData
    .filter(item => item.isActive)
    .sort((a, b) => a.order - b.order)
    .map(item => item.value);
}

export function getActiveWorkLocations(): string[] {
  return workLocationData
    .filter(item => item.isActive)
    .sort((a, b) => a.order - b.order)
    .map(item => item.value);
}

export function getActiveContractTypes(): string[] {
  return contractTypeData
    .filter(item => item.isActive)
    .sort((a, b) => a.order - b.order)
    .map(item => item.value);
}

export function getActiveContractualTypes(): string[] {
  return contractualTypeData
    .filter(item => item.isActive)
    .sort((a, b) => a.order - b.order)
    .map(item => item.value);
}

export function getActiveUserRoles(): string[] {
  return userRoleData
    .filter(item => item.isActive)
    .sort((a, b) => a.order - b.order)
    .map(item => item.value);
}

export function getActiveFundingSources(): string[] {
  return fundingSourceData
    .filter(item => item.isActive)
    .sort((a, b) => a.order - b.order)
    .map(item => item.value);
}

// Get reference data by category code
export function getReferenceDataByCategory(categoryCode: string): ReferenceDataItem[] {
  const category = referenceDataCategories.find(cat => cat.code === categoryCode);
  return category ? category.items : [];
}

// Get abbreviation for a specific value in a category
export function getAbbreviation(categoryCode: string, value: string): string | null {
  const category = referenceDataCategories.find(cat => cat.code === categoryCode);
  if (!category) return null;
  
  const item = category.items.find(item => item.value === value && item.isActive);
  return item?.abbreviation || null;
}

// Get jobsite abbreviation
export function getJobsiteAbbreviation(jobsite: string): string {
  const abbr = getAbbreviation('jobsite', jobsite);
  return abbr || jobsite.substring(0, 4).toUpperCase();
}

// Get KBLI description by code
export function getKBLIDescription(code: string): string | null {
  const kbli = kbliData.find(item => item.value === code && item.isActive);
  return kbli?.description || null;
}

// Get KBLI display (code only, no description)
export function getKBLIDisplay(code: string): string {
  return code;
}

// Get department abbreviation
export function getDepartmentAbbreviation(department: string): string {
  const abbr = getAbbreviation('department', department);
  return abbr || department.substring(0, 3).toUpperCase();
}

export function getActiveReferenceDataByCategory(categoryCode: string): string[] {
  const items = getReferenceDataByCategory(categoryCode);
  return items
    .filter(item => item.isActive)
    .sort((a, b) => a.order - b.order)
    .map(item => item.value);
}

// Helper functions for Materials Management
export function getActiveUOMs(): string[] {
  return uomData
    .filter(item => item.isActive)
    .sort((a, b) => a.order - b.order)
    .map(item => item.value);
}

export function getActiveExternalBrands(): string[] {
  return externalBrandData
    .filter(item => item.isActive)
    .sort((a, b) => a.order - b.order)
    .map(item => item.value);
}

export function getActiveKBLICodes(): { code: string; description: string }[] {
  return kbliData
    .filter(item => item.isActive)
    .sort((a, b) => a.order - b.order)
    .map(item => ({
      code: item.value,
      description: item.description || ''
    }));
}

export function getActiveValuationClasses(): string[] {
  return valuationClassData
    .filter(item => item.isActive)
    .sort((a, b) => a.order - b.order)
    .map(item => item.value);
}

export function getActiveMaterialGroups(): string[] {
  return materialGroupData
    .filter(item => item.isActive)
    .sort((a, b) => a.order - b.order)
    .map(item => item.value);
}

// Get Material Group Description by Material Group code
export function getMaterialGroupDescription(materialGroupCode: string): string {
  const group = materialGroupData.find(item => item.value === materialGroupCode && item.isActive);
  return group?.description || '';
}

// Get jobsite code (plant) by jobsite name
export function getJobsitePlantCode(jobsite: string): string {
  const jobsiteItem = jobsiteData.find(item => item.value === jobsite && item.isActive);
  return jobsiteItem?.abbreviation || '';
}

// CRUD operations for reference data items
export function createReferenceDataItem(
  categoryCode: string,
  value: string
): ReferenceDataItem | null {
  const category = referenceDataCategories.find(cat => cat.code === categoryCode);
  if (!category) return null;
  
  const maxOrder = category.items.reduce((max, item) => Math.max(max, item.order), 0);
  const now = new Date().toISOString().split('T')[0];
  
  const newItem: ReferenceDataItem = {
    id: `${categoryCode}-${Date.now()}`,
    value,
    isActive: true,
    order: maxOrder + 1,
    createdAt: now,
    updatedAt: now,
  };
  
  category.items.push(newItem);
  return newItem;
}

export function updateReferenceDataItem(
  categoryCode: string,
  id: string,
  updates: Partial<ReferenceDataItem>
): ReferenceDataItem | null {
  const category = referenceDataCategories.find(cat => cat.code === categoryCode);
  if (!category) return null;
  
  const index = category.items.findIndex(item => item.id === id);
  if (index === -1) return null;
  
  const now = new Date().toISOString().split('T')[0];
  category.items[index] = {
    ...category.items[index],
    ...updates,
    updatedAt: now,
  };
  
  return category.items[index];
}

export function deleteReferenceDataItem(categoryCode: string, id: string): boolean {
  const category = referenceDataCategories.find(cat => cat.code === categoryCode);
  if (!category) return false;
  
  const index = category.items.findIndex(item => item.id === id);
  if (index === -1) return false;
  
  category.items.splice(index, 1);
  return true;
}

export function reorderReferenceDataItems(
  categoryCode: string,
  items: ReferenceDataItem[]
): void {
  const category = referenceDataCategories.find(cat => cat.code === categoryCode);
  if (!category) return;
  
  items.forEach((item, index) => {
    const found = category.items.find(i => i.id === item.id);
    if (found) {
      found.order = index + 1;
    }
  });
}
