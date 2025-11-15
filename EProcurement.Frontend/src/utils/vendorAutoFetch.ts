/**
 * ===================================================================
 * VENDOR AUTO-FETCH UTILITY
 * ===================================================================
 * Auto-fetches vendors from Vendor Database Management based on proposal
 * specifications with intelligent matching logic.
 * 
 * Date: November 12, 2025
 * 
 * Matching Logic:
 * ---------------
 * 1. Sub-Classification: MUST match (exact match required)
 * 2. KBLI Code(s): ANY match (if proposal has multiple KBLI, vendor needs at least 1)
 * 3. Brand(s): ANY match (if proposal has multiple brands, vendor needs at least 1)
 * 4. If KBLI or Brand is empty in proposal → skip that criterion
 * 5. Vendor must be Active
 * 
 * Examples:
 * ---------
 * Proposal: Sub-Class = M.01.01, KBLI = [46591, 46599], Brand = [KOMATSU, CATERPILLAR]
 * 
 * Vendor A: Sub-Class = M.01.01, KBLI = [46591], Brand = [KOMATSU]
 *   ✅ MATCH - Has sub-class, has 1 KBLI match, has 1 brand match
 * 
 * Vendor B: Sub-Class = M.01.01, KBLI = [46599], Brand = [CATERPILLAR]
 *   ✅ MATCH - Has sub-class, has 1 KBLI match, has 1 brand match
 * 
 * Vendor C: Sub-Class = M.01.01, KBLI = [99999], Brand = [KOMATSU]
 *   ✅ MATCH - Has sub-class, no KBLI match but has brand match
 * 
 * Vendor D: Sub-Class = M.01.02, KBLI = [46591], Brand = [KOMATSU]
 *   ❌ NO MATCH - Sub-class doesn't match
 * 
 * Vendor E: Sub-Class = M.01.01, KBLI = [99999], Brand = [VOLVO]
 *   ❌ NO MATCH - Sub-class matches but neither KBLI nor Brand match
 * ===================================================================
 */

import { VendorRecord } from '../data/vendorDatabase_NEW';
import { Proposal } from '../types';

export interface VendorMatchResult {
  vendor: VendorRecord;
  matchScore: number;
  matchDetails: {
    subClassMatch: boolean;
    kbliMatch: boolean;
    brandMatch: boolean;
    isPreferred: boolean;
  };
}

/**
 * Extract KBLI codes from TOR items
 * Handles both formats:
 * - "46499" (code only)
 * - "46499-Perdagangan Besar Barang Lainnya" (code-description format)
 */
function extractKBLICodesFromTOR(proposal: Proposal): string[] {
  if (!proposal.torItems || proposal.torItems.length === 0) return [];
  
  const kbliCodes: string[] = [];
  const kbliItem = proposal.torItems.find((item: any) => item.id === 'KBLI' && item.enabled);
  
  if (kbliItem && kbliItem.requirement) {
    // Parse comma-separated KBLI codes from requirement field
    const codes = kbliItem.requirement.split(',').map(c => {
      const trimmed = c.trim();
      // Extract only the code part (before '-' if exists)
      // Format: "46499-Description" → "46499"
      // Format: "46499" → "46499"
      const codePart = trimmed.split('-')[0].trim();
      return codePart;
    }).filter(c => c);
    kbliCodes.push(...codes);
  }
  
  console.log('🔍 [VENDOR AUTO-FETCH] Extracted KBLI codes from TOR:', kbliCodes);
  
  return kbliCodes;
}

/**
 * Extract brands from TOR items
 * Handles both formats:
 * - "SKF" (brand name only)
 * - "SKF-Premium Bearing" (brand-description format)
 */
function extractBrandsFromTOR(proposal: Proposal): string[] {
  if (!proposal.torItems || proposal.torItems.length === 0) return [];
  
  const brands: string[] = [];
  const brandItem = proposal.torItems.find((item: any) => item.id === 'brandSpec' && item.enabled);
  
  if (brandItem && brandItem.requirement) {
    // Parse comma-separated brands from requirement field
    const brandList = brandItem.requirement.split(',').map(b => {
      const trimmed = b.trim();
      // Extract only the brand name part (before '-' if exists)
      // Format: "SKF-Premium Bearing" → "SKF"
      // Format: "SKF" → "SKF"
      const brandPart = trimmed.split('-')[0].trim();
      return brandPart;
    }).filter(b => b);
    brands.push(...brandList);
  }
  
  console.log('🔍 [VENDOR AUTO-FETCH] Extracted brands from TOR:', brands);
  
  return brands;
}

/**
 * Auto-fetch vendors based on proposal specifications
 * NOW EXTRACTS KBLI and Brands from TOR items automatically
 * @param proposal Proposal with subClassification and torItems
 * @param vendorDatabase Array of vendor records
 * @returns Sorted array of matching vendors with match scores
 */
export function autoFetchVendors(
  proposal: Proposal,
  vendorDatabase: VendorRecord[]
): VendorMatchResult[] {
  const results: VendorMatchResult[] = [];
  
  // Extract proposal specifications
  const proposalSubClass = proposal.subClassification;
  
  // ✅ NEW: Extract from TOR items if not directly available
  const proposalKBLIs = proposal.kbliCodes || extractKBLICodesFromTOR(proposal);
  const proposalBrands = proposal.brandSpecifications || extractBrandsFromTOR(proposal);
  
  console.log('🔍 [VENDOR AUTO-FETCH] Proposal:', proposal.proposalNo);
  console.log('🔍 [VENDOR AUTO-FETCH] Sub-class:', proposalSubClass);
  console.log('🔍 [VENDOR AUTO-FETCH] KBLI codes:', proposalKBLIs);
  console.log('🔍 [VENDOR AUTO-FETCH] Brands:', proposalBrands);
  
  // Filter to active vendors only
  const activeVendors = vendorDatabase.filter(v => v.isActive);
  console.log('🔍 [VENDOR AUTO-FETCH] Active vendors in database:', activeVendors.length);
  
  for (const vendor of activeVendors) {
    // 1. Check Sub-Classification (MUST match)
    const subClassMatch = vendor.capabilities.subClassifications.some(
      sc => sc.subClassificationCode === proposalSubClass
    );
    
    if (!subClassMatch) {
      continue; // Skip this vendor - sub-class is required
    }
    
    // 2. Check KBLI Code (ANY match if specified)
    let kbliMatch = true; // Default true if not specified
    if (proposalKBLIs.length > 0) {
      kbliMatch = vendor.capabilities.kbliCodes.some(vendorKBLI =>
        proposalKBLIs.includes(vendorKBLI.code)
      );
    }
    
    // 3. Check Brand (ANY match if specified)
    let brandMatch = true; // Default true if not specified
    if (proposalBrands.length > 0) {
      brandMatch = vendor.capabilities.brands.some(vendorBrand =>
        proposalBrands.includes(vendorBrand)
      );
    }
    
    // 4. Determine if vendor matches
    // If KBLI or Brand is specified, at least one must match
    const hasSpecifications = proposalKBLIs.length > 0 || proposalBrands.length > 0;
    const meetsSpecifications = hasSpecifications ? (kbliMatch || brandMatch) : true;
    
    if (!meetsSpecifications) {
      continue; // Skip this vendor
    }
    
    // 5. Calculate match score
    let matchScore = 50; // Base score for sub-class match
    
    if (proposalKBLIs.length > 0 && kbliMatch) {
      matchScore += 25; // +25 for KBLI match
    }
    
    if (proposalBrands.length > 0 && brandMatch) {
      matchScore += 25; // +25 for brand match
    }
    
    // Perfect match bonus
    if (kbliMatch && brandMatch && proposalKBLIs.length > 0 && proposalBrands.length > 0) {
      matchScore += 10; // +10 for perfect match
    }
    
    // Preferred vendor bonus
    if (vendor.isPreferred) {
      matchScore += 10; // +10 for preferred status
    }
    
    // Add to results
    results.push({
      vendor,
      matchScore,
      matchDetails: {
        subClassMatch,
        kbliMatch: proposalKBLIs.length > 0 ? kbliMatch : false,
        brandMatch: proposalBrands.length > 0 ? brandMatch : false,
        isPreferred: vendor.isPreferred || false
      }
    });
  }
  
  // Sort by match score (highest first), then by vendor name
  results.sort((a, b) => {
    if (b.matchScore !== a.matchScore) {
      return b.matchScore - a.matchScore;
    }
    return a.vendor.vendorName.localeCompare(b.vendor.vendorName);
  });
  
  console.log('✅ [VENDOR AUTO-FETCH] Found', results.length, 'matching vendors');
  if (results.length > 0) {
    console.log('✅ [VENDOR AUTO-FETCH] Top matches:', results.slice(0, 5).map(r => ({
      name: r.vendor.vendorName,
      score: r.matchScore,
      details: r.matchDetails
    })));
  }
  
  return results;
}

/**
 * Get match score percentage as string
 */
export function getMatchScoreLabel(score: number): string {
  if (score >= 100) return 'Perfect Match';
  if (score >= 80) return 'Excellent Match';
  if (score >= 70) return 'Good Match';
  if (score >= 60) return 'Fair Match';
  return 'Partial Match';
}

/**
 * Get match score color class
 */
export function getMatchScoreColor(score: number): string {
  if (score >= 100) return 'text-green-600 bg-green-50 border-green-300';
  if (score >= 80) return 'text-blue-600 bg-blue-50 border-blue-300';
  if (score >= 70) return 'text-cyan-600 bg-cyan-50 border-cyan-300';
  if (score >= 60) return 'text-yellow-600 bg-yellow-50 border-yellow-300';
  return 'text-gray-600 bg-gray-50 border-gray-300';
}

/**
 * Format match details for display
 */
export function formatMatchDetails(details: VendorMatchResult['matchDetails']): string[] {
  const items: string[] = [];
  
  if (details.subClassMatch) items.push('✓ Sub-Classification');
  if (details.kbliMatch) items.push('✓ KBLI Code');
  if (details.brandMatch) items.push('✓ Brand');
  if (details.isPreferred) items.push('⭐ Preferred');
  
  return items;
}

/**
 * Explain why vendor matches or doesn't match
 */
export function explainVendorMatch(
  proposal: Proposal,
  vendor: VendorRecord
): { matches: boolean; reason: string } {
  const proposalSubClass = proposal.subClassification;
  const proposalKBLIs = proposal.kbliCodes || [];
  const proposalBrands = proposal.brandSpecifications || [];
  
  // Check sub-class
  const subClassMatch = vendor.capabilities.subClassifications.some(
    sc => sc.subClassificationCode === proposalSubClass
  );
  
  if (!subClassMatch) {
    return {
      matches: false,
      reason: `Sub-classification mismatch. Proposal requires ${proposalSubClass}.`
    };
  }
  
  // Check KBLI
  let kbliMatch = true;
  if (proposalKBLIs.length > 0) {
    kbliMatch = vendor.capabilities.kbliCodes.some(vendorKBLI =>
      proposalKBLIs.includes(vendorKBLI.code)
    );
  }
  
  // Check Brand
  let brandMatch = true;
  if (proposalBrands.length > 0) {
    brandMatch = vendor.capabilities.brands.some(vendorBrand =>
      proposalBrands.includes(vendorBrand)
    );
  }
  
  // Determine match
  const hasSpecifications = proposalKBLIs.length > 0 || proposalBrands.length > 0;
  const meetsSpecifications = hasSpecifications ? (kbliMatch || brandMatch) : true;
  
  if (!meetsSpecifications) {
    const missing: string[] = [];
    if (proposalKBLIs.length > 0 && !kbliMatch) missing.push('KBLI');
    if (proposalBrands.length > 0 && !brandMatch) missing.push('Brand');
    
    return {
      matches: false,
      reason: `Vendor doesn't have matching ${missing.join(' or ')}.`
    };
  }
  
  // Build match reason
  const reasons: string[] = ['Sub-classification matches'];
  if (kbliMatch && proposalKBLIs.length > 0) reasons.push('KBLI matches');
  if (brandMatch && proposalBrands.length > 0) reasons.push('Brand matches');
  if (vendor.isPreferred) reasons.push('Preferred vendor');
  
  return {
    matches: true,
    reason: reasons.join(', ')
  };
}
