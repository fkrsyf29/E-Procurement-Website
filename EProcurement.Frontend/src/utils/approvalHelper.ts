/**
 * Approval Workflow Helper Utilities
 * Provides functions for generating approval workflows based on dynamic matrix
 * 
 * SPECIAL EXCEPTION RULE (Updated Nov 8, 2025):
 * - Most roles: Use CREATOR's jobsite for matrix approval routing
 * - Chief Operation ONLY: Use PROCUREMENT jobsite for matrix approval routing
 * 
 * CHIEF OPERATION ENTITY MAPPING:
 * - Chief Operation ONLY exists in: ADMO, MACO, SERA
 * - ADMO MINING or ADMO HAULING → Chief Operation ADMO
 * - MACO MINING or MACO HAULING → Chief Operation MACO
 * - SERA → Chief Operation SERA
 * - JAHO, NARO → NO Chief Operation (skip this step in matrix)
 */

import { ApprovalHistory, Proposal, Jobsite, Department } from '../types';
import { approvalMatrixData } from '../data/approvalMatrix';

/**
 * Jobsites that have Chief Operation role
 */
const JOBSITES_WITH_CHIEF_OPERATION = ['ADMO', 'MACO', 'SERA'] as const;

/**
 * Map procurement jobsite to Chief Operation entity
 * Returns null if jobsite doesn't have Chief Operation
 */
function getChiefOperationEntity(procurementJobsite: Jobsite): string | null {
  // Extract entity from jobsite name
  if (procurementJobsite.startsWith('ADMO')) {
    return 'ADMO'; // ADMO MINING or ADMO HAULING → Chief Operation ADMO
  }
  if (procurementJobsite.startsWith('MACO')) {
    return 'MACO'; // MACO MINING or MACO HAULING → Chief Operation MACO
  }
  if (procurementJobsite === 'SERA') {
    return 'SERA'; // SERA → Chief Operation SERA
  }
  
  // JAHO and NARO don't have Chief Operation
  return null;
}

/**
 * Check if a role is Chief Operation
 * Chief Operation is the ONLY role that uses procurement jobsite instead of creator jobsite
 */
function isChiefOperationRole(role: string): boolean {
  const roleLower = role.toLowerCase().trim();
  return roleLower.includes('chief operation');
}

/**
 * Get the appropriate jobsite for a given role and proposal
 * EXCEPTION: Chief Operation uses procurement jobsite, all others use creator's jobsite
 */
function getJobsiteForRole(proposal: Proposal, role?: string): Jobsite {
  // If role is provided and it's Chief Operation, use procurement jobsite
  if (role && isChiefOperationRole(role)) {
    return proposal.jobsite; // procurement jobsite
  }
  
  // For all other roles, use creator's jobsite
  return proposal.creatorJobsite || proposal.jobsite;
}

/**
 * Role code to Role Name mapping
 * Maps matrix role codes to actual role names in the system
 * 
 * @param roleCode - Matrix role code
 * @param department - Department context
 * @param jobsite - Jobsite context (procurement jobsite for Chief Operation, creator's for others)
 * @param isProcurementJobsite - Flag to indicate if jobsite is procurement (for Chief Op entity mapping)
 */
function mapRoleCodeToRoleName(
  roleCode: string,
  department: Department,
  jobsite: Jobsite,
  isProcurementJobsite: boolean = false
): string {
  // Remove any extra whitespace
  const code = roleCode.trim();
  
  switch (code) {
    case 'UH User':
      return `Unit Head ${department} Department ${jobsite}`;
    
    case 'SH User':
      return `Section Head ${department} Department ${jobsite}`;
    
    case 'DH User':
      return `Department Head ${department} Department ${jobsite}`;
    
    case 'MGR User':
      return `Manager ${department} Department ${jobsite}`;
    
    case 'DIV User':
      return `${department} Division Head`;
    
    case 'Dir User':
      return `${department} Director`;
    
    case 'Chief Operation Site':
      // Special handling: Map procurement jobsite to Chief Operation entity
      if (isProcurementJobsite) {
        const entity = getChiefOperationEntity(jobsite);
        if (entity) {
          return `Chief Operation ${entity}`;
        }
        // If no Chief Operation exists for this jobsite, return null indicator
        return 'SKIP_CHIEF_OPERATION';
      }
      return `Chief Operation ${jobsite}`;
    
    case 'President Director':
      return 'President Director';
    
    case 'Sourcing Department Head':
      return 'Sourcing Department Head';
    
    case 'Procurement Division Head':
      return 'Procurement Division Head';
    
    default:
      // If unknown, return as is
      return roleCode;
  }
}

/**
 * Map step name to status
 * UPDATED: Removed Verificator mapping - approval strictly follows matrix hierarchy
 */
function mapStepNameToStatus(stepName: string, stepNumber: number): string {
  const name = stepName.trim();
  
  // Direct mapping based on step names from approval matrix
  if (name === 'Unit Head Approval') return 'On Unit Head Approval';
  if (name === 'Section Head Approval') return 'On Section Head Approval';
  if (name === 'Department Head Approval') return 'On Department Head Approval';
  if (name === 'Manager Approval') return 'On Manager Approval';
  if (name === 'Division Head Approval') return 'On Division Head Approval';
  if (name === 'Director Approval') return 'On Director Approval';
  if (name === 'Chief Operation Approval') return 'On Chief Operation Approval';
  if (name === 'President Director Approval') return 'On President Director Approval';
  if (name === 'Sourcing Approval') return 'On Sourcing Approval';
  if (name === 'Procurement Approval') return 'On Procurement Approval';
  
  // Legacy mappings for backward compatibility (if needed)
  if (name === 'Review 1') return 'On Section Head Approval';
  if (name === 'Review 2') return 'On Department Head Approval';
  
  return 'On Approval';
}

/**
 * Get approval path from matrix based on amount, department, and jobsite
 * IMPORTANT: Uses CREATOR's jobsite for approval routing
 * EXCEPTION: Chief Operation step uses PROCUREMENT jobsite
 * 
 * @param amount - Proposal amount
 * @param department - Creator's department
 * @param jobsite - Creator's jobsite (used for most roles)
 * @param procurementJobsite - Procurement jobsite (used for Chief Operation only)
 */
export function getApprovalPathFromMatrix(
  amount: number,
  department: Department,
  jobsite: Jobsite, // Creator's jobsite
  procurementJobsite?: Jobsite // Procurement jobsite (for Chief Operation)
): ApprovalHistory[] | null {
  // Ensure amount is a number
  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
  
  if (isNaN(numAmount)) {
    console.error(`Invalid amount: ${amount} (type: ${typeof amount})`);
    return null;
  }
  
  // Find matching matrix using CREATOR's jobsite
  let matrix = approvalMatrixData.find(
    m => 
      m.department === department &&
      m.jobsite === jobsite &&
      numAmount >= m.amountMin &&
      numAmount <= m.amountMax
  );
  
  // Fallback: If no matrix found and amount is extremely large, use highest range (09) for that dept/jobsite
  if (!matrix && numAmount > 5000000) {
    console.warn(`Amount $${numAmount} exceeds normal ranges. Using highest range (09) as fallback.`);
    matrix = approvalMatrixData.find(
      m => 
        m.department === department &&
        m.jobsite === jobsite &&
        m.amountMin === 5000000 // Range 09 starts at 5M
    );
  }
  
  if (!matrix) {
    console.warn(`No approval matrix found for ${department} - ${jobsite} - $${numAmount}`);
    return null;
  }
  
  // Generate approval history entries from approval path
  const approvalHistory: ApprovalHistory[] = matrix.approvalPath
    .map((step, index) => {
      // EXCEPTION: For Chief Operation role, use procurement jobsite instead of creator's
      const isChiefOpStep = step.role === 'Chief Operation Site';
      const jobsiteForRole = (isChiefOpStep && procurementJobsite) 
        ? procurementJobsite 
        : jobsite;
      
      const roleName = mapRoleCodeToRoleName(
        step.role, 
        department, 
        jobsiteForRole,
        isChiefOpStep // Flag to indicate this is procurement jobsite for entity mapping
      );
      
      // Skip Chief Operation step if procurement jobsite doesn't have one
      if (roleName === 'SKIP_CHIEF_OPERATION') {
        return null;
      }
      
      const status = mapStepNameToStatus(step.stepName, step.stepNumber);
      
      return {
        id: `pending-${index}`,
        stage: step.stepName,
        approver: '',
        role: roleName,
        action: 'Pending',
        date: undefined,
        comment: undefined
      };
    })
    .filter((entry): entry is ApprovalHistory => entry !== null); // Remove null entries (skipped steps)
  
  return approvalHistory;
}

/**
 * Get first approval status from matrix
 * IMPORTANT: Uses CREATOR's jobsite and department for approval routing
 */
export function getFirstApprovalStatus(
  amount: number,
  department: Department, // Creator's department
  jobsite: Jobsite // Creator's jobsite
): string {
  const path = getApprovalPathFromMatrix(amount, department, jobsite);
  
  if (!path || path.length === 0) {
    return 'On Unit Head Approval'; // Fallback
  }
  
  // Get first step
  const firstStep = path[0];
  
  // Determine status based on first step role
  if (firstStep.role.includes('Unit Head')) {
    return 'On Unit Head Approval';
  } else if (firstStep.role.includes('Section Head')) {
    return 'On Section Head Approval';
  } else if (firstStep.role.includes('Department Head')) {
    return 'On Department Head Approval';
  } else if (firstStep.role.includes('Manager')) {
    return 'On Manager Approval';
  } else if (firstStep.role.includes('Division Head')) {
    return 'On Division Head Approval';
  } else if (firstStep.role.includes('Director') && !firstStep.role.includes('President')) {
    return 'On Director Approval';
  } else if (firstStep.role.includes('Chief Operation')) {
    return 'On Chief Operation Approval';
  } else if (firstStep.role.includes('President Director')) {
    return 'On President Director Approval';
  }
  
  return 'On Unit Head Approval'; // Fallback
}

/**
 * Initialize proposal history for new proposal
 * IMPORTANT: Uses CREATOR's jobsite and department for approval routing
 * EXCEPTION: Chief Operation uses PROCUREMENT jobsite
 */
export function initializeProposalHistory(
  creatorName: string,
  creatorRole: string,
  isDraft: boolean,
  amount: number,
  department: Department, // Creator's department
  jobsite: Jobsite, // Creator's jobsite
  procurementJobsite?: Jobsite // Procurement jobsite (for Chief Operation)
): ApprovalHistory[] {
  const history: ApprovalHistory[] = [];
  
  // Add Created entry
  history.push({
    id: `h${Date.now()}`,
    stage: 'Created',
    approver: creatorName,
    role: creatorRole,
    action: 'Created',
    date: new Date().toISOString(),
    comment: 'Proposal created'
  });
  
  // If not draft, add Submitted entry and pending approvals
  if (!isDraft) {
    history.push({
      id: `h${Date.now() + 1}`,
      stage: 'Submitted',
      approver: creatorName,
      role: creatorRole,
      action: 'Submitted',
      date: new Date().toISOString(),
      comment: 'Submitted for approval'
    });
    
    // Get approval path from matrix using CREATOR's jobsite (and procurement for Chief Op)
    const approvalPath = getApprovalPathFromMatrix(amount, department, jobsite, procurementJobsite);
    
    if (approvalPath && approvalPath.length > 0) {
      // Add first pending approval only
      const firstApproval = approvalPath[0];
      history.push({
        id: `h${Date.now() + 2}`,
        stage: firstApproval.stage,
        approver: '',
        role: firstApproval.role,
        action: 'Pending',
        date: undefined,
        comment: undefined
      });
    } else {
      // Fallback if no matrix found
      history.push({
        id: `h${Date.now() + 2}`,
        stage: 'Approval',
        approver: '',
        role: `Unit Head ${department} Department ${jobsite}`,
        action: 'Pending',
        date: undefined,
        comment: undefined
      });
    }
  }
  
  return history;
}

/**
 * Get next approval step based on current status and matrix
 * IMPORTANT: Uses CREATOR's jobsite and department for approval routing
 * EXCEPTION: Chief Operation uses PROCUREMENT jobsite
 */
export function getNextApprovalStep(
  proposal: Proposal
): { role: string; status: string } | null {
  // Use creator's jobsite and department if available, fallback to proposal's
  const creatorJobsite = proposal.creatorJobsite || proposal.jobsite;
  const department = proposal.creatorDepartment || proposal.department;
  const procurementJobsite = proposal.jobsite; // Procurement jobsite for Chief Operation
  
  const approvalPath = getApprovalPathFromMatrix(
    proposal.amount,
    department,
    creatorJobsite,
    procurementJobsite // Pass procurement jobsite for Chief Operation
  );
  
  if (!approvalPath) return null;
  
  // Count how many approvals have been done
  const approvedCount = proposal.history.filter(
    h => h.action === 'Approved' && h.stage !== 'Created' && h.stage !== 'Submitted'
  ).length;
  
  // Get next step from path
  if (approvedCount < approvalPath.length) {
    const nextStep = approvalPath[approvedCount];
    const status = mapStepNameToStatus(nextStep.stage || '', approvedCount + 1);
    
    return {
      role: nextStep.role || '',
      status
    };
  }
  
  // If all steps completed
  return null;
}

/**
 * Check if proposal workflow is complete
 * IMPORTANT: Uses CREATOR's jobsite and department for approval routing
 * EXCEPTION: Chief Operation uses PROCUREMENT jobsite
 */
export function isWorkflowComplete(proposal: Proposal): boolean {
  // Use creator's jobsite and department if available, fallback to proposal's
  const creatorJobsite = proposal.creatorJobsite || proposal.jobsite;
  const department = proposal.creatorDepartment || proposal.department;
  const procurementJobsite = proposal.jobsite; // Procurement jobsite for Chief Operation
  
  const approvalPath = getApprovalPathFromMatrix(
    proposal.amount,
    department,
    creatorJobsite,
    procurementJobsite // Pass procurement jobsite for Chief Operation
  );
  
  if (!approvalPath) return false;
  
  // Count approved steps
  const approvedCount = proposal.history.filter(
    h => h.action === 'Approved' && h.stage !== 'Created' && h.stage !== 'Submitted'
  ).length;
  
  return approvedCount >= approvalPath.length;
}

/**
 * Get approval path for a proposal using CREATOR's jobsite and department
 * EXCEPTION: Chief Operation uses PROCUREMENT jobsite
 * This is the main helper function that should be used throughout the app
 */
export function getProposalApprovalPath(proposal: Proposal): ApprovalHistory[] | null {
  // Use creator's jobsite and department if available, fallback to proposal's
  const creatorJobsite = proposal.creatorJobsite || proposal.jobsite;
  const department = proposal.creatorDepartment || proposal.department;
  const procurementJobsite = proposal.jobsite; // Procurement jobsite for Chief Operation
  
  return getApprovalPathFromMatrix(
    proposal.amount,
    department,
    creatorJobsite,
    procurementJobsite // Pass procurement jobsite for Chief Operation
  );
}
