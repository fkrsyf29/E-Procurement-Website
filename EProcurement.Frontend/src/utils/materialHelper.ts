import { Material } from '../types';

/**
 * Material Helper Utilities
 * ==========================
 * 
 * Utilities untuk manage material availability dalam proposal system
 * Business Rules:
 * 1. Materials dengan Contract Type "Contractual" tidak boleh muncul di new proposals
 * 2. EXCEPTION: Jika Contract End Date < 180 days dari today, material bisa reappear
 * 3. Materials dengan Contract Number tidak bisa dipilih lagi (sudah ada kontrak)
 */

/**
 * Calculate days between two dates
 */
function getDaysBetween(date1: Date, date2: Date): number {
  const diffTime = Math.abs(date2.getTime() - date1.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
}

/**
 * Check if contract is expiring soon (< 180 days)
 */
export function isContractExpiringSoon(endDate: string | undefined): boolean {
  if (!endDate) return false;
  
  try {
    const end = new Date(endDate);
    const today = new Date();
    const daysUntilExpiry = getDaysBetween(today, end);
    
    // If end date is in the past or within 180 days
    return end <= today || daysUntilExpiry < 180;
  } catch (error) {
    return false;
  }
}

/**
 * Check if material is available for new proposals
 * 
 * Material is AVAILABLE if:
 * - Contract Type is "Non-Contractual", OR
 * - Contract Type is "Contractual" AND Contract End Date < 180 days, OR
 * - No Contract Number exists
 * 
 * Material is NOT AVAILABLE if:
 * - Contract Type is "Contractual" AND Contract End Date >= 180 days
 */
export function isMaterialAvailableForProposal(material: Material): boolean {
  // Rule 1: If no contract type or Non-Contractual → Available
  if (!material.contractType || material.contractType === 'Non-Contractual') {
    return true;
  }
  
  // Rule 2: If Contractual but has no contract number → Available (not yet contracted)
  if (!material.contractNumber) {
    return true;
  }
  
  // Rule 3: If Contractual with contract number → Check expiry
  // Available only if contract expiring soon (< 180 days)
  return isContractExpiringSoon(material.contractEndDate);
}

/**
 * Filter materials that are available for new proposals
 */
export function getAvailableMaterialsForProposal(materials: Material[]): Material[] {
  return materials.filter(isMaterialAvailableForProposal);
}

/**
 * Get unavailable materials with reason
 */
export interface UnavailableMaterialInfo {
  material: Material;
  reason: string;
  daysUntilAvailable?: number;
}

export function getUnavailableMaterials(materials: Material[]): UnavailableMaterialInfo[] {
  return materials
    .filter(m => !isMaterialAvailableForProposal(m))
    .map(m => {
      let reason = 'Material has active contract';
      let daysUntilAvailable: number | undefined;
      
      if (m.contractEndDate) {
        const end = new Date(m.contractEndDate);
        const today = new Date();
        const daysRemaining = getDaysBetween(today, end);
        
        if (end > today) {
          daysUntilAvailable = Math.max(0, daysRemaining - 180);
          reason = `Contract active until ${m.contractEndDate} (${daysRemaining} days remaining)`;
        }
      }
      
      return {
        material: m,
        reason,
        daysUntilAvailable
      };
    });
}

/**
 * Get contract status for material
 */
export type ContractStatus = 'active' | 'expiring-soon' | 'expired' | 'no-contract' | 'non-contractual';

export function getContractStatus(material: Material): ContractStatus {
  // No contract type or Non-Contractual
  if (!material.contractType || material.contractType === 'Non-Contractual') {
    return 'non-contractual';
  }
  
  // Contractual but no contract number yet
  if (!material.contractNumber || !material.contractEndDate) {
    return 'no-contract';
  }
  
  // Check expiry
  const end = new Date(material.contractEndDate);
  const today = new Date();
  
  if (end < today) {
    return 'expired';
  }
  
  if (isContractExpiringSoon(material.contractEndDate)) {
    return 'expiring-soon';
  }
  
  return 'active';
}

/**
 * Get human-readable contract status message
 */
export function getContractStatusMessage(material: Material): string {
  const status = getContractStatus(material);
  
  switch (status) {
    case 'non-contractual':
      return 'Available (Non-Contractual)';
    
    case 'no-contract':
      return 'Available (No Active Contract)';
    
    case 'expired':
      return `Contract Expired (${material.contractEndDate})`;
    
    case 'expiring-soon':
      const end = new Date(material.contractEndDate!);
      const today = new Date();
      const days = getDaysBetween(today, end);
      return `Contract Expiring Soon (${days} days remaining)`;
    
    case 'active':
      return `Active Contract (Until ${material.contractEndDate})`;
    
    default:
      return 'Unknown Status';
  }
}

/**
 * Sort materials by availability (available first)
 */
export function sortMaterialsByAvailability(materials: Material[]): Material[] {
  return [...materials].sort((a, b) => {
    const aAvailable = isMaterialAvailableForProposal(a);
    const bAvailable = isMaterialAvailableForProposal(b);
    
    if (aAvailable && !bAvailable) return -1;
    if (!aAvailable && bAvailable) return 1;
    return 0;
  });
}

/**
 * Filter materials for Non-Budget funding source
 * 
 * Business Rule for Non-Budget:
 * - Show Contractual and Non-Contractual materials
 * - EXCLUDE materials that already have a Contract Number
 * 
 * This is different from Budget which allows Contractual materials with 180-day exception
 */
export function getAvailableMaterialsForNonBudget(materials: Material[]): Material[] {
  return materials.filter(material => {
    // Include both Contractual and Non-Contractual
    const isValidType = 
      !material.contractType || 
      material.contractType === 'Contractual' || 
      material.contractType === 'Non-Contractual';
    
    if (!isValidType) return false;
    
    // Exclude materials that already have a Contract Number
    const hasContractNumber = material.contractNumber && material.contractNumber.trim() !== '';
    
    return !hasContractNumber;
  });
}
