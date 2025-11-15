import { ApprovalMatrix } from '../types';

// Approval Matrix Data based on Department, Jobsite, and Amount
// Updated: November 7, 2025 - Complete coverage for ALL departments and jobsites
// Automated generation for consistency and maintainability

// ==================== CONFIGURATION ====================

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

// Standard 9 amount ranges + additional range for extremely large amounts
// FIXED Nov 12, 2025: Added missing range $500k-$1M to eliminate gap
const AMOUNT_RANGES = [
  { range: '01', min: 0, max: 2500 },
  { range: '02', min: 2500, max: 5000 },
  { range: '03', min: 5000, max: 35000 },
  { range: '04', min: 35000, max: 100000 },
  { range: '05', min: 100000, max: 250000 },
  { range: '06', min: 250000, max: 500000 },
  { range: '06B', min: 500000, max: 1000000 },      // ✅ NEW: Fill the gap $500k-$1M
  { range: '07', min: 1000000, max: 2000000 },
  { range: '08', min: 2000000, max: 5000000 },
  { range: '09', min: 5000000, max: 999999999999999 } // Extended to cover extremely large amounts (up to quadrillion)
];

// Standard approval paths for each range
// UPDATED: Removed Verificator role per requirement - approval strictly follows matrix hierarchy
const APPROVAL_PATHS = {
  '01': [
    { stepNumber: 1, stepName: 'Unit Head Approval', role: 'UH User' as const },
    { stepNumber: 2, stepName: 'Section Head Approval', role: 'SH User' as const }
  ],
  '02': [
    { stepNumber: 1, stepName: 'Section Head Approval', role: 'SH User' as const },
    { stepNumber: 2, stepName: 'Department Head Approval', role: 'DH User' as const }
  ],
  '03': [
    { stepNumber: 1, stepName: 'Department Head Approval', role: 'DH User' as const },
    { stepNumber: 2, stepName: 'Division Head Approval', role: 'DIV User' as const }
  ],
  '04': [
    { stepNumber: 1, stepName: 'Department Head Approval', role: 'DH User' as const },
    { stepNumber: 2, stepName: 'Division Head Approval', role: 'DIV User' as const }
  ],
  '05': [
    { stepNumber: 1, stepName: 'Department Head Approval', role: 'DH User' as const },
    { stepNumber: 2, stepName: 'Division Head Approval', role: 'DIV User' as const },
    { stepNumber: 3, stepName: 'Chief Operation Approval', role: 'Chief Operation Site' as const }
  ],
  '06': [
    { stepNumber: 1, stepName: 'Department Head Approval', role: 'DH User' as const },
    { stepNumber: 2, stepName: 'Division Head Approval', role: 'DIV User' as const },
    { stepNumber: 3, stepName: 'Chief Operation Approval', role: 'Chief Operation Site' as const },
    { stepNumber: 4, stepName: 'Director Approval', role: 'Dir User' as const }
  ],
  '06B': [
    { stepNumber: 1, stepName: 'Department Head Approval', role: 'DH User' as const },
    { stepNumber: 2, stepName: 'Division Head Approval', role: 'DIV User' as const },
    { stepNumber: 3, stepName: 'Chief Operation Approval', role: 'Chief Operation Site' as const },
    { stepNumber: 4, stepName: 'Director Approval', role: 'Dir User' as const }
  ],
  '07': [
    { stepNumber: 1, stepName: 'Department Head Approval', role: 'DH User' as const },
    { stepNumber: 2, stepName: 'Division Head Approval', role: 'DIV User' as const },
    { stepNumber: 3, stepName: 'Chief Operation Approval', role: 'Chief Operation Site' as const },
    { stepNumber: 4, stepName: 'Director Approval', role: 'Dir User' as const },
    { stepNumber: 5, stepName: 'President Director Approval', role: 'President Director' as const }
  ],
  '08': [
    { stepNumber: 1, stepName: 'Department Head Approval', role: 'DH User' as const },
    { stepNumber: 2, stepName: 'Division Head Approval', role: 'DIV User' as const },
    { stepNumber: 3, stepName: 'Chief Operation Approval', role: 'Chief Operation Site' as const },
    { stepNumber: 4, stepName: 'Director Approval', role: 'Dir User' as const },
    { stepNumber: 5, stepName: 'President Director Approval', role: 'President Director' as const }
  ],
  '09': [
    { stepNumber: 1, stepName: 'Department Head Approval', role: 'DH User' as const },
    { stepNumber: 2, stepName: 'Division Head Approval', role: 'DIV User' as const },
    { stepNumber: 3, stepName: 'Chief Operation Approval', role: 'Chief Operation Site' as const },
    { stepNumber: 4, stepName: 'Director Approval', role: 'Dir User' as const },
    { stepNumber: 5, stepName: 'President Director Approval', role: 'President Director' as const }
  ]
};

// ==================== MATRIX GENERATOR ====================

function generateMatrixId(department: string, jobsite: string, rangeNumber: string): string {
  const deptAbbr = department.substring(0, 3).toUpperCase();
  const jobsiteAbbr = jobsite.replace(/\s+/g, '_').toUpperCase();
  return `AM_${deptAbbr}_${jobsiteAbbr}_${rangeNumber}`;
}

function generateGroupName(department: string, jobsite: string): string {
  return `Creator ${department} Department ${jobsite}`;
}

function generateApprovalMatrices(): ApprovalMatrix[] {
  const matrices: ApprovalMatrix[] = [];
  let counter = 1;

  for (const department of DEPARTMENTS) {
    for (const jobsite of JOBSITES) {
      for (const amountRange of AMOUNT_RANGES) {
        const matrix: ApprovalMatrix = {
          id: generateMatrixId(department, jobsite, amountRange.range),
          department,
          jobsite,
          amountMin: amountRange.min,
          amountMax: amountRange.max,
          group: generateGroupName(department, jobsite),
          approvalPath: APPROVAL_PATHS[amountRange.range as keyof typeof APPROVAL_PATHS],
          createdDate: '2025-11-07',
          updatedDate: '2025-11-07'
        };
        matrices.push(matrix);
        counter++;
      }
    }
  }

  return matrices;
}

// ==================== EXPORTED DATA ====================

export const approvalMatrixData: ApprovalMatrix[] = generateApprovalMatrices();

// Validation log on load
console.log(`[ApprovalMatrix] Loaded ${approvalMatrixData.length} matrix entries`);
console.log(`[ApprovalMatrix] Coverage: ${DEPARTMENTS.length} departments × ${JOBSITES.length} jobsites × ${AMOUNT_RANGES.length} ranges = ${DEPARTMENTS.length * JOBSITES.length * AMOUNT_RANGES.length} expected`);
console.log(`[ApprovalMatrix] Departments:`, DEPARTMENTS);
console.log(`[ApprovalMatrix] Jobsites:`, JOBSITES);
console.log(`[ApprovalMatrix] Max amount supported: $${AMOUNT_RANGES[AMOUNT_RANGES.length - 1].max.toLocaleString()}`);

// ==================== HELPER FUNCTIONS ====================

// Helper function to get approval matrix by conditions
export function getApprovalMatrix(
  department: string,
  jobsite: string,
  amount: number
): ApprovalMatrix | undefined {
  // Debug logging
  console.log(`[ApprovalMatrix] Looking for: Department="${department}", Jobsite="${jobsite}", Amount=${amount}`);
  
  const result = approvalMatrixData.find(
    (matrix) =>
      matrix.department === department &&
      matrix.jobsite === jobsite &&
      amount >= matrix.amountMin &&
      amount <= matrix.amountMax
  );
  
  if (!result) {
    console.warn(`[ApprovalMatrix] No match found. Available departments:`, DEPARTMENTS);
    console.warn(`[ApprovalMatrix] Available jobsites:`, JOBSITES);
    console.warn(`[ApprovalMatrix] Total matrices:`, approvalMatrixData.length);
    
    // Check for partial matches to help debugging
    const deptMatches = approvalMatrixData.filter(m => m.department === department);
    const jobsiteMatches = approvalMatrixData.filter(m => m.jobsite === jobsite);
    console.warn(`[ApprovalMatrix] Matrices for department "${department}":`, deptMatches.length);
    console.warn(`[ApprovalMatrix] Matrices for jobsite "${jobsite}":`, jobsiteMatches.length);
    
    // Check amount ranges
    const amountMatches = approvalMatrixData.filter(m => amount >= m.amountMin && amount <= m.amountMax);
    console.warn(`[ApprovalMatrix] Matrices covering amount $${amount}:`, amountMatches.length);
  } else {
    console.log(`[ApprovalMatrix] ✓ Match found:`, result.id);
  }
  
  return result;
}

// Helper function to get all matrices for a jobsite
export function getMatricesByJobsite(jobsite: string): ApprovalMatrix[] {
  return approvalMatrixData.filter((matrix) => matrix.jobsite === jobsite);
}

// Helper function to get all matrices for a department
export function getMatricesByDepartment(department: string): ApprovalMatrix[] {
  return approvalMatrixData.filter((matrix) => matrix.department === department);
}

// Helper function to get matrices for a specific department-jobsite combination
export function getMatricesByDepartmentJobsite(department: string, jobsite: string): ApprovalMatrix[] {
  return approvalMatrixData.filter(
    (matrix) => matrix.department === department && matrix.jobsite === jobsite
  );
}

// Helper function to get approval path for a proposal
export function getApprovalPath(
  department: string,
  jobsite: string,
  amount: number
): ApprovalMatrix['approvalPath'] | undefined {
  const matrix = getApprovalMatrix(department, jobsite, amount);
  return matrix?.approvalPath;
}

// Get all unique departments in the matrix
export function getAllDepartments(): string[] {
  return DEPARTMENTS;
}

// Get all unique jobsites in the matrix
export function getAllJobsites(): string[] {
  return JOBSITES;
}

// Get matrix statistics
export function getMatrixStatistics() {
  return {
    totalMatrices: approvalMatrixData.length,
    departments: DEPARTMENTS.length,
    jobsites: JOBSITES.length,
    amountRanges: AMOUNT_RANGES.length,
    combinationsPerDept: JOBSITES.length * AMOUNT_RANGES.length,
    combinationsPerJobsite: DEPARTMENTS.length * AMOUNT_RANGES.length
  };
}

// Get matrices by amount range
export function getMatricesByAmountRange(min: number, max: number): ApprovalMatrix[] {
  return approvalMatrixData.filter(
    (matrix) => matrix.amountMin === min && matrix.amountMax === max
  );
}

// Validate if a department-jobsite combination exists
export function hasCombination(department: string, jobsite: string): boolean {
  return approvalMatrixData.some(
    (matrix) => matrix.department === department && matrix.jobsite === jobsite
  );
}

// Get approval path template for a specific range
export function getApprovalPathTemplate(rangeNumber: string) {
  return APPROVAL_PATHS[rangeNumber as keyof typeof APPROVAL_PATHS] || null;
}

// Export configuration for reference
export const MATRIX_CONFIG = {
  departments: DEPARTMENTS,
  jobsites: JOBSITES,
  amountRanges: AMOUNT_RANGES,
  totalCombinations: DEPARTMENTS.length * JOBSITES.length * AMOUNT_RANGES.length
};

// Export total count for admin panel
export const totalApprovalMatrices = approvalMatrixData.length;

// Log statistics on import (development only)
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  console.log('📊 Approval Matrix Statistics:', getMatrixStatistics());
  console.log(`✅ Total Matrices: ${totalApprovalMatrices}`);
  console.log(`📦 Departments: ${DEPARTMENTS.join(', ')}`);
  console.log(`🏢 Jobsites: ${JOBSITES.join(', ')}`);
}
