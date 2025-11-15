// TOR/TER Matrix - Maps sub-classifications to TOR and TER requirements

export interface TORItemDefault {
  parameter?: string;
  requirement?: string;
  description?: string;
}

export interface TERItemDefault {
  parameter?: string;
  requirement?: string;
  description?: string;
}

export interface MatrixEntry {
  id: string;
  subClassificationCode: string;
  subClassificationName: string;
  description: string;
  showInTOR: boolean;
  showInTER: boolean;
  torItems?: {
    KBLI?: boolean; // Klasifikasi Baku Lapangan Usaha Indonesia - MANDATORY for all
    performanceSpec?: boolean;
    brandSpec?: boolean;
    afterSalesService?: boolean;
    supplierCapability?: boolean;
    workshopTools?: boolean;
    leadTime?: boolean;
    paymentTerms?: boolean;
    warranty?: boolean;
  };
  terItems?: {
    technicalSpec?: boolean;
    drawingRequirements?: boolean;
    qualityStandards?: boolean;
    testingRequirements?: boolean;
    certifications?: boolean;
    materialStandards?: boolean;
    manufacturingProcess?: boolean;
    inspectionProcedure?: boolean;
  };
  // ✅ NEW: Default content for TOR/TER items (Nov 12, 2025)
  torDefaults?: {
    KBLI?: TORItemDefault;
    performanceSpec?: TORItemDefault;
    brandSpec?: TORItemDefault;
    afterSalesService?: TORItemDefault;
    supplierCapability?: TORItemDefault;
    workshopTools?: TORItemDefault;
    leadTime?: TORItemDefault;
    paymentTerms?: TORItemDefault;
    warranty?: TORItemDefault;
  };
  terDefaults?: {
    technicalSpec?: TERItemDefault;
    drawingRequirements?: TERItemDefault;
    qualityStandards?: TERItemDefault;
    testingRequirements?: TERItemDefault;
    certifications?: TERItemDefault;
    materialStandards?: TERItemDefault;
    manufacturingProcess?: TERItemDefault;
    inspectionProcedure?: TERItemDefault;
  };
}

// Default TOR/TER Matrix Data
export const torterMatrix: MatrixEntry[] = [
  // M.01.01 - Bearing
  {
    id: 'matrix-001',
    subClassificationCode: 'M.01.01',
    subClassificationName: 'M.01.01 Bearing',
    description: 'Rolling element bearings for rotating machinery and equipment',
    showInTOR: true,
    showInTER: true,
    torItems: {
      performanceSpec: true,
      brandSpec: true,
      afterSalesService: true,
      supplierCapability: true,
      leadTime: true,
      paymentTerms: true,
      warranty: true,
    },
    terItems: {
      technicalSpec: true,
      qualityStandards: true,
      certifications: true,
      materialStandards: true,
    },
    // ✅ Default content for Bearing TOR (Generic/Instructional)
    torDefaults: {
      KBLI: {
        parameter: 'Describe KBLI Classification',
        requirement: 'Enter specific KBLI codes required for this procurement',
        description: 'Describe KBLI verification requirements and applicable codes'
      },
      performanceSpec: {
        parameter: 'Describe Performance Specification',
        requirement: 'Enter performance requirements',
        description: 'Describe performance criteria'
      },
      brandSpec: {
        parameter: 'Describe Brand Specification',
        requirement: 'Enter approved brands or equivalent requirements',
        description: 'Describe brand requirements and equivalent criteria'
      },
      afterSalesService: {
        parameter: 'Describe After Sales Service Requirements',
        requirement: 'Enter after-sales service requirements',
        description: 'Describe after-sales service criteria'
      },
      supplierCapability: {
        parameter: 'Describe Supplier Capability Requirements',
        requirement: 'Enter supplier capability requirements',
        description: 'Describe supplier capability criteria'
      },
      leadTime: {
        parameter: 'Describe Lead Time Requirements',
        requirement: 'Enter lead time requirements',
        description: 'Describe lead time criteria'
      },
      paymentTerms: {
        parameter: 'Describe Payment Terms',
        requirement: 'Enter payment terms requirements',
        description: 'Describe payment terms criteria'
      },
      warranty: {
        parameter: 'Describe Warranty Requirements',
        requirement: 'Enter warranty requirements',
        description: 'Describe warranty criteria'
      }
    },
    // ✅ Default content for Bearing TER (Generic/Instructional)
    terDefaults: {
      technicalSpec: {
        parameter: 'Describe Technical Specification',
        requirement: 'Enter technical specification requirements',
        description: 'Describe technical specification criteria'
      },
      qualityStandards: {
        parameter: 'Describe Quality Standards',
        requirement: 'Enter quality standards requirements',
        description: 'Describe quality standards criteria'
      },
      certifications: {
        parameter: 'Describe Required Certifications',
        requirement: 'Enter certification requirements',
        description: 'Describe certification criteria'
      },
      materialStandards: {
        parameter: 'Describe Material Standards',
        requirement: 'Enter material standards requirements',
        description: 'Describe material standards criteria'
      }
    }
  },
  // M.01.02 - Bolt & Nut
  {
    id: 'matrix-002',
    subClassificationCode: 'M.01.02',
    subClassificationName: 'M.01.02 Bolt & Nut',
    description: 'Fasteners including bolts, nuts, and related hardware components',
    showInTOR: true,
    showInTER: true,
    torItems: {
      performanceSpec: true,
      brandSpec: false,
      afterSalesService: false,
      supplierCapability: true,
      leadTime: true,
      paymentTerms: true,
    },
    terItems: {
      technicalSpec: true,
      qualityStandards: true,
      materialStandards: true,
    },
    // ✅ Default content for Bolt & Nut TOR (Generic/Instructional)
    torDefaults: {
      KBLI: {
        parameter: 'Describe KBLI Classification',
        requirement: 'Enter specific KBLI codes required for this procurement',
        description: 'Describe KBLI verification requirements and applicable codes'
      },
      performanceSpec: {
        parameter: 'Describe Performance Specification',
        requirement: 'Enter performance requirements',
        description: 'Describe performance criteria'
      },
      supplierCapability: {
        parameter: 'Describe Supplier Capability Requirements',
        requirement: 'Enter supplier capability requirements',
        description: 'Describe supplier capability criteria'
      },
      leadTime: {
        parameter: 'Describe Lead Time Requirements',
        requirement: 'Enter lead time requirements',
        description: 'Describe lead time criteria'
      },
      paymentTerms: {
        parameter: 'Describe Payment Terms',
        requirement: 'Enter payment terms requirements',
        description: 'Describe payment terms criteria'
      }
    },
    // ✅ Default content for Bolt & Nut TER (Generic/Instructional)
    terDefaults: {
      technicalSpec: {
        parameter: 'Describe Technical Specification',
        requirement: 'Enter technical specification requirements',
        description: 'Describe technical specification criteria'
      },
      qualityStandards: {
        parameter: 'Describe Quality Standards',
        requirement: 'Enter quality standards requirements',
        description: 'Describe quality standards criteria'
      },
      materialStandards: {
        parameter: 'Describe Material Standards',
        requirement: 'Enter material standards requirements',
        description: 'Describe material standards criteria'
      }
    }
  },
  // M.01.03 - Seal
  {
    id: 'matrix-003',
    subClassificationCode: 'M.01.03',
    subClassificationName: 'M.01.03 Seal',
    description: 'Sealing components for preventing fluid leakage in machinery',
    showInTOR: true,
    showInTER: true,
    torItems: {
      performanceSpec: true,
      brandSpec: true,
      afterSalesService: true,
      supplierCapability: true,
      leadTime: true,
      paymentTerms: true,
      warranty: true,
    },
    terItems: {
      technicalSpec: true,
      qualityStandards: true,
      materialStandards: true,
      certifications: true,
    },
  },
  // M.01.04 - Filter
  {
    id: 'matrix-004',
    subClassificationCode: 'M.01.04',
    subClassificationName: 'M.01.04 Filter',
    description: 'Filtration systems for air, oil, fuel, and hydraulic applications',
    showInTOR: true,
    showInTER: true,
    torItems: {
      performanceSpec: true,
      brandSpec: true,
      afterSalesService: true,
      supplierCapability: true,
      leadTime: true,
      paymentTerms: true,
      warranty: true,
    },
    terItems: {
      technicalSpec: true,
      qualityStandards: true,
      certifications: true,
    },
  },
  // M.01.05 - Belt
  {
    id: 'matrix-005',
    subClassificationCode: 'M.01.05',
    subClassificationName: 'M.01.05 Belt',
    description: 'Power transmission belts including V-belts and timing belts',
    showInTOR: true,
    showInTER: true,
    torItems: {
      performanceSpec: true,
      brandSpec: true,
      afterSalesService: true,
      supplierCapability: true,
      leadTime: true,
      paymentTerms: true,
      warranty: true,
    },
    terItems: {
      technicalSpec: true,
      qualityStandards: true,
      materialStandards: true,
    },
  },
  // M.01.06 - Hose
  {
    id: 'matrix-006',
    subClassificationCode: 'M.01.06',
    subClassificationName: 'M.01.06 Hose',
    description: 'Hydraulic and pneumatic hoses for fluid power systems',
    showInTOR: true,
    showInTER: true,
    torItems: {
      performanceSpec: true,
      brandSpec: true,
      afterSalesService: true,
      supplierCapability: true,
      leadTime: true,
      paymentTerms: true,
      warranty: true,
    },
    terItems: {
      technicalSpec: true,
      qualityStandards: true,
      testingRequirements: true,
      certifications: true,
      materialStandards: true,
    },
  },
  // M.02.01 - Tire
  {
    id: 'matrix-007',
    subClassificationCode: 'M.02.01',
    subClassificationName: 'M.02.01 Tire',
    description: 'Pneumatic tires for vehicles and heavy equipment',
    showInTOR: true,
    showInTER: true,
    torItems: {
      performanceSpec: true,
      brandSpec: true,
      afterSalesService: true,
      supplierCapability: true,
      leadTime: true,
      paymentTerms: true,
      warranty: true,
    },
    terItems: {
      technicalSpec: true,
      qualityStandards: true,
      certifications: true,
    },
  },
  // M.03.01 - Oil & Grease
  {
    id: 'matrix-008',
    subClassificationCode: 'M.03.01',
    subClassificationName: 'M.03.01 Oil & Grease',
    description: 'Lubricants including engine oil, hydraulic oil, and grease',
    showInTOR: true,
    showInTER: true,
    torItems: {
      performanceSpec: true,
      brandSpec: true,
      afterSalesService: true,
      supplierCapability: true,
      leadTime: true,
      paymentTerms: true,
    },
    terItems: {
      technicalSpec: true,
      qualityStandards: true,
      certifications: true,
      testingRequirements: true,
    },
  },
  // M.07.01 - Helmet
  {
    id: 'matrix-009',
    subClassificationCode: 'M.07.01',
    subClassificationName: 'M.07.01 Helmet',
    description: 'Safety helmets for head protection in industrial environments',
    showInTOR: true,
    showInTER: true,
    torItems: {
      performanceSpec: true,
      brandSpec: false,
      afterSalesService: false,
      supplierCapability: true,
      leadTime: true,
      paymentTerms: true,
      warranty: true,
    },
    terItems: {
      technicalSpec: true,
      qualityStandards: true,
      certifications: true,
      testingRequirements: true,
    },
  },
  // S.01.01 - Heavy Equipment Maintenance
  {
    id: 'matrix-010',
    subClassificationCode: 'S.01.01',
    subClassificationName: 'S.01.01 Heavy Equipment Maintenance',
    description: 'Maintenance services for heavy machinery and mining equipment',
    showInTOR: true,
    showInTER: true,
    torItems: {
      performanceSpec: true,
      afterSalesService: true,
      supplierCapability: true,
      workshopTools: true,
      leadTime: true,
      paymentTerms: true,
      warranty: true,
    },
    terItems: {
      technicalSpec: true,
      qualityStandards: true,
      certifications: true,
      inspectionProcedure: true,
    },
  },
  // S.07.01 - Technical Training
  {
    id: 'matrix-011',
    subClassificationCode: 'S.07.01',
    subClassificationName: 'S.07.01 Technical Training',
    description: 'Technical skill development and training programs for personnel',
    showInTOR: true,
    showInTER: true,
    torItems: {
      performanceSpec: true,
      supplierCapability: true,
      leadTime: true,
      paymentTerms: true,
    },
    terItems: {
      technicalSpec: true,
      certifications: true,
    },
  },
  // P.01.01 - Mining Road Development
  {
    id: 'matrix-012',
    subClassificationCode: 'P.01.01',
    subClassificationName: 'P.01.01 Mining Road Development',
    description: 'Development and construction of mining access and haul roads',
    showInTOR: true,
    showInTER: true,
    torItems: {
      performanceSpec: true,
      supplierCapability: true,
      workshopTools: true,
      leadTime: true,
      paymentTerms: true,
      warranty: true,
    },
    terItems: {
      technicalSpec: true,
      drawingRequirements: true,
      qualityStandards: true,
      testingRequirements: true,
      materialStandards: true,
      inspectionProcedure: true,
    },
  },
  // P.02.01 - Workshop Construction
  {
    id: 'matrix-013',
    subClassificationCode: 'P.02.01',
    subClassificationName: 'P.02.01 Workshop Construction',
    description: 'Construction of workshop facilities for equipment maintenance and repair',
    showInTOR: true,
    showInTER: true,
    torItems: {
      performanceSpec: true,
      supplierCapability: true,
      workshopTools: true,
      leadTime: true,
      paymentTerms: true,
      warranty: true,
    },
    terItems: {
      technicalSpec: true,
      drawingRequirements: true,
      qualityStandards: true,
      materialStandards: true,
      inspectionProcedure: true,
    },
  },
  // P.03.01 - Crushing Plant Installation
  {
    id: 'matrix-014',
    subClassificationCode: 'P.03.01',
    subClassificationName: 'P.03.01 Crushing Plant Installation',
    description: 'Installation and commissioning of crushing plant equipment and systems',
    showInTOR: true,
    showInTER: true,
    torItems: {
      performanceSpec: true,
      brandSpec: true,
      afterSalesService: true,
      supplierCapability: true,
      workshopTools: true,
      leadTime: true,
      paymentTerms: true,
      warranty: true,
    },
    terItems: {
      technicalSpec: true,
      drawingRequirements: true,
      qualityStandards: true,
      testingRequirements: true,
      certifications: true,
      inspectionProcedure: true,
    },
  },
  // P.04.01 - ERP System Implementation
  {
    id: 'matrix-015',
    subClassificationCode: 'P.04.01',
    subClassificationName: 'P.04.01 ERP System Implementation',
    description: 'Enterprise Resource Planning system implementation and customization',
    showInTOR: true,
    showInTER: true,
    torItems: {
      performanceSpec: true,
      brandSpec: true,
      afterSalesService: true,
      supplierCapability: true,
      leadTime: true,
      paymentTerms: true,
      warranty: true,
    },
    terItems: {
      technicalSpec: true,
      qualityStandards: true,
      certifications: true,
      testingRequirements: true,
    },
  },
  // P.05.01 - Reclamation Project
  {
    id: 'matrix-016',
    subClassificationCode: 'P.05.01',
    subClassificationName: 'P.05.01 Reclamation Project',
    description: 'Land reclamation and environmental restoration project',
    showInTOR: true,
    showInTER: true,
    torItems: {
      performanceSpec: true,
      supplierCapability: true,
      leadTime: true,
      paymentTerms: true,
      warranty: true,
    },
    terItems: {
      technicalSpec: true,
      qualityStandards: true,
      certifications: true,
      testingRequirements: true,
      inspectionProcedure: true,
    },
  },
];

// ✅ Helper: Generate generic TOR item default content
function generateGenericTORDefault(itemCode: string, label: string): TORItemDefault {
  // Special handling for KBLI and Brand (have specific rules)
  if (itemCode === 'KBLI') {
    return {
      parameter: 'Describe KBLI Classification',
      requirement: 'Enter specific KBLI codes required for this procurement',
      description: 'Describe KBLI verification requirements and applicable codes'
    };
  }
  
  if (itemCode === 'brandSpec') {
    return {
      parameter: 'Describe Brand Specification',
      requirement: 'Enter approved brands or equivalent requirements',
      description: 'Describe brand requirements and equivalent criteria'
    };
  }
  
  // Generic format for all other items
  const cleanLabel = label.replace(/\(.*?\)/g, '').trim(); // Remove parentheses content
  return {
    parameter: `Describe ${cleanLabel}`,
    requirement: 'Enter requirement',
    description: 'Describe criteria'
  };
}

// ✅ Helper: Generate generic TER item default content
function generateGenericTERDefault(itemCode: string, label: string): TERItemDefault {
  const cleanLabel = label.replace(/\(.*?\)/g, '').trim();
  return {
    parameter: `Describe ${cleanLabel}`,
    requirement: 'Enter requirement',
    description: 'Describe criteria'
  };
}

// Helper function to ensure KBLI is always included and set to true for all matrix entries
function ensureKBLIInMatrixEntries() {
  torterMatrix.forEach(entry => {
    if (entry.torItems) {
      // KBLI is MANDATORY for all sub-classifications
      entry.torItems = { KBLI: true, ...entry.torItems };
    }
  });
}

// Initialize KBLI for all entries
ensureKBLIInMatrixEntries();

// Function to get matrix entry by sub-classification code
export function getMatrixBySubClassification(subClassificationCode: string): MatrixEntry | undefined {
  return torterMatrix.find(entry => entry.subClassificationCode === subClassificationCode);
}

// Function to get all matrix entries
export function getAllMatrixEntries(): MatrixEntry[] {
  return torterMatrix;
}

// ✅ NEW: Function to populate TOR items with defaults based on sub-classification (Nov 12, 2025)
// Updated: If no specific defaults exist, use generic instructional defaults
export function populateTORItemsWithDefaults(subClassificationCode: string, torItemDefinitions: any[]): any[] {
  const matrixEntry = getMatrixBySubClassification(subClassificationCode);
  if (!matrixEntry || !matrixEntry.torItems) {
    // No matrix entry found - return empty TOR items with enabled=false
    return torItemDefinitions.map(def => ({
      id: def.code,
      label: def.label,
      enabled: false,
      parameter: '',
      requirement: '',
      description: '',
      remarks: '',
      placeholderParameter: 'Enter parameter',
      placeholderRequirement: 'Enter requirement',
      placeholderDescription: 'Enter description'
    }));
  }

  return torItemDefinitions.map(def => {
    const itemCode = def.code;
    const isEnabled = matrixEntry.torItems[itemCode] === true;
    
    // Try to get specific defaults, otherwise generate generic defaults
    let defaults = matrixEntry.torDefaults?.[itemCode];
    if (!defaults && isEnabled) {
      // Generate generic instructional defaults
      defaults = generateGenericTORDefault(itemCode, def.label);
    }

    return {
      id: itemCode,
      label: def.label,
      enabled: isEnabled,
      parameter: '', // ✅ Always empty - user input only
      requirement: '', // ✅ Always empty - user input only
      description: '', // ✅ Always empty - user input only
      remarks: '',
      // ✅ Placeholder text (light gray guide text)
      placeholderParameter: defaults?.parameter || 'Enter parameter',
      placeholderRequirement: defaults?.requirement || 'Enter requirement',
      placeholderDescription: defaults?.description || 'Enter description'
    };
  });
}

// ✅ NEW: Function to populate TER items with defaults based on sub-classification (Nov 12, 2025)
// Updated: If no specific defaults exist, use generic instructional defaults
export function populateTERItemsWithDefaults(subClassificationCode: string, terItemDefinitions: any[]): any[] {
  const matrixEntry = getMatrixBySubClassification(subClassificationCode);
  if (!matrixEntry || !matrixEntry.terItems) {
    // No matrix entry found - return empty TER items with enabled=false
    return terItemDefinitions.map(def => ({
      id: def.code,
      label: def.label,
      enabled: false,
      parameter: '',
      requirement: '',
      description: '',
      remarks: '',
      uploadedFile: null,
      placeholderParameter: 'Enter parameter',
      placeholderRequirement: 'Enter requirement',
      placeholderDescription: 'Enter description'
    }));
  }

  return terItemDefinitions.map(def => {
    const itemCode = def.code;
    const isEnabled = matrixEntry.terItems[itemCode] === true;
    
    // Try to get specific defaults, otherwise generate generic defaults
    let defaults = matrixEntry.terDefaults?.[itemCode];
    if (!defaults && isEnabled) {
      // Generate generic instructional defaults
      defaults = generateGenericTERDefault(itemCode, def.label);
    }

    return {
      id: itemCode,
      label: def.label,
      enabled: isEnabled,
      parameter: '', // ✅ Always empty - user input only
      requirement: '', // ✅ Always empty - user input only
      description: '', // ✅ Always empty - user input only
      remarks: '',
      uploadedFile: null,
      // ✅ Placeholder text (light gray guide text)
      placeholderParameter: defaults?.parameter || 'Enter parameter',
      placeholderRequirement: defaults?.requirement || 'Enter requirement',
      placeholderDescription: defaults?.description || 'Enter description'
    };
  });
}

// Admin functions for matrix management (in a real app, these would call an API)
export function createMatrixEntry(entry: Omit<MatrixEntry, 'id'>): MatrixEntry {
  const newEntry: MatrixEntry = {
    ...entry,
    id: `matrix-${Date.now()}`,
  };
  torterMatrix.push(newEntry);
  return newEntry;
}

export function updateMatrixEntry(id: string, updates: Partial<MatrixEntry>): MatrixEntry | null {
  const index = torterMatrix.findIndex(entry => entry.id === id);
  if (index === -1) return null;
  
  torterMatrix[index] = { ...torterMatrix[index], ...updates };
  return torterMatrix[index];
}

export function deleteMatrixEntry(id: string): boolean {
  const index = torterMatrix.findIndex(entry => entry.id === id);
  if (index === -1) return false;
  
  torterMatrix.splice(index, 1);
  return true;
}
