// Category hierarchy based on the provided structure
export interface SubClassification {
  code: string;
  name: string;
}

export interface Classification {
  code: string;
  name: string;
  subClassifications: SubClassification[];
}

export interface Category {
  code: string;
  name: string;
  classifications: Classification[];
}

// Mutable array for dynamic management
let categoriesData: Category[] = [
  {
    code: 'M',
    name: 'M. Material - Goods',
    classifications: [
      {
        code: 'M.01',
        name: 'M.01 Spareparts',
        subClassifications: [
          { code: 'M.01.01', name: 'M.01.01-Battery / Accumulator' },
          { code: 'M.01.02', name: 'M.01.02-Bearing' },
          { code: 'M.01.03', name: 'M.01.03-Component and Sub Component' },
          { code: 'M.01.04', name: 'M.01.04-Electrical' },
          { code: 'M.01.05', name: 'M.01.05-Fastener' },
          { code: 'M.01.06', name: 'M.01.06-Filter' },
          { code: 'M.01.07', name: 'M.01.07 -Friction Part (Disc, Plate Etc)' },
          { code: 'M.01.08', name: 'M.01.08 -Hose' },
          { code: 'M.01.09', name: 'M.01.09 -Pin, Bushing' },
          { code: 'M.01.10', name: 'M.01.10 -Rubber Part' },
          { code: 'M.01.11', name: 'M.01.11 -Seal, O-Ring, Gasket' },
          { code: 'M.01.12', name: 'M.01.12 -Spring' },
          { code: 'M.01.13', name: 'M.01.13 -V-Belt' },
          { code: 'M.01.14', name: 'M.01.14 -Other Spareparts' },
        ]
      },
      {
        code: 'M.02',
        name: 'M.02 Accessories',
        subClassifications: [
          { code: 'M.02.01', name: 'M.02.01 Tire' },
          { code: 'M.02.02', name: 'M.02.02 Rim' },
          { code: 'M.02.03', name: 'M.02.03 Battery' },
          { code: 'M.02.04', name: 'M.02.04 Wiper' },
          { code: 'M.02.05', name: 'M.02.05 Mirror' },
          { code: 'M.02.06', name: 'M.02.06 Lamp' },
          { code: 'M.02.07', name: 'M.02.07 Horn' },
        ]
      },
      {
        code: 'M.03',
        name: 'M.03 Consumables',
        subClassifications: [
          { code: 'M.03.01', name: 'M.03.01 Oil & Grease' },
          { code: 'M.03.02', name: 'M.03.02 Fuel' },
          { code: 'M.03.03', name: 'M.03.03 Coolant' },
          { code: 'M.03.04', name: 'M.03.04 Chemical' },
          { code: 'M.03.05', name: 'M.03.05 Paint' },
          { code: 'M.03.06', name: 'M.03.06 Welding Material' },
          { code: 'M.03.07', name: 'M.03.07 Cutting Tool' },
          { code: 'M.03.08', name: 'M.03.08 Grinding Wheel' },
          { code: 'M.03.09', name: 'M.03.09 Sandpaper' },
        ]
      },
      {
        code: 'M.04',
        name: 'M.04 Raw Material',
        subClassifications: [
          { code: 'M.04.01', name: 'M.04.01 Steel Plate' },
          { code: 'M.04.02', name: 'M.04.02 Steel Bar' },
          { code: 'M.04.03', name: 'M.04.03 Steel Pipe' },
          { code: 'M.04.04', name: 'M.04.04 Steel Profile' },
          { code: 'M.04.05', name: 'M.04.05 Aluminum' },
          { code: 'M.04.06', name: 'M.04.06 Copper' },
          { code: 'M.04.07', name: 'M.04.07 Brass' },
        ]
      },
      {
        code: 'M.05',
        name: 'M.05 Tools',
        subClassifications: [
          { code: 'M.05.01', name: 'M.05.01 Hand Tools' },
          { code: 'M.05.02', name: 'M.05.02 Power Tools' },
          { code: 'M.05.03', name: 'M.05.03 Measuring Tools' },
          { code: 'M.05.04', name: 'M.05.04 Lifting Tools' },
          { code: 'M.05.05', name: 'M.05.05 Safety Tools' },
        ]
      },
      {
        code: 'M.06',
        name: 'M.06 Equipment',
        subClassifications: [
          { code: 'M.06.01', name: 'M.06.01 Heavy Equipment' },
          { code: 'M.06.02', name: 'M.06.02 Light Equipment' },
          { code: 'M.06.03', name: 'M.06.03 Office Equipment' },
          { code: 'M.06.04', name: 'M.06.04 IT Equipment' },
          { code: 'M.06.05', name: 'M.06.05 Safety Equipment' },
        ]
      },
      {
        code: 'M.07',
        name: 'M.07 PPE (Personal Protective Equipment)',
        subClassifications: [
          { code: 'M.07.01', name: 'M.07.01 Helmet' },
          { code: 'M.07.02', name: 'M.07.02 Safety Shoes' },
          { code: 'M.07.03', name: 'M.07.03 Safety Gloves' },
          { code: 'M.07.04', name: 'M.07.04 Safety Glasses' },
          { code: 'M.07.05', name: 'M.07.05 Mask' },
          { code: 'M.07.06', name: 'M.07.06 Ear Protection' },
          { code: 'M.07.07', name: 'M.07.07 Safety Vest' },
          { code: 'M.07.08', name: 'M.07.08 Safety Harness' },
        ]
      },
      {
        code: 'M.08',
        name: 'M.08 Stationery',
        subClassifications: [
          { code: 'M.08.01', name: 'M.08.01 Office Supplies' },
          { code: 'M.08.02', name: 'M.08.02 Computer Supplies' },
          { code: 'M.08.03', name: 'M.08.03 Printing Supplies' },
        ]
      },
      {
        code: 'M.09',
        name: 'M.09 Uniform',
        subClassifications: [
          { code: 'M.09.01', name: 'M.09.01 Work Uniform' },
          { code: 'M.09.02', name: 'M.09.02 Office Uniform' },
        ]
      },
      {
        code: 'M.10',
        name: 'M.10 Furniture',
        subClassifications: [
          { code: 'M.10.01', name: 'M.10.01 Office Furniture' },
          { code: 'M.10.02', name: 'M.10.02 Workshop Furniture' },
        ]
      },
    ]
  },
  {
    code: 'S',
    name: 'S. Service',
    classifications: [
      {
        code: 'S.01',
        name: 'S.01 Maintenance & Repair',
        subClassifications: [
          { code: 'S.01.01', name: 'S.01.01 Heavy Equipment Maintenance' },
          { code: 'S.01.02', name: 'S.01.02 Vehicle Maintenance' },
          { code: 'S.01.03', name: 'S.01.03 Building Maintenance' },
          { code: 'S.01.04', name: 'S.01.04 Equipment Calibration' },
          { code: 'S.01.05', name: 'S.01.05 IT Maintenance' },
        ]
      },
      {
        code: 'S.02',
        name: 'S.02 Transportation',
        subClassifications: [
          { code: 'S.02.01', name: 'S.02.01 Employee Transport' },
          { code: 'S.02.02', name: 'S.02.02 Material Transport' },
          { code: 'S.02.03', name: 'S.02.03 Equipment Transport' },
        ]
      },
      {
        code: 'S.03',
        name: 'S.03 Catering',
        subClassifications: [
          { code: 'S.03.01', name: 'S.03.01 Employee Catering' },
          { code: 'S.03.02', name: 'S.03.02 Meeting Catering' },
        ]
      },
      {
        code: 'S.04',
        name: 'S.04 Cleaning',
        subClassifications: [
          { code: 'S.04.01', name: 'S.04.01 Office Cleaning' },
          { code: 'S.04.02', name: 'S.04.02 Workshop Cleaning' },
          { code: 'S.04.03', name: 'S.04.03 Equipment Cleaning' },
        ]
      },
      {
        code: 'S.05',
        name: 'S.05 Security',
        subClassifications: [
          { code: 'S.05.01', name: 'S.05.01 Security Guard' },
          { code: 'S.05.02', name: 'S.05.02 Security System' },
        ]
      },
      {
        code: 'S.06',
        name: 'S.06 Consulting',
        subClassifications: [
          { code: 'S.06.01', name: 'S.06.01 Legal Consulting' },
          { code: 'S.06.02', name: 'S.06.02 Financial Consulting' },
          { code: 'S.06.03', name: 'S.06.03 IT Consulting' },
          { code: 'S.06.04', name: 'S.06.04 Management Consulting' },
        ]
      },
      {
        code: 'S.07',
        name: 'S.07 Training',
        subClassifications: [
          { code: 'S.07.01', name: 'S.07.01 Technical Training' },
          { code: 'S.07.02', name: 'S.07.02 Safety Training' },
          { code: 'S.07.03', name: 'S.07.03 Soft Skills Training' },
          { code: 'S.07.04', name: 'S.07.04 Certification Training' },
        ]
      },
      {
        code: 'S.08',
        name: 'S.08 Insurance',
        subClassifications: [
          { code: 'S.08.01', name: 'S.08.01 Vehicle Insurance' },
          { code: 'S.08.02', name: 'S.08.02 Equipment Insurance' },
          { code: 'S.08.03', name: 'S.08.03 Building Insurance' },
          { code: 'S.08.04', name: 'S.08.04 Health Insurance' },
        ]
      },
      {
        code: 'S.09',
        name: 'S.09 Utilities',
        subClassifications: [
          { code: 'S.09.01', name: 'S.09.01 Electricity' },
          { code: 'S.09.02', name: 'S.09.02 Water' },
          { code: 'S.09.03', name: 'S.09.03 Telephone' },
          { code: 'S.09.04', name: 'S.09.04 Internet' },
        ]
      },
      {
        code: 'S.10',
        name: 'S.10 Rental',
        subClassifications: [
          { code: 'S.10.01', name: 'S.10.01 Equipment Rental' },
          { code: 'S.10.02', name: 'S.10.02 Vehicle Rental' },
          { code: 'S.10.03', name: 'S.10.03 Building Rental' },
        ]
      },
    ]
  },
  {
    code: 'P',
    name: 'P. Project',
    classifications: [
      {
        code: 'P.01',
        name: 'P.01 Infrastructure Project',
        subClassifications: [
          { code: 'P.01.01', name: 'P.01.01 Mining Road Development' },
          { code: 'P.01.02', name: 'P.01.02 Haul Road Construction' },
          { code: 'P.01.03', name: 'P.01.03 Drainage System Project' },
          { code: 'P.01.04', name: 'P.01.04 Bridge & Culvert Project' },
          { code: 'P.01.05', name: 'P.01.05 Site Development' },
        ]
      },
      {
        code: 'P.02',
        name: 'P.02 Facility Project',
        subClassifications: [
          { code: 'P.02.01', name: 'P.02.01 Workshop Construction' },
          { code: 'P.02.02', name: 'P.02.02 Office Building Project' },
          { code: 'P.02.03', name: 'P.02.03 Storage Facility Project' },
          { code: 'P.02.04', name: 'P.02.04 Camp & Accommodation Project' },
          { code: 'P.02.05', name: 'P.02.05 Laboratory Facility' },
        ]
      },
      {
        code: 'P.03',
        name: 'P.03 Equipment Installation Project',
        subClassifications: [
          { code: 'P.03.01', name: 'P.03.01 Crushing Plant Installation' },
          { code: 'P.03.02', name: 'P.03.02 Power Generation Installation' },
          { code: 'P.03.03', name: 'P.03.03 Water Treatment Plant' },
          { code: 'P.03.04', name: 'P.03.04 Fuel Storage Installation' },
          { code: 'P.03.05', name: 'P.03.05 Material Handling System' },
        ]
      },
      {
        code: 'P.04',
        name: 'P.04 IT Implementation Project',
        subClassifications: [
          { code: 'P.04.01', name: 'P.04.01 ERP System Implementation' },
          { code: 'P.04.02', name: 'P.04.02 Network Infrastructure Project' },
          { code: 'P.04.03', name: 'P.04.03 CCTV & Security System Project' },
          { code: 'P.04.04', name: 'P.04.04 Communication System Project' },
          { code: 'P.04.05', name: 'P.04.05 Fleet Management System' },
        ]
      },
      {
        code: 'P.05',
        name: 'P.05 Environmental Project',
        subClassifications: [
          { code: 'P.05.01', name: 'P.05.01 Reclamation Project' },
          { code: 'P.05.02', name: 'P.05.02 Waste Management Project' },
          { code: 'P.05.03', name: 'P.05.03 Water Management Project' },
          { code: 'P.05.04', name: 'P.05.04 Air Quality Control Project' },
          { code: 'P.05.05', name: 'P.05.05 Environmental Monitoring System' },
        ]
      },
      {
        code: 'P.06',
        name: 'P.06 Safety & HSE Project',
        subClassifications: [
          { code: 'P.06.01', name: 'P.06.01 Safety System Installation' },
          { code: 'P.06.02', name: 'P.06.02 Fire Protection System' },
          { code: 'P.06.03', name: 'P.06.03 Emergency Response Facility' },
          { code: 'P.06.04', name: 'P.06.04 Occupational Health Center' },
        ]
      },
    ]
  },
];

// Export as a getter function to maintain compatibility
export const categoryHierarchy: Category[] = categoriesData;

// CRUD Functions for Categories
export function getAllCategories(): Category[] {
  return categoriesData;
}

export function getCategoryByCode(code: string): Category | undefined {
  return categoriesData.find(cat => cat.code === code);
}

export function createCategory(data: { code: string; name: string }): Category {
  const newCategory: Category = {
    code: data.code,
    name: data.name,
    classifications: [],
  };
  categoriesData.push(newCategory);
  return newCategory;
}

export function updateCategory(code: string, data: { code?: string; name?: string }): boolean {
  const category = getCategoryByCode(code);
  if (!category) return false;
  
  if (data.code) category.code = data.code;
  if (data.name) category.name = data.name;
  return true;
}

export function deleteCategory(code: string): boolean {
  const index = categoriesData.findIndex(cat => cat.code === code);
  if (index === -1) return false;
  
  categoriesData.splice(index, 1);
  return true;
}

// CRUD Functions for Classifications
export function getAllClassifications(categoryCode: string): Classification[] {
  const category = getCategoryByCode(categoryCode);
  return category ? category.classifications : [];
}

export function getClassificationByCode(categoryCode: string, classificationCode: string): Classification | undefined {
  const category = getCategoryByCode(categoryCode);
  if (!category) return undefined;
  return category.classifications.find(cls => cls.code === classificationCode);
}

// Helper function to get ALL sub-classifications across all categories
export function getAllSubClassificationsFlat(): SubClassification[] {
  const allSubClassifications: SubClassification[] = [];
  
  categoriesData.forEach(category => {
    category.classifications.forEach(classification => {
      classification.subClassifications.forEach(subClass => {
        allSubClassifications.push(subClass);
      });
    });
  });
  
  return allSubClassifications;
}

export function createClassification(categoryCode: string, data: { code: string; name: string }): Classification | null {
  const category = getCategoryByCode(categoryCode);
  if (!category) return null;
  
  const newClassification: Classification = {
    code: data.code,
    name: data.name,
    subClassifications: [],
  };
  category.classifications.push(newClassification);
  return newClassification;
}

export function updateClassification(
  categoryCode: string,
  classificationCode: string,
  data: { code?: string; name?: string }
): boolean {
  const classification = getClassificationByCode(categoryCode, classificationCode);
  if (!classification) return false;
  
  if (data.code) classification.code = data.code;
  if (data.name) classification.name = data.name;
  return true;
}

export function deleteClassification(categoryCode: string, classificationCode: string): boolean {
  const category = getCategoryByCode(categoryCode);
  if (!category) return false;
  
  const index = category.classifications.findIndex(cls => cls.code === classificationCode);
  if (index === -1) return false;
  
  category.classifications.splice(index, 1);
  return true;
}

// CRUD Functions for SubClassifications
export function getAllSubClassifications(categoryCode: string, classificationCode: string): SubClassification[] {
  const classification = getClassificationByCode(categoryCode, classificationCode);
  return classification ? classification.subClassifications : [];
}

export function getSubClassificationByCode(
  categoryCode: string,
  classificationCode: string,
  subClassificationCode: string
): SubClassification | undefined {
  const classification = getClassificationByCode(categoryCode, classificationCode);
  if (!classification) return undefined;
  return classification.subClassifications.find(sub => sub.code === subClassificationCode);
}

export function createSubClassification(
  categoryCode: string,
  classificationCode: string,
  data: { code: string; name: string }
): SubClassification | null {
  const classification = getClassificationByCode(categoryCode, classificationCode);
  if (!classification) return null;
  
  const newSubClassification: SubClassification = {
    code: data.code,
    name: data.name,
  };
  classification.subClassifications.push(newSubClassification);
  return newSubClassification;
}

export function updateSubClassification(
  categoryCode: string,
  classificationCode: string,
  subClassificationCode: string,
  data: { code?: string; name?: string }
): boolean {
  const subClassification = getSubClassificationByCode(categoryCode, classificationCode, subClassificationCode);
  if (!subClassification) return false;
  
  if (data.code) subClassification.code = data.code;
  if (data.name) subClassification.name = data.name;
  return true;
}

export function deleteSubClassification(
  categoryCode: string,
  classificationCode: string,
  subClassificationCode: string
): boolean {
  const classification = getClassificationByCode(categoryCode, classificationCode);
  if (!classification) return false;
  
  const index = classification.subClassifications.findIndex(sub => sub.code === subClassificationCode);
  if (index === -1) return false;
  
  classification.subClassifications.splice(index, 1);
  return true;
}

// Work location options (synced with systemReferenceData)
export const workLocations = [
  'PT Saptaindra Sejati Head Office',
  'Rebuild Center Narogong',
  'Franco Jobsite',
  'Loco Jakarta',
  'Loco Banjarmasin',
  'Loco Balikpapan',
  'Ex-Workshop Vendor',
  'Custom Location',
];
