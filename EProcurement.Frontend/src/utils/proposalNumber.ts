import { mockProposals } from '../data/mockData';
import { getJobsiteAbbreviation, getDepartmentAbbreviation } from '../data/systemReferenceData';

/**
 * Convert month number (1-12) to Roman numerals
 */
function toRomanNumeral(month: number): string {
  const romanNumerals = [
    'I', 'II', 'III', 'IV', 'V', 'VI',
    'VII', 'VIII', 'IX', 'X', 'XI', 'XII'
  ];
  return romanNumerals[month - 1] || 'I';
}

/**
 * Generate proposal number in format: [Sequence]/[Jobsite Code]/[Dept Code]/[Roman Month]/[Year]
 * Example: 001/40AB/PLANT/XI/2025
 * 
 * IMPORTANT: Sequence number RESETS for each unique combination of:
 * - Month + Year + Jobsite + Department
 * 
 * This means:
 * - Same context (month/year/jobsite/dept): 001, 002, 003, ...
 * - Different department same month: Resets to 001
 * - Different jobsite same month: Resets to 001
 * - Different month: Resets to 001
 */
export function generateProposalNumber(
  jobsite: string,
  department: string,
  existingProposals: any[] = mockProposals
): string {
  const now = new Date();
  const monthNumber = now.getMonth() + 1;
  const monthRoman = toRomanNumeral(monthNumber);
  const year = String(now.getFullYear());
  
  // Get abbreviations from system data
  const jobsiteCode = getJobsiteAbbreviation(jobsite);
  const departmentCode = getDepartmentAbbreviation(department);
  
  // Filter proposals for SAME context: jobsite + department + month + year
  // This ensures sequence resets for each unique combination
  const sameContext = existingProposals.filter(p => {
    if (!p.proposalNo) return false;
    
    const parts = p.proposalNo.split('/');
    if (parts.length !== 5) return false;
    
    const [_, pJobsite, pDept, pMonth, pYear] = parts;
    return (
      pJobsite === jobsiteCode &&
      pDept === departmentCode &&
      pMonth === monthRoman &&
      pYear === year
    );
  });
  
  // Get next sequence number within this context
  let maxSequence = 0;
  sameContext.forEach(p => {
    const parts = p.proposalNo.split('/');
    const seq = parseInt(parts[0], 10);
    if (!isNaN(seq) && seq > maxSequence) {
      maxSequence = seq;
    }
  });
  
  // Increment sequence (resets for each context)
  const sequence = String(maxSequence + 1).padStart(3, '0');
  
  return `${sequence}/${jobsiteCode}/${departmentCode}/${monthRoman}/${year}`;
}

/**
 * Validate proposal number uniqueness
 */
export function isProposalNumberUnique(
  proposalNo: string,
  existingProposals: any[] = mockProposals
): boolean {
  return !existingProposals.some(p => p.proposalNo === proposalNo);
}

/**
 * Parse proposal number to extract components
 */
export function parseProposalNumber(proposalNo: string): {
  sequence: string;
  jobsiteCode: string;
  departmentCode: string;
  month: string;
  year: string;
} | null {
  const parts = proposalNo.split('/');
  if (parts.length !== 5) return null;
  
  return {
    sequence: parts[0],
    jobsiteCode: parts[1],
    departmentCode: parts[2],
    month: parts[3],
    year: parts[4],
  };
}
