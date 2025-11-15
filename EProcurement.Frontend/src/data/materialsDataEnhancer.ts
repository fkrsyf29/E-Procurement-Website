import { Material } from '../types';

/**
 * Materials Data Enhancer
 * =======================
 * 
 * This module adds Annual Purchase Plan data to existing materials.
 * It generates realistic dummy data for:
 * - qty (Quantity)
 * - estimatedPrice (Estimated Price in USD)
 * - contractType (Contractual or Non-Contractual)
 * - vendorName
 * - contractNumber
 * - contractStartDate
 * - contractEndDate
 */

// Sample vendor names by category
const vendorsByCategory = {
  'VOLVO': ['PT Volvo Construction Equipment Indonesia', 'PT Volvo Parts Center', 'PT Intraco Penta'],
  'KOMATSU': ['PT United Tractors Pandu Engineering', 'PT Trakindo Utama', 'PT Komatsu Undercarriage Indonesia'],
  'CATERPILLAR': ['PT Trakindo Utama', 'PT Cat Reman Indonesia', 'PT Caterpillar Financial Services'],
  'HITACHI': ['PT Hitachi Construction Machinery Indonesia', 'PT Hexindo Adiperkasa', 'PT Trinityindo Technologies'],
  'SANDVIK': ['PT Sandvik Mining', 'PT Multi Prima Sejahtera', 'PT Mining Equipment Technology'],
  'DENSO': ['PT Denso Indonesia', 'PT Denso Sales Indonesia', 'PT Auto Parts Manufacturing'],
  'default': ['PT Supplier Materials Indonesia', 'PT Global Parts Center', 'PT Mining Supply Chain']
};

// Generate random integer between min and max
function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Generate random price based on material type
function generateEstimatedPrice(materialDescription: string): number {
  const desc = materialDescription.toUpperCase();
  
  // Expensive items
  if (desc.includes('ENGINE') || desc.includes('TRANSMISSION')) {
    return randomInt(5000, 25000) + Math.random();
  }
  
  // Medium price items
  if (desc.includes('PUMP') || desc.includes('CYLINDER') || desc.includes('MOTOR')) {
    return randomInt(500, 5000) + Math.random();
  }
  
  // Low to medium price items
  if (desc.includes('BEARING') || desc.includes('GEAR') || desc.includes('CLUTCH')) {
    return randomInt(100, 1000) + Math.random();
  }
  
  // Small parts
  if (desc.includes('SEAL') || desc.includes('GASKET') || desc.includes('ORING') || desc.includes('BOLT')) {
    return randomInt(5, 150) + Math.random();
  }
  
  // Default range
  return randomInt(50, 500) + Math.random();
}

// Generate quantity based on price (inverse relationship)
function generateQuantity(estimatedPrice: number): number {
  if (estimatedPrice > 10000) return randomInt(1, 10); // Expensive items: low qty
  if (estimatedPrice > 1000) return randomInt(5, 50); // Medium items: medium qty
  if (estimatedPrice > 100) return randomInt(20, 200); // Low-medium: higher qty
  return randomInt(100, 1000); // Small parts: high qty
}

// Generate contract type (70% Contractual, 30% Non-Contractual)
function generateContractType(): 'Contractual' | 'Non-Contractual' {
  return Math.random() < 0.7 ? 'Contractual' : 'Non-Contractual';
}

// Get vendor name based on brand
function getVendorName(brand: string): string {
  const vendors = vendorsByCategory[brand] || vendorsByCategory['default'];
  return vendors[randomInt(0, vendors.length - 1)];
}

// Generate contract number
function generateContractNumber(year: number, sequence: number): string {
  const month = randomInt(1, 12).toString().padStart(2, '0');
  return `CNT-${year}-${month}-${sequence.toString().padStart(4, '0')}`;
}

// Generate contract name based on material type and brand
function generateContractName(materialDescription: string, brand: string): string {
  const desc = materialDescription.toUpperCase();
  
  // Contract name templates
  const templates = [
    `Supply & Delivery of ${brand} Parts`,
    `Annual Supply Contract - ${brand} Components`,
    `${brand} Equipment Parts Supply Agreement`,
    `Maintenance Parts Supply - ${brand}`,
    `${brand} Spare Parts Annual Contract`,
    `Supply Agreement - ${brand} Materials`,
    `${brand} Components & Parts Supply`,
    `Annual Parts Supply - ${brand} Equipment`
  ];
  
  // Category-specific names
  if (desc.includes('ENGINE') || desc.includes('TRANSMISSION')) {
    return `Major Component Supply - ${brand}`;
  }
  if (desc.includes('PUMP') || desc.includes('CYLINDER') || desc.includes('MOTOR')) {
    return `Hydraulic Systems Supply - ${brand}`;
  }
  if (desc.includes('BEARING') || desc.includes('GEAR') || desc.includes('CLUTCH')) {
    return `Mechanical Parts Supply - ${brand}`;
  }
  if (desc.includes('SEAL') || desc.includes('GASKET') || desc.includes('ORING')) {
    return `Seals & Gaskets Supply - ${brand}`;
  }
  
  // Random template for others
  return templates[randomInt(0, templates.length - 1)];
}

// Generate contract dates
function generateContractDates(contractType: 'Contractual' | 'Non-Contractual'): {
  startDate: string;
  endDate: string;
} {
  if (contractType === 'Non-Contractual') {
    return { startDate: '', endDate: '' };
  }
  
  // Random start date in 2025
  const startMonth = randomInt(1, 12);
  const startDay = randomInt(1, 28);
  const startDate = `2025-${startMonth.toString().padStart(2, '0')}-${startDay.toString().padStart(2, '0')}`;
  
  // Contract duration: 6 or 12 months
  const durationMonths = Math.random() < 0.7 ? 12 : 6;
  const endMonth = startMonth + durationMonths > 12 ? 
    (startMonth + durationMonths - 12) : 
    (startMonth + durationMonths);
  const endYear = startMonth + durationMonths > 12 ? 2026 : 2025;
  const endDate = `${endYear}-${endMonth.toString().padStart(2, '0')}-${startDay.toString().padStart(2, '0')}`;
  
  return { startDate, endDate };
}

/**
 * Enhance material with Annual Purchase Plan data
 */
export function enhanceMaterialWithAPP(material: Material, sequence: number): Material {
  // If material already has APP data, skip
  if (material.qty !== undefined && material.estimatedPrice !== undefined) {
    return material;
  }
  
  const estimatedPrice = parseFloat(generateEstimatedPrice(material.materialDescription).toFixed(2));
  const qty = generateQuantity(estimatedPrice);
  const contractType = generateContractType();
  const vendorName = getVendorName(material.extMaterialGroup);
  const contractNumber = contractType === 'Contractual' ? 
    generateContractNumber(2025, sequence) : '';
  const contractName = contractType === 'Contractual' ?
    generateContractName(material.materialDescription, material.extMaterialGroup) : '';
  const { startDate, endDate } = generateContractDates(contractType);
  
  return {
    ...material,
    qty,
    estimatedPrice,
    contractType,
    vendorName,
    contractNumber: contractNumber || undefined,
    contractName: contractName || undefined,
    contractStartDate: startDate || undefined,
    contractEndDate: endDate || undefined,
    updatedDate: new Date().toISOString()
  };
}

/**
 * Enhance all materials with APP data
 */
export function enhanceAllMaterials(materials: Material[]): Material[] {
  return materials.map((material, index) => enhanceMaterialWithAPP(material, index + 1));
}

/**
 * Get summary statistics
 */
export function getAPPSummary(materials: Material[]): {
  total: number;
  contractual: number;
  nonContractual: number;
  totalValue: number;
  avgPrice: number;
} {
  const contractual = materials.filter(m => m.contractType === 'Contractual').length;
  const nonContractual = materials.filter(m => m.contractType === 'Non-Contractual').length;
  const totalValue = materials.reduce((sum, m) => sum + ((m.qty || 0) * (m.estimatedPrice || 0)), 0);
  const avgPrice = materials.reduce((sum, m) => sum + (m.estimatedPrice || 0), 0) / materials.length;
  
  return {
    total: materials.length,
    contractual,
    nonContractual,
    totalValue: parseFloat(totalValue.toFixed(2)),
    avgPrice: parseFloat(avgPrice.toFixed(2))
  };
}
