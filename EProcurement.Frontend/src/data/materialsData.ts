import { Material } from '../types';
import { enhanceAllMaterials } from './materialsDataEnhancer';

// ✅ Materials Database - MULTI-JOBSITE (November 11, 2025)
// 59 base materials x 7 jobsites = 413 total materials

// Base materials template (59 items)
const baseMaterialsTemplate = [
  {
    material: '2115-10-37210',
    materialDescription: 'DISC',
    baseUnitOfMeasure: 'EA',
    extMaterialGroup: 'VOLVO',
    valuationClass: 'M001',
    materialGroup: '261120',
    materialGroupDescription: 'BATTERIES&GENERATORS&KINETIC POWER TRA&CLUTCH PARTS&ACC',
    subClassification: 'M.01.01-Battery / Accumulator',
    unique: 'Yes'
  },
  {
    material: '190-10-37210',
    materialDescription: 'DISC',
    baseUnitOfMeasure: 'EA',
    extMaterialGroup: 'KOMATSU',
    valuationClass: 'M001',
    materialGroup: '261120',
    materialGroupDescription: 'BATTERIES&GENERATORS&KINETIC POWER TRA&CLUTCH PARTS&ACC',
    subClassification: 'M.01.01-Battery / Accumulator',
    unique: 'Yes'
  },
  {
    material: '2024/064-5349',
    materialDescription: 'SPEEDI CLUTCH - 8C-S04',
    baseUnitOfMeasure: 'EA',
    extMaterialGroup: 'SKEENSIGH LORRY P',
    valuationClass: 'M001',
    materialGroup: '261119',
    materialGroupDescription: 'BATTERIES&GENERATORS&KINETIC POWER TRANSMISSION&CLUTCHES',
    subClassification: 'M.01.01-Battery / Accumulator',
    unique: 'No'
  },
  {
    material: '234-3942',
    materialDescription: 'SEAL, ORING',
    baseUnitOfMeasure: 'EA',
    extMaterialGroup: 'CATERPILLAR',
    valuationClass: 'M001',
    materialGroup: '2x1117',
    materialGroupDescription: 'SEALS AND GASKETS/SEALS/ORING & MECHANICAL & COMPOSITE OMINT',
    subClassification: 'M.01.01-Battery / Accumulator',
    unique: 'Yes'
  },
  {
    material: '247900-4882',
    materialDescription: 'MAGINED CLUTCH',
    baseUnitOfMeasure: 'EA',
    extMaterialGroup: 'DENSO',
    valuationClass: 'M001',
    materialGroup: '261119',
    materialGroupDescription: 'BATTERIES&GENERATORS&KINETIC POWER TRANSMISSION&CLUTCHES',
    subClassification: 'M.01.01-Battery / Accumulator',
    unique: 'No'
  },
  {
    material: '4221019',
    materialDescription: 'BUSHING',
    baseUnitOfMeasure: 'EA',
    extMaterialGroup: 'HITACHI',
    valuationClass: 'M001',
    materialGroup: '211745',
    materialGroupDescription: 'BEARINGS AND BUSHINGS AND WHEELS AND GEARS&BUSHINGS',
    subClassification: 'M.01.02-Bearing',
    unique: 'No'
  },
  {
    material: '1P4696',
    materialDescription: 'BEARING',
    baseUnitOfMeasure: 'EA',
    extMaterialGroup: 'CATERPILLAR',
    valuationClass: 'M001',
    materialGroup: '311715',
    materialGroupDescription: 'BEARINGS AND BUSHINGS AND WHEELS AND GEARS&BEARINGS',
    subClassification: 'M.01.02-Bearing',
    unique: 'Yes'
  },
  {
    material: '234-13-12451',
    materialDescription: 'GEAR',
    baseUnitOfMeasure: 'EA',
    extMaterialGroup: 'KOMATSU',
    valuationClass: 'M001',
    materialGroup: '311717',
    materialGroupDescription: 'BEARINGS AND BUSHINGS AND WHEELS AND GEARS&GEARS',
    subClassification: 'M.01.02-Bearing',
    unique: 'Yes'
  },
  {
    material: '255-0768',
    materialDescription: 'GEAR',
    baseUnitOfMeasure: 'EA',
    extMaterialGroup: 'CATERPILLAR',
    valuationClass: 'M001',
    materialGroup: '311717',
    materialGroupDescription: 'BEARINGS AND BUSHINGS AND WHEELS AND GEARS&GEARS',
    subClassification: 'M.01.02-Bearing',
    unique: 'Yes'
  },
  {
    material: '430-9444',
    materialDescription: 'BEARING KIT',
    baseUnitOfMeasure: 'EA',
    extMaterialGroup: 'CATERPILLAR',
    valuationClass: 'M001',
    materialGroup: '311715',
    materialGroupDescription: 'BEARINGS AND BUSHINGS AND WHEELS AND GEARS&BEARINGS',
    subClassification: 'M.01.02-Bearing',
    unique: 'Yes'
  },
  {
    material: '8-98303024',
    materialDescription: 'BEARING',
    baseUnitOfMeasure: 'EA',
    extMaterialGroup: 'CATERPILLAR',
    valuationClass: 'M001',
    materialGroup: '21x715',
    materialGroupDescription: 'BEARINGS AND BUSHINGS AND WHEELS AND GEARS&BEARINGS',
    subClassification: 'M.01.02-Bearing',
    unique: 'Yes'
  },
  {
    material: '21N1237',
    materialDescription: 'FAN RING',
    baseUnitOfMeasure: 'EA',
    extMaterialGroup: 'VOLVO',
    valuationClass: 'M001',
    materialGroup: '221710',
    materialGroupDescription: 'TRANSPORTATION COMPONENTS AND SYSTEMS&ENGINE COOLANT SYSTEM',
    subClassification: 'M.01.03-Component and Sub Component',
    unique: 'Yes'
  },
  {
    material: '122-4409',
    materialDescription: 'RADIATOR',
    baseUnitOfMeasure: 'EA',
    extMaterialGroup: 'CATERPILLAR',
    valuationClass: 'M001',
    materialGroup: '221617',
    materialGroupDescription: 'HEAVY CONSTRUCTION MACHINERY AND EQUIPMENT EQ COMPONENTS',
    subClassification: 'M.01.03-Component and Sub Component',
    unique: 'Yes'
  },
  {
    material: '14Y-911-3120',
    materialDescription: 'MOTOR',
    baseUnitOfMeasure: 'EA',
    extMaterialGroup: 'KOMATSU',
    valuationClass: 'M001',
    materialGroup: '261014',
    materialGroupDescription: 'POWER SOURCES&MOTOR OR GENERATOR COMPONENTS',
    subClassification: 'M.01.03-Component and Sub Component',
    unique: 'Yes'
  },
  {
    material: '201-62-55043',
    materialDescription: 'JOINT',
    baseUnitOfMeasure: 'EA',
    extMaterialGroup: 'KOMATSU',
    valuationClass: 'M001',
    materialGroup: '261017',
    materialGroupDescription: 'POWER SOURCES&ENGINE COMPONENTS AND ACCESSORIES',
    subClassification: 'M.01.03-Component and Sub Component',
    unique: 'Yes'
  },
  {
    material: '2642172',
    materialDescription: 'WIRE AS',
    baseUnitOfMeasure: 'EA',
    extMaterialGroup: 'CATERPILLAR',
    valuationClass: 'M001',
    materialGroup: '261215',
    materialGroupDescription: 'ELECTRICAL WIRE AND CABLE AND HARNESS&ELECTRICAL WIRE',
    subClassification: 'M.01.04-Electrical',
    unique: 'Yes'
  },
  {
    material: '4688376',
    materialDescription: 'WIRE HARNESS',
    baseUnitOfMeasure: 'EA',
    extMaterialGroup: 'NOT IN LIST',
    valuationClass: 'M001',
    materialGroup: '261217',
    materialGroupDescription: 'ELECTRICAL WIRE AND CABLE AND HARNESS&WIRE HARNESS',
    subClassification: 'M.01.04-Electrical',
    unique: 'No'
  },
  {
    material: '7-08252',
    materialDescription: 'ALTERNATOR',
    baseUnitOfMeasure: 'EA',
    extMaterialGroup: 'CATERPILLAR',
    valuationClass: 'M001',
    materialGroup: 'S91222',
    materialGroupDescription: 'ELECTRICAL EQ AND CMPNT AND SUPPL&ELECTRICAL SWITCHES AND ACC',
    subClassification: 'M.01.04-Electrical',
    unique: 'Yes'
  },
  {
    material: '129-2975',
    materialDescription: 'SWITCH',
    baseUnitOfMeasure: 'EA',
    extMaterialGroup: 'CATERPILLAR',
    valuationClass: 'M001',
    materialGroup: 'S91222',
    materialGroupDescription: 'ELECTRICAL EQ AND CMPNT AND SUPPL&ELECTRICAL SWITCHES AND ACC',
    subClassification: 'M.01.04-Electrical',
    unique: 'Yes'
  },
  {
    material: '149-0590',
    materialDescription: 'RELAY',
    baseUnitOfMeasure: 'EA',
    extMaterialGroup: 'CATERPILLAR',
    valuationClass: 'M001',
    materialGroup: '291223',
    materialGroupDescription: 'ELECTRICAL EQ AND CMPNT AND SUPPL&ELECTRICAL RELAYS AND ACC',
    subClassification: 'M.01.04-Electrical',
    unique: 'Yes'
  },
  {
    material: '093-1571',
    materialDescription: 'SNAP RING',
    baseUnitOfMeasure: 'EA',
    extMaterialGroup: 'CATERPILLAR',
    valuationClass: 'M001',
    materialGroup: '311624',
    materialGroupDescription: 'HARDWARE&MISCELLANEOUS FASTENERS',
    subClassification: 'M.01.05-Fastener',
    unique: 'Yes'
  },
  {
    material: '8104352100',
    materialDescription: 'INJNOZ/E',
    baseUnitOfMeasure: 'EA',
    extMaterialGroup: 'KOMATSU',
    valuationClass: 'M001',
    materialGroup: '311624',
    materialGroupDescription: 'HARDWARE&MISCELLANEOUS FASTENERS',
    subClassification: 'M.01.05-Fastener',
    unique: 'Yes'
  },
  {
    material: '100-5471',
    materialDescription: 'CLEVIS',
    baseUnitOfMeasure: 'EA',
    extMaterialGroup: 'CATERPILLAR',
    valuationClass: 'M001',
    materialGroup: '311624',
    materialGroupDescription: 'HARDWARE&MISCELLANEOUS FASTENERS',
    subClassification: 'M.01.05-Fastener',
    unique: 'Yes'
  },
  {
    material: '144-8035',
    materialDescription: 'NUT',
    baseUnitOfMeasure: 'EA',
    extMaterialGroup: 'CATERPILLAR',
    valuationClass: 'M001',
    materialGroup: '311624',
    materialGroupDescription: 'HARDWARE&MISCELLANEOUS FASTENERS',
    subClassification: 'M.01.05-Fastener',
    unique: 'Yes'
  },
  {
    material: '190-3027',
    materialDescription: 'BACK UP RING',
    baseUnitOfMeasure: 'EA',
    extMaterialGroup: 'CATERPILLAR',
    valuationClass: 'M001',
    materialGroup: '311624',
    materialGroupDescription: 'HARDWARE&MISCELLANEOUS FASTENERS',
    subClassification: 'M.01.05-Fastener',
    unique: 'Yes'
  },
  {
    material: '2134303',
    materialDescription: 'IN LINE FILTER',
    baseUnitOfMeasure: 'EA',
    extMaterialGroup: 'PERKINS',
    valuationClass: 'M001',
    materialGroup: '401615',
    materialGroupDescription: 'INDUSTRIAL FILTERING AND PURIFICATION/FILTERS',
    subClassification: 'M.01.06-Filter',
    unique: 'No'
  },
  {
    material: '2520403',
    materialDescription: 'OIL FILTER, LF701, TW2527',
    baseUnitOfMeasure: 'EA',
    extMaterialGroup: 'PERKINS',
    valuationClass: 'M001',
    materialGroup: '401615',
    materialGroupDescription: 'INDUSTRIAL FILTERING AND PURIFICATION/FILTERS',
    subClassification: 'M.01.06-Filter',
    unique: 'No'
  },
  {
    material: '2392340',
    materialDescription: 'AIR FILTER (LRS01340)',
    baseUnitOfMeasure: 'EA',
    extMaterialGroup: 'CATERPILLAR',
    valuationClass: 'M001',
    materialGroup: '401615',
    materialGroupDescription: 'INDUSTRIAL FILTERING AND PURIFICATION/FILTERS',
    subClassification: 'M.01.06-Filter',
    unique: 'Yes'
  },
  {
    material: '2392341',
    materialDescription: 'AIR FILTER OUTER 6I-2502 K11-82230',
    baseUnitOfMeasure: 'EA',
    extMaterialGroup: 'CATERPILLAR',
    valuationClass: 'M001',
    materialGroup: '401615',
    materialGroupDescription: 'INDUSTRIAL FILTERING AND PURIFICATION/FILTERS',
    subClassification: 'M.01.06-Filter',
    unique: 'Yes'
  },
  {
    material: '205-7632',
    materialDescription: 'PLATE',
    baseUnitOfMeasure: 'EA',
    extMaterialGroup: 'CATERPILLAR',
    valuationClass: 'M001',
    materialGroup: '511612',
    materialGroupDescription: 'FABRICATED PLATE ASSEMBLIES/BOLTED PLATE ASSEMBLIES',
    subClassification: 'M.01.07-Friction Part (Disc, Plate Etc)',
    unique: 'Yes'
  },
  {
    material: '212-6227',
    materialDescription: 'PLATE',
    baseUnitOfMeasure: 'EA',
    extMaterialGroup: 'CATERPILLAR',
    valuationClass: 'M001',
    materialGroup: '511612',
    materialGroupDescription: 'FABRICATED PLATE ASSEMBLIES/BOLTED PLATE ASSEMBLIES',
    subClassification: 'M.01.07-Friction Part (Disc, Plate Etc)',
    unique: 'Yes'
  },
  {
    material: '319-0815',
    materialDescription: 'PLATE',
    baseUnitOfMeasure: 'EA',
    extMaterialGroup: 'CATERPILLAR',
    valuationClass: 'M001',
    materialGroup: '511612',
    materialGroupDescription: 'FABRICATED PLATE ASSEMBLIES/BOLTED PLATE ASSEMBLIES',
    subClassification: 'M.01.07-Friction Part (Disc, Plate Etc)',
    unique: 'Yes'
  },
  {
    material: '363-7692',
    materialDescription: 'PLATE',
    baseUnitOfMeasure: 'EA',
    extMaterialGroup: 'CATERPILLAR',
    valuationClass: 'M001',
    materialGroup: '511612',
    materialGroupDescription: 'FABRICATED PLATE ASSEMBLIES/BOLTED PLATE ASSEMBLIES',
    subClassification: 'M.01.07-Friction Part (Disc, Plate Etc)',
    unique: 'Yes'
  },
  {
    material: '499-9060',
    materialDescription: 'PLATE',
    baseUnitOfMeasure: 'EA',
    extMaterialGroup: 'CATERPILLAR',
    valuationClass: 'M001',
    materialGroup: '511612',
    materialGroupDescription: 'FABRICATED PLATE ASSEMBLIES/BOLTED PLATE ASSEMBLIES',
    subClassification: 'M.01.07-Friction Part (Disc, Plate Etc)',
    unique: 'Yes'
  },
  {
    material: '3149979',
    materialDescription: 'ADAPTOR',
    baseUnitOfMeasure: 'EA',
    extMaterialGroup: 'CATERPILLAR',
    valuationClass: 'M001',
    materialGroup: '411054',
    materialGroupDescription: 'LAB AND SCIENTIFIC EQUIP/SCIENTIFIC APPARATUS',
    subClassification: 'M.01.08-Hose',
    unique: 'Yes'
  },
  {
    material: '9049961',
    materialDescription: 'CAP',
    baseUnitOfMeasure: 'EA',
    extMaterialGroup: 'CATERPILLAR',
    valuationClass: 'M001',
    materialGroup: '261617',
    materialGroupDescription: 'PIPE PIPING AND LINE FITTINGS/PIPE CONNECTORS',
    subClassification: 'M.01.08-Hose',
    unique: 'Yes'
  },
  {
    material: '5088104',
    materialDescription: 'NUT',
    baseUnitOfMeasure: 'EA',
    extMaterialGroup: 'PATRIA',
    valuationClass: 'M001',
    materialGroup: '511617',
    materialGroupDescription: 'HARDWARE/NUTS',
    subClassification: 'M.01.08-Hose',
    unique: 'No'
  },
  {
    material: '96993000',
    materialDescription: 'BEARING BC9000',
    baseUnitOfMeasure: 'EA',
    extMaterialGroup: 'DEMAG',
    valuationClass: 'M001',
    materialGroup: '211721',
    materialGroupDescription: 'TRANSPORT COMPONENTS&SYSTEMS&SVCS&SECURITY SYSTEM&CMPNT',
    subClassification: 'M.01.08-Hose',
    unique: 'Yes'
  },
  {
    material: '111-6940',
    materialDescription: 'SPACER',
    baseUnitOfMeasure: 'EA',
    extMaterialGroup: 'CATERPILLAR',
    valuationClass: 'M001',
    materialGroup: '511618',
    materialGroupDescription: 'HARDWARE/WASHERS',
    subClassification: 'M.01.08-Hose',
    unique: 'Yes'
  },
  {
    material: '5031103022',
    materialDescription: 'RUBBER BUSHING',
    baseUnitOfMeasure: 'EA',
    extMaterialGroup: 'RENAULT',
    valuationClass: 'M001',
    materialGroup: '401723',
    materialGroupDescription: 'PIPE PIPING AND LINE FITTINGS/PIPE BUSHINGS',
    subClassification: 'M.01.09-Pin, Bushing',
    unique: 'Yes'
  },
  {
    material: '5010562453',
    materialDescription: 'RUBBER BUSHING',
    baseUnitOfMeasure: 'EA',
    extMaterialGroup: 'RENAULT',
    valuationClass: 'M001',
    materialGroup: '401723',
    materialGroupDescription: 'PIPE PIPING AND LINE FITTINGS/PIPE BUSHINGS',
    subClassification: 'M.01.09-Pin, Bushing',
    unique: 'Yes'
  },
  {
    material: '7401825919',
    materialDescription: 'RUBBER BUSHING',
    baseUnitOfMeasure: 'EA',
    extMaterialGroup: 'RENAULT',
    valuationClass: 'M001',
    materialGroup: '401723',
    materialGroupDescription: 'PIPE PIPING AND LINE FITTINGS/PIPE BUSHINGS',
    subClassification: 'M.01.09-Pin, Bushing',
    unique: 'Yes'
  },
  {
    material: '5010608086',
    materialDescription: 'RUBBER BUSHING, CRITICAL UNIT 1AVSO',
    baseUnitOfMeasure: 'EA',
    extMaterialGroup: 'RENAULT',
    valuationClass: 'M001',
    materialGroup: '401723',
    materialGroupDescription: 'PIPE PIPING AND LINE FITTINGS/PIPE BUSHINGS',
    subClassification: 'M.01.09-Pin, Bushing',
    unique: 'Yes'
  },
  {
    material: '7421916031',
    materialDescription: 'RUBBER BUSHING',
    baseUnitOfMeasure: 'EA',
    extMaterialGroup: 'RENAULT',
    valuationClass: 'M001',
    materialGroup: '401723',
    materialGroupDescription: 'PIPE PIPING AND LINE FITTINGS/PIPE BUSHINGS',
    subClassification: 'M.01.09-Pin, Bushing',
    unique: 'Yes'
  },
  {
    material: '514-35-11140',
    materialDescription: 'VALVE',
    baseUnitOfMeasure: 'EA',
    extMaterialGroup: 'KOMATSU',
    valuationClass: 'M001',
    materialGroup: '421416',
    materialGroupDescription: 'FLUID AND GAS DISTRIBUTION/VALVES',
    subClassification: 'M.01.10-Rubber Part',
    unique: 'Yes'
  },
  {
    material: '5050209CP10',
    materialDescription: 'HOSE ASSY',
    baseUnitOfMeasure: 'EA',
    extMaterialGroup: 'HYDRO POWER',
    valuationClass: 'M006',
    materialGroup: '401420',
    materialGroupDescription: 'FLUID AND GAS DISTRIBUTION/HOSES',
    subClassification: 'M.01.10-Rubber Part',
    unique: 'No'
  },
  {
    material: '8921464341',
    materialDescription: 'SPACER',
    baseUnitOfMeasure: 'EA',
    extMaterialGroup: 'IAWS',
    valuationClass: 'M001',
    materialGroup: '511618',
    materialGroupDescription: 'HARDWARE/WASHERS',
    subClassification: 'M.01.10-Rubber Part',
    unique: 'Yes'
  },
  {
    material: '614-35-11180',
    materialDescription: 'VALVE',
    baseUnitOfMeasure: 'EA',
    extMaterialGroup: 'KOMATSU',
    valuationClass: 'M001',
    materialGroup: '421416',
    materialGroupDescription: 'FLUID AND GAS DISTRIBUTION/VALVES',
    subClassification: 'M.01.10-Rubber Part',
    unique: 'Yes'
  },
  {
    material: '5030208001P',
    materialDescription: 'HOSE ASSY',
    baseUnitOfMeasure: 'EA',
    extMaterialGroup: 'HYDRO POWER',
    valuationClass: 'M006',
    materialGroup: '401420',
    materialGroupDescription: 'FLUID AND GAS DISTRIBUTION/HOSES',
    subClassification: 'M.01.10-Rubber Part',
    unique: 'No'
  },
  {
    material: '3631030CP10',
    materialDescription: 'HOSE ASSY',
    baseUnitOfMeasure: 'EA',
    extMaterialGroup: 'HYDRO POWER',
    valuationClass: 'M006',
    materialGroup: '401420',
    materialGroupDescription: 'FLUID AND GAS DISTRIBUTION/HOSES',
    subClassification: 'M.01.10-Rubber Part',
    unique: 'No'
  },
  {
    material: '22V.15.16270',
    materialDescription: 'HOLDER',
    baseUnitOfMeasure: 'EA',
    extMaterialGroup: 'KOMATSU',
    valuationClass: 'M006',
    materialGroup: '251421',
    materialGroupDescription: 'METAL CUTTING MACHINE TOOL/METAL CUTTING MACHINE ATTACHMENTS',
    subClassification: 'M.01.12-Spring',
    unique: 'Yes'
  },
  {
    material: '7X-0590',
    materialDescription: 'BOLT',
    baseUnitOfMeasure: 'EA',
    extMaterialGroup: 'CATERPILLAR',
    valuationClass: 'M001',
    materialGroup: '511616',
    materialGroupDescription: 'HARDWARE/BOLTS',
    subClassification: 'M.01.12-Spring',
    unique: 'Yes'
  },
  {
    material: '(8-273)6-549-0',
    materialDescription: 'BEARING THRUSETF',
    baseUnitOfMeasure: 'EA',
    extMaterialGroup: 'PALFINGER',
    valuationClass: 'M001',
    materialGroup: '511616',
    materialGroupDescription: 'HARDWARE/BOLTS',
    subClassification: 'M.01.12-Spring',
    unique: 'Yes'
  },
  {
    material: '07095-01227P',
    materialDescription: 'HOSE ASSY',
    baseUnitOfMeasure: 'EA',
    extMaterialGroup: 'HYDRO POWER',
    valuationClass: 'M001',
    materialGroup: '401420',
    materialGroupDescription: 'FLUID AND GAS DISTRIBUTION/HOSES',
    subClassification: 'M.01.12-Spring',
    unique: 'No'
  },
  {
    material: '131-1374',
    materialDescription: 'SPACER',
    baseUnitOfMeasure: 'EA',
    extMaterialGroup: 'CATERPILLAR',
    valuationClass: 'M001',
    materialGroup: '511618',
    materialGroupDescription: 'HARDWARE/WASHERS',
    subClassification: 'M.01.13-V-Belt',
    unique: 'Yes'
  },
  {
    material: '53L-9425',
    materialDescription: 'WASHER',
    baseUnitOfMeasure: 'EA',
    extMaterialGroup: 'CATERPILLAR',
    valuationClass: 'M001',
    materialGroup: '511618',
    materialGroupDescription: 'HARDWARE/WASHERS',
    subClassification: 'M.01.13-V-Belt',
    unique: 'Yes'
  },
  {
    material: '053-1571',
    materialDescription: 'RETAINER',
    baseUnitOfMeasure: 'EA',
    extMaterialGroup: 'CATERPILLAR',
    valuationClass: 'M001',
    materialGroup: '214114',
    materialGroupDescription: 'BEARINGS&BUSHINGS&WHEEL&GEARS&BUSHES AND LINERS AND ADAPTORS',
    subClassification: 'M.01.13-V-Belt',
    unique: 'Yes'
  }
];

// Jobsite configurations for duplication
const jobsiteConfigs = [
  { jobsite: 'NARO', plant: '4090' },
  { jobsite: 'ADMO MINING', plant: '40AB' },
  { jobsite: 'ADMO HAULING', plant: '40AC' },
  { jobsite: 'SERA', plant: '40AD' },
  { jobsite: 'MACO MINING', plant: '40AI' },
  { jobsite: 'MACO HAULING', plant: '40AJ' },
  { jobsite: 'JAHO', plant: '40A0' }
];

// Generate all materials for all jobsites (413 total)
export const initialMaterials: Material[] = [];
let materialCounter = 1;

jobsiteConfigs.forEach(config => {
  baseMaterialsTemplate.forEach(template => {
    initialMaterials.push({
      id: `MAT-${String(materialCounter).padStart(3, '0')}`,
      ...template,
      jobsite: config.jobsite,
      plant: config.plant,
      createdDate: '2025-11-11'
    });
    materialCounter++;
  });
});

// ✅ LocalStorage key for materials persistence
const MATERIALS_STORAGE_KEY = 'eproposal_materials_data';

// ✅ Initialize materials from localStorage or use initial data
const initializeMaterials = (): Material[] => {
  try {
    const stored = localStorage.getItem(MATERIALS_STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      // Ensure it's an array
      if (Array.isArray(parsed) && parsed.length > 0) {
        console.log('✅ Materials loaded from localStorage:', parsed.length);
        
        // ✅ CHECK: Do materials need Annual Purchase Plan enhancement?
        const needsEnhancement = parsed.some(m => 
          m.qty === undefined || m.estimatedPrice === undefined
        );
        
        if (needsEnhancement) {
          console.log('🔧 Enhancing materials with Annual Purchase Plan data...');
          const enhanced = enhanceAllMaterials(parsed);
          saveMaterialsToStorage(enhanced);
          console.log('✅ All materials enhanced with APP data!');
          return enhanced;
        }
        
        return parsed;
      }
    }
  } catch (error) {
    console.error('❌ Error loading materials from localStorage:', error);
  }
  
  // Use initial data if localStorage is empty or invalid
  console.log('📦 Using initial materials data:', initialMaterials.length);
  console.log('🔧 Enhancing initial materials with APP data...');
  const enhanced = enhanceAllMaterials(initialMaterials);
  saveMaterialsToStorage(enhanced);
  console.log('✅ Initial materials enhanced and saved!');
  return enhanced;
};

// ✅ Save materials to localStorage
const saveMaterialsToStorage = (materialsData: Material[]): void => {
  try {
    localStorage.setItem(MATERIALS_STORAGE_KEY, JSON.stringify(materialsData));
    console.log('💾 Materials saved to localStorage:', materialsData.length);
  } catch (error) {
    console.error('❌ Error saving materials to localStorage:', error);
  }
};

// Helper functions for materials management
let materials = initializeMaterials();

// ✅ CRITICAL: Reload materials from localStorage to ensure sync
const reloadMaterialsFromStorage = (): void => {
  try {
    const stored = localStorage.getItem(MATERIALS_STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed)) {
        materials = parsed;
      }
    }
  } catch (error) {
    console.error('❌ Error reloading materials from localStorage:', error);
  }
};

export const getMaterials = (): Material[] => {
  // ✅ Always reload from localStorage to get latest data
  reloadMaterialsFromStorage();
  return [...materials];
};

export const getMaterialById = (id: string): Material | undefined => {
  reloadMaterialsFromStorage(); // ✅ Reload before query
  return materials.find(m => m.id === id);
};

// ✅ NEW: Check if Material + Plant combination already exists
export const checkDuplicateMaterialPlant = (material: string, plant: string, excludeId?: string): boolean => {
  reloadMaterialsFromStorage(); // ✅ Reload before check
  return materials.some(m => 
    m.material === material && 
    m.plant === plant && 
    m.id !== excludeId
  );
};

export const addMaterial = (material: Omit<Material, 'id' | 'createdDate'>): Material => {
  reloadMaterialsFromStorage(); // ✅ Reload to get latest count for ID generation
  const newMaterial: Material = {
    ...material,
    id: `MAT-${String(materials.length + 1).padStart(3, '0')}`,
    createdDate: new Date().toISOString().split('T')[0]
  };
  materials.push(newMaterial);
  saveMaterialsToStorage(materials); // ✅ Persist to localStorage
  return newMaterial;
};

export const updateMaterial = (id: string, updates: Partial<Material>): Material | null => {
  reloadMaterialsFromStorage(); // ✅ Reload before update
  const index = materials.findIndex(m => m.id === id);
  if (index === -1) return null;
  
  materials[index] = {
    ...materials[index],
    ...updates,
    id: materials[index].id, // Preserve ID
    createdDate: materials[index].createdDate, // Preserve creation date
    updatedDate: new Date().toISOString().split('T')[0]
  };
  saveMaterialsToStorage(materials); // ✅ Persist to localStorage
  return materials[index];
};

export const deleteMaterial = (id: string): boolean => {
  reloadMaterialsFromStorage(); // ✅ Reload before delete
  const index = materials.findIndex(m => m.id === id);
  if (index === -1) return false;
  materials.splice(index, 1);
  saveMaterialsToStorage(materials); // ✅ Persist to localStorage
  return true;
};

export const searchMaterials = (searchTerm: string): Material[] => {
  reloadMaterialsFromStorage(); // ✅ Reload before search
  const term = searchTerm.toLowerCase();
  return materials.filter(m =>
    m.material.toLowerCase().includes(term) ||
    m.materialDescription.toLowerCase().includes(term) ||
    m.extMaterialGroup.toLowerCase().includes(term) ||
    (m.jobsite && m.jobsite.toLowerCase().includes(term)) ||
    (m.company && m.company.toLowerCase().includes(term)) || // Backward compatibility
    m.plant.toLowerCase().includes(term)
  );
};

export const bulkAddMaterials = (newMaterials: Omit<Material, 'id' | 'createdDate'>[]): Material[] => {
  reloadMaterialsFromStorage(); // ✅ Reload to get latest count for ID generation
  const addedMaterials: Material[] = [];
  
  newMaterials.forEach((mat, index) => {
    const newMaterial: Material = {
      ...mat,
      id: `MAT-${String(materials.length + index + 1).padStart(3, '0')}`,
      createdDate: new Date().toISOString().split('T')[0]
    };
    addedMaterials.push(newMaterial);
  });
  
  materials.push(...addedMaterials);
  saveMaterialsToStorage(materials); // ✅ Persist to localStorage
  console.log(`✅ Bulk added ${addedMaterials.length} materials to system`);
  return addedMaterials;
};

// Validate CSV/Excel upload data
export const validateMaterialData = (data: any[]): { valid: boolean; errors: string[] } => {
  reloadMaterialsFromStorage(); // ✅ Reload before validation to check against latest data
  const errors: string[] = [];
  const requiredFields = ['material', 'materialDescription', 'baseUnitOfMeasure', 'extMaterialGroup', 'valuationClass', 'materialGroup', 'materialGroupDescription', 'subClassification', 'jobsite', 'plant'];
  
  // Check if data is empty
  if (!data || data.length === 0) {
    errors.push('No data provided');
    return { valid: false, errors };
  }
  
  // Validate each row
  data.forEach((row, index) => {
    // Check required fields
    requiredFields.forEach(field => {
      if (!row[field] || String(row[field]).trim() === '') {
        errors.push(`Row ${index + 1}: Missing required field '${field}'`);
      }
    });
    
    // Check for duplicate Material + Plant combination
    if (row.material && row.plant) {
      const isDuplicate = checkDuplicateMaterialPlant(String(row.material).trim(), String(row.plant).trim());
      if (isDuplicate) {
        errors.push(`Row ${index + 1}: Material '${row.material}' already exists in Plant '${row.plant}'`);
      }
    }
  });
  
  return {
    valid: errors.length === 0,
    errors
  };
};
