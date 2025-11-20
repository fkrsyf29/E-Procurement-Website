/**
 * Admin Helper Utilities
 * Provides helper functions for Administrator super power access checks
 */

import { User } from '../types';

/**
 * Check if user is Administrator (super user with full access)
 */
export function isAdministrator(user: User | null | undefined): boolean {
  return user?.roleName === 'Administrator';
}

/**
 * Check if user has approval rights
 * Administrator has approval rights at all levels
 */
export function canApprove(user: User | null | undefined): boolean {
  if (!user) return false;
  
  // Administrator super power - can approve at ALL levels
  if (isAdministrator(user)) return true;
  
  // Check if role includes approval keywords
  const role = user.roleName;
  return (
    role.includes('Unit Head') ||
    role.includes('Section Head') ||
    role.includes('Department Head') ||
    role.includes('Manager') ||
    role.includes('Division Head') ||
    role.includes('Director') ||
    role.includes('Chief Operation') ||
    role === 'President Director' ||
    role === 'Sourcing Department Head' ||
    role === 'Procurement Division Head'
  );
}

/**
 * Check if user can create proposals
 */
export function canCreateProposal(user: User | null | undefined): boolean {
  if (!user) return false;
  
  // Administrator super power - can do everything
  if (isAdministrator(user)) return true;
  
  // Check if role includes creator
  return user.roleName.includes('Creator');
}

/**
 * Check if user can edit any proposal
 * Administrator can edit all proposals regardless of status or creator
 */
export function canEditProposal(
  user: User | null | undefined,
  proposal: { creatorId: string; status: string }
): boolean {
  if (!user) return false;
  
  // Administrator super power - can edit ANY proposal at ANY stage
  if (isAdministrator(user)) return true;
  
  // Regular users can only edit their own drafts
  return proposal.creatorId === user.id && proposal.status === 'Draft';
}

/**
 * Check if user can delete proposal
 * Administrator can delete any proposal
 */
export function canDeleteProposal(
  user: User | null | undefined,
  proposal: { creatorId: string; status: string }
): boolean {
  if (!user) return false;
  
  // Administrator super power - can delete ANY proposal
  if (isAdministrator(user)) return true;
  
  // Regular users can only delete their own drafts
  return proposal.creatorId === user.id && proposal.status === 'Draft';
}

/**
 * Check if user can access system management pages
 */
export function canAccessSystemManagement(user: User | null | undefined): boolean {
  return isAdministrator(user);
}

/**
 * Check if user can access sourcing documents
 */
export function canAccessSourcing(user: User | null | undefined): boolean {
  if (!user) return false;
  
  // Administrator super power - full access
  if (isAdministrator(user)) return true;
  
  // Sourcing team members
  const role = user.roleName;
  return (
    role === 'Buyer' ||
    role === 'Planner' ||
    role === 'Sourcing' ||
    role === 'Sourcing Department Head' ||
    role === 'Procurement Division Head'
  );
}

/**
 * Get user display name with admin indicator
 */
export function getUserDisplayName(user: User | null | undefined): string {
  if (!user) return 'Unknown User';
  
  if (isAdministrator(user)) {
    return `${user.name} (Administrator)`;
  }
  
  return user.name;
}

/**
 * Check if user can approve at specific stage
 * Administrator can approve at ANY stage
 */
export function canApproveAtStage(
  user: User | null | undefined,
  proposalStatus: string
): boolean {
  if (!user) return false;
  
  // Administrator super power - can approve at ANY stage
  if (isAdministrator(user)) return true;
  
  // For other users, check based on their role and current proposal status
  // This would need to be implemented based on approval matrix
  return canApprove(user);
}

/**
 * Get admin badge component data
 */
export function getAdminBadge(user: User | null | undefined): { show: boolean; text: string; color: string } | null {
  if (!isAdministrator(user)) return null;
  
  return {
    show: true,
    text: 'SUPER USER',
    color: 'red'
  };
}

/**
 * Log admin action for audit trail
 */
export function logAdminAction(
  user: User | null | undefined,
  action: string,
  target: string,
  details?: string
): void {
  if (!isAdministrator(user)) return;
  
  const timestamp = new Date().toISOString();
  const logEntry = {
    timestamp,
    admin: user?.name,
    adminUsername: user?.username,
    action,
    target,
    details,
  };
  
  // In production, this would send to logging service
 // console.log('[ADMIN ACTION]', logEntry);
}
