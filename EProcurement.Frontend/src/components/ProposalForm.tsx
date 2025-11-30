import { useState, useEffect, useMemo } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Checkbox } from './ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { User, Proposal, Jobsite, Department, Material, BudgetItem } from '../types';
import { toast } from 'sonner';
import { Upload, X, FileText, Eye, Info, FileSpreadsheet, Download, AlertCircle, CheckCircle2, Save } from 'lucide-react';
import { categoryHierarchy, workLocations, Category, Classification, SubClassification } from '../data/categoryHierarchy';
import { generateProposalNumber, isProposalNumberUnique } from '../utils/proposalNumber';
import { getMatrixBySubClassification, populateTORItemsWithDefaults, populateTERItemsWithDefaults } from '../data/torterMatrix';
import { 
  getActiveJobsites, 
  getActiveDepartments, 
  getActiveWorkLocations,
  getActiveContractTypes,
  getActiveContractualTypes,
  getActiveExternalBrands,
  getActiveKBLICodes,
  getKBLIDisplay
} from '../data/systemReferenceData';
import { getActiveTORDefinitions, getActiveTERDefinitions, TORItemDefinition } from '../data/torterItemDefinitions';
import { Badge } from './ui/badge';
import { getActiveMatrixConditions, MatrixContractCondition } from '../data/matrixContractConditions';
import { formatNumberWithSeparator, parseFormattedNumber } from '../utils/formatters';
import { getAllowedDepartments, getAllowedJobsites } from '../utils/roleHelper';
import { getMaterials } from '../data/materialsData';
import { getAvailableMaterialsForProposal, getAvailableMaterialsForNonBudget } from '../utils/materialHelper';
import { BudgetItemSelection } from './BudgetItemSelection';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { 
  getRelevantKBLICodes, 
  getRelevantBrands,
  getRecommendedVendors
} from '../utils/vendorRecommendation';

interface ProposalFormProps {
  user: User;
  proposal?: Proposal | null;
  onClose: () => void;
  onSave?: (proposalData: any, isDraft: boolean) => void;
  existingProposals?: Proposal[];
}

interface TORItem {
  id: string;
  label: string;
  enabled: boolean;
  parameter: string;
  requirement: string;
  description: string;
  remarks: string;
  placeholderParameter?: string;
  placeholderRequirement?: string;
  placeholderDescription?: string;
}

interface TERItem {
  id: string;
  label: string;
  enabled: boolean;
  parameter: string;
  requirement: string;
  description: string;
  remarks: string;
  uploadedFile?: File | null;
  placeholderParameter?: string;
  placeholderRequirement?: string;
  placeholderDescription?: string;
}

export function ProposalForm({ user, proposal, onClose, onSave, existingProposals }: ProposalFormProps) {
  const handleAutoSelect = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setTimeout(() => {
      e.target.select();
      const length = e.target.value.length;
      e.target.setSelectionRange(0, length);
    }, 0);
  };
  
  // Reference Data
  const allJobsites = getActiveJobsites() as Jobsite[];
  const allDepartments = getActiveDepartments() as Department[];
  const jobsites = getAllowedJobsites(user.roleName, allJobsites);
  const departments = getAllowedDepartments(user.roleName, allDepartments);
  const workLocationOptions = getActiveWorkLocations();
  const contractTypeOptions = getActiveContractTypes();
  const contractualTypeOptions = getActiveContractualTypes();

  // Basic Information State
  const [proposalNo, setProposalNo] = useState(proposal?.proposalNo || '');
  const [createdDate, setCreatedDate] = useState(
    proposal ? new Date(proposal.createdDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]
  );
  // Handle Object or String for Jobsite/Dept
  const [jobsite, setJobsite] = useState<Jobsite | ''>(
     (proposal?.jobsite as any)?.name || proposal?.jobsite || ''
  );
  const [department, setDepartment] = useState<Department | ''>(
     (proposal?.department as any)?.name || proposal?.department || ''
  );
  const [workLocation, setWorkLocation] = useState('');
  const [customWorkLocation, setCustomWorkLocation] = useState('');
  const [title, setTitle] = useState(proposal?.title || '');
  const [procurementObjective, setProcurementObjective] = useState(proposal?.description || '');
  
  // Hierarchy State
  const [selectedCategories, setSelectedCategories] = useState<Category[]>([]);
  const [selectedClassifications, setSelectedClassifications] = useState<Classification[]>([]);
  const [selectedSubClassifications, setSelectedSubClassifications] = useState<SubClassification[]>([]);
  const [availableClassifications, setAvailableClassifications] = useState<Classification[]>([]);
  const [availableSubClassifications, setAvailableSubClassifications] = useState<SubClassification[]>([]);
  
  // Details State
  const [scopeOfWork, setScopeOfWork] = useState('');
  const [analysis, setAnalysis] = useState('');
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  
  // Funding & Cost State
  const [fundingBudget, setFundingBudget] = useState(false);
  const [fundingNonBudget, setFundingNonBudget] = useState(false);
  const [estimatedCost, setEstimatedCost] = useState(proposal?.amount?.toString() || '');
  const [estimatedCostDisplay, setEstimatedCostDisplay] = useState(
    proposal?.amount ? formatNumberWithSeparator(proposal.amount) : ''
  );
  
  // Budget Items State
  const [budgetItems, setBudgetItems] = useState<BudgetItem[]>(proposal?.budgetItems || []);
  const [isBudgetDialogOpen, setIsBudgetDialogOpen] = useState(false);
  const [showBudgetPreview, setShowBudgetPreview] = useState(false);
  const allMaterials = getMaterials();
  
  const availableMaterials = useMemo(() => {
    if (fundingNonBudget && !fundingBudget) return getAvailableMaterialsForNonBudget(allMaterials);
    return getAvailableMaterialsForProposal(allMaterials);
  }, [allMaterials, fundingBudget, fundingNonBudget]);
  
  // Tab & Draft State
  const [activeTab, setActiveTab] = useState('general');
  const DRAFT_STORAGE_KEY = `eproposal_draft_${user.userID}`;
  const [hasDraft, setHasDraft] = useState(false);
  const [draftSavedAt, setDraftSavedAt] = useState<string>('');
  
  // Vendor Matching State
  const [selectedKBLICodes, setSelectedKBLICodes] = useState<string[]>([]);
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [tempKBLISelection, setTempKBLISelection] = useState<string>('');
  const [tempBrandSelection, setTempBrandSelection] = useState<string>('');

  // Matrix & Contract State
  const [matrixConditions, setMatrixConditions] = useState<MatrixContractCondition[]>([]);
  const [matrixConditionValues, setMatrixConditionValues] = useState<Record<string, boolean>>({});
  const [isTransactionValueExceeded, setIsTransactionValueExceeded] = useState(false);
  const [durationMonths, setDurationMonths] = useState('');
  const [isDurationExceeded, setIsDurationExceeded] = useState(false);
  const [contractType, setContractType] = useState<'Contractual' | 'Non-Contractual'>('Non-Contractual');
  const [contractualType, setContractualType] = useState('');
  const [contractPeriod, setContractPeriod] = useState('');
  const [penalty, setPenalty] = useState('');
  const [contractTermination, setContractTermination] = useState('');
  const [regulations, setRegulations] = useState('');

  // Initialize TOR/TER Helper
  const initializeTORItems = (): TORItem[] => {
    const torDefinitions = getActiveTORDefinitions();
    return torDefinitions.map(def => ({
      id: def.code, label: def.label, enabled: false, parameter: '', requirement: '', description: '', remarks: ''
    }));
  };
  
  const initializeTERItems = (): TERItem[] => {
    const terDefinitions = getActiveTERDefinitions();
    return terDefinitions.map(def => ({
      id: def.code, label: def.label, enabled: false, parameter: '', requirement: '', description: '', remarks: '', uploadedFile: null
    }));
  };
  
  const [torItems, setTorItems] = useState<TORItem[]>(initializeTORItems);
  const [terItems, setTerItems] = useState<TERItem[]>(initializeTERItems);

  // --- INITIALIZATION EFFECTS ---
  
  useEffect(() => {
    if ((fundingBudget || fundingNonBudget) && !isBudgetDialogOpen) setIsBudgetDialogOpen(true);
  }, [fundingBudget, fundingNonBudget]);
  
  const totalBudgetCost = budgetItems.reduce((sum, item) => sum + (item.qty * item.estimatedPrice), 0);
  
  useEffect(() => {
    if (totalBudgetCost > 0) {
      setEstimatedCost(totalBudgetCost.toString());
      setEstimatedCostDisplay(formatNumberWithSeparator(totalBudgetCost));
    }
  }, [totalBudgetCost]);

  useEffect(() => {
    const activeConditions = getActiveMatrixConditions();
    setMatrixConditions(activeConditions);
    const initialValues: Record<string, boolean> = {};
    activeConditions.forEach(condition => initialValues[condition.code] = false);
    setMatrixConditionValues(initialValues);
  }, []);

  useEffect(() => {
    const costValue = parseFloat(estimatedCost) || 0;
    setIsTransactionValueExceeded(costValue > 200000);
  }, [estimatedCost]);
  
  useEffect(() => {
    const duration = parseFloat(durationMonths) || 0;
    setIsDurationExceeded(duration > 6);
  }, [durationMonths]);

  useEffect(() => {
    if (jobsite && department && !proposal) {
      const generatedNo = generateProposalNumber(jobsite, department, existingProposals);
      setProposalNo(generatedNo);
    }
  }, [jobsite, department, proposal, existingProposals]);

  useEffect(() => {
    const anyConditionTrue = Object.values(matrixConditionValues).some(value => value === true) || isTransactionValueExceeded || isDurationExceeded;
    setContractType(anyConditionTrue ? 'Contractual' : 'Non-Contractual');
  }, [matrixConditionValues, isTransactionValueExceeded, isDurationExceeded]);

  // --- HIERARCHY HANDLERS ---

  const updateAvailableClassifications = (categories: Category[]) => {
    const allClassifications = categories
      .filter(cat => cat && cat.classifications)
      .flatMap(cat => cat.classifications)
      .filter(cls => cls && cls.code);
    setAvailableClassifications(allClassifications);
  };
  
  const updateAvailableSubClassifications = (classifications: Classification[]) => {
    const allSubClassifications = classifications
      .filter(cl => cl && cl.subClassifications)
      .flatMap(cl => cl.subClassifications)
      .filter(sub => sub && sub.code);
    setAvailableSubClassifications(allSubClassifications);
  };
  
  useEffect(() => {
    updateAvailableClassifications(selectedCategories);
  }, [selectedCategories]);
  
  useEffect(() => {
    updateAvailableSubClassifications(selectedClassifications);
  }, [selectedClassifications]);

  const handleCategoryToggle = (category: Category) => {
    const isSelected = selectedCategories.some(c => c.code === category.code);
    
    if (isSelected) {
      const newCategories = selectedCategories.filter(c => c.code !== category.code);
      setSelectedCategories(newCategories);
      
      const newClassifications = selectedClassifications.filter(
        cl => !category.classifications.some(catCl => catCl.code === cl.code)
      );
      setSelectedClassifications(newClassifications);
      
      const categoryClassificationCodes = category.classifications.map(cl => cl.code);
      const newSubClassifications = selectedSubClassifications.filter(
        sub => {
          const parentClassification = availableClassifications.find(cl => 
            cl.subClassifications.some(s => s.code === sub.code)
          );
          return parentClassification && !categoryClassificationCodes.includes(parentClassification.code);
        }
      );
      setSelectedSubClassifications(newSubClassifications);
    } else {
      setSelectedCategories([...selectedCategories, category]);
    }
  };

  const handleClassificationToggle = (classification: Classification) => {
    const isSelected = selectedClassifications.some(c => c.code === classification.code);
    
    if (isSelected) {
      const newClassifications = selectedClassifications.filter(c => c.code !== classification.code);
      setSelectedClassifications(newClassifications);
      
      const newSubClassifications = selectedSubClassifications.filter(
        sub => !classification.subClassifications.some(clSub => clSub.code === sub.code)
      );
      setSelectedSubClassifications(newSubClassifications);
    } else {
      setSelectedClassifications([...selectedClassifications, classification]);
    }
  };
  
  const handleSubClassificationToggle = (subClassification: SubClassification) => {
    const isSelected = selectedSubClassifications.some(s => s.code === subClassification.code);
    const newSubClassifications = isSelected
      ? selectedSubClassifications.filter(s => s.code !== subClassification.code)
      : [...selectedSubClassifications, subClassification];
    
    setSelectedSubClassifications(newSubClassifications);
    handleTORTERAutoPopulate(newSubClassifications);
  };

  // --- AUTO POPULATE HANDLERS ---

  const handleTORTERAutoPopulate = (subClassifications: SubClassification[]) => {
    if (subClassifications.length === 0) {
      setTorItems(initializeTORItems());
      setTerItems(initializeTERItems());
      return;
    }
    
    // Use FIRST sub-classification for detailed defaults
    const primarySubClass = subClassifications[0];
    const torDefinitions = getActiveTORDefinitions();
    const terDefinitions = getActiveTERDefinitions();
    
    const populatedTORItems = populateTORItemsWithDefaults(primarySubClass.code, torDefinitions);
    setTorItems(populatedTORItems);
    
    const populatedTERItems = populateTERItemsWithDefaults(primarySubClass.code, terDefinitions);
    setTerItems(populatedTERItems);
    
    const matrixEntry = getMatrixBySubClassification(primarySubClass.code);
    if (matrixEntry && matrixEntry.description && !procurementObjective.trim()) {
      setProcurementObjective(matrixEntry.description);
    }
    
    if (subClassifications.length === 1) {
      toast.success(`TOR/TER auto-filled for ${primarySubClass.name}`, {
        description: 'Default parameter, requirement, and description have been populated'
      });
    } else {
      toast.success(`TOR/TER auto-filled from ${subClassifications.length} sub-classification(s)`, {
        description: `Using ${primarySubClass.name} as primary template`
      });
    }
  };

  // --- FILE HANDLING ---

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      const validFiles = files.filter(file => {
        const extension = file.name.split('.').pop()?.toLowerCase();
        return ['pdf', 'doc', 'docx', 'xls', 'xlsx'].includes(extension || '');
      });
      
      if (validFiles.length !== files.length) {
        toast.error('Some files were rejected. Only PDF, Word, and Excel files are allowed.');
      }
      
      setUploadedFiles([...uploadedFiles, ...validFiles]);
    }
  };
  
  const removeFile = (index: number) => {
    setUploadedFiles(uploadedFiles.filter((_, i) => i !== index));
  };

  // --- TOR HELPERS ---

  const updateTORItem = (index: number, field: keyof TORItem, value: string | boolean) => {
    const updated = [...torItems];
    updated[index] = { ...updated[index], [field]: value };
    setTorItems(updated);
  };
  
  const updateTERItem = (index: number, field: keyof TERItem, value: string | boolean | File | null) => {
    const updated = [...terItems];
    updated[index] = { ...updated[index], [field]: value };
    setTerItems(updated);
  };
  
  const handleTERFileUpload = (index: number, file: File | null) => {
    if (file) {
      const extension = file.name.split('.').pop()?.toLowerCase();
      if (!['pdf', 'doc', 'docx', 'xls', 'xlsx', 'dwg', 'dxf', 'zip'].includes(extension || '')) {
        toast.error('Invalid file type. Please upload PDF, Word, Excel, CAD, or ZIP files.');
        return;
      }
    }
    updateTERItem(index, 'uploadedFile', file);
  };
  
  // Auto-enable KBLI when sub-classifications are selected
  useEffect(() => {
    if (selectedSubClassifications.length > 0) {
      const kbliIndex = torItems.findIndex(item => item.id === 'KBLI');
      if (kbliIndex !== -1 && !torItems[kbliIndex].enabled) {
        const updated = [...torItems];
        updated[kbliIndex] = { ...updated[kbliIndex], enabled: true };
        setTorItems(updated);
      }
    }
  }, [selectedSubClassifications]);

  // --- EDIT MODE LOADER ---

  useEffect(() => {
    if (proposal) {
      if (proposal.kbliCodes && proposal.kbliCodes.length > 0) {
        setSelectedKBLICodes(proposal.kbliCodes);
      }
      if (proposal.brandSpecifications && proposal.brandSpecifications.length > 0) {
        setSelectedBrands(proposal.brandSpecifications);
      }
      if (proposal.categories && proposal.categories.length > 0) {
        setSelectedCategories(proposal.categories as Category[]);
      }
      if (proposal.classifications && proposal.classifications.length > 0) {
        setSelectedClassifications(proposal.classifications as Classification[]);
      }
      if (proposal.subClassifications && proposal.subClassifications.length > 0) {
        setSelectedSubClassifications(proposal.subClassifications as SubClassification[]);
      }
      
      if (proposal.workLocation) {
        const isCustomLocation = !workLocationOptions.some(opt => opt === proposal.workLocation);
        if (isCustomLocation) {
          setWorkLocation('Other');
          setCustomWorkLocation(proposal.workLocation);
        } else {
          setWorkLocation(proposal.workLocation);
        }
      }
      
      if (proposal.scopeOfWork) setScopeOfWork(proposal.scopeOfWork);
      if (proposal.analysis) setAnalysis(proposal.analysis);
      
      if (proposal.fundingBudget !== undefined) setFundingBudget(proposal.fundingBudget);
      if (proposal.fundingNonBudget !== undefined) setFundingNonBudget(proposal.fundingNonBudget);
      
      if (proposal.durationMonths) setDurationMonths(proposal.durationMonths.toString());
      if (proposal.contractType) setContractType(proposal.contractType as any);
      if (proposal.contractualType) setContractualType(proposal.contractualType);
      if (proposal.contractPeriod) setContractPeriod(proposal.contractPeriod);
      if (proposal.penalty) setPenalty(proposal.penalty);
      if (proposal.contractTermination) setContractTermination(proposal.contractTermination);
      if (proposal.regulations) setRegulations(proposal.regulations);
      
      if (proposal.matrixConditions) setMatrixConditionValues(proposal.matrixConditions);
      if (proposal.isTransactionValueExceeded !== undefined) setIsTransactionValueExceeded(proposal.isTransactionValueExceeded);
      if (proposal.isDurationExceeded !== undefined) setIsDurationExceeded(proposal.isDurationExceeded);
      
      if (proposal.torItems && proposal.torItems.length > 0) {
        const loadedTorItems = initializeTORItems().map(defaultItem => {
          const existingItem = proposal.torItems?.find(ti => ti.id === defaultItem.id);
          if (existingItem) {
            return {
              ...defaultItem,
              enabled: existingItem.enabled || false,
              parameter: existingItem.parameter || '',
              requirement: existingItem.requirement || '',
              description: existingItem.description || '',
              remarks: existingItem.remarks || '',
            };
          }
          return defaultItem;
        });
        setTorItems(loadedTorItems);
      }
      
      if (proposal.terItems && proposal.terItems.length > 0) {
        const loadedTerItems = initializeTERItems().map(defaultItem => {
          const existingItem = proposal.terItems?.find(ti => ti.id === defaultItem.id);
          if (existingItem) {
            return {
              ...defaultItem,
              enabled: existingItem.enabled || false,
              parameter: existingItem.parameter || '',
              requirement: existingItem.requirement || '',
              description: existingItem.description || '',
              remarks: existingItem.remarks || '',
              uploadedFile: null,
            };
          }
          return defaultItem;
        });
        setTerItems(loadedTerItems);
      }
    }
  }, [proposal]);

  // --- VALIDATION & SUBMIT ---

  const canNavigateToTOR = () => proposalNo && jobsite && department && title;
  const canNavigateToTER = () => canNavigateToTOR() && selectedSubClassifications.length > 0;
  
  const calculateProgress = (): number => {
    let completed = 0;
    const total = 10;
    if (proposalNo) completed++;
    if (jobsite) completed++;
    if (department) completed++;
    if (title) completed++;
    if (selectedSubClassifications.length > 0) completed++;
    if (estimatedCost && parseFloat(estimatedCost) > 0) completed++;
    if (fundingBudget || fundingNonBudget) completed++;
    if (torItems.some(t => t.enabled)) completed++;
    if (terItems.some(t => t.enabled)) completed++;
    if (scopeOfWork) completed++;
    return Math.round((completed / total) * 100);
  };
  
  const validateForm = (): boolean => {
    if (!proposalNo) { toast.error('Proposal number is required'); return false; }
    if (!proposal && !isProposalNumberUnique(proposalNo)) { toast.error('Proposal number already exists'); return false; }
    if (!jobsite) { toast.error('Jobsite must be selected'); return false; }
    if (!department) { toast.error('Department must be selected'); return false; }
    if (!workLocation && !customWorkLocation) { toast.error('Work location is required'); return false; }
    if (!title) { toast.error('Title is required'); return false; }
    if (selectedCategories.length === 0) { toast.error('At least one category must be selected'); return false; }
    if (selectedClassifications.length === 0) { toast.error('At least one classification must be selected'); return false; }
    if (selectedSubClassifications.length === 0) { toast.error('At least one sub-classification must be selected'); return false; }
    if (!estimatedCost || parseFloat(estimatedCost) <= 0) { toast.error('Valid estimated cost is required'); return false; }
    if (!fundingBudget && !fundingNonBudget) { toast.error('Please select at least one funding source'); return false; }
    return true;
  };

  const extractKBLICodesFromTOR = (): string[] => {
    const kbliItem = torItems.find(item => item.id === 'KBLI' && item.enabled);
    if (kbliItem && kbliItem.requirement) {
      return kbliItem.requirement.split(',').map(c => c.trim()).filter(c => c);
    }
    return [];
  };
  
  const extractBrandsFromTOR = (): string[] => {
    const brandItem = torItems.find(item => item.id === 'brandSpec' && item.enabled);
    if (brandItem && brandItem.requirement) {
      return brandItem.requirement.split(',').map(b => b.trim()).filter(b => b);
    }
    return [];
  };

  const handleSaveDraft = () => {
    const finalKBLICodes = [...new Set([...selectedKBLICodes, ...extractKBLICodesFromTOR()])];
    const finalBrands = [...new Set([...selectedBrands, ...extractBrandsFromTOR()])];
    
    const syncedTorItems = torItems.map(item => {
      if (item.id === 'KBLI' && item.enabled && finalKBLICodes.length > 0) {
        return { ...item, requirement: finalKBLICodes.join(', ') };
      }
      if (item.id === 'brandSpec' && item.enabled && finalBrands.length > 0) {
        return { ...item, requirement: finalBrands.join(', ') };
      }
      return item;
    });
    
    const recommendedVendorsResult = getRecommendedVendors({
      subClassifications: selectedSubClassifications,
      kbliCodes: finalKBLICodes,
      brands: finalBrands
    });
    
    const recommendedVendorsList = recommendedVendorsResult.map(r => ({
      vendorName: r.vendor.vendorName,
      contactPerson: r.vendor.contactPerson,
      phoneNumber: r.vendor.contactPhone,
      email: r.vendor.contactEmail
    }));
    
    const proposalData = {
      id: proposal?.id,
      proposalNo,
      createdDate,
      jobsite,
      department,
      workLocation: customWorkLocation || workLocation,
      title,
      procurementObjective,
      categories: selectedCategories.map(c => ({ code: c.code, name: c.name })),
      classifications: selectedClassifications.map(c => ({ code: c.code, name: c.name })),
      subClassifications: selectedSubClassifications.map(s => ({ code: s.code, name: s.name })),
      category: selectedCategories.map(c => c.name).join(', '),
      classification: selectedClassifications.map(c => c.name).join(', '),
      subClassification: selectedSubClassifications.map(s => s.name).join(', '),
      scopeOfWork,
      analysis,
      amount: estimatedCost ? parseFloat(estimatedCost) : 0,
      fundingBudget,
      fundingNonBudget,
      durationMonths: durationMonths ? parseFloat(durationMonths) : 0,
      matrixConditions: matrixConditionValues,
      isTransactionValueExceeded,
      isDurationExceeded,
      contractType,
      contractualType: contractType === 'Contractual' ? contractualType : '',
      contractPeriod,
      penalty,
      contractTermination,
      regulations,
      torItems: syncedTorItems.filter(item => item.enabled),
      terItems: terItems.filter(item => item.enabled).map(item => ({
        ...item,
        uploadedFile: item.uploadedFile ? (item.uploadedFile as File).name : undefined,
      })),
      attachments: uploadedFiles.map(f => f.name),
      budgetItems: budgetItems.map(item => ({
        ...item,
        totalPrice: (item.qty || 0) * (item.estimatedPrice || 0),
        quantity: item.qty,
        unitPrice: item.estimatedPrice
      })),
      kbliCodes: finalKBLICodes,
      brandSpecifications: finalBrands,
      recommendedVendors: recommendedVendorsList,
      additionalVendors: proposal?.additionalVendors || [],
    };
    
    if (onSave) {
      onSave(proposalData, true); // true = draft
    }
    
    toast.success('Proposal saved as draft!', {
      description: recommendedVendorsList.length > 0 
        ? `Draft saved with ${recommendedVendorsList.length} recommended vendor(s).`
        : 'You can continue editing later.',
    });
    
    onClose();
  };

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    // Extract KBLI and brands from TOR items
    const finalKBLICodes = [...new Set([...selectedKBLICodes, ...extractKBLICodesFromTOR()])];
    const finalBrands = [...new Set([...selectedBrands, ...extractBrandsFromTOR()])];
    
    // Sync TOR items
    const syncedTorItems = torItems.map(item => {
      if (item.id === 'KBLI' && item.enabled && finalKBLICodes.length > 0) {
        return { ...item, requirement: finalKBLICodes.join(', ') };
      }
      if (item.id === 'brandSpec' && item.enabled && finalBrands.length > 0) {
        return { ...item, requirement: finalBrands.join(', ') };
      }
      return item;
    });
    
    // Auto-fetch vendors
    const recommendedVendorsResult = getRecommendedVendors({
      subClassifications: selectedSubClassifications,
      kbliCodes: finalKBLICodes,
      brands: finalBrands
    });
    
    const recommendedVendorsList = recommendedVendorsResult.map(r => ({
      vendorName: r.vendor.vendorName,
      contactPerson: r.vendor.contactPerson,
      phoneNumber: r.vendor.contactPhone,
      email: r.vendor.contactEmail
    }));
    
    const proposalData = {
      id: proposal?.id,
      proposalNo,
      createdDate,
      jobsite: jobsite as string,
      department: department as string,
      workLocation: customWorkLocation || workLocation,
      title,
      procurementObjective,
      categories: selectedCategories.map(c => ({ code: c.code, name: c.name })),
      classifications: selectedClassifications.map(c => ({ code: c.code, name: c.name })),
      subClassifications: selectedSubClassifications.map(s => ({ code: s.code, name: s.name })),
      category: selectedCategories.map(c => c.name).join(', '),
      classification: selectedClassifications.map(c => c.name).join(', '),
      subClassification: selectedSubClassifications.map(s => s.name).join(', '),
      scopeOfWork,
      analysis,
      amount: parseFloat(estimatedCost),
      fundingBudget,
      fundingNonBudget,
      durationMonths: durationMonths ? parseFloat(durationMonths) : 0,
      matrixConditions: matrixConditionValues,
      isTransactionValueExceeded,
      isDurationExceeded,
      contractType,
      contractualType: contractType === 'Contractual' ? contractualType : '',
      contractPeriod,
      penalty,
      contractTermination,
      regulations,
      torItems: syncedTorItems.filter(item => item.enabled),
      terItems: terItems.filter(item => item.enabled).map(item => ({
        ...item,
        uploadedFile: item.uploadedFile ? (item.uploadedFile as File).name : undefined,
      })),
      attachments: uploadedFiles.map(f => f.name),
      budgetItems: budgetItems.map(item => ({
        ...item,
        totalPrice: (item.qty || 0) * (item.estimatedPrice || 0),
        quantity: item.qty,
        unitPrice: item.estimatedPrice
      })),
      kbliCodes: finalKBLICodes,
      brandSpecifications: finalBrands,
      recommendedVendors: recommendedVendorsList,
      additionalVendors: proposal?.additionalVendors || [],
    };
    
    if (onSave) {
      onSave(proposalData, false); // false = submitted
    }
    
    clearDraft();
    
    const isResubmit = proposal?.status === 'Rejected';
    
    toast.success(
      isResubmit ? '🔄 Proposal resubmitted successfully!' : proposal ? 'Proposal updated successfully!' : 'Proposal submitted successfully!', 
      {
        description: isResubmit
          ? 'Your proposal has been resubmitted for a new approval cycle.'
          : recommendedVendorsList.length > 0 
            ? `Your proposal has been sent for approval with ${recommendedVendorsList.length} recommended vendor(s).`
            : 'Your proposal has been sent for approval.',
      }
    );
    
    onClose();
  };

  return (
    <div className="space-y-4">
      {/* Draft Status Badge */}
      {hasDraft && !proposal && (
        <div className="flex items-center gap-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-300">
            📝 Draft Available
          </Badge>
          <span className="text-sm text-gray-600">
            Last saved: {draftSavedAt}
          </span>
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => {
              if (confirm('Load draft? Any unsaved changes will be lost.')) {
                loadDraft();
              }
            }}
          >
            Load Draft
          </Button>
        </div>
      )}

      {/* Progress Indicator */}
      {!proposal && (
        <div className="bg-white border rounded-lg p-4">
          <div className="flex justify-between text-sm mb-2">
            <span className="text-gray-600">Form Completion</span>
            <span className="text-gray-900 font-medium">{calculateProgress()}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${calculateProgress()}%` }}
            />
          </div>
        </div>
      )}

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-4">
          <TabsTrigger value="general">1. General Information</TabsTrigger>
          <TabsTrigger value="tor" disabled={!canNavigateToTOR()}>2. Terms of Reference</TabsTrigger>
          <TabsTrigger value="ter" disabled={!canNavigateToTER()}>3. Technical Evaluation</TabsTrigger>
        </TabsList>

        {/* TAB 1: GENERAL INFORMATION */}
        <TabsContent value="general" className="space-y-6 mt-0">
          
          {/* Basic Information */}
          <div className="space-y-3 bg-white border rounded-lg p-6">
            <h3 className="text-lg text-gray-900 border-b pb-2 mb-3">Basic Information</h3>
            
            <div className="space-y-1.5">
              <Label htmlFor="proposalNo">Proposal Number *</Label>
              <Input id="proposalNo" value={proposalNo} onChange={(e) => setProposalNo(e.target.value)} placeholder="Auto-generated" disabled={!!proposal} className="bg-gray-50" />
            </div>
            
            <div className="space-y-1.5">
              <Label htmlFor="createdDate">Date *</Label>
              <Input id="createdDate" type="date" value={createdDate} onChange={(e) => setCreatedDate(e.target.value)} required />
            </div>
            
            <div className="space-y-1.5">
              <Label htmlFor="title">Title *</Label>
              <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Enter proposal title" required />
            </div>
            
            {/* Department */}
            <div className="space-y-1.5">
              <Label htmlFor="department">Department (Plant) *</Label>
              <Select value={typeof department === 'object' ? (department as any).code : department} onValueChange={(value) => {
                 setDepartment(value); 
              }}>
                <SelectTrigger><SelectValue placeholder="Select department" /></SelectTrigger>
                <SelectContent>
                  {departments.map((dept) => (
                    <SelectItem key={dept.departmentID} value={dept.code}>{dept.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            {/* Jobsite */}
            <div className="space-y-1.5">
              <Label htmlFor="jobsite">Jobsite *</Label>
              <Select value={typeof jobsite === 'object' ? (jobsite as any).code : jobsite} onValueChange={(value) => setJobsite(value)}>
                <SelectTrigger><SelectValue placeholder="Select jobsite" /></SelectTrigger>
                <SelectContent>
                  {jobsites.map((js) => (
                    <SelectItem key={js.jobsiteID} value={js.code}>{js.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            {/* Work Location */}
            <div className="space-y-1.5">
              <Label htmlFor="workLocation">Work Location *</Label>
              <div className="space-y-2">
                <Select value={workLocation} onValueChange={setWorkLocation}>
                  <SelectTrigger><SelectValue placeholder="Select location" /></SelectTrigger>
                  <SelectContent>
                    {workLocationOptions.map((loc) => <SelectItem key={loc} value={loc}>{loc}</SelectItem>)}
                  </SelectContent>
                </Select>
                {workLocation === 'Custom Location' && (
                  <Input value={customWorkLocation} onChange={(e) => setCustomWorkLocation(e.target.value)} placeholder="Enter custom location" />
                )}
              </div>
            </div>
            
            <div className="space-y-1.5">
              <Label htmlFor="procurementObjective">Procurement Objective</Label>
              <Textarea id="procurementObjective" value={procurementObjective} onChange={(e) => setProcurementObjective(e.target.value)} placeholder="Describe the procurement objective" rows={3} />
            </div>
          </div>
          
          {/* Category Classification */}
          <div className="space-y-3 bg-white border rounded-lg p-6">
            <h3 className="text-lg text-gray-900 border-b pb-2">Category Classification</h3>
            <p className="text-sm text-gray-600">Select one or more items at each level</p>
            
            {/* Categories */}
            <div className="space-y-1.5">
              <Label htmlFor="category">Category *</Label>
              <Select value="" onValueChange={(value) => {
                 const category = categoryHierarchy.find(c => c.code === value);
                 if (category) handleCategoryToggle(category);
              }}>
                <SelectTrigger><SelectValue placeholder="Select category to add" /></SelectTrigger>
                <SelectContent>
                  {categoryHierarchy
                    .filter(cat => cat?.code && !selectedCategories.some(c => c?.code === cat.code))
                    .map(cat => <SelectItem key={cat.code} value={cat.code}>{cat.code} - {cat.name}</SelectItem>)
                  }
                </SelectContent>
              </Select>
              
              {selectedCategories.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2 p-3 bg-blue-50 rounded-lg border border-blue-200">
                  {selectedCategories.map(cat => (
                    <span key={cat.code} className="inline-flex items-center gap-2 px-3 py-1.5 bg-white text-blue-900 text-sm rounded-md border border-blue-300 shadow-sm">
                      <span className="font-medium">{cat.code}</span>
                      <span className="text-blue-700">·</span>
                      <span>{cat.name}</span>
                      <X className="w-4 h-4 cursor-pointer hover:text-red-600 ml-1" onClick={() => handleCategoryToggle(cat)} />
                    </span>
                  ))}
                </div>
              )}
            </div>
            
            {/* Classifications */}
            {selectedCategories.length > 0 && (
              <div className="space-y-1.5">
                <Label htmlFor="classification">Classification *</Label>
                <Select value="" onValueChange={(value) => {
                   const classification = availableClassifications.find(c => c.code === value);
                   if (classification) handleClassificationToggle(classification);
                }}>
                  <SelectTrigger><SelectValue placeholder="Select classification to add" /></SelectTrigger>
                  <SelectContent>
                    {availableClassifications
                      .filter(cls => cls?.code && !selectedClassifications.some(c => c?.code === cls.code))
                      .map(cls => <SelectItem key={cls.code} value={cls.code}>{cls.code} - {cls.name}</SelectItem>)
                    }
                  </SelectContent>
                </Select>
                
                {selectedClassifications.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2 p-3 bg-green-50 rounded-lg border border-green-200">
                    {selectedClassifications.map(cls => (
                      <span key={cls.code} className="inline-flex items-center gap-2 px-3 py-1.5 bg-white text-green-900 text-sm rounded-md border border-green-300 shadow-sm">
                        <span className="font-medium">{cls.code}</span>
                        <span className="text-green-700">·</span>
                        <span>{cls.name}</span>
                        <X className="w-4 h-4 cursor-pointer hover:text-red-600 ml-1" onClick={() => handleClassificationToggle(cls)} />
                      </span>
                    ))}
                  </div>
                )}
              </div>
            )}
            
            {/* Sub-Classifications */}
            {selectedClassifications.length > 0 && (
              <div className="space-y-1.5">
                <Label htmlFor="subClassification">Sub-Classification *</Label>
                <Select value="" onValueChange={(value) => {
                   const sub = availableSubClassifications.find(s => s.code === value);
                   if (sub) handleSubClassificationToggle(sub);
                }}>
                  <SelectTrigger><SelectValue placeholder="Select sub-classification to add" /></SelectTrigger>
                  <SelectContent>
                    {availableSubClassifications
                      .filter(sub => sub?.code && !selectedSubClassifications.some(s => s?.code === sub.code))
                      .map(sub => <SelectItem key={sub.code} value={sub.code}>{sub.code} - {sub.name}</SelectItem>)
                    }
                  </SelectContent>
                </Select>
                
                {selectedSubClassifications.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2 p-3 bg-purple-50 rounded-lg border border-purple-200">
                    {selectedSubClassifications.map(sub => (
                      <span key={sub.code} className="inline-flex items-center gap-2 px-3 py-1.5 bg-white text-purple-900 text-sm rounded-md border border-purple-300 shadow-sm">
                        <span className="font-medium">{sub.code}</span>
                        <span className="text-purple-700">·</span>
                        <span>{sub.name}</span>
                        <X className="w-4 h-4 cursor-pointer hover:text-red-600 ml-1" onClick={() => handleSubClassificationToggle(sub)} />
                      </span>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
          
          {/* Scope of Work */}
          <div className="space-y-3 bg-white border rounded-lg p-6">
            <h3 className="text-lg text-gray-900 border-b pb-2">Scope of Work (SoW)</h3>
            <Textarea value={scopeOfWork} onChange={(e) => setScopeOfWork(e.target.value)} placeholder="Describe the scope of work in detail..." rows={4} />
          </div>
          
          {/* Analysis */}
          <div className="space-y-3 bg-white border rounded-lg p-6">
            <h3 className="text-lg text-gray-900 border-b pb-2">Analysis and Benefits</h3>
            <Textarea value={analysis} onChange={(e) => setAnalysis(e.target.value)} placeholder="Provide analysis and expected benefits..." rows={4} />
            
            <div>
              <Label>Upload Supporting Documents</Label>
              <div className="mt-2">
                 <label className="flex items-center justify-center w-full h-28 px-4 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                    <div className="flex flex-col items-center">
                       <Upload className="w-7 h-7 text-gray-400 mb-2" />
                       <p className="text-sm text-gray-600">Click to upload or drag and drop</p>
                       <p className="text-xs text-gray-500">PDF, Word, Excel (Max 10MB each)</p>
                    </div>
                    <input type="file" className="hidden" multiple accept=".pdf,.doc,.docx,.xls,.xlsx" onChange={handleFileUpload} />
                 </label>
              </div>
              {uploadedFiles.length > 0 && (
                 <div className="mt-3 space-y-2">
                    <p className="text-sm text-gray-600">Uploaded Files:</p>
                    {uploadedFiles.map((file, idx) => (
                       <div key={idx} className="flex items-center justify-between p-2 bg-gray-50 rounded border">
                          <span className="text-sm text-gray-700">{file.name}</span>
                          <Button type="button" variant="ghost" size="sm" onClick={() => removeFile(idx)}><X className="w-4 h-4" /></Button>
                       </div>
                    ))}
                 </div>
              )}
            </div>
          </div>
        </TabsContent>

          {/* ================== TAB 2: TERMS OF REFERENCE ================== */}
        <TabsContent value="tor" className="space-y-6 mt-0">
          <div className="space-y-4 bg-white border rounded-lg p-6">
            <h3 className="text-lg text-gray-900 border-b pb-2">Terms of Reference (TOR)</h3>
            <p className="text-sm text-gray-600 mb-4">
              Enable relevant criteria and fill in the details for each selected item.
            </p>
            
            <div className="space-y-3">
              {torItems.map((item, index) => (
                <div key={item.id} className="border rounded-lg p-4 bg-gray-50">
                  <div className="flex items-center space-x-2 mb-3">
                    <Checkbox
                      id={`tor-${item.id}`}
                      checked={item.enabled}
                      onCheckedChange={(checked: boolean) => updateTORItem(index, 'enabled', checked as boolean)}
                      disabled={item.id === 'KBLI' && selectedSubClassifications.length > 0}
                    />
                    <label htmlFor={`tor-${item.id}`} className="cursor-pointer flex items-center gap-2">
                      {item.label}
                      {item.id === 'KBLI' && (
                        <Badge variant="destructive" className="text-xs">Required</Badge>
                      )}
                    </label>
                  </div>
                  
                  {item.enabled && (
                    <div className="ml-6 space-y-2">
                      <div className="space-y-1.5">
                        <Label htmlFor={`tor-${item.id}-parameter`}>Parameter</Label>
                        <Input
                          id={`tor-${item.id}-parameter`}
                          value={item.parameter}
                          onChange={(e) => updateTORItem(index, 'parameter', e.target.value)}
                          onFocus={handleAutoSelect}
                          onClick={handleAutoSelect}
                          placeholder={item.placeholderParameter || 'Enter parameter'}
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor={`tor-${item.id}-requirement`}>Requirement</Label>
                        
                        {/* KBLI Multi-Select Logic */}
                        {item.id === 'KBLI' ? (
                          <div className="space-y-2">
                            {selectedKBLICodes.length === 0 && (
                              <div className="flex items-start gap-2 p-3 bg-yellow-50 border border-yellow-300 rounded-lg">
                                <AlertCircle className="w-4 h-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                                <div className="text-sm text-yellow-800">
                                  <strong>Required:</strong> Please select at least one KBLI code
                                </div>
                              </div>
                            )}
                            
                            {selectedKBLICodes.length > 0 && (
                              <div className="flex flex-wrap gap-1 p-3 bg-green-50 border border-green-200 rounded-lg">
                                {selectedKBLICodes.map(code => (
                                  <div key={code} className="inline-flex items-center gap-1.5 px-2 py-1 bg-green-100 text-green-800 border border-green-300 rounded-md text-xs">
                                    <span>{getKBLIDisplay(code)}</span>
                                    <button
                                      type="button"
                                      className="hover:bg-green-200 rounded"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setSelectedKBLICodes(selectedKBLICodes.filter(k => k !== code));
                                      }}
                                    >
                                      <X className="w-3 h-3" />
                                    </button>
                                  </div>
                                ))}
                              </div>
                            )}
                            
                            <div className="flex gap-2">
                              <Select 
                                value={tempKBLISelection} 
                                onValueChange={setTempKBLISelection}
                              >
                                <SelectTrigger className="flex-1">
                                  <SelectValue placeholder="Choose KBLI code..." />
                                </SelectTrigger>
                                <SelectContent>
                                  {getCombinedKBLICodes(selectedSubClassifications)
                                    .filter(kbli => !selectedKBLICodes.includes(kbli.code))
                                    .map((kbli) => (
                                      <SelectItem key={kbli.code} value={kbli.code}>
                                        <strong>{kbli.code}</strong> - {kbli.description}
                                      </SelectItem>
                                    ))}
                                </SelectContent>
                              </Select>
                              <Button
                                type="button"
                                onClick={() => {
                                  if (tempKBLISelection && !selectedKBLICodes.includes(tempKBLISelection)) {
                                    setSelectedKBLICodes([...selectedKBLICodes, tempKBLISelection]);
                                    setTempKBLISelection('');
                                  }
                                }}
                                disabled={!tempKBLISelection}
                                className="bg-green-600 hover:bg-green-700"
                              >
                                Add
                              </Button>
                            </div>
                          </div>
                        ) : item.id === 'brandSpec' ? (
                          /* Brand Multi-Select Logic */
                          <div className="space-y-2">
                            {selectedBrands.length > 0 && (
                              <div className="flex flex-wrap gap-1 p-3 bg-purple-50 border border-purple-200 rounded-lg">
                                {selectedBrands.map(brand => (
                                  <div key={brand} className="inline-flex items-center gap-1.5 px-2 py-1 bg-purple-100 text-purple-800 border border-purple-300 rounded-md text-xs">
                                    <span>{brand}</span>
                                    <button
                                      type="button"
                                      className="hover:bg-purple-200 rounded"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setSelectedBrands(selectedBrands.filter(b => b !== brand));
                                      }}
                                    >
                                      <X className="w-3 h-3" />
                                    </button>
                                  </div>
                                ))}
                              </div>
                            )}
                            
                            <div className="flex gap-2">
                              <Select 
                                value={tempBrandSelection} 
                                onValueChange={setTempBrandSelection}
                              >
                                <SelectTrigger className="flex-1">
                                  <SelectValue placeholder="Choose brand..." />
                                </SelectTrigger>
                                <SelectContent>
                                  {getActiveExternalBrands()
                                    .filter(brand => !selectedBrands.includes(brand))
                                    .map((brand) => (
                                      <SelectItem key={brand} value={brand}>{brand}</SelectItem>
                                    ))}
                                </SelectContent>
                              </Select>
                              <Button
                                type="button"
                                onClick={() => {
                                  if (tempBrandSelection && !selectedBrands.includes(tempBrandSelection)) {
                                    setSelectedBrands([...selectedBrands, tempBrandSelection]);
                                    setTempBrandSelection('');
                                  }
                                }}
                                disabled={!tempBrandSelection}
                                className="bg-purple-600 hover:bg-purple-700"
                              >
                                Add
                              </Button>
                            </div>
                          </div>
                        ) : (
                          /* Standard Input */
                          <Input
                            id={`tor-${item.id}-requirement`}
                            value={item.requirement}
                            onChange={(e) => updateTORItem(index, 'requirement', e.target.value)}
                            onFocus={handleAutoSelect}
                            onClick={handleAutoSelect}
                            placeholder={item.placeholderRequirement || 'Enter requirement'}
                          />
                        )}
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor={`tor-${item.id}-description`}>Description</Label>
                        <Textarea
                          id={`tor-${item.id}-description`}
                          value={item.description}
                          onChange={(e) => updateTORItem(index, 'description', e.target.value)}
                          onFocus={handleAutoSelect}
                          onClick={handleAutoSelect}
                          placeholder={item.placeholderDescription || 'Enter description'}
                          rows={2}
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor={`tor-${item.id}-remarks`}>Remarks</Label>
                        <Textarea
                          id={`tor-${item.id}-remarks`}
                          value={item.remarks}
                          onChange={(e) => updateTORItem(index, 'remarks', e.target.value)}
                          onFocus={handleAutoSelect}
                          onClick={handleAutoSelect}
                          placeholder="Enter remarks"
                          rows={2}
                        />
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
          
          <div className="flex justify-between items-center pt-6 border-t bg-white p-4 rounded-lg">
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setActiveTab('general')} type="button">
                ← Previous
              </Button>
              {!proposal && (
                <Button variant="outline" onClick={handleSaveDraft} type="button">
                  💾 Save as Draft
                </Button>
              )}
            </div>
            <Button 
              type="button"
              onClick={() => setActiveTab('ter')}
              disabled={!canNavigateToTER()}
            >
              Next: Technical Evaluation →
            </Button>
          </div>
        </TabsContent>

        {/* ================== TAB 3: TECHNICAL EVALUATION ================== */}
        <TabsContent value="ter" className="space-y-6 mt-0">
          <div className="space-y-4 bg-white border rounded-lg p-6">
            <h3 className="text-lg text-gray-900 border-b pb-2">Technical Evaluation Requirements (TER)</h3>
            <div className="space-y-6">
              {terItems.map((item, index) => (
                <div key={item.id} className="border rounded-lg p-4 bg-gray-50">
                  <div className="flex items-center space-x-2 mb-4">
                    <Checkbox
                      id={`ter-${item.id}`}
                      checked={item.enabled}
                      onCheckedChange={(checked: boolean) => updateTERItem(index, 'enabled', checked as boolean)}
                    />
                    <label htmlFor={`ter-${item.id}`} className="cursor-pointer">
                      {item.label}
                    </label>
                  </div>
                  
                  {item.enabled && (
                    <div className="ml-6 space-y-2">
                      <div className="grid grid-cols-[150px_1fr] gap-4 items-start">
                        <Label htmlFor={`ter-${item.id}-parameter`} className="pt-2">Parameter</Label>
                        <Input
                          id={`ter-${item.id}-parameter`}
                          value={item.parameter}
                          onChange={(e) => updateTERItem(index, 'parameter', e.target.value)}
                          onFocus={handleAutoSelect}
                          onClick={handleAutoSelect}
                          placeholder={item.placeholderParameter || 'Enter parameter'}
                        />
                      </div>
                      <div className="grid grid-cols-[150px_1fr] gap-4 items-start">
                        <Label htmlFor={`ter-${item.id}-requirement`} className="pt-2">Requirement</Label>
                        <Input
                          id={`ter-${item.id}-requirement`}
                          value={item.requirement}
                          onChange={(e) => updateTERItem(index, 'requirement', e.target.value)}
                          onFocus={handleAutoSelect}
                          onClick={handleAutoSelect}
                          placeholder={item.placeholderRequirement || 'Enter requirement'}
                        />
                      </div>
                      <div className="grid grid-cols-[150px_1fr] gap-4 items-start">
                        <Label htmlFor={`ter-${item.id}-description`} className="pt-2">Description</Label>
                        <Textarea
                          id={`ter-${item.id}-description`}
                          value={item.description}
                          onChange={(e) => updateTERItem(index, 'description', e.target.value)}
                          onFocus={handleAutoSelect}
                          onClick={handleAutoSelect}
                          placeholder={item.placeholderDescription || 'Enter description'}
                          rows={2}
                        />
                      </div>
                      <div className="grid grid-cols-[150px_1fr] gap-4 items-start">
                        <Label htmlFor={`ter-${item.id}-remarks`} className="pt-2">Remarks</Label>
                        <Textarea
                          id={`ter-${item.id}-remarks`}
                          value={item.remarks}
                          onChange={(e) => updateTERItem(index, 'remarks', e.target.value)}
                          onFocus={handleAutoSelect}
                          onClick={handleAutoSelect}
                          placeholder="Enter remarks"
                          rows={2}
                        />
                      </div>
                      
                      <div className="grid grid-cols-[150px_1fr] gap-4 items-start">
                        <Label className="pt-2">Upload</Label>
                        <div>
                          {!item.uploadedFile ? (
                            <label className="flex items-center gap-3 w-full px-4 py-3 border-2 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors">
                              <Upload className="w-5 h-5 text-gray-500" />
                              <span className="text-sm text-gray-700">Click to upload document</span>
                              <input
                                type="file"
                                className="hidden"
                                accept=".pdf,.doc,.docx,.xls,.xlsx,.dwg,.dxf,.zip"
                                onChange={(e) => handleTERFileUpload(index, e.target.files?.[0] || null)}
                              />
                            </label>
                          ) : (
                            <div className="bg-gray-50 rounded-lg border p-3 flex justify-between items-center">
                              <div className="flex items-center gap-2">
                                <FileText className="w-4 h-4 text-gray-600" />
                                <span className="text-sm text-gray-900">{item.uploadedFile.name}</span>
                              </div>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => handleTERFileUpload(index, null)}
                              >
                                <X className="w-4 h-4" />
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
          
          <div className="flex justify-between items-center pt-6 border-t bg-white p-4 rounded-lg">
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setActiveTab('tor')} type="button">
                ← Previous
              </Button>
              <Button variant="outline" onClick={onClose} type="button">
                <X className="w-4 h-4 mr-2" />
                Cancel
              </Button>
              {!proposal && (
                <Button variant="outline" onClick={handleSaveDraft} type="button">
                  💾 Save as Draft
                </Button>
              )}
            </div>
            <Button 
              type="button"
              onClick={handleSubmit}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {proposal?.status === 'Rejected' ? '🔄 Resubmit for Approval' : proposal ? 'Update Proposal' : 'Submit for Verification'}
            </Button>
          </div>
        </TabsContent>
      </Tabs>

      {/* Budget Item Selection Dialog */}
      <BudgetItemSelection
        materials={availableMaterials}
        selectedSubClassifications={selectedSubClassifications.map(s => s.name)}
        budgetItems={budgetItems}
        onBudgetItemsChange={setBudgetItems}
        open={isBudgetDialogOpen}
        onOpenChange={setIsBudgetDialogOpen}
        selectedJobsite={jobsite as string}
      />
    </div>
  );
}