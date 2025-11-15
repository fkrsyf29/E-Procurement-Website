// ===================================================================
// VENDOR RECOMMENDATION HELPER - AND MATCH ALGORITHM
// ===================================================================
// This helper provides vendor recommendations based on:
// 
// MATCHING LOGIC (AND):
// - ALL criteria that are provided MUST match
// - If sub-classification is provided → vendor MUST match
// - If KBLI codes are provided → vendor MUST match at least ONE
// - If brands are provided → vendor MUST match at least ONE
//
// MULTIPLE VALUES (OR):
// - Multiple KBLI codes: vendor matches if it has ANY of them
// - Multiple brands: vendor matches if it has ANY of them
// - Multiple sub-classifications: vendor matches if it has ANY of them
//
// EXAMPLE:
// - Proposal has M.01.02 + KBLI 46499 + Brand SKF
// - Vendor MUST have M.01.02 AND (46499) AND (SKF) to be recommended
// - If proposal has KBLI [46499, 47388] → vendor needs ANY of them
// ===================================================================

import { vendorDatabase, VendorRecord } from '../data/vendorDatabase_NEW';
import { SubClassification } from '../data/categoryHierarchy';

export interface VendorRecommendationCriteria {
  subClassifications?: SubClassification[]; // Array of selected sub-classifications from proposal
  kbliCode?: string; // Selected KBLI code from TOR (DEPRECATED - use kbliCodes instead)
  brand?: string; // Selected brand from Brand Specification in TOR (DEPRECATED - use brands instead)
  kbliCodes?: string[]; // Multiple KBLI codes from TOR
  brands?: string[]; // Multiple brands from Brand Specification in TOR
}

export interface RecommendedVendor {
  vendor: VendorRecord;
  matchDetails: {
    subClassificationMatch: boolean;
    kbliMatch: boolean;
    brandMatch: boolean;
    matchCount: number; // How many criteria matched (0-3)
  };
}

/**
 * Get recommended vendors based on AND match criteria
 * ALL provided criteria must match (AND logic)
 * Multiple values within a criteria use OR logic
 * 
 * @param criteria - The criteria to match (sub-classifications, KBLI codes, brands)
 * @returns Array of recommended vendors sorted by match count (highest first)
 * 
 * @example
 * // Proposal with M.01.02 + KBLI [46499] + Brand [SKF, NTN]
 * // Vendor must have: M.01.02 AND (46499) AND (SKF OR NTN)
 */
export function getRecommendedVendors(criteria: VendorRecommendationCriteria): RecommendedVendor[] {
  const { subClassifications, kbliCode, brand, kbliCodes, brands } = criteria;
  
  // Support both old single value and new array format
  const allKBLICodes = kbliCodes || (kbliCode ? [kbliCode] : []);
  const allBrands = brands || (brand ? [brand] : []);
  
  // If no criteria provided, return empty array
  if (!subClassifications?.length && allKBLICodes.length === 0 && allBrands.length === 0) {
    return [];
  }
  
  const recommendations: RecommendedVendor[] = [];
  
  // Iterate through all active vendors
  vendorDatabase
    .filter(vendor => vendor.isActive)
    .forEach(vendor => {
      let subClassificationMatch = false;
      let kbliMatch = false;
      let brandMatch = false;
      
      // Check sub-classification match (OR logic for multiple sub-classifications)
      if (subClassifications && subClassifications.length > 0) {
        subClassificationMatch = subClassifications.some(selectedSubClass => 
          vendor.capabilities.subClassifications.some(vendorSubClass => 
            vendorSubClass.subClassificationCode === selectedSubClass.code
          )
        );
      }
      
      // Check KBLI code match (OR logic - vendor matches if it has ANY of the selected KBLI codes)
      if (allKBLICodes.length > 0) {
        kbliMatch = allKBLICodes.some(selectedKBLI =>
          vendor.capabilities.kbliCodes.some(
            vendorKBLI => vendorKBLI.code === selectedKBLI
          )
        );
      }
      
      // Check brand match (OR logic - vendor matches if it has ANY of the selected brands)
      if (allBrands.length > 0) {
        brandMatch = allBrands.some(selectedBrand =>
          vendor.capabilities.brands.some(
            vendorBrand => vendorBrand.toLowerCase() === selectedBrand.toLowerCase()
          )
        );
      }
      
      // ✅ AND LOGIC: ALL criteria that are present MUST match
      // If a criteria is not provided (empty array), it's not required
      let matchesAll = true;
      
      // If sub-classifications provided, vendor MUST match
      if (subClassifications && subClassifications.length > 0 && !subClassificationMatch) {
        matchesAll = false;
      }
      
      // If KBLI codes provided, vendor MUST match at least one
      if (allKBLICodes.length > 0 && !kbliMatch) {
        matchesAll = false;
      }
      
      // If brands provided, vendor MUST match at least one
      if (allBrands.length > 0 && !brandMatch) {
        matchesAll = false;
      }
      
      // Calculate match count for ranking
      const matchCount = 
        (subClassificationMatch ? 1 : 0) +
        (kbliMatch ? 1 : 0) +
        (brandMatch ? 1 : 0);
      
      // ✅ Only include vendors that match ALL provided criteria
      if (matchesAll && matchCount > 0) {
        recommendations.push({
          vendor,
          matchDetails: {
            subClassificationMatch,
            kbliMatch,
            brandMatch,
            matchCount,
          },
        });
      }
    });
  
  // Sort by match count (highest first), then by preferred status, then by rating
  return recommendations.sort((a, b) => {
    if (a.matchDetails.matchCount !== b.matchDetails.matchCount) {
      return b.matchDetails.matchCount - a.matchDetails.matchCount;
    }
    if (a.vendor.isPreferred !== b.vendor.isPreferred) {
      return a.vendor.isPreferred ? -1 : 1;
    }
    return (b.vendor.rating || 0) - (a.vendor.rating || 0);
  });
}

/**
 * Get unique KBLI codes from all active vendors
 * This function is kept for backward compatibility but now also includes system KBLI data
 * @returns Array of unique KBLI codes with descriptions
 */
export function getAllKBLICodes(): { code: string; description: string }[] {
  const kbliMap = new Map<string, string>();
  
  // Get KBLI codes from vendor database
  vendorDatabase
    .filter(vendor => vendor.isActive)
    .forEach(vendor => {
      vendor.capabilities.kbliCodes.forEach(kbli => {
        if (!kbliMap.has(kbli.code)) {
          kbliMap.set(kbli.code, kbli.description);
        }
      });
    });
  
  return Array.from(kbliMap.entries())
    .map(([code, description]) => ({ code, description }))
    .sort((a, b) => a.code.localeCompare(b.code));
}

/**
 * Get KBLI codes relevant to selected sub-classifications
 * @param subClassifications - Array of selected sub-classifications
 * @returns Array of relevant KBLI codes
 */
export function getRelevantKBLICodes(subClassifications: SubClassification[]): { code: string; description: string }[] {
  if (!subClassifications || subClassifications.length === 0) {
    return getAllKBLICodes();
  }
  
  const kbliMap = new Map<string, string>();
  
  vendorDatabase
    .filter(vendor => vendor.isActive)
    .forEach(vendor => {
      // Check if vendor supports any of the selected sub-classifications
      const hasRelevantSubClass = subClassifications.some(selectedSubClass =>
        vendor.capabilities.subClassifications.some(vendorSubClass =>
          vendorSubClass.subClassificationCode === selectedSubClass.code
        )
      );
      
      // If vendor supports the sub-class, include their KBLI codes
      if (hasRelevantSubClass) {
        vendor.capabilities.kbliCodes.forEach(kbli => {
          if (!kbliMap.has(kbli.code)) {
            kbliMap.set(kbli.code, kbli.description);
          }
        });
      }
    });
  
  return Array.from(kbliMap.entries())
    .map(([code, description]) => ({ code, description }))
    .sort((a, b) => a.code.localeCompare(b.code));
}

/**
 * Get brands relevant to selected sub-classifications and KBLI code
 * @param subClassifications - Array of selected sub-classifications
 * @param kbliCode - Selected KBLI code (optional)
 * @returns Array of relevant brand names
 */
export function getRelevantBrands(
  subClassifications?: SubClassification[], 
  kbliCode?: string
): string[] {
  const brandSet = new Set<string>();
  
  vendorDatabase
    .filter(vendor => vendor.isActive)
    .forEach(vendor => {
      let isRelevant = true;
      
      // If sub-classifications provided, check match
      if (subClassifications && subClassifications.length > 0) {
        isRelevant = subClassifications.some(selectedSubClass =>
          vendor.capabilities.subClassifications.some(vendorSubClass =>
            vendorSubClass.subClassificationCode === selectedSubClass.code
          )
        );
      }
      
      // If KBLI code provided, check match
      if (kbliCode && isRelevant) {
        isRelevant = vendor.capabilities.kbliCodes.some(
          vendorKBLI => vendorKBLI.code === kbliCode
        );
      }
      
      // If vendor is relevant, add their brands
      if (isRelevant) {
        vendor.capabilities.brands.forEach(brand => brandSet.add(brand));
      }
    });
  
  return Array.from(brandSet).sort();
}
