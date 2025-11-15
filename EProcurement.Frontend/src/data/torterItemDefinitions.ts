// Dynamic TOR/TER Item Definitions - Admins can add/edit/delete these

export interface TORItemDefinition {
  id: string;
  code: string; // e.g., 'performanceSpec', 'brandSpec', 'KBLI'
  label: string; // e.g., 'Performance Specification'
  category: 'tor';
  order: number;
  isActive: boolean;
  validationSource?: 'externalBrand' | 'materialGroup' | 'uom'; // Optional: data source from System Data for validation
}

export interface TERItemDefinition {
  id: string;
  code: string; // e.g., 'technicalSpec', 'drawingRequirements'
  label: string; // e.g., 'Detailed Technical Specification'
  category: 'ter';
  order: number;
  isActive: boolean;
}

export type ItemDefinition = TORItemDefinition | TERItemDefinition;

// Default TOR Item Definitions
export const torItemDefinitions: TORItemDefinition[] = [
  {
    id: 'tor-def-000',
    code: 'KBLI',
    label: 'Klasifikasi Baku Lapangan Usaha Indonesia (KBLI)',
    category: 'tor',
    order: 1,
    isActive: true,
  },
  {
    id: 'tor-def-001',
    code: 'performanceSpec',
    label: 'Performance Specification',
    category: 'tor',
    order: 2,
    isActive: true,
  },
  {
    id: 'tor-def-002',
    code: 'brandSpec',
    label: 'Brand Specification',
    category: 'tor',
    order: 3,
    isActive: true,
    validationSource: 'externalBrand', // Pull data from System Data > External Brand
  },
  {
    id: 'tor-def-003',
    code: 'afterSalesService',
    label: 'After Sales Service & Stock Availability',
    category: 'tor',
    order: 4,
    isActive: true,
  },
  {
    id: 'tor-def-004',
    code: 'supplierCapability',
    label: 'Supplier Capability & Financial Condition',
    category: 'tor',
    order: 5,
    isActive: true,
  },
  {
    id: 'tor-def-005',
    code: 'workshopTools',
    label: 'Workshop Tools & Equipment Support',
    category: 'tor',
    order: 6,
    isActive: true,
  },
  {
    id: 'tor-def-006',
    code: 'leadTime',
    label: 'Lead Time',
    category: 'tor',
    order: 7,
    isActive: true,
  },
  {
    id: 'tor-def-007',
    code: 'paymentTerms',
    label: 'Payment Terms',
    category: 'tor',
    order: 8,
    isActive: true,
  },
  {
    id: 'tor-def-008',
    code: 'warranty',
    label: 'Warranty Period & Claim Procedure',
    category: 'tor',
    order: 9,
    isActive: true,
  },
];

// Default TER Item Definitions
export const terItemDefinitions: TERItemDefinition[] = [
  {
    id: 'ter-def-001',
    code: 'technicalSpec',
    label: 'Detailed Technical Specification',
    category: 'ter',
    order: 1,
    isActive: true,
  },
  {
    id: 'ter-def-002',
    code: 'drawingRequirements',
    label: 'Drawing Requirements (GA/Shop Drawing)',
    category: 'ter',
    order: 2,
    isActive: true,
  },
  {
    id: 'ter-def-003',
    code: 'qualityStandards',
    label: 'Quality Standards (ISO/SNI/ASTM)',
    category: 'ter',
    order: 3,
    isActive: true,
  },
  {
    id: 'ter-def-004',
    code: 'testingRequirements',
    label: 'Testing & Inspection Requirements',
    category: 'ter',
    order: 4,
    isActive: true,
  },
  {
    id: 'ter-def-005',
    code: 'certifications',
    label: 'Required Certifications',
    category: 'ter',
    order: 5,
    isActive: true,
  },
  {
    id: 'ter-def-006',
    code: 'materialStandards',
    label: 'Material Standards & Grade',
    category: 'ter',
    order: 6,
    isActive: true,
  },
  {
    id: 'ter-def-007',
    code: 'manufacturingProcess',
    label: 'Manufacturing Process Requirements',
    category: 'ter',
    order: 7,
    isActive: true,
  },
  {
    id: 'ter-def-008',
    code: 'inspectionProcedure',
    label: 'Inspection Procedure & Documentation',
    category: 'ter',
    order: 8,
    isActive: true,
  },
];

// Helper functions to get active definitions
export function getActiveTORDefinitions(): TORItemDefinition[] {
  return torItemDefinitions
    .filter(def => def.isActive)
    .sort((a, b) => a.order - b.order);
}

export function getActiveTERDefinitions(): TERItemDefinition[] {
  return terItemDefinitions
    .filter(def => def.isActive)
    .sort((a, b) => a.order - b.order);
}

export function getAllTORDefinitions(): TORItemDefinition[] {
  return [...torItemDefinitions].sort((a, b) => a.order - b.order);
}

export function getAllTERDefinitions(): TERItemDefinition[] {
  return [...terItemDefinitions].sort((a, b) => a.order - b.order);
}

// CRUD operations for TOR definitions
export function createTORDefinition(
  code: string,
  label: string
): TORItemDefinition {
  const maxOrder = torItemDefinitions.reduce(
    (max, def) => Math.max(max, def.order),
    0
  );
  
  const newDef: TORItemDefinition = {
    id: `tor-def-${Date.now()}`,
    code,
    label,
    category: 'tor',
    order: maxOrder + 1,
    isActive: true,
  };
  
  torItemDefinitions.push(newDef);
  return newDef;
}

export function updateTORDefinition(
  id: string,
  updates: Partial<TORItemDefinition>
): TORItemDefinition | null {
  const index = torItemDefinitions.findIndex(def => def.id === id);
  if (index === -1) return null;
  
  torItemDefinitions[index] = { ...torItemDefinitions[index], ...updates };
  return torItemDefinitions[index];
}

export function deleteTORDefinition(id: string): boolean {
  const index = torItemDefinitions.findIndex(def => def.id === id);
  if (index === -1) return false;
  
  torItemDefinitions.splice(index, 1);
  return true;
}

// CRUD operations for TER definitions
export function createTERDefinition(
  code: string,
  label: string
): TERItemDefinition {
  const maxOrder = terItemDefinitions.reduce(
    (max, def) => Math.max(max, def.order),
    0
  );
  
  const newDef: TERItemDefinition = {
    id: `ter-def-${Date.now()}`,
    code,
    label,
    category: 'ter',
    order: maxOrder + 1,
    isActive: true,
  };
  
  terItemDefinitions.push(newDef);
  return newDef;
}

export function updateTERDefinition(
  id: string,
  updates: Partial<TERItemDefinition>
): TERItemDefinition | null {
  const index = terItemDefinitions.findIndex(def => def.id === id);
  if (index === -1) return null;
  
  terItemDefinitions[index] = { ...terItemDefinitions[index], ...updates };
  return terItemDefinitions[index];
}

export function deleteTERDefinition(id: string): boolean {
  const index = terItemDefinitions.findIndex(def => def.id === id);
  if (index === -1) return false;
  
  terItemDefinitions.splice(index, 1);
  return true;
}

// Reorder functions
export function reorderTORDefinitions(definitions: TORItemDefinition[]): void {
  definitions.forEach((def, index) => {
    const found = torItemDefinitions.find(d => d.id === def.id);
    if (found) {
      found.order = index + 1;
    }
  });
}

export function reorderTERDefinitions(definitions: TERItemDefinition[]): void {
  definitions.forEach((def, index) => {
    const found = terItemDefinitions.find(d => d.id === def.id);
    if (found) {
      found.order = index + 1;
    }
  });
}
