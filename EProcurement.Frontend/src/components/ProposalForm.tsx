import { useState, useEffect, useMemo } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Checkbox } from './ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { User, Proposal, Jobsite, Department, Material, BudgetItem } from '../types';
import { toast } from 'sonner@2.0.3';
import { Upload, X, FileText, Eye, Info, FileSpreadsheet, Download, AlertCircle, CheckCircle2 } from 'lucide-react';
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
import { vendorDatabase } from '../data/vendorDatabase_NEW';

interface ProposalFormProps {
  user: User;
  proposal?: Proposal | null;
  onClose: () => void;
  onSave?: (proposalData: any, isDraft: boolean) => void;
  existingProposals?: Proposal[]; // Add this to receive all existing proposals
}

interface TORItem {
  id: string;
  label: string;
  enabled: boolean;
  parameter: string;
  requirement: string;
  description: string;
  remarks: string;
  // Placeholders for guide text
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
  // Placeholders for guide text
  placeholderParameter?: string;
  placeholderRequirement?: string;
  placeholderDescription?: string;
}

export function ProposalForm({ user, proposal, onClose, onSave, existingProposals }: ProposalFormProps) {
  // Helper function for auto-select on focus - more robust approach
  const handleAutoSelect = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    // Use setTimeout to ensure this runs after React's event handling
    setTimeout(() => {
      e.target.select();
      // Also use setSelectionRange for better browser compatibility
      const length = e.target.value.length;
      e.target.setSelectionRange(0, length);
    }, 0);
  };
  
  // Get dynamic reference data
  const allJobsites = getActiveJobsites() as Jobsite[];
  const allDepartments = getActiveDepartments() as Department[];
  
  // Filter based on user role
  const jobsites = getAllowedJobsites(user.role, allJobsites);
  const departments = getAllowedDepartments(user.role, allDepartments);
  
  const workLocationOptions = getActiveWorkLocations();
  const contractTypeOptions = getActiveContractTypes();
  const contractualTypeOptions = getActiveContractualTypes();
  // Basic Information
  const [proposalNo, setProposalNo] = useState(proposal?.proposalNo || '');
  const [createdDate, setCreatedDate] = useState(
    proposal ? new Date(proposal.createdDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]
  );
  const [jobsite, setJobsite] = useState<Jobsite | ''>(proposal?.jobsite || '');
  const [department, setDepartment] = useState<Department | ''>(proposal?.department || '');
  const [workLocation, setWorkLocation] = useState('');
  const [customWorkLocation, setCustomWorkLocation] = useState('');
  const [title, setTitle] = useState(proposal?.title || '');
  const [procurementObjective, setProcurementObjective] = useState(proposal?.description || '');
  
  // Category Hierarchy - Multiple Selection
  const [selectedCategories, setSelectedCategories] = useState<Category[]>([]);
  const [selectedClassifications, setSelectedClassifications] = useState<Classification[]>([]);
  const [selectedSubClassifications, setSelectedSubClassifications] = useState<SubClassification[]>([]);
  const [availableClassifications, setAvailableClassifications] = useState<Classification[]>([]);
  const [availableSubClassifications, setAvailableSubClassifications] = useState<SubClassification[]>([]);
  
  // Scope of Work
  const [scopeOfWork, setScopeOfWork] = useState('');
  
  // Analysis and Benefits
  const [analysis, setAnalysis] = useState('');
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  
  // Funding Source Checkboxes
  const [fundingBudget, setFundingBudget] = useState(false);
  const [fundingNonBudget, setFundingNonBudget] = useState(false);
  
  // Cost Estimation
  const [estimatedCost, setEstimatedCost] = useState(proposal?.amount?.toString() || '');
  const [estimatedCostDisplay, setEstimatedCostDisplay] = useState(
    proposal?.amount ? formatNumberWithSeparator(proposal.amount) : ''
  );
  
  // Budget Items
  const [budgetItems, setBudgetItems] = useState<BudgetItem[]>(proposal?.budgetItems || []);
  const [isBudgetDialogOpen, setIsBudgetDialogOpen] = useState(false);
  const [showBudgetPreview, setShowBudgetPreview] = useState(false);
  const allMaterials = getMaterials();
  
  // Filter materials based on funding source
  // Budget: Non-Contractual OR Contractual with End Date < 180 days
  // Non-Budget: Contractual and Non-Contractual EXCEPT materials with Contract Number
  const availableMaterials = useMemo(() => {
    if (fundingNonBudget && !fundingBudget) {
      // Only Non-Budget selected
      return getAvailableMaterialsForNonBudget(allMaterials);
    }
    // Budget selected or both selected - use Budget rules (180-day exception)
    return getAvailableMaterialsForProposal(allMaterials);
  }, [allMaterials, fundingBudget, fundingNonBudget]);
  
  // Tab Management
  const [activeTab, setActiveTab] = useState('general');
  
  // Draft Management
  const DRAFT_STORAGE_KEY = `eproposal_draft_${user.id}`;
  const [hasDraft, setHasDraft] = useState(false);
  const [draftSavedAt, setDraftSavedAt] = useState<string>('');
  
  // TOR Multi-Select for Vendor Matching (NEW - Nov 12, 2025)
  const [selectedKBLICodes, setSelectedKBLICodes] = useState<string[]>([]);
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  
  // Temporary state for dropdown selection before adding
  const [tempKBLISelection, setTempKBLISelection] = useState<string>('');
  const [tempBrandSelection, setTempBrandSelection] = useState<string>('');
  
  // Auto-open budget dialog when fundingBudget or fundingNonBudget is checked
  useEffect(() => {
    if ((fundingBudget || fundingNonBudget) && !isBudgetDialogOpen) {
      setIsBudgetDialogOpen(true);
    }
  }, [fundingBudget, fundingNonBudget]);
  
  // Calculate total budget cost
  const totalBudgetCost = budgetItems.reduce((sum, item) => sum + (item.qty * item.estimatedPrice), 0);
  
  // Auto-fill Estimated Cost (USD) from total budget cost
  useEffect(() => {
    if (totalBudgetCost > 0) {
      setEstimatedCost(totalBudgetCost.toString());
      setEstimatedCostDisplay(formatNumberWithSeparator(totalBudgetCost));
    }
  }, [totalBudgetCost]);
  
  // Export Excel function
  const handleExportBudgetExcel = () => {
    if (budgetItems.length === 0) {
      toast.error('No budget items to export');
      return;
    }

    const headers = ['Material Code', 'Description', 'UoM', 'Brand', 'Qty', 'Price', 'Total'];
    const rows = budgetItems.map(item => [
      item.materialCode,
      item.materialDescription,
      item.uom,
      item.brand,
      item.qty.toString(),
      formatNumberWithSeparator(item.estimatedPrice),
      formatNumberWithSeparator(item.qty * item.estimatedPrice)
    ]);

    const totalRow = ['', '', '', '', '', 'TOTAL:', formatNumberWithSeparator(totalBudgetCost)];

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `\"${cell}\"`).join(',')),
      totalRow.map(cell => `\"${cell}\"`).join(',')
    ].join('\\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `budget_items_${proposalNo || 'draft'}_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    window.URL.revokeObjectURL(url);

    toast.success('Budget exported to Excel (CSV)');
  };

  // Export PDF function
  const handleExportBudgetPDF = () => {
    if (budgetItems.length === 0) {
      toast.error('No budget items to export');
      return;
    }

    const doc = new jsPDF();
    
    doc.setFontSize(16);
    doc.text('Budget Items Report', 14, 20);
    
    doc.setFontSize(10);
    doc.text(`Proposal: ${proposalNo || 'Draft'}`, 14, 28);
    doc.text(`Generated: ${new Date().toLocaleDateString()}`, 14, 34);
    
    const tableData = budgetItems.map(item => [
      item.materialCode,
      item.materialDescription.substring(0, 40) + (item.materialDescription.length > 40 ? '...' : ''),
      item.uom,
      item.brand.substring(0, 20) + (item.brand.length > 20 ? '...' : ''),
      item.qty.toString(),
      formatNumberWithSeparator(item.estimatedPrice),
      formatNumberWithSeparator(item.qty * item.estimatedPrice)
    ]);
    
    autoTable(doc, {
      head: [['Code', 'Description', 'UoM', 'Brand', 'Qty', 'Price', 'Total']],
      body: tableData,
      foot: [['', '', '', '', '', 'TOTAL:', formatNumberWithSeparator(totalBudgetCost)]],
      startY: 40,
      styles: { fontSize: 8 },
      headStyles: { fillColor: [59, 130, 246] },
      footStyles: { fillColor: [229, 231, 235], textColor: [0, 0, 0], fontStyle: 'bold' }
    });
    
    doc.save(`budget_items_${proposalNo || 'draft'}_${new Date().toISOString().split('T')[0]}.pdf`);
    toast.success('Budget exported to PDF');
  };
  
  // ✅ DRAFT MANAGEMENT FUNCTIONS
  const saveDraft = () => {
    const draftData = {
      savedAt: new Date().toISOString(),
      activeTab,
      data: {
        proposalNo,
        createdDate,
        jobsite,
        department,
        workLocation: customWorkLocation || workLocation,
        customWorkLocation,
        title,
        procurementObjective,
        selectedCategories,
        selectedClassifications,
        selectedSubClassifications,
        scopeOfWork,
        analysis,
        fundingBudget,
        fundingNonBudget,
        budgetItems,
        estimatedCost,
        estimatedCostDisplay,
        durationMonths,
        matrixConditionValues,
        isTransactionValueExceeded,
        isDurationExceeded,
        contractType,
        contractualType,
        contractPeriod,
        penalty,
        contractTermination,
        regulations,
        torItems,
        terItems,
        selectedKBLICodes,
        selectedBrands
      }
    };
    
    localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(draftData));
    setDraftSavedAt(new Date().toLocaleTimeString());
    setHasDraft(true);
    
    toast.success('Draft saved successfully', {
      description: `Saved at ${new Date().toLocaleTimeString()}`
    });
  };
  
  const loadDraft = () => {
    try {
      const stored = localStorage.getItem(DRAFT_STORAGE_KEY);
      if (!stored) return false;
      
      const draft = JSON.parse(stored);
      const data = draft.data;
      
      // Populate all fields
      setProposalNo(data.proposalNo || '');
      setCreatedDate(data.createdDate || new Date().toISOString().split('T')[0]);
      setJobsite(data.jobsite || '');
      setDepartment(data.department || '');
      setWorkLocation(data.workLocation || '');
      setCustomWorkLocation(data.customWorkLocation || '');
      setTitle(data.title || '');
      setProcurementObjective(data.procurementObjective || '');
      setSelectedCategories(data.selectedCategories || []);
      setSelectedClassifications(data.selectedClassifications || []);
      setSelectedSubClassifications(data.selectedSubClassifications || []);
      setScopeOfWork(data.scopeOfWork || '');
      setAnalysis(data.analysis || '');
      setFundingBudget(data.fundingBudget || false);
      setFundingNonBudget(data.fundingNonBudget || false);
      setBudgetItems(data.budgetItems || []);
      setEstimatedCost(data.estimatedCost || '');
      setEstimatedCostDisplay(data.estimatedCostDisplay || '');
      setDurationMonths(data.durationMonths || '');
      setMatrixConditionValues(data.matrixConditionValues || {});
      setIsTransactionValueExceeded(data.isTransactionValueExceeded || false);
      setIsDurationExceeded(data.isDurationExceeded || false);
      setContractType(data.contractType || 'Non-Contractual');
      setContractualType(data.contractualType || '');
      setContractPeriod(data.contractPeriod || '');
      setPenalty(data.penalty || '');
      setContractTermination(data.contractTermination || '');
      setRegulations(data.regulations || '');
      setTorItems(data.torItems || initializeTORItems());
      setTerItems(data.terItems || initializeTERItems());
      setSelectedKBLICodes(data.selectedKBLICodes || []);
      setSelectedBrands(data.selectedBrands || []);
      setActiveTab(draft.activeTab || 'general');
      
      setDraftSavedAt(new Date(draft.savedAt).toLocaleString());
      setHasDraft(true);
      
      toast.success('Draft loaded successfully', {
        description: `Last saved: ${new Date(draft.savedAt).toLocaleString()}`
      });
      
      return true;
    } catch (error) {
      console.error('Error loading draft:', error);
      return false;
    }
  };
  
  const clearDraft = () => {
    localStorage.removeItem(DRAFT_STORAGE_KEY);
    setHasDraft(false);
    setDraftSavedAt('');
  };
  
  // Check for existing draft on mount
  useEffect(() => {
    if (!proposal) { // Only check draft if not editing existing proposal
      const stored = localStorage.getItem(DRAFT_STORAGE_KEY);
      if (stored) {
        setHasDraft(true);
        const draft = JSON.parse(stored);
        setDraftSavedAt(new Date(draft.savedAt).toLocaleString());
      }
    }
  }, []);
  
  // Dynamic Matrix Contract Conditions
  const [matrixConditions, setMatrixConditions] = useState<MatrixContractCondition[]>([]);
  const [matrixConditionValues, setMatrixConditionValues] = useState<Record<string, boolean>>({});
  
  // Auto-condition for Transaction Value > USD 200,000
  const [isTransactionValueExceeded, setIsTransactionValueExceeded] = useState(false);
  
  // Duration for service items (in months)
  const [durationMonths, setDurationMonths] = useState('');
  const [isDurationExceeded, setIsDurationExceeded] = useState(false);
  
  // Contract Type (auto-determined)
  const [contractType, setContractType] = useState<'Contractual' | 'Non-Contractual'>('Non-Contractual');
  const [contractualType, setContractualType] = useState('');
  
  // New Fields
  const [contractPeriod, setContractPeriod] = useState('');
  const [penalty, setPenalty] = useState('');
  const [contractTermination, setContractTermination] = useState('');
  const [regulations, setRegulations] = useState('');
  
  // Initialize TOR/TER items dynamically from definitions
  const initializeTORItems = (): TORItem[] => {
    const torDefinitions = getActiveTORDefinitions();
    return torDefinitions.map(def => ({
      id: def.code,
      label: def.label,
      enabled: false,
      parameter: '',
      requirement: '',
      description: '',
      remarks: '',
    }));
  };
  
  const initializeTERItems = (): TERItem[] => {
    const terDefinitions = getActiveTERDefinitions();
    return terDefinitions.map(def => ({
      id: def.code,
      label: def.label,
      enabled: false,
      parameter: '',
      requirement: '',
      description: '',
      remarks: '',
      uploadedFile: null,
    }));
  };
  
  // Terms of Reference (TOR) with detailed fields
  const [torItems, setTorItems] = useState<TORItem[]>(initializeTORItems);
  
  // Technical Requirements (TER) with detailed fields
  const [terItems, setTerItems] = useState<TERItem[]>(initializeTERItems);
  
  // ✅ VENDOR RECOMMENDATION SYSTEM (uses selectedKBLICodes and selectedBrands from above)
  const [recommendedVendors, setRecommendedVendors] = useState<RecommendedVendor[]>([]);
  
  // Proposal Status
  const [proposalStatus, setProposalStatus] = useState<'draft' | 'submitted'>('draft');
  
  // Load dynamic matrix conditions on mount
  useEffect(() => {
    const activeConditions = getActiveMatrixConditions();
    setMatrixConditions(activeConditions);
    
    // Initialize values to false
    const initialValues: Record<string, boolean> = {};
    activeConditions.forEach(condition => {
      initialValues[condition.code] = false;
    });
    setMatrixConditionValues(initialValues);
  }, []);
  
  // Auto-check Transaction Value condition when Estimated Cost > USD 200,000
  useEffect(() => {
    const costValue = parseFloat(estimatedCost) || 0;
    setIsTransactionValueExceeded(costValue > 200000);
  }, [estimatedCost]);
  
  // Auto-check Duration condition when Duration > 6 months
  useEffect(() => {
    const duration = parseFloat(durationMonths) || 0;
    setIsDurationExceeded(duration > 6);
  }, [durationMonths]);
  
  // Auto-generate proposal number when jobsite and department are selected
  useEffect(() => {
    if (jobsite && department && !proposal) {
      const generatedNo = generateProposalNumber(jobsite, department, existingProposals);
      setProposalNo(generatedNo);
    }
  }, [jobsite, department, proposal, existingProposals]);
  
  // ✅ HELPER: Get combined KBLI codes (System Data + Vendor Database)
  const getCombinedKBLICodes = (subClassifications: SubClassification[]) => {
    const systemKBLI = getActiveKBLICodes(); // From System Data Management
    const vendorKBLI = getRelevantKBLICodes(subClassifications); // From Vendor Database
    
    // Merge and deduplicate by code
    const kbliMap = new Map<string, string>();
    
    // Add system KBLI first (priority)
    systemKBLI.forEach(kbli => {
      kbliMap.set(kbli.code, kbli.description);
    });
    
    // Add vendor KBLI (if not already in system)
    vendorKBLI.forEach(kbli => {
      if (!kbliMap.has(kbli.code)) {
        kbliMap.set(kbli.code, kbli.description);
      }
    });
    
    return Array.from(kbliMap.entries())
      .map(([code, description]) => ({ code, description }))
      .sort((a, b) => a.code.localeCompare(b.code));
  };
  
  
  // Update available classifications when categories change
  useEffect(() => {
    updateAvailableClassifications(selectedCategories);
  }, [selectedCategories]);
  
  // Update available sub-classifications when classifications change
  useEffect(() => {
    updateAvailableSubClassifications(selectedClassifications);
  }, [selectedClassifications]);
  
  // Auto-determine contract type based on dynamic matrix conditions AND auto-conditions
  useEffect(() => {
    const anyConditionTrue = Object.values(matrixConditionValues).some(value => value === true) || isTransactionValueExceeded || isDurationExceeded;
    setContractType(anyConditionTrue ? 'Contractual' : 'Non-Contractual');
  }, [matrixConditionValues, isTransactionValueExceeded, isDurationExceeded]);
  
  // Handle category selection (multiple)
  const handleCategoryToggle = (category: Category) => {
    const isSelected = selectedCategories.some(c => c.code === category.code);
    
    if (isSelected) {
      // Remove category and its related classifications/sub-classifications
      const newCategories = selectedCategories.filter(c => c.code !== category.code);
      setSelectedCategories(newCategories);
      
      // Remove classifications from this category
      const newClassifications = selectedClassifications.filter(
        cl => !category.classifications.some(catCl => catCl.code === cl.code)
      );
      setSelectedClassifications(newClassifications);
      
      // Remove sub-classifications from this category
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
      // Add category
      setSelectedCategories([...selectedCategories, category]);
    }
    
    // Update available classifications from all selected categories
    updateAvailableClassifications([...selectedCategories.filter(c => c.code !== category.code), ...(isSelected ? [] : [category])]);
  };
  
  // Handle classification selection (multiple)
  const handleClassificationToggle = (classification: Classification) => {
    const isSelected = selectedClassifications.some(c => c.code === classification.code);
    
    if (isSelected) {
      // Remove classification and its sub-classifications
      const newClassifications = selectedClassifications.filter(c => c.code !== classification.code);
      setSelectedClassifications(newClassifications);
      
      // Remove sub-classifications from this classification
      const newSubClassifications = selectedSubClassifications.filter(
        sub => !classification.subClassifications.some(clSub => clSub.code === sub.code)
      );
      setSelectedSubClassifications(newSubClassifications);
    } else {
      // Add classification
      setSelectedClassifications([...selectedClassifications, classification]);
    }
    
    // Update available sub-classifications from all selected classifications
    updateAvailableSubClassifications([...selectedClassifications.filter(c => c.code !== classification.code), ...(isSelected ? [] : [classification])]);
  };
  
  // Handle sub-classification selection (multiple)
  const handleSubClassificationToggle = (subClassification: SubClassification) => {
    const isSelected = selectedSubClassifications.some(s => s.code === subClassification.code);
    
    const newSubClassifications = isSelected
      ? selectedSubClassifications.filter(s => s.code !== subClassification.code)
      : [...selectedSubClassifications, subClassification];
    
    setSelectedSubClassifications(newSubClassifications);
    
    // Auto-populate TOR/TER when sub-classifications change
    handleTORTERAutoPopulate(newSubClassifications);
  };
  
  // Update available classifications based on selected categories
  const updateAvailableClassifications = (categories: Category[]) => {
    const allClassifications = categories
      .filter(cat => cat && cat.classifications)
      .flatMap(cat => cat.classifications)
      .filter(cls => cls && cls.code);
    setAvailableClassifications(allClassifications);
  };
  
  // Update available sub-classifications based on selected classifications
  const updateAvailableSubClassifications = (classifications: Classification[]) => {
    const allSubClassifications = classifications
      .filter(cl => cl && cl.subClassifications)
      .flatMap(cl => cl.subClassifications)
      .filter(sub => sub && sub.code);
    setAvailableSubClassifications(allSubClassifications);
  };
  
  // ✅ UPDATED: Handle TOR/TER auto-populate with FULL DEFAULTS from matrix (Nov 12, 2025)
  const handleTORTERAutoPopulate = (subClassifications: SubClassification[]) => {
    if (subClassifications.length === 0) {
      // Reset if no sub-classifications selected
      setTorItems(initializeTORItems());
      setTerItems(initializeTERItems());
      return;
    }
    
    // Use FIRST sub-classification for detailed defaults
    // (If multiple selected, we use the primary/first one for template)
    const primarySubClass = subClassifications[0];
    const torDefinitions = getActiveTORDefinitions();
    const terDefinitions = getActiveTERDefinitions();
    
    // ✅ Populate TOR items with defaults from matrix
    const populatedTORItems = populateTORItemsWithDefaults(primarySubClass.code, torDefinitions);
    setTorItems(populatedTORItems);
    
    // ✅ Populate TER items with defaults from matrix
    const populatedTERItems = populateTERItemsWithDefaults(primarySubClass.code, terDefinitions);
    setTerItems(populatedTERItems);
    
    // Update procurement objective with description (only if empty)
    const matrixEntry = getMatrixBySubClassification(primarySubClass.code);
    if (matrixEntry && matrixEntry.description && !procurementObjective.trim()) {
      setProcurementObjective(matrixEntry.description);
    }
    
    // Show success notification
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
  
  // Keep old handler for backward compatibility (now unused)
  const handleSubClassificationChange_OLD = (subClassificationCode: string) => {
    // Auto-populate TOR/TER based on matrix
    const matrixEntry = getMatrixBySubClassification(subClassificationCode);
    
    if (matrixEntry) {
      // Update description
      setProcurementObjective(matrixEntry.description);
      
      // Update TOR items based on matrix - only set enabled if showInTOR is true
      const updatedTorItems = torItems.map(item => {
        if (matrixEntry.showInTOR && matrixEntry.torItems) {
          const itemKey = item.id as keyof typeof matrixEntry.torItems;
          const shouldEnable = matrixEntry.torItems?.[itemKey] || false;
          
          return {
            ...item,
            enabled: shouldEnable,
            description: shouldEnable ? matrixEntry.description : '',
          };
        } else {
          // If showInTOR is false, disable the item
          return {
            ...item,
            enabled: false,
            parameter: '',
            requirement: '',
            description: '',
            remarks: '',
          };
        }
      });
      setTorItems(updatedTorItems);
      
      // Update TER items based on matrix - only set enabled if showInTER is true
      const updatedTerItems = terItems.map(item => {
        if (matrixEntry.showInTER && matrixEntry.terItems) {
          const itemKey = item.id as keyof typeof matrixEntry.terItems;
          const shouldEnable = matrixEntry.terItems?.[itemKey] || false;
          
          return {
            ...item,
            enabled: shouldEnable,
            description: shouldEnable ? matrixEntry.description : '',
          };
        } else {
          // If showInTER is false, disable the item
          return {
            ...item,
            enabled: false,
            parameter: '',
            requirement: '',
            description: '',
            remarks: '',
          };
        }
      });
      setTerItems(updatedTerItems);
      
      toast.success(`TOR/TER auto-populated based on matrix for ${subClassificationCode}`, {
        description: matrixEntry.description,
      });
    } else {
      // No matrix entry found - keep items available but unchecked for manual addition
      const resetTorItems = torItems.map(item => ({
        ...item,
        enabled: false,
        parameter: '',
        requirement: '',
        description: '',
        remarks: '',
      }));
      setTorItems(resetTorItems);
      
      const resetTerItems = terItems.map(item => ({
        ...item,
        enabled: false,
        parameter: '',
        requirement: '',
        description: '',
        remarks: '',
        uploadedFile: null,
      }));
      setTerItems(resetTerItems);
      
      toast.info('No matrix configuration found. You can manually select TOR/TER items.');
    }
  };
  
  // Handle file upload
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
  
  // Remove uploaded file
  const removeFile = (index: number) => {
    setUploadedFiles(uploadedFiles.filter((_, i) => i !== index));
  };
  
  // ✅ Auto-enable KBLI when sub-classifications are selected
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
  
  // ✅ COMPREHENSIVE: Load ALL data from existing proposal when editing (Nov 13, 2025 FIX)
  useEffect(() => {
    if (proposal) {
      console.log('📝 [EDIT MODE] Loading existing proposal data:', proposal);
      
      // Load KBLI codes and brands
      if (proposal.kbliCodes && proposal.kbliCodes.length > 0) {
        setSelectedKBLICodes(proposal.kbliCodes);
      }
      if (proposal.brandSpecifications && proposal.brandSpecifications.length > 0) {
        setSelectedBrands(proposal.brandSpecifications);
      }
      
      // Load category hierarchy data
      if (proposal.categories && proposal.categories.length > 0) {
        setSelectedCategories(proposal.categories as Category[]);
      }
      if (proposal.classifications && proposal.classifications.length > 0) {
        setSelectedClassifications(proposal.classifications as Classification[]);
      }
      if (proposal.subClassifications && proposal.subClassifications.length > 0) {
        setSelectedSubClassifications(proposal.subClassifications as SubClassification[]);
      }
      
      // Load work location
      if (proposal.workLocation) {
        const isCustomLocation = !workLocationOptions.some(opt => opt === proposal.workLocation);
        if (isCustomLocation) {
          setWorkLocation('Other');
          setCustomWorkLocation(proposal.workLocation);
        } else {
          setWorkLocation(proposal.workLocation);
        }
      }
      
      // Load scope of work and analysis
      if (proposal.scopeOfWork) {
        setScopeOfWork(proposal.scopeOfWork);
      }
      if (proposal.analysis) {
        setAnalysis(proposal.analysis);
      }
      
      // Load funding sources
      if (proposal.fundingBudget !== undefined) {
        setFundingBudget(proposal.fundingBudget);
      }
      if (proposal.fundingNonBudget !== undefined) {
        setFundingNonBudget(proposal.fundingNonBudget);
      }
      
      // Load contract-related fields
      if (proposal.durationMonths) {
        setDurationMonths(proposal.durationMonths.toString());
      }
      if (proposal.contractType) {
        setContractType(proposal.contractType);
      }
      if (proposal.contractualType) {
        setContractualType(proposal.contractualType);
      }
      if (proposal.contractPeriod) {
        setContractPeriod(proposal.contractPeriod);
      }
      if (proposal.penalty) {
        setPenalty(proposal.penalty);
      }
      if (proposal.contractTermination) {
        setContractTermination(proposal.contractTermination);
      }
      if (proposal.regulations) {
        setRegulations(proposal.regulations);
      }
      
      // Load matrix conditions
      if (proposal.matrixConditions) {
        setMatrixConditionValues(proposal.matrixConditions);
      }
      if (proposal.isTransactionValueExceeded !== undefined) {
        setIsTransactionValueExceeded(proposal.isTransactionValueExceeded);
      }
      if (proposal.isDurationExceeded !== undefined) {
        setIsDurationExceeded(proposal.isDurationExceeded);
      }
      
      // Load TOR items
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
      
      // Load TER items
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
              uploadedFile: null, // File objects can't be persisted
            };
          }
          return defaultItem;
        });
        setTerItems(loadedTerItems);
      }
      
      console.log('✅ [EDIT MODE] All proposal data loaded successfully');
    }
  }, [proposal]);
  
  // Handle TOR item updates
  const updateTORItem = (index: number, field: keyof TORItem, value: string | boolean) => {
    const updated = [...torItems];
    updated[index] = { ...updated[index], [field]: value };
    setTorItems(updated);
    // Note: KBLI and Brand are now handled by separate multi-select state (selectedKBLICodes, selectedBrands)
  };
  
  // Handle TER item updates
  const updateTERItem = (index: number, field: keyof TERItem, value: string | boolean | File | null) => {
    const updated = [...terItems];
    updated[index] = { ...updated[index], [field]: value };
    setTerItems(updated);
  };
  
  // Handle TER file upload
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
  
  // ✅ TAB NAVIGATION HELPERS
  const canNavigateToTOR = () => {
    return proposalNo && jobsite && department && title;
  };
  
  const canNavigateToTER = () => {
    return canNavigateToTOR() && selectedSubClassifications.length > 0;
  };
  
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
  
  // Form validation
  const validateForm = (): boolean => {
    if (!proposalNo) {
      toast.error('Proposal number is required');
      return false;
    }
    
    if (!proposal && !isProposalNumberUnique(proposalNo)) {
      toast.error('Proposal number already exists');
      return false;
    }
    
    if (!jobsite) {
      toast.error('Jobsite must be selected');
      return false;
    }
    
    if (!department) {
      toast.error('Department must be selected');
      return false;
    }
    
    if (!workLocation && !customWorkLocation) {
      toast.error('Work location is required');
      return false;
    }
    
    if (!title) {
      toast.error('Title is required');
      return false;
    }
    
    if (selectedCategories.length === 0) {
      toast.error('At least one category must be selected');
      return false;
    }
    
    if (selectedClassifications.length === 0) {
      toast.error('At least one classification must be selected');
      return false;
    }
    
    if (selectedSubClassifications.length === 0) {
      toast.error('At least one sub-classification must be selected');
      return false;
    }
    
    if (!estimatedCost || parseFloat(estimatedCost) <= 0) {
      toast.error('Valid estimated cost is required');
      return false;
    }
    
    if (!fundingBudget && !fundingNonBudget) {
      toast.error('Please select at least one funding source');
      return false;
    }
    
    return true;
  };
  
  // Handle draft save
  const handleSaveDraft = () => {
    // ✅ Extract and merge KBLI/Brands from both sources
    const finalKBLICodes = [...new Set([...selectedKBLICodes, ...extractKBLICodesFromTOR()])];
    const finalBrands = [...new Set([...selectedBrands, ...extractBrandsFromTOR()])];
    
    // ✅ SYNC: Update TOR items requirement field with selected KBLI/Brands (Nov 12, 2025 FIX)
    const syncedTorItems = torItems.map(item => {
      if (item.id === 'KBLI' && item.enabled && finalKBLICodes.length > 0) {
        return {
          ...item,
          requirement: finalKBLICodes.join(', ')
        };
      }
      if (item.id === 'brandSpec' && item.enabled && finalBrands.length > 0) {
        return {
          ...item,
          requirement: finalBrands.join(', ')
        };
      }
      return item;
    });
    
    // ✅ AUTO-FETCH RECOMMENDED VENDORS FOR DRAFT (Nov 13, 2025)
    console.log('💾 [DRAFT SAVE] Auto-fetching recommended vendors...');
    
    const recommendedVendorsResult = getRecommendedVendors({
      subClassifications: selectedSubClassifications,
      kbliCodes: finalKBLICodes,
      brands: finalBrands
    });
    
    console.log('✅ [DRAFT SAVE] Found recommended vendors:', recommendedVendorsResult.length);
    
    // ✅ Convert recommended vendors to AddedVendorDetail format (Nov 13, 2025 FIX)
    const recommendedVendorsList = recommendedVendorsResult.map(r => ({
      vendorName: r.vendor.vendorName,
      contactPerson: r.vendor.contactPerson,
      phoneNumber: r.vendor.contactPhone, // ✅ FIXED: contactPhone -> phoneNumber
      email: r.vendor.contactEmail // ✅ FIXED: contactEmail -> email
    }));
    
    const proposalData = {
      id: proposal?.id, // ✅ Include ID if editing (Nov 13, 2025 FIX)
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
      matrixConditions: matrixConditionValues, // Dynamic matrix conditions
      isTransactionValueExceeded, // Auto-condition for Transaction Value > USD 200,000
      isDurationExceeded, // Auto-condition for Duration > 6 months
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
        totalPrice: (item.qty || 0) * (item.estimatedPrice || 0), // Calculate totalPrice
        quantity: item.qty, // Add quantity alias
        unitPrice: item.estimatedPrice // Add unitPrice alias
      })),
      kbliCodes: finalKBLICodes, // ✅ FIXED - Merged from both sources (Nov 12, 2025)
      brandSpecifications: finalBrands, // ✅ FIXED - Merged from both sources (Nov 12, 2025)
      recommendedVendors: recommendedVendorsList, // ✅ NEW: Auto-fetched vendors (Nov 13, 2025)
      additionalVendors: proposal?.additionalVendors || [], // ✅ Preserve existing additional vendors
    };
    
    // Save proposal as draft
    if (onSave) {
      onSave(proposalData, true); // true = draft
    }
    
    toast.success('Proposal saved as draft!', {
      description: recommendedVendorsList.length > 0 
        ? `Draft saved with ${recommendedVendorsList.length} recommended vendor(s).`
        : 'You can continue editing later.',
    });
    
    // ✅ FIX (Nov 13): Close dialog immediately after save
    onClose();
  };
  
  // ✅ Extract KBLI codes from TOR items (Nov 12, 2025 - FIX)
  const extractKBLICodesFromTOR = (): string[] => {
    const kbliItem = torItems.find(item => item.id === 'KBLI' && item.enabled);
    if (kbliItem && kbliItem.requirement) {
      // Parse comma-separated KBLI codes
      return kbliItem.requirement.split(',').map(c => c.trim()).filter(c => c);
    }
    return [];
  };
  
  // ✅ Extract brands from TOR items (Nov 12, 2025 - FIX)
  const extractBrandsFromTOR = (): string[] => {
    const brandItem = torItems.find(item => item.id === 'brandSpec' && item.enabled);
    if (brandItem && brandItem.requirement) {
      // Parse comma-separated brands
      return brandItem.requirement.split(',').map(b => b.trim()).filter(b => b);
    }
    return [];
  };

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    // ✅ Extract KBLI and brands from TOR items (in case they were manually entered)
    const finalKBLICodes = [...new Set([...selectedKBLICodes, ...extractKBLICodesFromTOR()])];
    const finalBrands = [...new Set([...selectedBrands, ...extractBrandsFromTOR()])];
    
    // ✅ SYNC: Update TOR items requirement field with selected KBLI/Brands (Nov 12, 2025 FIX)
    const syncedTorItems = torItems.map(item => {
      if (item.id === 'KBLI' && item.enabled && finalKBLICodes.length > 0) {
        return {
          ...item,
          requirement: finalKBLICodes.join(', ') // "46591, 46599"
        };
      }
      if (item.id === 'brandSpec' && item.enabled && finalBrands.length > 0) {
        return {
          ...item,
          requirement: finalBrands.join(', ') // "SKF, NSK, Timken"
        };
      }
      return item;
    });
    
    // ✅ AUTO-FETCH RECOMMENDED VENDORS (Nov 13, 2025)
    console.log('🚀 [PROPOSAL SUBMIT] Auto-fetching recommended vendors...');
    console.log('📋 [PROPOSAL SUBMIT] Sub-classifications:', selectedSubClassifications);
    console.log('📋 [PROPOSAL SUBMIT] KBLI codes:', finalKBLICodes);
    console.log('📋 [PROPOSAL SUBMIT] Brands:', finalBrands);
    
    const recommendedVendorsResult = getRecommendedVendors({
      subClassifications: selectedSubClassifications,
      kbliCodes: finalKBLICodes,
      brands: finalBrands
    });
    
    console.log('✅ [PROPOSAL SUBMIT] Found recommended vendors:', recommendedVendorsResult.length);
    console.log('✅ [PROPOSAL SUBMIT] Vendor details:', recommendedVendorsResult.map(r => ({
      name: r.vendor.vendorName,
      matchCount: r.matchDetails.matchCount,
      subClassMatch: r.matchDetails.subClassificationMatch,
      kbliMatch: r.matchDetails.kbliMatch,
      brandMatch: r.matchDetails.brandMatch
    })));
    
    // ✅ Convert recommended vendors to AddedVendorDetail format (Nov 13, 2025 FIX)
    const recommendedVendorsList = recommendedVendorsResult.map(r => ({
      vendorName: r.vendor.vendorName,
      contactPerson: r.vendor.contactPerson,
      phoneNumber: r.vendor.contactPhone, // ✅ FIXED: contactPhone -> phoneNumber
      email: r.vendor.contactEmail // ✅ FIXED: contactEmail -> email
    }));
    
    const proposalData = {
      id: proposal?.id, // ✅ Include ID if editing (Nov 13, 2025 FIX)
      proposalNo,
      createdDate,
      jobsite: jobsite as Jobsite,
      department: department as Department,
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
      matrixConditions: matrixConditionValues, // Dynamic matrix conditions
      isTransactionValueExceeded, // Auto-condition for Transaction Value > USD 200,000
      isDurationExceeded, // Auto-condition for Duration > 6 months
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
      uploadedFiles: uploadedFiles.map(f => f.name),
      budgetItems: budgetItems.map(item => ({
        ...item,
        totalPrice: (item.qty || 0) * (item.estimatedPrice || 0), // Calculate totalPrice
        quantity: item.qty, // Add quantity alias
        unitPrice: item.estimatedPrice // Add unitPrice alias
      })),
      kbliCodes: finalKBLICodes, // ✅ FIXED - Merged from both sources
      brandSpecifications: finalBrands, // ✅ FIXED - Merged from both sources
      recommendedVendors: recommendedVendorsList, // ✅ NEW: Auto-fetched vendors (Nov 13, 2025)
      additionalVendors: proposal?.additionalVendors || [], // ✅ Preserve existing additional vendors
    };
    
    // Save proposal (submitted)
    if (onSave) {
      onSave(proposalData, false); // false = submitted
    }
    
    // ✅ Clear draft after successful submit
    clearDraft();
    
    // ✅ RESUBMIT: Show special message for rejected proposals being resubmitted
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
    
    // ✅ FIX (Nov 13): Close dialog immediately after submit
    onClose();
  };

  return (
    <div className="space-y-4">
      {/* ✅ DRAFT STATUS BADGE */}
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

      {/* ✅ PROGRESS INDICATOR */}
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

      {/* ✅ 3-TAB STRUCTURE */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-4">
          <TabsTrigger value="general">
            1. General Information
          </TabsTrigger>
          <TabsTrigger 
            value="tor" 
            disabled={!canNavigateToTOR()}
          >
            2. Terms of Reference
          </TabsTrigger>
          <TabsTrigger 
            value="ter" 
            disabled={!canNavigateToTER()}
          >
            3. Technical Evaluation
          </TabsTrigger>
        </TabsList>

        {/* ================== TAB 1: GENERAL INFORMATION ================== */}
        <TabsContent value="general" className="space-y-6 mt-0">
      {/* Basic Information - ONE COLUMN VERTICAL COMPACT LAYOUT */}
      <div className="space-y-3 bg-white border rounded-lg p-6">
        <h3 className="text-lg text-gray-900 border-b pb-2 mb-3">Basic Information</h3>
        
        {/* Proposal Number */}
        <div className="space-y-1.5">
          <Label htmlFor="proposalNo">Proposal Number *</Label>
          <Input
            id="proposalNo"
            value={proposalNo}
            onChange={(e) => setProposalNo(e.target.value)}
            placeholder="Auto-generated"
            disabled={!!proposal}
            className="bg-gray-50"
          />
        </div>
        
        {/* Date */}
        <div className="space-y-1.5">
          <Label htmlFor="createdDate">Date *</Label>
          <Input
            id="createdDate"
            type="date"
            value={createdDate}
            onChange={(e) => setCreatedDate(e.target.value)}
            required
          />
        </div>
        
        {/* Title */}
        <div className="space-y-1.5">
          <Label htmlFor="title">Title *</Label>
          <Input
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter proposal title"
            required
          />
        </div>
        
        {/* Department (Plant) - SHOWN FIRST */}
        <div className="space-y-1.5">
          <Label htmlFor="department">Department (Plant) *</Label>
          <Select value={department} onValueChange={(value) => setDepartment(value as Department)}>
            <SelectTrigger>
              <SelectValue placeholder="Select department" />
            </SelectTrigger>
            <SelectContent>
              {departments.map((dept) => (
                <SelectItem key={dept} value={dept}>{dept}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        {/* Jobsite - SHOWN AFTER DEPARTMENT */}
        <div className="space-y-1.5">
          <Label htmlFor="jobsite">Jobsite *</Label>
          <Select value={jobsite} onValueChange={(value) => setJobsite(value as Jobsite)}>
            <SelectTrigger>
              <SelectValue placeholder="Select jobsite" />
            </SelectTrigger>
            <SelectContent>
              {jobsites.map((js) => (
                <SelectItem key={js} value={js}>{js}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        {/* Work Location */}
        <div className="space-y-1.5">
          <Label htmlFor="workLocation">Work Location *</Label>
          <div className="space-y-2">
            <Select value={workLocation} onValueChange={setWorkLocation}>
              <SelectTrigger>
                <SelectValue placeholder="Select location" />
              </SelectTrigger>
              <SelectContent>
                {workLocationOptions.map((loc) => (
                  <SelectItem key={loc} value={loc}>{loc}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            {workLocation === 'Custom Location' && (
              <Input
                value={customWorkLocation}
                onChange={(e) => setCustomWorkLocation(e.target.value)}
                placeholder="Enter custom location"
              />
            )}
          </div>
        </div>
        
        {/* Procurement Objective */}
        <div className="space-y-1.5">
          <Label htmlFor="procurementObjective">Procurement Objective</Label>
          <Textarea
            id="procurementObjective"
            value={procurementObjective}
            onChange={(e) => setProcurementObjective(e.target.value)}
            placeholder="Describe the procurement objective"
            rows={3}
          />
        </div>
      </div>
      
      {/* Category Classification - Multiple Selection */}
      <div className="space-y-3 bg-white border rounded-lg p-6">
        <h3 className="text-lg text-gray-900 border-b pb-2">Category Classification</h3>
        <p className="text-sm text-gray-600">Select one or more items at each level</p>
        
        {/* Categories */}
        <div className="space-y-1.5">
          <Label htmlFor="category">Category *</Label>
          <Select 
            value="" 
            onValueChange={(value) => {
              const category = categoryHierarchy.find(c => c.code === value);
              if (category) handleCategoryToggle(category);
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select category to add" />
            </SelectTrigger>
            <SelectContent>
              {categoryHierarchy
                .filter(cat => cat && cat.code)
                .filter(cat => !selectedCategories.some(c => c && c.code === cat.code))
                .map((cat) => (
                  <SelectItem key={cat.code} value={cat.code}>
                    {cat.code} - {cat.name}
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>
          
          {selectedCategories.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2 p-3 bg-blue-50 rounded-lg border border-blue-200">
              {selectedCategories.filter(cat => cat && cat.code).map(cat => (
                <span 
                  key={cat.code} 
                  className="inline-flex items-center gap-2 px-3 py-1.5 bg-white text-blue-900 text-sm rounded-md border border-blue-300 shadow-sm"
                >
                  <span className="font-medium">{cat.code}</span>
                  <span className="text-blue-700">·</span>
                  <span>{cat.name}</span>
                  <X 
                    className="w-4 h-4 cursor-pointer hover:text-red-600 ml-1" 
                    onClick={() => handleCategoryToggle(cat)}
                  />
                </span>
              ))}
            </div>
          )}
        </div>
        
        {/* Classifications - Only show if categories selected */}
        {selectedCategories.length > 0 && (
          <div className="space-y-1.5">
            <Label htmlFor="classification">Classification *</Label>
            <Select 
              value="" 
              onValueChange={(value) => {
                const classification = availableClassifications.find(c => c.code === value);
                if (classification) handleClassificationToggle(classification);
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select classification to add" />
              </SelectTrigger>
              <SelectContent>
                {availableClassifications
                  .filter(cls => cls && cls.code)
                  .filter(cls => !selectedClassifications.some(c => c && c.code === cls.code))
                  .map((cls) => (
                    <SelectItem key={cls.code} value={cls.code}>
                      {cls.code} - {cls.name}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
            
            {selectedClassifications.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2 p-3 bg-green-50 rounded-lg border border-green-200">
                {selectedClassifications.filter(cls => cls && cls.code).map(cls => (
                  <span 
                    key={cls.code} 
                    className="inline-flex items-center gap-2 px-3 py-1.5 bg-white text-green-900 text-sm rounded-md border border-green-300 shadow-sm"
                  >
                    <span className="font-medium">{cls.code}</span>
                    <span className="text-green-700">·</span>
                    <span>{cls.name}</span>
                    <X 
                      className="w-4 h-4 cursor-pointer hover:text-red-600 ml-1" 
                      onClick={() => handleClassificationToggle(cls)}
                    />
                  </span>
                ))}
              </div>
            )}
          </div>
        )}
        
        {/* Sub-Classifications - Only show if classifications selected */}
        {selectedClassifications.length > 0 && (
          <div className="space-y-1.5">
            <Label htmlFor="subClassification">Sub-Classification *</Label>
            <Select 
              value="" 
              onValueChange={(value) => {
                const subClassification = availableSubClassifications.find(s => s.code === value);
                if (subClassification) handleSubClassificationToggle(subClassification);
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select sub-classification to add" />
              </SelectTrigger>
              <SelectContent>
                {availableSubClassifications
                  .filter(sub => sub && sub.code)
                  .filter(sub => !selectedSubClassifications.some(s => s && s.code === sub.code))
                  .map((sub) => (
                    <SelectItem key={sub.code} value={sub.code}>
                      {sub.code} - {sub.name}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
            
            {selectedSubClassifications.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2 p-3 bg-purple-50 rounded-lg border border-purple-200">
                {selectedSubClassifications.filter(sub => sub && sub.code).map(sub => (
                  <span 
                    key={sub.code} 
                    className="inline-flex items-center gap-2 px-3 py-1.5 bg-white text-purple-900 text-sm rounded-md border border-purple-300 shadow-sm"
                  >
                    <span className="font-medium">{sub.code}</span>
                    <span className="text-purple-700">·</span>
                    <span>{sub.name}</span>
                    <X 
                      className="w-4 h-4 cursor-pointer hover:text-red-600 ml-1" 
                      onClick={() => handleSubClassificationToggle(sub)}
                    />
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
        <Textarea
          value={scopeOfWork}
          onChange={(e) => setScopeOfWork(e.target.value)}
          placeholder="Describe the scope of work in detail..."
          rows={4}
        />
      </div>
      
      {/* Analysis and Benefits */}
      <div className="space-y-3 bg-white border rounded-lg p-6">
        <h3 className="text-lg text-gray-900 border-b pb-2">Analysis and Benefits</h3>
        <Textarea
          value={analysis}
          onChange={(e) => setAnalysis(e.target.value)}
          placeholder="Provide analysis and expected benefits..."
          rows={4}
        />
        
        <div>
          <Label>Upload Supporting Documents (PDF, Word, Excel)</Label>
          <div className="mt-2">
            <label className="flex items-center justify-center w-full h-28 px-4 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
              <div className="flex flex-col items-center">
                <Upload className="w-7 h-7 text-gray-400 mb-2" />
                <p className="text-sm text-gray-600">Click to upload or drag and drop</p>
                <p className="text-xs text-gray-500">PDF, Word, Excel (Max 10MB each)</p>
              </div>
              <input
                type="file"
                className="hidden"
                multiple
                accept=".pdf,.doc,.docx,.xls,.xlsx"
                onChange={handleFileUpload}
              />
            </label>
          </div>
          
          {uploadedFiles.length > 0 && (
            <div className="mt-3 space-y-2">
              <p className="text-sm text-gray-600">Uploaded Files:</p>
              {uploadedFiles.map((file, index) => (
                <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded border">
                  <span className="text-sm text-gray-700">{file.name}</span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeFile(index)}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      
      {/* Funding Source */}
      <div className="space-y-3 bg-white border rounded-lg p-6">
        <h3 className="text-lg text-gray-900 border-b pb-2">Funding Source *</h3>
        <div className="flex gap-6">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="fundingBudget"
              checked={fundingBudget}
              onCheckedChange={(checked) => setFundingBudget(checked as boolean)}
            />
            <label htmlFor="fundingBudget" className="text-sm cursor-pointer">
              Budget
            </label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="fundingNonBudget"
              checked={fundingNonBudget}
              onCheckedChange={(checked) => setFundingNonBudget(checked as boolean)}
            />
            <label htmlFor="fundingNonBudget" className="text-sm cursor-pointer">
              Non-Budget
            </label>
          </div>
        </div>
      </div>
      
      {/* Cost Estimation */}
      <div className="space-y-3 bg-white border rounded-lg p-6">
        <h3 className="text-lg text-gray-900 border-b pb-2">Cost Estimation</h3>
        
        {/* Estimated Cost */}
        <div className="space-y-1.5">
          <Label htmlFor="estimatedCost">Estimated Cost (USD) *</Label>
          <Input
            id="estimatedCost"
            type="text"
            value={estimatedCostDisplay}
            onChange={(e) => {
              const input = e.target.value;
              // Allow only numbers, commas, and decimal point
              const sanitized = input.replace(/[^\d.,]/g, '');
              
              // Update display value
              setEstimatedCostDisplay(sanitized);
              
              // Parse and store actual numeric value
              const numericValue = parseFormattedNumber(sanitized);
              setEstimatedCost(numericValue.toString());
            }}
            onBlur={() => {
              // Format on blur
              if (estimatedCost) {
                const formatted = formatNumberWithSeparator(estimatedCost);
                setEstimatedCostDisplay(formatted);
              }
            }}
            placeholder="0.00"
            className="text-lg"
            required
          />
          <p className="text-xs text-gray-500">
            Format: 1,000,000.00
          </p>
        </div>
        
        {/* Duration */}
        <div className="space-y-1.5">
          <Label htmlFor="durationMonths">Duration</Label>
          <div className="relative">
            <Input
              id="durationMonths"
              type="number"
              value={durationMonths}
              onChange={(e) => setDurationMonths(e.target.value)}
              placeholder="0"
              min="0"
              step="1"
              className="pr-24 text-lg"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 bg-gray-100 px-3 py-1 rounded text-gray-700">
              months
            </span>
          </div>
        </div>
        
        {/* Budget Button and Actions */}
        <div className="space-y-4 pt-4 border-t border-gray-200">
          <div className="flex items-center gap-3">
            <Button
              type="button"
              onClick={() => setIsBudgetDialogOpen(true)}
              variant="outline"
              className="border-blue-600 text-blue-600 hover:bg-blue-50"
            >
              <FileText className="w-4 h-4 mr-2" />
              Budget {budgetItems.length > 0 && `(${budgetItems.length} items)`}
            </Button>
            {budgetItems.length > 0 && (
              <>
                <div className="h-8 w-px bg-gray-300"></div>
                <Button
                  type="button"
                  onClick={handleExportBudgetExcel}
                  variant="outline"
                  size="sm"
                >
                  <FileSpreadsheet className="w-4 h-4 mr-2" />
                  Export Excel
                </Button>
                <Button
                  type="button"
                  onClick={handleExportBudgetPDF}
                  variant="outline"
                  size="sm"
                >
                  <FileText className="w-4 h-4 mr-2" />
                  Export PDF
                </Button>
                <Button
                  type="button"
                  onClick={() => setShowBudgetPreview(!showBudgetPreview)}
                  variant="outline"
                  size="sm"
                >
                  <Eye className="w-4 h-4 mr-2" />
                  {showBudgetPreview ? 'Hide' : 'Show'} Preview
                </Button>
              </>
            )}
          </div>
          
          {budgetItems.length > 0 && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-blue-900">
                    {budgetItems.length} item{budgetItems.length > 1 ? 's' : ''} selected
                  </p>
                  <p className="text-xs text-blue-700 mt-1">
                    Total Cost: {formatNumberWithSeparator(totalBudgetCost)} USD
                  </p>
                </div>
                <Button
                  type="button"
                  onClick={() => setIsBudgetDialogOpen(true)}
                  variant="ghost"
                  size="sm"
                  className="text-blue-600 hover:text-blue-700"
                >
                  Edit Budget Items
                </Button>
              </div>
            </div>
          )}
          
          {/* Budget Preview */}
          {showBudgetPreview && budgetItems.length > 0 && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-3">
                <Eye className="w-5 h-5 text-yellow-700" />
                <h4 className="text-yellow-900">Budget Items Preview</h4>
              </div>
              <div className="bg-white rounded border border-yellow-300 overflow-hidden">
                <div className="overflow-x-auto max-h-96">
                  <table className="w-full text-sm">
                    <thead className="bg-yellow-100 sticky top-0">
                      <tr>
                        <th className="px-3 py-2 text-left text-yellow-900">Code</th>
                        <th className="px-3 py-2 text-left text-yellow-900">Description</th>
                        <th className="px-3 py-2 text-left text-yellow-900">UoM</th>
                        <th className="px-3 py-2 text-left text-yellow-900">Brand</th>
                        <th className="px-3 py-2 text-right text-yellow-900">Qty</th>
                        <th className="px-3 py-2 text-right text-yellow-900">Price</th>
                        <th className="px-3 py-2 text-right text-yellow-900">Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-yellow-200">
                      {budgetItems.map((item) => (
                        <tr key={item.id} className="hover:bg-yellow-50">
                          <td className="px-3 py-2 text-gray-900">{item.materialCode}</td>
                          <td className="px-3 py-2 text-gray-900">{item.materialDescription}</td>
                          <td className="px-3 py-2 text-gray-600">{item.uom}</td>
                          <td className="px-3 py-2 text-gray-600">{item.brand}</td>
                          <td className="px-3 py-2 text-right text-gray-600">{item.qty}</td>
                          <td className="px-3 py-2 text-right text-gray-600">
                            {formatNumberWithSeparator(item.estimatedPrice)}
                          </td>
                          <td className="px-3 py-2 text-right text-gray-900">
                            {formatNumberWithSeparator(item.qty * item.estimatedPrice)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot className="bg-yellow-100">
                      <tr>
                        <td colSpan={6} className="px-3 py-2 text-right text-yellow-900">
                          <strong>Total Estimated Cost:</strong>
                        </td>
                        <td className="px-3 py-2 text-right text-yellow-900">
                          <strong>{formatNumberWithSeparator(totalBudgetCost)}</strong>
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>
              <div className="mt-3 flex gap-2">
                <Button
                  type="button"
                  onClick={handleExportBudgetExcel}
                  variant="outline"
                  size="sm"
                  className="bg-white"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Save as Excel
                </Button>
                <Button
                  type="button"
                  onClick={handleExportBudgetPDF}
                  variant="outline"
                  size="sm"
                  className="bg-white"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Save as PDF
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Budget Item Selection Dialog - ✅ FILTERED MATERIALS ONLY */}
      <BudgetItemSelection
        materials={availableMaterials}
        selectedSubClassifications={selectedSubClassifications.map(s => s.name)}
        budgetItems={budgetItems}
        onBudgetItemsChange={setBudgetItems}
        open={isBudgetDialogOpen}
        onOpenChange={setIsBudgetDialogOpen}
        selectedJobsite={jobsite as string}
      />
      
      {/* Matrix Contract - DYNAMIC & VERTICAL LAYOUT */}
      <div className="space-y-3 bg-white border rounded-lg p-6">
        <h3 className="text-lg text-gray-900 border-b pb-2">Matrix Contract Evaluation</h3>
        <p className="text-sm text-gray-600">
          Check any applicable conditions. If any condition is checked, the contract type will be Contractual. If none are checked, it will be Non-Contractual.
        </p>
        
        <div className="space-y-2">
          {/* Auto-Check: Transaction Value > USD 200,000 */}
          <div className={`flex items-start space-x-2 p-3 rounded-lg border-2 ${
            isTransactionValueExceeded 
              ? 'bg-blue-50 border-blue-300' 
              : 'bg-gray-50 border-gray-200'
          }`}>
            <Checkbox
              id="auto-transaction-value"
              checked={isTransactionValueExceeded}
              disabled={true}
              className="disabled:opacity-100 mt-0.5"
            />
            <div className="flex-1">
              <label 
                htmlFor="auto-transaction-value" 
                className={`text-sm flex items-center gap-2 ${
                  isTransactionValueExceeded ? 'text-blue-900' : 'text-gray-600'
                }`}
                title="Automatically checked when Estimated Cost exceeds USD 200,000"
              >
                <span>Transaction Value &gt; USD 200,000</span>
                <Info className="w-4 h-4 text-blue-500" />
                {isTransactionValueExceeded && (
                  <Badge className="bg-blue-600 text-white text-xs ml-2">
                    Auto-Checked
                  </Badge>
                )}
              </label>
              {estimatedCost && parseFloat(estimatedCost) > 0 && (
                <div className={`mt-1 text-xs ${
                  isTransactionValueExceeded ? 'text-blue-700' : 'text-gray-500'
                }`}>
                  Transaction Value = USD {parseFloat(estimatedCost).toLocaleString('en-US', { 
                    minimumFractionDigits: 0, 
                    maximumFractionDigits: 0 
                  })}
                </div>
              )}
            </div>
          </div>
          
          {/* Auto-Check: Duration > 6 months */}
          <div className={`flex items-start space-x-2 p-3 rounded-lg border-2 ${
            isDurationExceeded 
              ? 'bg-green-50 border-green-300' 
              : 'bg-gray-50 border-gray-200'
          }`}>
            <Checkbox
              id="auto-duration"
              checked={isDurationExceeded}
              disabled={true}
              className="disabled:opacity-100 mt-0.5"
            />
            <div className="flex-1">
              <label 
                htmlFor="auto-duration" 
                className={`text-sm flex items-center gap-2 ${
                  isDurationExceeded ? 'text-green-900' : 'text-gray-600'
                }`}
                title="Automatically checked when Duration exceeds 6 months"
              >
                <span>Duration &gt; 6 months for services/active items</span>
                <Info className="w-4 h-4 text-green-500" />
                {isDurationExceeded && (
                  <Badge className="bg-green-600 text-white text-xs ml-2">
                    Auto-Checked
                  </Badge>
                )}
              </label>
              {durationMonths && parseFloat(durationMonths) > 0 && (
                <div className={`mt-1 text-xs ${
                  isDurationExceeded ? 'text-green-700' : 'text-gray-500'
                }`}>
                  Duration = {parseFloat(durationMonths)} months
                </div>
              )}
            </div>
          </div>
          
          {/* Dynamic Matrix Conditions */}
          {matrixConditions.length === 0 ? (
            <div className="text-sm text-gray-500 italic py-4">
              No additional matrix conditions available. Contact administrator to configure conditions.
            </div>
          ) : (
            <>
              {matrixConditions.map((condition) => (
                <div key={condition.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={`matrix-${condition.code}`}
                    checked={matrixConditionValues[condition.code] || false}
                    onCheckedChange={(checked) => {
                      setMatrixConditionValues({
                        ...matrixConditionValues,
                        [condition.code]: checked as boolean,
                      });
                    }}
                  />
                  <label 
                    htmlFor={`matrix-${condition.code}`} 
                    className="text-sm cursor-pointer"
                    title={condition.description}
                  >
                    {condition.label}
                  </label>
                </div>
              ))}
            </>
          )}
        </div>
      </div>
      
      {/* Contract Type - Auto Determined */}
      <div className="space-y-4 bg-white border rounded-lg p-6">
        <h3 className="text-lg text-gray-900 border-b pb-2">Contract Type (Auto-Determined)</h3>
        <div className={`p-4 rounded border-2 ${
          contractType === 'Contractual' 
            ? 'bg-blue-50 border-blue-300' 
            : 'bg-gray-50 border-gray-300'
        }`}>
          <div className="flex items-center gap-3">
            <div className={`w-3 h-3 rounded-full ${
              contractType === 'Contractual' ? 'bg-blue-600' : 'bg-gray-400'
            }`} />
            <p className="text-lg">
              <span className={contractType === 'Contractual' ? 'text-blue-900' : 'text-gray-900'}>
                {contractType}
              </span>
            </p>
          </div>
        </div>
        
        {contractType === 'Contractual' && (
          <div className="mt-3 space-y-1.5">
            <Label htmlFor="contractualType">Contractual Type</Label>
            <Select value={contractualType} onValueChange={setContractualType}>
              <SelectTrigger>
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                {contractualTypeOptions.map((type) => (
                  <SelectItem key={type} value={type}>{type}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
      </div>
      
      {/* Contract Details - Only show if Contractual */}
      {contractType === 'Contractual' && (
        <div className="space-y-3 bg-white border rounded-lg p-6">
          <h3 className="text-lg text-gray-900 border-b pb-2">Contract Details</h3>
          
          <div className="space-y-1.5">
            <Label htmlFor="contractPeriod">Contract Period</Label>
            <Input
              id="contractPeriod"
              value={contractPeriod}
              onChange={(e) => setContractPeriod(e.target.value)}
              placeholder="e.g., 12 months, 2 years"
            />
          </div>
          
          <div className="space-y-1.5">
            <Label htmlFor="penalty">Penalty</Label>
            <Textarea
              id="penalty"
              value={penalty}
              onChange={(e) => setPenalty(e.target.value)}
              placeholder="Describe penalty terms..."
              rows={3}
            />
          </div>
          
          <div className="space-y-1.5">
            <Label htmlFor="contractTermination">Contract Termination</Label>
            <Textarea
              id="contractTermination"
              value={contractTermination}
              onChange={(e) => setContractTermination(e.target.value)}
              placeholder="Describe termination conditions..."
              rows={3}
            />
          </div>
          
          <div className="space-y-1.5">
            <Label htmlFor="regulations">Regulations</Label>
            <Textarea
              id="regulations"
              value={regulations}
              onChange={(e) => setRegulations(e.target.value)}
              placeholder="List applicable regulations..."
              rows={3}
            />
          </div>
        </div>
      )}
      
      {/* ✅ TAB 1 NAVIGATION BUTTONS */}
      <div className="flex justify-between items-center pt-6 border-t bg-white p-4 rounded-lg">
        <div className="flex gap-2">
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
          onClick={() => setActiveTab('tor')}
          disabled={!canNavigateToTOR()}
        >
          Next: Terms of Reference →
        </Button>
      </div>
    </TabsContent>

    {/* ================== TAB 2: TERMS OF REFERENCE ================== */}
    <TabsContent value="tor" className="space-y-6 mt-0">
      {/* Terms of Reference (TOR) */}
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
                  onCheckedChange={(checked) => updateTORItem(index, 'enabled', checked as boolean)}
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
                    
                    {/* ✅ KBLI Multi-Select - Dropdown + Add System */}
                    {item.id === 'KBLI' ? (
                      <div className="space-y-2">
                        {/* ⚠️ Warning if no KBLI selected */}
                        {selectedKBLICodes.length === 0 && (
                          <div className="flex items-start gap-2 p-3 bg-yellow-50 border border-yellow-300 rounded-lg">
                            <AlertCircle className="w-4 h-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                            <div className="text-sm text-yellow-800">
                              <strong>Required:</strong> Please select at least one KBLI code from the dropdown below
                            </div>
                          </div>
                        )}
                        
                        {/* Selected KBLI Badges */}
                        {selectedKBLICodes.length > 0 && (
                          <div className="space-y-1">
                            <div className="text-xs text-green-700 flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3" />
                              <span>{selectedKBLICodes.length} KBLI code{selectedKBLICodes.length > 1 ? 's' : ''} selected</span>
                            </div>
                            <div className="flex flex-wrap gap-1 p-3 bg-green-50 border border-green-200 rounded-lg">
                              {selectedKBLICodes.map(code => {
                                return (
                                  <div key={code} className="inline-flex items-center gap-1.5 px-2 py-1 bg-green-100 text-green-800 border border-green-300 rounded-md text-xs">
                                    <span>{getKBLIDisplay(code)}</span>
                                    <button
                                      type="button"
                                      className="inline-flex items-center justify-center w-3.5 h-3.5 cursor-pointer hover:bg-green-200 rounded transition-colors"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setSelectedKBLICodes(selectedKBLICodes.filter(k => k !== code));
                                        toast.success('KBLI code removed');
                                      }}
                                      aria-label="Remove KBLI code"
                                    >
                                      <X className="w-3 h-3" />
                                    </button>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}
                        
                        {/* Dropdown + Add Button */}
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
                                toast.success('KBLI code added');
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
                      /* ✅ Brand Specification Multi-Select - Dropdown + Add System */
                      <div className="space-y-2">
                        {/* ℹ️ Info if no brand selected (optional) */}
                        {selectedBrands.length === 0 && (
                          <div className="flex items-start gap-2 p-3 bg-blue-50 border border-blue-300 rounded-lg">
                            <Info className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                            <div className="text-sm text-blue-800">
                              <strong>Optional:</strong> Select brands if you have specific brand requirements
                            </div>
                          </div>
                        )}
                        
                        {/* Selected Brand Badges */}
                        {selectedBrands.length > 0 && (
                          <div className="space-y-1">
                            <div className="text-xs text-purple-700 flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3" />
                              <span>{selectedBrands.length} brand{selectedBrands.length > 1 ? 's' : ''} selected</span>
                            </div>
                            <div className="flex flex-wrap gap-1 p-3 bg-purple-50 border border-purple-200 rounded-lg">
                              {selectedBrands.map(brand => (
                                <div key={brand} className="inline-flex items-center gap-1.5 px-2 py-1 bg-purple-100 text-purple-800 border border-purple-300 rounded-md text-xs">
                                  <span>{brand}</span>
                                  <button
                                    type="button"
                                    className="inline-flex items-center justify-center w-3.5 h-3.5 cursor-pointer hover:bg-purple-200 rounded transition-colors"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setSelectedBrands(selectedBrands.filter(b => b !== brand));
                                      toast.success('Brand removed');
                                    }}
                                    aria-label="Remove brand"
                                  >
                                    <X className="w-3 h-3" />
                                  </button>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                        
                        {/* Dropdown + Add Button */}
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
                                  <SelectItem key={brand} value={brand}>
                                    {brand}
                                  </SelectItem>
                                ))}
                            </SelectContent>
                          </Select>
                          <Button
                            type="button"
                            onClick={() => {
                              if (tempBrandSelection && !selectedBrands.includes(tempBrandSelection)) {
                                setSelectedBrands([...selectedBrands, tempBrandSelection]);
                                setTempBrandSelection('');
                                toast.success('Brand added');
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
                      /* Default Input for other TOR items */
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
                      placeholder="Enter any remarks or additional notes"
                      rows={2}
                    />
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
      
      {/* ✅ TAB 2 NAVIGATION BUTTONS */}
      <div className="flex justify-between items-center pt-6 border-t bg-white p-4 rounded-lg">
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={() => setActiveTab('general')} 
            type="button"
          >
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
      {/* Technical Requirements (TER) */}
      <div className="space-y-4 bg-white border rounded-lg p-6">
        <h3 className="text-lg text-gray-900 border-b pb-2">Technical Evaluation Requirements (TER)</h3>
        <p className="text-sm text-gray-600 mb-4">
          Enable relevant technical requirements and provide detailed specifications for each selected item.
        </p>
        
        <div className="space-y-6">
          {terItems.map((item, index) => (
            <div key={item.id} className="border rounded-lg p-4 bg-gray-50">
              <div className="flex items-center space-x-2 mb-4">
                <Checkbox
                  id={`ter-${item.id}`}
                  checked={item.enabled}
                  onCheckedChange={(checked) => updateTERItem(index, 'enabled', checked as boolean)}
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
                      placeholder="Enter any remarks or additional notes"
                      rows={2}
                    />
                  </div>
                  
                  {/* Document Upload for TER Items */}
                  <div className="grid grid-cols-[150px_1fr] gap-4 items-start">
                    <Label htmlFor={`ter-${item.id}-upload`} className="pt-2">Upload Documents</Label>
                    <div>
                      {!item.uploadedFile ? (
                        <label className="flex items-center gap-3 w-full px-4 py-3 border-2 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors">
                          <Upload className="w-5 h-5 text-gray-500" />
                          <span className="text-sm text-gray-700">Click to upload document</span>
                          <input
                            id={`ter-${item.id}-upload`}
                            type="file"
                            className="hidden"
                            accept=".pdf,.doc,.docx,.xls,.xlsx,.dwg,.dxf,.zip"
                            onChange={(e) => {
                              const file = e.target.files?.[0] || null;
                              handleTERFileUpload(index, file);
                            }}
                          />
                        </label>
                      ) : (
                        <div className="bg-gray-50 rounded-lg border p-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 flex-1 min-w-0">
                              <FileText className="w-4 h-4 text-gray-600 flex-shrink-0" />
                              <span className="text-sm text-gray-900 truncate">{item.uploadedFile.name}</span>
                            </div>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => handleTERFileUpload(index, null)}
                              title="Remove document"
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          </div>
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
      
      {/* ✅ TAB 3 NAVIGATION & SUBMIT BUTTONS */}
      <div className="flex justify-between items-center pt-6 border-t bg-white p-4 rounded-lg">
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={() => setActiveTab('tor')} 
            type="button"
          >
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

  {/* ✅ BUDGET DIALOG - Outside tabs but controlled by Tab 1 */}
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
