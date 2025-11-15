// ===================================================================
// VENDOR DATABASE - RESTRUCTURED FOR INTELLIGENT RECOMMENDATION
// ===================================================================
// Support for:
// - Multiple Sub-Classifications per vendor
// - Multiple KBLI codes per vendor
// - Multiple Brands per vendor
// This enables smart vendor recommendation based on proposal criteria
// ===================================================================

export interface VendorCapability {
  // Sub-classification support
  subClassifications: {
    categoryCode: string;
    categoryName: string;
    classificationCode: string;
    classificationName: string;
    subClassificationCode: string;
    subClassificationName: string;
  }[];
  
  // KBLI (Klasifikasi Baku Lapangan Usaha Indonesia) support
  kbliCodes: {
    code: string;
    description: string;
  }[];
  
  // Brand support (brands that vendor can supply)
  brands: string[]; // Array of brand names from External Brand data
}

export interface VendorRecord {
  // Basic Information
  id: string;
  vendorName: string;
  vendorCode: string;
  
  // Contact Information
  contactPerson?: string;
  phoneNumber?: string;
  email?: string;
  address?: string;
  website?: string;
  
  // Capabilities - MAIN FEATURE
  capabilities: VendorCapability;
  
  // Performance & Qualification
  rating?: number; // 1-5 stars
  certifications?: string[]; // ISO, SNI, etc.
  
  // Business Information
  companySize?: 'Small' | 'Medium' | 'Large' | 'Enterprise';
  yearEstablished?: number;
  npwp?: string;
  siup?: string;
  
  // Financial
  creditLimit?: number;
  paymentTerms?: string; // e.g., "Net 30", "Net 60"
  
  // Notes & Tags
  notes?: string;
  tags?: string[]; // e.g., ['Preferred', 'Blacklist', 'Strategic Partner']
  
  // Status & Audit
  isActive: boolean;
  isPreferred?: boolean; // Preferred vendor flag
  createdDate: string;
  updatedDate: string;
  createdBy?: string;
  updatedBy?: string;
  
  // Dynamic fields for future expansion
  customFields?: Record<string, any>;
}

// ===================================================================
// VENDOR DATABASE
// ===================================================================
export const vendorDatabase: VendorRecord[] = [
  // VENDOR 1: PT Kambing Guling (Multi-capability vendor)
  {
    id: 'VDB-001',
    vendorName: 'PT Kambing Guling',
    vendorCode: 'VND-KG-001',
    contactPerson: 'John Doe',
    phoneNumber: '+62 21 1234567',
    email: 'sales@kambingguling.com',
    address: 'Jl. Gatot Subroto No. 123, Jakarta Selatan',
    website: 'www.kambingguling.com',
    capabilities: {
      subClassifications: [
        {
          categoryCode: 'M',
          categoryName: 'M. Material - Goods',
          classificationCode: 'M.01',
          classificationName: 'M.01 Spareparts',
          subClassificationCode: 'M.01.01',
          subClassificationName: 'M.01.01-Battery / Accumulator',
        },
        {
          categoryCode: 'M',
          categoryName: 'M. Material - Goods',
          classificationCode: 'M.01',
          classificationName: 'M.01 Spareparts',
          subClassificationCode: 'M.01.02',
          subClassificationName: 'M.01.02-Bearing',
        },
        {
          categoryCode: 'M',
          categoryName: 'M. Material - Goods',
          classificationCode: 'M.01',
          classificationName: 'M.01 Spareparts',
          subClassificationCode: 'M.01.13',
          subClassificationName: 'M.01.13 -V-Belt',
        },
      ],
      kbliCodes: [
        { code: '46591', description: 'Perdagangan Besar Suku Cadang Kendaraan Bermotor' },
        { code: '46599', description: 'Perdagangan Besar Alat dan Mesin Industri Lainnya' },
        { code: '28250', description: 'Industri Mesin Pendingin dan Pemurni Udara' },
      ],
      brands: [
        'SKF',
        'NSK',
        'Timken',
        'FAG',
        'NTN',
        'Gates',
        'Mitsuboshi',
      ],
    },
    rating: 4.5,
    certifications: ['ISO 9001:2015', 'SNI 19-9001-2001'],
    companySize: 'Medium',
    yearEstablished: 2010,
    isActive: true,
    isPreferred: true,
    createdDate: '2024-01-15',
    updatedDate: '2025-11-12',
    tags: ['Preferred', 'Strategic Partner'],
  },
  
  // VENDOR 2: PT ABCDEF (Multi-brand distributor)
  {
    id: 'VDB-002',
    vendorName: 'PT ABCDEF',
    vendorCode: 'VND-ABC-001',
    contactPerson: 'Jane Smith',
    phoneNumber: '+62 21 2345678',
    email: 'info@abcdef.co.id',
    address: 'Jl. Sudirman Kav. 45, Jakarta Pusat',
    capabilities: {
      subClassifications: [
        {
          categoryCode: 'M',
          categoryName: 'M. Material - Goods',
          classificationCode: 'M.01',
          classificationName: 'M.01 Spareparts',
          subClassificationCode: 'M.01.02',
          subClassificationName: 'M.01.02-Bearing',
        },
        {
          categoryCode: 'M',
          categoryName: 'M. Material - Goods',
          classificationCode: 'M.01',
          classificationName: 'M.01 Spareparts',
          subClassificationCode: 'M.01.06',
          subClassificationName: 'M.01.06-Filter',
        },
        {
          categoryCode: 'M',
          categoryName: 'M. Material - Goods',
          classificationCode: 'M.01',
          classificationName: 'M.01 Spareparts',
          subClassificationCode: 'M.01.11',
          subClassificationName: 'M.01.11 -Seal, O-Ring, Gasket',
        },
      ],
      kbliCodes: [
        { code: '46591', description: 'Perdagangan Besar Suku Cadang Kendaraan Bermotor' },
        { code: '46693', description: 'Perdagangan Besar Mesin, Peralatan dan Perlengkapan Lainnya' },
      ],
      brands: [
        'SKF',
        'FAG',
        'Bosch',
        'Mann Filter',
        'Parker',
        'Donaldson',
        'Sakura',
      ],
    },
    rating: 4.8,
    certifications: ['ISO 9001:2015', 'ISO 14001:2015'],
    companySize: 'Large',
    yearEstablished: 2005,
    isActive: true,
    isPreferred: true,
    createdDate: '2024-01-15',
    updatedDate: '2025-11-12',
    tags: ['Preferred', 'Multi-Brand'],
  },
  
  // VENDOR 3: PT Glodok Jaya (Local supplier)
  {
    id: 'VDB-003',
    vendorName: 'PT Glodok Jaya',
    vendorCode: 'VND-GLO-001',
    contactPerson: 'Ahmad Yani',
    phoneNumber: '+62 21 3456789',
    email: 'sales@glodokjaya.com',
    address: 'Jl. Hayam Wuruk No. 77, Jakarta Barat',
    capabilities: {
      subClassifications: [
        {
          categoryCode: 'M',
          categoryName: 'M. Material - Goods',
          classificationCode: 'M.01',
          classificationName: 'M.01 Spareparts',
          subClassificationCode: 'M.01.02',
          subClassificationName: 'M.01.02-Bearing',
        },
        {
          categoryCode: 'M',
          categoryName: 'M. Material - Goods',
          classificationCode: 'M.01',
          classificationName: 'M.01 Spareparts',
          subClassificationCode: 'M.01.05',
          subClassificationName: 'M.01.05-Fastener',
        },
      ],
      kbliCodes: [
        { code: '46599', description: 'Perdagangan Besar Alat dan Mesin Industri Lainnya' },
      ],
      brands: [
        'NSK',
        'NTN',
        'Local Brand',
      ],
    },
    rating: 4.2,
    certifications: ['SNI 19-9001-2001'],
    companySize: 'Small',
    yearEstablished: 2015,
    isActive: true,
    createdDate: '2024-01-15',
    updatedDate: '2025-11-12',
  },
  
  // VENDOR 4: PT Spareparts Indonesia (Specialized in filters)
  {
    id: 'VDB-004',
    vendorName: 'PT Spareparts Indonesia',
    vendorCode: 'VND-SPI-001',
    contactPerson: 'Budi Santoso',
    phoneNumber: '+62 21 4567890',
    email: 'info@sparepartsindonesia.com',
    address: 'Jl. MT Haryono No. 88, Jakarta Timur',
    capabilities: {
      subClassifications: [
        {
          categoryCode: 'M',
          categoryName: 'M. Material - Goods',
          classificationCode: 'M.01',
          classificationName: 'M.01 Spareparts',
          subClassificationCode: 'M.01.06',
          subClassificationName: 'M.01.06-Filter',
        },
        {
          categoryCode: 'M',
          categoryName: 'M. Material - Goods',
          classificationCode: 'M.01',
          classificationName: 'M.01 Spareparts',
          subClassificationCode: 'M.01.08',
          subClassificationName: 'M.01.08 -Hose',
        },
      ],
      kbliCodes: [
        { code: '46591', description: 'Perdagangan Besar Suku Cadang Kendaraan Bermotor' },
        { code: '28297', description: 'Industri Mesin Keperluan Umum Lainnya YTDL' },
      ],
      brands: [
        'Mann Filter',
        'Donaldson',
        'Sakura',
        'Fleetguard',
        'Parker',
      ],
    },
    rating: 4.6,
    certifications: ['ISO 9001:2015'],
    companySize: 'Medium',
    yearEstablished: 2008,
    isActive: true,
    createdDate: '2024-01-15',
    updatedDate: '2025-11-12',
  },
  
  // VENDOR 5: PT Angin Ribut (Service provider)
  {
    id: 'VDB-005',
    vendorName: 'PT Angin Ribut',
    vendorCode: 'VND-ANR-001',
    contactPerson: 'Siti Nurhaliza',
    phoneNumber: '+62 21 5678901',
    email: 'sales@anginribut.co.id',
    address: 'Jl. Rasuna Said No. 99, Jakarta Selatan',
    capabilities: {
      subClassifications: [
        {
          categoryCode: 'S',
          categoryName: 'S. Service',
          classificationCode: 'S.01',
          classificationName: 'S.01 Maintenance & Repair',
          subClassificationCode: 'S.01.01',
          subClassificationName: 'S.01.01 Heavy Equipment Maintenance',
        },
        {
          categoryCode: 'S',
          categoryName: 'S. Service',
          classificationCode: 'S.01',
          classificationName: 'S.01 Maintenance & Repair',
          subClassificationCode: 'S.01.02',
          subClassificationName: 'S.01.02 Vehicle Maintenance',
        },
      ],
      kbliCodes: [
        { code: '33120', description: 'Reparasi Mesin' },
        { code: '45200', description: 'Pemeliharaan dan Reparasi Kendaraan Bermotor' },
      ],
      brands: [
        'OEM Service',
        'Certified Workshop',
      ],
    },
    rating: 4.3,
    certifications: ['ISO 9001:2015', 'OHSAS 18001:2007'],
    companySize: 'Medium',
    yearEstablished: 2012,
    isActive: true,
    createdDate: '2024-01-15',
    updatedDate: '2025-11-12',
  },
  
  // VENDOR 6: PT Bearing Specialist (Bearing supplier with KBLI 46499)
  {
    id: 'VDB-006',
    vendorName: 'PT Bearing Specialist Indonesia',
    vendorCode: 'VND-BSI-001',
    contactPerson: 'Rudi Hartono',
    phoneNumber: '+62 21 6789012',
    email: 'sales@bearingspecialist.co.id',
    address: 'Jl. Industri No. 45, Jakarta Utara',
    website: 'www.bearingspecialist.co.id',
    capabilities: {
      subClassifications: [
        {
          categoryCode: 'M',
          categoryName: 'M. Material - Goods',
          classificationCode: 'M.01',
          classificationName: 'M.01 Spareparts',
          subClassificationCode: 'M.01.02',
          subClassificationName: 'M.01.02-Bearing',
        },
      ],
      kbliCodes: [
        { code: '46499', description: 'Perdagangan Besar Barang Lainnya yang Tidak Diklasifikasikan di Tempat Lain' },
        { code: '46591', description: 'Perdagangan Besar Mesin, Peralatan dan Perlengkapan Lainnya' },
      ],
      brands: [
        'SKF',
        'NSK',
        'Timken',
        'NTN',
        'FAG',
        'INA',
        'Koyo',
        'SNR',
      ],
    },
    rating: 4.8,
    certifications: ['ISO 9001:2015', 'ISO 14001:2015', 'SNI Bearing Standards'],
    companySize: 'Medium',
    yearEstablished: 2008,
    creditLimit: 2000000000, // IDR 2 Billion
    paymentTerms: 'Net 30',
    isActive: true,
    isPreferred: true, // ✅ Now preferred vendor
    createdDate: '2024-01-15',
    updatedDate: '2025-11-12',
    tags: ['Preferred', 'Bearing Specialist', 'OEM Distributor'],
    notes: 'Authorized distributor for SKF, NSK, and Timken. Specializes in industrial bearings for mining and heavy equipment.',
  },
  
  // VENDOR 6B: PT Indo Bearing Supply (Another bearing vendor with KBLI 46499)
  {
    id: 'VDB-006B',
    vendorName: 'PT Indo Bearing Supply',
    vendorCode: 'VND-IBS-001',
    contactPerson: 'Yanto Kusuma',
    phoneNumber: '+62 21 6789111',
    email: 'info@indobearing.com',
    address: 'Jl. Industri Raya No. 88, Bekasi',
    website: 'www.indobearing.co.id',
    capabilities: {
      subClassifications: [
        {
          categoryCode: 'M',
          categoryName: 'M. Material - Goods',
          classificationCode: 'M.01',
          classificationName: 'M.01 Spareparts',
          subClassificationCode: 'M.01.02',
          subClassificationName: 'M.01.02-Bearing',
        },
      ],
      kbliCodes: [
        { code: '46499', description: 'Perdagangan Besar Barang Lainnya yang Tidak Diklasifikasikan di Tempat Lain' },
      ],
      brands: [
        'SKF',
        'NSK',
        'NTN',
        'Koyo',
        'FAG',
        'INA',
      ],
    },
    rating: 4.5,
    certifications: ['ISO 9001:2015'],
    companySize: 'Small',
    yearEstablished: 2015,
    creditLimit: 1000000000, // IDR 1 Billion
    paymentTerms: 'Net 30',
    isActive: true,
    isPreferred: false,
    createdDate: '2024-01-15',
    updatedDate: '2025-11-12',
    tags: ['Bearing Supplier', 'Competitive Price'],
    notes: 'Alternative supplier for bearing products. Good pricing for bulk orders.',
  },
  
  // VENDOR 7: PT Mega Berdikari (Project contractor)
  {
    id: 'VDB-007',
    vendorName: 'PT Mega Berdikari',
    vendorCode: 'VND-MBD-001',
    contactPerson: 'Andi Wijaya',
    phoneNumber: '+62 21 6789012',
    email: 'procurement@megaberdikari.com',
    address: 'Jl. HR Rasuna Said Kav. 1, Jakarta Selatan',
    capabilities: {
      subClassifications: [
        {
          categoryCode: 'P',
          categoryName: 'P. Project',
          classificationCode: 'P.01',
          classificationName: 'P.01 Infrastructure Project',
          subClassificationCode: 'P.01.01',
          subClassificationName: 'P.01.01 Mining Road Development',
        },
        {
          categoryCode: 'P',
          categoryName: 'P. Project',
          classificationCode: 'P.01',
          classificationName: 'P.01 Infrastructure Project',
          subClassificationCode: 'P.01.02',
          subClassificationName: 'P.01.02 Haul Road Construction',
        },
        {
          categoryCode: 'P',
          categoryName: 'P. Project',
          classificationCode: 'P.02',
          classificationName: 'P.02 Facility Project',
          subClassificationCode: 'P.02.01',
          subClassificationName: 'P.02.01 Workshop Construction',
        },
      ],
      kbliCodes: [
        { code: '42101', description: 'Konstruksi Jalan dan Jalan Rel' },
        { code: '42102', description: 'Konstruksi Jembatan dan Terowongan' },
        { code: '41020', description: 'Konstruksi Gedung' },
      ],
      brands: [
        'Caterpillar',
        'Komatsu',
        'Hitachi',
      ],
    },
    rating: 4.7,
    certifications: ['ISO 9001:2015', 'ISO 14001:2015', 'OHSAS 18001:2007'],
    companySize: 'Enterprise',
    yearEstablished: 2000,
    isActive: true,
    isPreferred: true,
    createdDate: '2024-01-15',
    updatedDate: '2025-11-12',
    tags: ['Preferred', 'Strategic Partner', 'EPC Contractor'],
  },
  
  // VENDOR 8: PT Palu Gada (Hardware supplier)
  {
    id: 'VDB-008',
    vendorName: 'PT Palu Gada',
    vendorCode: 'VND-PLG-001',
    contactPerson: 'Dewi Lestari',
    phoneNumber: '+62 21 7890123',
    email: 'info@palugada.com',
    address: 'Jl. Mangga Dua Raya No. 55, Jakarta Utara',
    capabilities: {
      subClassifications: [
        {
          categoryCode: 'M',
          categoryName: 'M. Material - Goods',
          classificationCode: 'M.01',
          classificationName: 'M.01 Spareparts',
          subClassificationCode: 'M.01.05',
          subClassificationName: 'M.01.05-Fastener',
        },
        {
          categoryCode: 'M',
          categoryName: 'M. Material - Goods',
          classificationCode: 'M.05',
          classificationName: 'M.05 Tools',
          subClassificationCode: 'M.05.01',
          subClassificationName: 'M.05.01 Hand Tools',
        },
      ],
      kbliCodes: [
        { code: '46739', description: 'Perdagangan Besar Hasil Logam Lainnya' },
      ],
      brands: [
        'Unbranded',
        'Local Tools',
      ],
    },
    rating: 4.1,
    certifications: [],
    companySize: 'Small',
    yearEstablished: 2018,
    isActive: true,
    createdDate: '2024-01-15',
    updatedDate: '2025-11-12',
  },
  
  // VENDOR 11: PT Kemana Saja (IT implementation)
  {
    id: 'VDB-011',
    vendorName: 'PT Kemana Saja',
    vendorCode: 'VND-KMS-001',
    contactPerson: 'Ridwan Kamil',
    phoneNumber: '+62 21 8901234',
    email: 'sales@kemanasaja.co.id',
    address: 'Jl. Kuningan Barat No. 20, Jakarta Selatan',
    capabilities: {
      subClassifications: [
        {
          categoryCode: 'P',
          categoryName: 'P. Project',
          classificationCode: 'P.04',
          classificationName: 'P.04 IT Implementation Project',
          subClassificationCode: 'P.04.01',
          subClassificationName: 'P.04.01 ERP System Implementation',
        },
        {
          categoryCode: 'P',
          categoryName: 'P. Project',
          classificationCode: 'P.04',
          classificationName: 'P.04 IT Implementation Project',
          subClassificationCode: 'P.04.02',
          subClassificationName: 'P.04.02 Network Infrastructure Project',
        },
      ],
      kbliCodes: [
        { code: '62010', description: 'Aktivitas Pemrograman Komputer' },
        { code: '62020', description: 'Aktivitas Konsultansi Komputer dan Manajemen Fasilitas Komputer' },
      ],
      brands: [
        'SAP',
        'Oracle',
        'Microsoft',
        'Cisco',
      ],
    },
    rating: 4.4,
    certifications: ['ISO 9001:2015', 'ISO 27001:2013'],
    companySize: 'Medium',
    yearEstablished: 2013,
    isActive: true,
    createdDate: '2024-01-15',
    updatedDate: '2025-11-12',
    tags: ['IT Specialist'],
  },
  
  // VENDOR 9: PT Yori International (Environmental specialist)
  {
    id: 'VDB-009',
    vendorName: 'PT Yori International',
    vendorCode: 'VND-YRI-001',
    contactPerson: 'Yori Gunawan',
    phoneNumber: '+62 21 9012345',
    email: 'info@yoriinternational.com',
    address: 'Jl. TB Simatupang Kav. 88, Jakarta Selatan',
    capabilities: {
      subClassifications: [
        {
          categoryCode: 'P',
          categoryName: 'P. Project',
          classificationCode: 'P.05',
          classificationName: 'P.05 Environmental Project',
          subClassificationCode: 'P.05.01',
          subClassificationName: 'P.05.01 Reclamation Project',
        },
        {
          categoryCode: 'P',
          categoryName: 'P. Project',
          classificationCode: 'P.05',
          classificationName: 'P.05 Environmental Project',
          subClassificationCode: 'P.05.02',
          subClassificationName: 'P.05.02 Waste Management Project',
        },
        {
          categoryCode: 'P',
          categoryName: 'P. Project',
          classificationCode: 'P.05',
          classificationName: 'P.05 Environmental Project',
          subClassificationCode: 'P.05.03',
          subClassificationName: 'P.05.03 Water Management Project',
        },
      ],
      kbliCodes: [
        { code: '39000', description: 'Aktivitas Remediasi dan Pengelolaan Sampah Lainnya' },
        { code: '42919', description: 'Konstruksi Bangunan Sipil Lainnya YTDL' },
      ],
      brands: [
        'Environmental Solutions',
      ],
    },
    rating: 4.5,
    certifications: ['ISO 9001:2015', 'ISO 14001:2015'],
    companySize: 'Medium',
    yearEstablished: 2011,
    isActive: true,
    isPreferred: true,
    createdDate: '2024-01-15',
    updatedDate: '2025-11-12',
    tags: ['Preferred', 'Environmental Expert'],
  },
  
  // VENDOR 10: PT Ultra Mining Services (Multi-capability for mining)
  {
    id: 'VDB-010',
    vendorName: 'PT Ultra Mining Services',
    vendorCode: 'VND-UMS-001',
    contactPerson: 'Bambang Suryadi',
    phoneNumber: '+62 21 3338888',
    email: 'sales@ultramining.co.id',
    address: 'Jl. Mega Kuningan Lot 8.1, Jakarta Selatan',
    capabilities: {
      subClassifications: [
        {
          categoryCode: 'M',
          categoryName: 'M. Material - Goods',
          classificationCode: 'M.01',
          classificationName: 'M.01 Spareparts',
          subClassificationCode: 'M.01.02',
          subClassificationName: 'M.01.02-Bearing',
        },
        {
          categoryCode: 'M',
          categoryName: 'M. Material - Goods',
          classificationCode: 'M.01',
          classificationName: 'M.01 Spareparts',
          subClassificationCode: 'M.01.06',
          subClassificationName: 'M.01.06-Filter',
        },
        {
          categoryCode: 'M',
          categoryName: 'M. Material - Goods',
          classificationCode: 'M.06',
          classificationName: 'M.06 Equipment',
          subClassificationCode: 'M.06.01',
          subClassificationName: 'M.06.01 Heavy Equipment',
        },
        {
          categoryCode: 'S',
          categoryName: 'S. Service',
          classificationCode: 'S.01',
          classificationName: 'S.01 Maintenance & Repair',
          subClassificationCode: 'S.01.01',
          subClassificationName: 'S.01.01 Heavy Equipment Maintenance',
        },
        {
          categoryCode: 'P',
          categoryName: 'P. Project',
          classificationCode: 'P.03',
          classificationName: 'P.03 Equipment Installation Project',
          subClassificationCode: 'P.03.01',
          subClassificationName: 'P.03.01 Crushing Plant Installation',
        },
      ],
      kbliCodes: [
        { code: '46591', description: 'Perdagangan Besar Suku Cadang Kendaraan Bermotor' },
        { code: '46693', description: 'Perdagangan Besar Mesin, Peralatan dan Perlengkapan Lainnya' },
        { code: '33120', description: 'Reparasi Mesin' },
        { code: '43220', description: 'Instalasi Mekanika dan Elektrikal' },
      ],
      brands: [
        'Caterpillar',
        'Komatsu',
        'Hitachi',
        'Sandvik',
        'Metso',
        'SKF',
        'Mann Filter',
        'Fleetguard',
      ],
    },
    rating: 4.9,
    certifications: ['ISO 9001:2015', 'ISO 14001:2015', 'OHSAS 18001:2007', 'ISO 27001:2013'],
    companySize: 'Enterprise',
    yearEstablished: 1995,
    creditLimit: 10000000000, // IDR 10 Billion
    paymentTerms: 'Net 60',
    isActive: true,
    isPreferred: true,
    createdDate: '2024-01-15',
    updatedDate: '2025-11-12',
    tags: ['Preferred', 'Strategic Partner', 'Full Service', 'Mining Specialist'],
  },
];

// ===================================================================
// HELPER FUNCTIONS
// ===================================================================

/**
 * Get vendors by sub-classification code
 */
export const getVendorsBySubClassification = (subClassificationCode: string): VendorRecord[] => {
  return vendorDatabase.filter(vendor => {
    if (!vendor.isActive) return false;
    return vendor.capabilities.subClassifications.some(
      sc => sc.subClassificationCode === subClassificationCode
    );
  });
};

/**
 * Get vendors by multiple sub-classification codes (OR logic)
 */
export const getVendorsByMultipleSubClassifications = (subClassificationCodes: string[]): VendorRecord[] => {
  const uniqueVendors = new Map<string, VendorRecord>();
  
  subClassificationCodes.forEach(code => {
    const vendors = getVendorsBySubClassification(code);
    vendors.forEach(vendor => {
      if (!uniqueVendors.has(vendor.id)) {
        uniqueVendors.set(vendor.id, vendor);
      }
    });
  });
  
  return Array.from(uniqueVendors.values()).sort((a, b) => 
    (b.rating || 0) - (a.rating || 0)
  );
};

/**
 * Get vendors by KBLI code
 */
export const getVendorsByKBLI = (kbliCode: string): VendorRecord[] => {
  return vendorDatabase.filter(vendor => {
    if (!vendor.isActive) return false;
    return vendor.capabilities.kbliCodes.some(
      kbli => kbli.code === kbliCode
    );
  });
};

/**
 * Get vendors by brand
 */
export const getVendorsByBrand = (brandName: string): VendorRecord[] => {
  return vendorDatabase.filter(vendor => {
    if (!vendor.isActive) return false;
    return vendor.capabilities.brands.some(
      brand => brand.toLowerCase() === brandName.toLowerCase()
    );
  });
};

/**
 * SMART VENDOR RECOMMENDATION
 * Main function to recommend vendors based on proposal criteria
 * Uses weighted scoring system
 */
export interface VendorRecommendationCriteria {
  subClassificationCode?: string;
  kbliCode?: string;
  brand?: string;
}

export interface VendorRecommendationResult {
  vendor: VendorRecord;
  score: number;
  matchedCriteria: {
    subClassification: boolean;
    kbli: boolean;
    brand: boolean;
  };
  matchCount: number;
}

export const getRecommendedVendors = (
  criteria: VendorRecommendationCriteria
): VendorRecommendationResult[] => {
  const results: VendorRecommendationResult[] = [];
  
  vendorDatabase.forEach(vendor => {
    if (!vendor.isActive) return;
    
    const matched = {
      subClassification: false,
      kbli: false,
      brand: false,
    };
    
    let score = 0;
    
    // Check sub-classification match (weight: 40)
    if (criteria.subClassificationCode) {
      const hasSubClass = vendor.capabilities.subClassifications.some(
        sc => sc.subClassificationCode === criteria.subClassificationCode
      );
      if (hasSubClass) {
        matched.subClassification = true;
        score += 40;
      }
    }
    
    // Check KBLI match (weight: 30)
    if (criteria.kbliCode) {
      const hasKBLI = vendor.capabilities.kbliCodes.some(
        kbli => kbli.code === criteria.kbliCode
      );
      if (hasKBLI) {
        matched.kbli = true;
        score += 30;
      }
    }
    
    // Check brand match (weight: 30)
    if (criteria.brand) {
      const hasBrand = vendor.capabilities.brands.some(
        brand => brand.toLowerCase() === criteria.brand!.toLowerCase()
      );
      if (hasBrand) {
        matched.brand = true;
        score += 30;
      }
    }
    
    // Only include vendors with at least one match
    const matchCount = Object.values(matched).filter(Boolean).length;
    if (matchCount > 0) {
      // Add bonus for preferred vendors
      if (vendor.isPreferred) {
        score += 10;
      }
      
      // Add bonus based on rating
      if (vendor.rating) {
        score += vendor.rating * 2; // Max +10 points
      }
      
      results.push({
        vendor,
        score,
        matchedCriteria: matched,
        matchCount,
      });
    }
  });
  
  // Sort by score (descending), then by rating
  return results.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    return (b.vendor.rating || 0) - (a.vendor.rating || 0);
  });
};

/**
 * Search vendors by text
 */
export const searchVendors = (searchTerm: string): VendorRecord[] => {
  const term = searchTerm.toLowerCase();
  return vendorDatabase.filter(vendor => 
    vendor.isActive && (
      vendor.vendorName.toLowerCase().includes(term) ||
      vendor.vendorCode.toLowerCase().includes(term) ||
      vendor.contactPerson?.toLowerCase().includes(term) ||
      vendor.email?.toLowerCase().includes(term) ||
      vendor.capabilities.subClassifications.some(sc => 
        sc.subClassificationName.toLowerCase().includes(term) ||
        sc.classificationName.toLowerCase().includes(term) ||
        sc.categoryName.toLowerCase().includes(term)
      ) ||
      vendor.capabilities.kbliCodes.some(kbli =>
        kbli.code.includes(term) ||
        kbli.description.toLowerCase().includes(term)
      ) ||
      vendor.capabilities.brands.some(brand =>
        brand.toLowerCase().includes(term)
      )
    )
  );
};

/**
 * Get all active vendors
 */
export const getAllActiveVendors = (): VendorRecord[] => {
  return vendorDatabase.filter(vendor => vendor.isActive)
    .sort((a, b) => (b.rating || 0) - (a.rating || 0));
};

/**
 * Get preferred vendors only
 */
export const getPreferredVendors = (): VendorRecord[] => {
  return vendorDatabase.filter(vendor => vendor.isActive && vendor.isPreferred)
    .sort((a, b) => (b.rating || 0) - (a.rating || 0));
};

/**
 * Add new vendor
 */
export const addVendorRecord = (
  vendor: Omit<VendorRecord, 'id' | 'createdDate' | 'updatedDate'>
): VendorRecord => {
  const newVendor: VendorRecord = {
    ...vendor,
    id: `VDB-${String(vendorDatabase.length + 1).padStart(3, '0')}`,
    createdDate: new Date().toISOString().split('T')[0],
    updatedDate: new Date().toISOString().split('T')[0],
  };
  vendorDatabase.push(newVendor);
  return newVendor;
};

/**
 * Update vendor
 */
export const updateVendorRecord = (
  id: string,
  updates: Partial<VendorRecord>
): VendorRecord | null => {
  const index = vendorDatabase.findIndex(v => v.id === id);
  if (index === -1) return null;
  
  vendorDatabase[index] = {
    ...vendorDatabase[index],
    ...updates,
    updatedDate: new Date().toISOString().split('T')[0],
  };
  
  return vendorDatabase[index];
};

/**
 * Delete vendor (soft delete - set isActive to false)
 */
export const deleteVendorRecord = (id: string): boolean => {
  const vendor = vendorDatabase.find(v => v.id === id);
  if (!vendor) return false;
  
  vendor.isActive = false;
  vendor.updatedDate = new Date().toISOString().split('T')[0];
  return true;
};

/**
 * Get vendor statistics
 */
export const getVendorStatistics = () => {
  const active = vendorDatabase.filter(v => v.isActive);
  const preferred = active.filter(v => v.isPreferred);
  
  return {
    total: vendorDatabase.length,
    active: active.length,
    inactive: vendorDatabase.length - active.length,
    preferred: preferred.length,
    averageRating: active.reduce((sum, v) => sum + (v.rating || 0), 0) / active.length,
  };
};
