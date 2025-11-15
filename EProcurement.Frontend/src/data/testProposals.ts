import { Proposal } from '../types';

/**
 * VENDOR RECOMMENDATION TEST PROPOSALS
 * ====================================
 * 
 * Proposal-proposal ini khusus dibuat untuk testing vendor recommendation system.
 * Sub-classification menggunakan KODE (M.01.01, M.01.02, M.01.03) yang sesuai dengan vendor database.
 * 
 * Cara menggunakan:
 * 1. Import testProposals dari file ini
 * 2. Gabungkan dengan mockProposals di App.tsx
 * 3. Login sebagai Planner atau Buyer
 * 4. Buka menu "Sourcing Documents"
 * 5. Klik "View" pada salah satu test proposal
 * 6. Recommended Vendors akan muncul otomatis
 */

export const testProposals: Proposal[] = [
  // ============================================================================
  // Test Proposal 1: M.01.02 - Bearing (FIXED CODE format)
  // Expected vendors: PT Kambing Guling, PT ABCDEF (vendors with M.01.02-Bearing)
  // ============================================================================
  {
    id: 'vtest-1',
    proposalNo: 'TEST-BEARING-001', // ✅ CHANGED: Test format to avoid conflict with user proposals
    title: 'Proposal Test 1: Bearing Procurement for Heavy Equipment',
    description: 'Procurement of high-quality bearings for heavy equipment maintenance including excavators, dump trucks, and loaders. Required for preventive maintenance program.',
    category: 'Material - Goods',
    classification: 'Spareparts',
    subClassification: 'M.01.02', // ✅ FIXED: M.01.02 is for Bearing (NOT M.01.01 which is Battery)
    subClassifications: [{ code: 'M.01.02', name: 'Bearing' }], // ✅ Array format for robust vendor matching
    
    // ✅ NEW: KBLI Codes from TOR (Nov 12, 2025)
    kbliCodes: ['46591', '46599'], // KBLI codes relevant to bearing suppliers
    
    // ✅ NEW: Brand Specifications from TOR (Nov 12, 2025)
    brandSpecifications: ['SKF', 'NSK', 'Timken'], // Brands specified in budget items
    
    // ✅ NEW: TOR Items with KBLI and Brand Requirements (Nov 12, 2025 FIX)
    torItems: [
      {
        id: 'KBLI',
        label: 'KBLI Code',
        enabled: true,
        parameter: 'Industry Classification',
        requirement: '46591, 46599', // ✅ Synced with kbliCodes array!
        description: 'KBLI codes for bearing suppliers - wholesale of machinery equipment',
        remarks: 'Vendor must have valid KBLI registration in these categories'
      },
      {
        id: 'brandSpec',
        label: 'Brand Specification',
        enabled: true,
        parameter: 'Approved Brands',
        requirement: 'SKF, NSK, Timken', // ✅ Synced with brandSpecifications array!
        description: 'OEM brands only - no substitute brands accepted',
        remarks: 'Equivalent brands must be pre-approved by Engineering Department'
      },
      {
        id: 'warranty',
        label: 'Warranty',
        enabled: true,
        parameter: 'Warranty Period',
        requirement: 'Minimum 12 months from delivery date',
        description: 'Full replacement warranty for manufacturing defects',
        remarks: 'Warranty claim process must be documented'
      },
      {
        id: 'delivery',
        label: 'Delivery Time',
        enabled: true,
        parameter: 'Maximum Delivery Time',
        requirement: '21 working days from PO issuance',
        description: 'Delivery to JAHO Main Workshop',
        remarks: 'Penalty applies for late delivery'
      }
    ],
    
    // ✅ TER Items
    terItems: [
      {
        id: 'certification',
        label: 'Product Certification',
        enabled: true,
        parameter: 'Required Certifications',
        requirement: 'ISO 9001, Original Manufacturer Certificate',
        description: 'Must provide certificates with quotation',
        remarks: 'Photocopies accepted, originals on delivery'
      },
      {
        id: 'packaging',
        label: 'Packaging',
        enabled: true,
        parameter: 'Packaging Requirements',
        requirement: 'Individual boxes with grease, sealed packaging',
        description: 'Protection from moisture and contamination',
        remarks: 'Damaged packaging will be rejected'
      }
    ],
    
    // ✅ NEW: Recommended Vendors (Auto-fetched based on sub-classification M.01.02)
    recommendedVendors: [
      {
        vendorName: 'PT Kambing Guling',
        vendorCode: 'VND-KG-001',
        contactPerson: 'John Doe',
        phoneNumber: '+62 21 1234567',
        email: 'sales@kambingguling.com',
        isRecommended: true
      },
      {
        vendorName: 'PT ABCDEF',
        vendorCode: 'VND-ABC-001',
        contactPerson: 'Jane Smith',
        phoneNumber: '+62 21 2345678',
        email: 'info@abcdef.co.id',
        isRecommended: true
      },
      {
        vendorName: 'PT Glodok Jaya',
        vendorCode: 'VND-GLO-001',
        contactPerson: 'Ahmad Yani',
        phoneNumber: '+62 21 3456789',
        email: 'sales@glodokjaya.com',
        isRecommended: true
      }
    ],
    
    tor: 'Supply of SKF or equivalent bearings with minimum 12-month warranty and technical documentation',
    ter: 'Original manufacturer bearings, ISO certified, proper packaging with grease, delivery within 21 days',
    vendorList: [],
    jobsite: 'JAHO',
    department: 'Plant',
    workLocation: 'JAHO Main Workshop',
    creator: 'Ahmad Fauzi',
    creatorId: '3',
    creatorJobsite: 'JAHO',
    creatorDepartment: 'Plant',
    createdDate: new Date('2025-11-01T08:00:00').toISOString(),
    amount: 185000000,
    contractType: 'Single Vendor',
    contractualSubType: 'Direct Purchase',
    fundingBudget: true,
    fundingNonBudget: false,
    durationMonths: 0,
    status: 'Approved',
    budgetItems: [
      {
        id: 'budget-vtest1-1',
        materialId: 'mat-001',
        materialCode: '2115-10-37210',
        materialDescription: 'SKF Deep Groove Ball Bearing 6208',
        uom: 'EA',
        brand: 'SKF',
        qty: 100,
        estimatedPrice: 45.50,
        subClassification: 'M.01.02-Bearing', // ✅ FIXED: Changed from Battery to Bearing
        plant: '4090'
      },
      {
        id: 'budget-vtest1-2',
        materialId: 'mat-002',
        materialCode: '190-10-37210',
        materialDescription: 'NSK Cylindrical Roller Bearing NU309',
        uom: 'EA',
        brand: 'NSK',
        qty: 50,
        estimatedPrice: 45.50,
        subClassification: 'M.01.02-Bearing', // ✅ FIXED: Changed from Battery to Bearing
        plant: '4090'
      },
      {
        id: 'budget-vtest1-3',
        materialId: 'mat-003',
        materialCode: '4221019',
        materialDescription: 'Timken Tapered Roller Bearing 32016X',
        uom: 'EA',
        brand: 'Timken',
        qty: 75,
        estimatedPrice: 32.75,
        subClassification: 'M.01.02-Bearing', // ✅ FIXED: Changed from Bearing Components to Bearing
        plant: '4090'
      }
    ],
    history: [
      {
        date: new Date('2025-11-01T08:00:00').toISOString(),
        action: 'Created',
        by: 'Ahmad Fauzi',
        comments: 'Bearing procurement for maintenance',
        role: 'Creator Plant Department JAHO'
      },
      {
        date: new Date('2025-11-01T09:00:00').toISOString(),
        action: 'Submitted',
        by: 'Ahmad Fauzi',
        comments: 'Submitted for approval',
        role: 'Creator Plant Department JAHO'
      },
      {
        date: new Date('2025-11-01T10:00:00').toISOString(),
        action: 'Approved',
        by: 'Siti Nurhaliza',
        comments: 'Approved - Critical spare parts',
        role: 'Unit Head Plant Department JAHO'
      },
      {
        date: new Date('2025-11-01T11:00:00').toISOString(),
        action: 'Approved',
        by: 'Budi Rahardjo',
        comments: 'Approved by Section Head',
        role: 'Section Head Plant Department JAHO'
      },
      {
        date: new Date('2025-11-01T13:00:00').toISOString(),
        action: 'Approved',
        by: 'Dewi Kartika',
        comments: 'Approved - Budget confirmed',
        role: 'Department Head Plant Department JAHO'
      },
      {
        date: new Date('2025-11-01T14:00:00').toISOString(),
        action: 'Approved',
        by: 'Eko Prasetyo',
        comments: 'Approved by Manager - Final approval',
        role: 'Manager Plant Department JAHO'
      }
    ]
  },

  // ============================================================================
  // Test Proposal 2: M.01.05 - Fastener (FIXED CODE format for Bolt & Nut)
  // Expected vendors: PT Glodok Jaya (vendors with M.01.05-Fastener)
  // ============================================================================
  {
    id: 'vtest-2',
    proposalNo: 'PRO-2025-VTEST-002',
    title: 'Proposal Test 2: Bolts & Nuts Bulk Procurement',
    description: 'Annual supply contract for various grades of bolts, nuts, washers, and fasteners for equipment maintenance and repair operations.',
    category: 'Material - Goods',
    classification: 'Spareparts',
    subClassification: 'M.01.05', // ✅ FIXED: M.01.05 is for Fastener (Bolt & Nut)
    subClassifications: [{ code: 'M.01.05', name: 'Fastener' }], // ✅ Array format for robust vendor matching
    
    // ✅ NEW: KBLI Codes from TOR (Nov 12, 2025)
    kbliCodes: ['46599'], // KBLI code for fastener suppliers
    
    // ✅ NEW: Brand Specifications from TOR (Nov 12, 2025)
    brandSpecifications: ['Local Brand', 'JIS Standard', 'DIN Standard'], // Generic brand specs for fasteners
    
    // ✅ NEW: Recommended Vendors (Auto-fetched based on sub-classification M.01.05)
    recommendedVendors: [
      {
        vendorName: 'PT Glodok Jaya',
        vendorCode: 'VND-GLO-001',
        contactPerson: 'Ahmad Yani',
        phoneNumber: '+62 21 3456789',
        email: 'sales@glodokjaya.com',
        isRecommended: true
      }
    ],
    
    tor: 'Supply of high-tensile strength bolts and nuts (Grade 8.8 and above) in various sizes with proper certifications',
    ter: 'JIS/DIN/ISO standard fasteners, heat-treated, with material certificates, proper packaging',
    vendorList: [],
    jobsite: 'ADMO MINING',
    department: 'Plant',
    workLocation: 'ADMO Workshop',
    creator: 'Ahmad Fauzi',
    creatorId: '3',
    creatorJobsite: 'JAHO',
    creatorDepartment: 'Plant',
    createdDate: new Date('2025-11-02T08:00:00').toISOString(),
    amount: 95000000,
    contractType: 'Contractual',
    contractualSubType: 'Annual Supply Contract',
    contractPeriod: '12 months',
    fundingBudget: true,
    fundingNonBudget: false,
    durationMonths: 12,
    status: 'Approved',
    budgetItems: [
      {
        id: 'budget-vtest2-1',
        materialId: 'mat-004',
        materialCode: 'BN-M16-100',
        materialDescription: 'BOLT M16 X 100MM GRADE 8.8',
        uom: 'EA',
        brand: 'UNBRAKO',
        qty: 500,
        estimatedPrice: 2.50,
        subClassification: 'M.01.05-Fastener', // ✅ FIXED: Changed to Fastener
        plant: '4080'
      },
      {
        id: 'budget-vtest2-2',
        materialId: 'mat-005',
        materialCode: 'BN-M20-150',
        materialDescription: 'BOLT M20 X 150MM GRADE 10.9',
        uom: 'EA',
        brand: 'WUERTH',
        qty: 300,
        estimatedPrice: 4.75,
        subClassification: 'M.01.05-Fastener', // ✅ FIXED: Changed to Fastener
        plant: '4080'
      },
      {
        id: 'budget-vtest2-3',
        materialId: 'mat-006',
        materialCode: 'NUT-M16-8.8',
        materialDescription: 'NUT M16 GRADE 8.8 HEXAGONAL',
        uom: 'EA',
        brand: 'UNBRAKO',
        qty: 500,
        estimatedPrice: 1.25,
        subClassification: 'M.01.05-Fastener', // ✅ FIXED: Changed to Fastener
        plant: '4080'
      }
    ],
    history: [
      {
        date: new Date('2025-11-02T08:00:00').toISOString(),
        action: 'Created',
        by: 'Ahmad Fauzi',
        comments: 'Annual bolts & nuts supply contract',
        role: 'Creator Plant Department JAHO'
      },
      {
        date: new Date('2025-11-02T09:00:00').toISOString(),
        action: 'Submitted',
        by: 'Ahmad Fauzi',
        comments: 'Submitted for approval',
        role: 'Creator Plant Department JAHO'
      },
      {
        date: new Date('2025-11-02T10:00:00').toISOString(),
        action: 'Approved',
        by: 'Siti Nurhaliza',
        comments: 'Approved by Unit Head',
        role: 'Unit Head Plant Department JAHO'
      },
      {
        date: new Date('2025-11-02T11:00:00').toISOString(),
        action: 'Approved',
        by: 'Budi Rahardjo',
        comments: 'Approved by Section Head',
        role: 'Section Head Plant Department JAHO'
      },
      {
        date: new Date('2025-11-02T13:00:00').toISOString(),
        action: 'Approved',
        by: 'Dewi Kartika',
        comments: 'Approved by Department Head',
        role: 'Department Head Plant Department JAHO'
      },
      {
        date: new Date('2025-11-02T14:00:00').toISOString(),
        action: 'Approved',
        by: 'Eko Prasetyo',
        comments: 'Approved - Final approval',
        role: 'Manager Plant Department JAHO'
      }
    ]
  },

  // ============================================================================
  // Test Proposal 3: M.01.03 - Seal (CODE format)
  // Expected vendors: PT Burung Terbang, PT Ikan Berenang
  // ============================================================================
  {
    id: 'vtest-3',
    proposalNo: 'PRO-2025-VTEST-003',
    title: 'Proposal Test 3: Hydraulic Seals & O-Rings Package',
    description: 'Procurement of comprehensive hydraulic seals, O-rings, and gaskets kit for heavy equipment hydraulic system maintenance.',
    category: 'Material - Goods',
    classification: 'Spareparts',
    subClassification: 'M.01.03', // CODE format - akan match dengan vendor database
    subClassifications: [{ code: 'M.01.03', name: 'Seal' }], // ✅ Array format for robust vendor matching
    tor: 'Supply of NOK, Parker, or equivalent hydraulic seals with complete size range and material specifications',
    ter: 'NBR/FKM material seals, temperature range -40°C to +200°C, proper storage packaging, 18-month warranty',
    vendorList: [],
    jobsite: 'SERA',
    department: 'Plant',
    workLocation: 'SERA Maintenance Workshop',
    creator: 'Ahmad Fauzi',
    creatorId: '3',
    creatorJobsite: 'JAHO',
    creatorDepartment: 'Plant',
    createdDate: new Date('2025-11-03T08:00:00').toISOString(),
    amount: 125000000,
    contractType: 'Single Vendor',
    contractualSubType: 'Direct Purchase',
    fundingBudget: true,
    fundingNonBudget: false,
    durationMonths: 0,
    status: 'Approved',
    budgetItems: [
      {
        id: 'budget-vtest3-1',
        materialId: 'mat-007',
        materialCode: 'SEAL-OR-100',
        materialDescription: 'O-RING 100MM NBR MATERIAL',
        uom: 'EA',
        brand: 'NOK',
        qty: 200,
        estimatedPrice: 8.50,
        subClassification: 'M.01.03-Seal',
        plant: '4070'
      },
      {
        id: 'budget-vtest3-2',
        materialId: 'mat-008',
        materialCode: 'SEAL-OR-150',
        materialDescription: 'O-RING 150MM FKM MATERIAL',
        uom: 'EA',
        brand: 'PARKER',
        qty: 150,
        estimatedPrice: 12.75,
        subClassification: 'M.01.03-Seal',
        plant: '4070'
      },
      {
        id: 'budget-vtest3-3',
        materialId: 'mat-009',
        materialCode: 'SEAL-HYD-250',
        materialDescription: 'HYDRAULIC SEAL 250MM',
        uom: 'EA',
        brand: 'NOK',
        qty: 100,
        estimatedPrice: 25.00,
        subClassification: 'M.01.03-Seal',
        plant: '4070'
      }
    ],
    history: [
      {
        date: new Date('2025-11-03T08:00:00').toISOString(),
        action: 'Created',
        by: 'Ahmad Fauzi',
        comments: 'Hydraulic seals procurement',
        role: 'Creator Plant Department JAHO'
      },
      {
        date: new Date('2025-11-03T09:00:00').toISOString(),
        action: 'Submitted',
        by: 'Ahmad Fauzi',
        comments: 'Submitted for approval',
        role: 'Creator Plant Department JAHO'
      },
      {
        date: new Date('2025-11-03T10:00:00').toISOString(),
        action: 'Approved',
        by: 'Siti Nurhaliza',
        comments: 'Approved - Essential for maintenance',
        role: 'Unit Head Plant Department JAHO'
      },
      {
        date: new Date('2025-11-03T11:00:00').toISOString(),
        action: 'Approved',
        by: 'Budi Rahardjo',
        comments: 'Approved by Section Head',
        role: 'Section Head Plant Department JAHO'
      },
      {
        date: new Date('2025-11-03T13:00:00').toISOString(),
        action: 'Approved',
        by: 'Dewi Kartika',
        comments: 'Approved by Department Head',
        role: 'Department Head Plant Department JAHO'
      },
      {
        date: new Date('2025-11-03T14:00:00').toISOString(),
        action: 'Approved',
        by: 'Eko Prasetyo',
        comments: 'Approved - Final approval',
        role: 'Manager Plant Department JAHO'
      }
    ]
  },

  // ============================================================================
  // Test Proposal 4: Bearing dengan NAME format (backward compatibility test)
  // Expected vendors: PT Kambing Guling, PT Kuda Lari (same as M.01.01)
  // ============================================================================
  {
    id: 'vtest-4',
    proposalNo: 'PRO-2025-VTEST-004',
    title: 'Proposal Test 4: Premium Bearing Package (NAME format test)',
    description: 'Procurement of premium quality bearings for critical equipment. This proposal uses NAME format for sub-classification to test backward compatibility.',
    category: 'Material - Goods',
    classification: 'Spareparts',
    subClassification: 'Bearing', // NAME format - backward compatibility test
    tor: 'Supply of premium SKF bearings with extended warranty and technical support',
    ter: 'Original SKF bearings with hologram authentication, 24-month warranty, technical training included',
    vendorList: [],
    jobsite: 'MACO MINING',
    department: 'Plant',
    workLocation: 'MACO Workshop',
    creator: 'Ahmad Fauzi',
    creatorId: '3',
    creatorJobsite: 'JAHO',
    creatorDepartment: 'Plant',
    createdDate: new Date('2025-11-04T08:00:00').toISOString(),
    amount: 245000000,
    contractType: 'Single Vendor',
    contractualSubType: 'Direct Purchase',
    fundingBudget: true,
    fundingNonBudget: false,
    status: 'Approved',
    history: [
      {
        date: new Date('2025-11-04T08:00:00').toISOString(),
        action: 'Created',
        by: 'Ahmad Fauzi',
        comments: 'Premium bearing procurement - NAME format test',
        role: 'Creator Plant Department JAHO'
      },
      {
        date: new Date('2025-11-04T09:00:00').toISOString(),
        action: 'Submitted',
        by: 'Ahmad Fauzi',
        comments: 'Submitted for approval',
        role: 'Creator Plant Department JAHO'
      },
      {
        date: new Date('2025-11-04T10:00:00').toISOString(),
        action: 'Approved',
        by: 'Siti Nurhaliza',
        comments: 'Approved by Unit Head',
        role: 'Unit Head Plant Department JAHO'
      },
      {
        date: new Date('2025-11-04T11:00:00').toISOString(),
        action: 'Approved',
        by: 'Budi Rahardjo',
        comments: 'Approved by Section Head',
        role: 'Section Head Plant Department JAHO'
      },
      {
        date: new Date('2025-11-04T13:00:00').toISOString(),
        action: 'Approved',
        by: 'Dewi Kartika',
        comments: 'Approved by Department Head',
        role: 'Department Head Plant Department JAHO'
      },
      {
        date: new Date('2025-11-04T14:00:00').toISOString(),
        action: 'Approved',
        by: 'Eko Prasetyo',
        comments: 'Approved - Final approval',
        role: 'Manager Plant Department JAHO'
      }
    ]
  }
];
