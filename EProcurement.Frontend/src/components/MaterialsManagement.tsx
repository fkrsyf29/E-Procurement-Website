import { useState, useMemo, useRef, useEffect } from 'react';
import { Search, Plus, Edit2, Trash2, Upload, Download, ArrowUpDown, ArrowUp, ArrowDown, FileSpreadsheet, AlertCircle, CheckCircle, X as XIcon } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from './ui/dialog';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { User, Material } from '../types';
import { toast } from 'sonner';
import { Badge } from './ui/badge';
import { getAllSubClassificationsFlat } from '../data/categoryHierarchy';
import { 
  getActiveJobsites,
  getActiveUOMs, 
  getActiveExternalBrands, 
  getActiveValuationClasses, 
  getActiveMaterialGroups,
  getMaterialGroupDescription,
  getJobsitePlantCode
} from '../data/systemReferenceData';

type SortField = 'material' | 'materialDescription' | 'baseUnitOfMeasure' | 'extMaterialGroup' | 'valuationClass' | 'materialGroup' | 'materialGroupDescription' | 'subClassification' | 'jobsite' | 'plant' | 'qty' | 'estimatedPrice' | 'contractType' | 'vendorName' | 'contractNumber' | 'contractName' | 'unique';
type SortDirection = 'asc' | 'desc' | null;

interface MaterialsManagementProps {
  user: User;
  materials: Material[];
  onAddMaterial: (material: Omit<Material, 'id' | 'createdDate'>) => void;
  onUpdateMaterial: (id: string, updates: Partial<Material>) => void;
  onDeleteMaterial: (id: string) => void;
  onBulkUpload: (materials: Omit<Material, 'id' | 'createdDate'>[]) => void;
  isAnnualPurchasePlan?: boolean; // NEW: Flag to indicate if this is Annual Purchase Plan view
}

export function MaterialsManagement({ 
  user, 
  materials, 
  onAddMaterial, 
  onUpdateMaterial, 
  onDeleteMaterial,
  onBulkUpload,
  isAnnualPurchasePlan = false
}: MaterialsManagementProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState<SortField | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>(null);
  
  // Dialog states
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  
  // Selected material for edit/delete
  const [selectedMaterial, setSelectedMaterial] = useState<Material | null>(null);
  
  // Form data
  const [formData, setFormData] = useState({
    material: '',
    materialDescription: '',
    baseUnitOfMeasure: '',
    extMaterialGroup: '',
    valuationClass: '',
    materialGroup: '',
    materialGroupDescription: '',
    subClassification: '',
    jobsite: '',
    plant: '',
    qty: 0,
    estimatedPrice: 0,
    contractType: '' as 'Contractual' | 'Non-Contractual' | '',
    vendorName: '',
    contractNumber: '',
    contractName: '',
    contractStartDate: '',
    contractEndDate: '',
    unique: '' as 'Yes' | 'No' | ''
  });
  
  // Get validation data from system
  const jobsites = getActiveJobsites();
  const uomOptions = getActiveUOMs();
  const brandOptions = getActiveExternalBrands();
  const valuationClassOptions = getActiveValuationClasses();
  const materialGroupOptions = getActiveMaterialGroups();
  
  // Auto-fill Material Group Description when Material Group changes
  useEffect(() => {
    if (formData.materialGroup) {
      const description = getMaterialGroupDescription(formData.materialGroup);
      if (description && description !== formData.materialGroupDescription) {
        setFormData(prev => ({
          ...prev,
          materialGroupDescription: description
        }));
      }
    }
  }, [formData.materialGroup]);
  
  // Auto-fill Plant when Jobsite changes
  useEffect(() => {
    if (formData.jobsite) {
      const plantCode = getJobsitePlantCode(formData.jobsite);
      if (plantCode && plantCode !== formData.plant) {
        setFormData(prev => ({
          ...prev,
          plant: plantCode
        }));
      }
    }
  }, [formData.jobsite]);
  
  // Upload states
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [uploadPreview, setUploadPreview] = useState<any[]>([]);
  const [uploadErrors, setUploadErrors] = useState<string[]>([]);
  const [uploadSummary, setUploadSummary] = useState<{
    total: number;
    success: number;
    failed: number;
    failedItems: Array<{ row: number; material: string; plant: string; reason: string }>;
  } | null>(null);
  
  const isAdmin = user.roleName === 'Administrator';
  
  // Get all sub-classifications from Category Management
  const allSubClassifications = useMemo(() => getAllSubClassificationsFlat(), []);

  // Handle sorting
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      if (sortDirection === 'asc') {
        setSortDirection('desc');
      } else if (sortDirection === 'desc') {
        setSortField(null);
        setSortDirection(null);
      } else {
        setSortDirection('asc');
      }
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) {
      return <ArrowUpDown className="w-3 h-3 ml-1 inline" />;
    }
    if (sortDirection === 'asc') {
      return <ArrowUp className="w-3 h-3 ml-1 inline" />;
    }
    return <ArrowDown className="w-3 h-3 ml-1 inline" />;
  };

  // Filter and sort materials
  const filteredMaterials = useMemo(() => {
    let filtered = materials.filter(m => {
      const term = searchTerm.toLowerCase();
      const jobsite = m.jobsite || m.company || ''; // Backward compatibility
      return (
        m.material.toLowerCase().includes(term) ||
        m.materialDescription.toLowerCase().includes(term) ||
        m.extMaterialGroup.toLowerCase().includes(term) ||
        jobsite.toLowerCase().includes(term) ||
        m.plant.toLowerCase().includes(term) ||
        m.baseUnitOfMeasure.toLowerCase().includes(term) ||
        m.valuationClass.toLowerCase().includes(term) ||
        m.materialGroup.toLowerCase().includes(term) ||
        m.materialGroupDescription.toLowerCase().includes(term) ||
        m.subClassification.toLowerCase().includes(term)
      );
    });

    // Apply sorting
    if (sortField && sortDirection) {
      filtered = [...filtered].sort((a, b) => {
        // Handle numeric fields
        if (sortField === 'qty' || sortField === 'estimatedPrice') {
          const aNum = Number(a[sortField] || 0);
          const bNum = Number(b[sortField] || 0);
          return sortDirection === 'asc' ? aNum - bNum : bNum - aNum;
        }
        
        // Handle jobsite field with backward compatibility
        let aVal: string, bVal: string;
        if (sortField === 'jobsite') {
          aVal = (a.jobsite || a.company || '').toString().toLowerCase();
          bVal = (b.jobsite || b.company || '').toString().toLowerCase();
        } else {
          aVal = (a[sortField] || '').toString().toLowerCase();
          bVal = (b[sortField] || '').toString().toLowerCase();
        }
        
        if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
        if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return filtered;
  }, [materials, searchTerm, sortField, sortDirection]);

  // Reset form
  const resetForm = () => {
    setFormData({
      material: '',
      materialDescription: '',
      baseUnitOfMeasure: '',
      extMaterialGroup: '',
      valuationClass: '',
      materialGroup: '',
      materialGroupDescription: '',
      subClassification: '',
      jobsite: '',
      plant: '',
      qty: 0,
      estimatedPrice: 0,
      contractType: '',
      vendorName: '',
      contractNumber: '',
      contractName: '',
      contractStartDate: '',
      contractEndDate: '',
      unique: ''
    });
  };

  // Handle add material
  const handleAddMaterial = () => {
    // Validate
    if (!formData.material || !formData.materialDescription || !formData.baseUnitOfMeasure || !formData.extMaterialGroup || !formData.plant) {
      toast.error('Please fill in all required fields');
      return;
    }

    // ✅ Check for duplicate Material + Plant combination
    const exists = materials.find(m => m.material === formData.material && m.plant === formData.plant);
    if (exists) {
      toast.error(`Material ${formData.material} already exists in Plant ${formData.plant}`, {
        description: 'Same material can exist in different plants, but not in the same plant'
      });
      return;
    }

    onAddMaterial(formData);
    toast.success('Material added successfully');
    setIsAddDialogOpen(false);
    resetForm();
  };

  // Handle edit material
  const handleEditMaterial = () => {
    if (!selectedMaterial) return;

    // Validate
    if (!formData.material || !formData.materialDescription || !formData.baseUnitOfMeasure || !formData.extMaterialGroup || !formData.plant) {
      toast.error('Please fill in all required fields');
      return;
    }

    // ✅ Check for duplicate Material + Plant combination (exclude current)
    const exists = materials.find(m => 
      m.material === formData.material && 
      m.plant === formData.plant && 
      m.id !== selectedMaterial.id
    );
    if (exists) {
      toast.error(`Material ${formData.material} already exists in Plant ${formData.plant}`, {
        description: 'Same material can exist in different plants, but not in the same plant'
      });
      return;
    }

    onUpdateMaterial(selectedMaterial.id, formData);
    toast.success('Material updated successfully');
    setIsEditDialogOpen(false);
    setSelectedMaterial(null);
    resetForm();
  };

  // Handle delete material
  const handleDeleteMaterial = () => {
    if (!selectedMaterial) return;
    
    onDeleteMaterial(selectedMaterial.id);
    toast.success('Material deleted successfully');
    setIsDeleteDialogOpen(false);
    setSelectedMaterial(null);
  };

  // Open edit dialog
  const openEditDialog = (material: Material) => {
    setSelectedMaterial(material);
    setFormData({
      material: material.material,
      materialDescription: material.materialDescription,
      baseUnitOfMeasure: material.baseUnitOfMeasure,
      extMaterialGroup: material.extMaterialGroup,
      valuationClass: material.valuationClass,
      materialGroup: material.materialGroup,
      materialGroupDescription: material.materialGroupDescription,
      subClassification: material.subClassification,
      jobsite: material.jobsite || material.company || '', // Backward compatibility
      plant: material.plant,
      qty: material.qty || 0,
      estimatedPrice: material.estimatedPrice || 0,
      contractType: material.contractType || '',
      vendorName: material.vendorName || '',
      contractNumber: material.contractNumber || '',
      contractName: material.contractName || '',
      contractStartDate: material.contractStartDate || '',
      contractEndDate: material.contractEndDate || '',
      unique: material.unique || ''
    });
    setIsEditDialogOpen(true);
  };

  // Open delete dialog
  const openDeleteDialog = (material: Material) => {
    setSelectedMaterial(material);
    setIsDeleteDialogOpen(true);
  };

  // Handle file upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadedFile(file);
    setUploadSummary(null); // Reset summary
    
    // Read file
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        
        // Parse CSV
        const lines = text.split('\n').filter(line => line.trim());
        const headers = lines[0].split(',').map(h => h.trim());
        
        // Map CSV headers to our field names
        const headerMap: Record<string, string> = {
          'Material': 'material',
          'Material description': 'materialDescription',
          'Base Unit of Measure': 'baseUnitOfMeasure',
          'Ext. Material Group': 'extMaterialGroup',
          'Valuation Class': 'valuationClass',
          'Material Group': 'materialGroup',
          'Material Group Description': 'materialGroupDescription',
          'Sub-Classification': 'subClassification',
          'Company': 'jobsite', // Map Company to jobsite
          'Jobsite': 'jobsite', // Also accept Jobsite header
          'Plant': 'plant',
          'Qty': 'qty',
          'Quantity': 'qty',
          'Price': 'estimatedPrice',
          'Estimated Price': 'estimatedPrice',
          'Contract Type': 'contractType',
          'Vendor Name': 'vendorName',
          'Contract Number': 'contractNumber',
          'Contract Name': 'contractName',
          'Start Date': 'contractStartDate',
          'Contract Start Date': 'contractStartDate',
          'End Date': 'contractEndDate',
          'Contract End Date': 'contractEndDate',
          'Unique': 'unique'
        };
        
        const data = lines.slice(1).map((line, index) => {
          const values = line.split(',').map(v => v.trim());
          const row: any = { _rowNumber: index + 2 }; // +2 because header is row 1, data starts at row 2
          headers.forEach((header, index) => {
            const fieldName = headerMap[header] || header.toLowerCase().replace(/\s+/g, '');
            row[fieldName] = values[index] || '';
          });
          return row;
        });

        // Validate data - only check for missing required columns
        const errors: string[] = [];
        const requiredFields = ['material', 'materialDescription', 'baseUnitOfMeasure', 'extMaterialGroup', 'valuationClass', 'materialGroup', 'materialGroupDescription', 'subClassification', 'jobsite', 'plant'];
        
        // Check required fields in header
        const missingFields = requiredFields.filter(field => !headers.some(h => headerMap[h] === field));
        if (missingFields.length > 0) {
          errors.push(`Missing required columns: ${missingFields.join(', ')}`);
          setUploadErrors(errors);
          setUploadPreview([]);
          toast.error(`File validation failed: Missing columns`);
          return;
        }

        setUploadErrors([]);
        setUploadPreview(data);
        toast.success(`File validated: ${data.length} rows ready for processing`);

      } catch (error) {
        toast.error('Failed to parse file. Please ensure it is a valid CSV file.');
        setUploadErrors(['Failed to parse file']);
        setUploadPreview([]);
      }
    };
    
    reader.readAsText(file);
  };

  // Handle bulk upload with smart validation
  const handleBulkUpload = () => {
    if (uploadErrors.length > 0) {
      toast.error('Please fix file structure errors before uploading');
      return;
    }

    if (uploadPreview.length === 0) {
      toast.error('No data to upload');
      return;
    }

    const requiredFields = ['material', 'materialDescription', 'baseUnitOfMeasure', 'extMaterialGroup', 'plant'];
    const validMaterials: any[] = [];
    const failedItems: Array<{ row: number; material: string; plant: string; reason: string }> = [];
    
    // Build existing combos for quick lookup
    const existingCombos = new Set(materials.map(m => `${m.material}|${m.plant}`));
    const uploadedCombos = new Set<string>();

    uploadPreview.forEach((item) => {
      const rowNumber = item._rowNumber || 0;
      const material = item.material || '';
      const plant = item.plant || '';
      const combo = `${material}|${plant}`;
      
      // Validate required fields
      const missingFields = requiredFields.filter(field => !item[field] || item[field].trim() === '');
      if (missingFields.length > 0) {
        failedItems.push({
          row: rowNumber,
          material: material || '(empty)',
          plant: plant || '(empty)',
          reason: `Missing: ${missingFields.join(', ')}`
        });
        return;
      }

      // Check duplicate in database
      if (existingCombos.has(combo)) {
        failedItems.push({
          row: rowNumber,
          material,
          plant,
          reason: 'Already exists in database'
        });
        return;
      }

      // Check duplicate within upload file
      if (uploadedCombos.has(combo)) {
        failedItems.push({
          row: rowNumber,
          material,
          plant,
          reason: 'Duplicate in upload file'
        });
        return;
      }

      // Valid - add to upload list
      uploadedCombos.add(combo);
      const cleanItem = { ...item };
      delete cleanItem._rowNumber;
      validMaterials.push(cleanItem);
    });

    // Upload valid materials
    if (validMaterials.length > 0) {
      onBulkUpload(validMaterials);
    }

    // Show summary
    const summary = {
      total: uploadPreview.length,
      success: validMaterials.length,
      failed: failedItems.length,
      failedItems
    };
    
    setUploadSummary(summary);

    if (failedItems.length === 0) {
      toast.success(`✓ All ${validMaterials.length} materials imported successfully`);
    } else if (validMaterials.length > 0) {
      toast.success(`✓ ${validMaterials.length} materials imported, ${failedItems.length} failed`, {
        description: 'See details below'
      });
    } else {
      toast.error(`✗ All ${failedItems.length} materials failed to import`, {
        description: 'See details below'
      });
    }

    // Don't close dialog - show summary
  };

  // Download template
  const handleDownloadTemplate = () => {
    const headers = ['Material', 'Material description', 'Base Unit of Measure', 'Ext. Material Group', 'Valuation Class', 'Material Group', 'Material Group Description', 'Sub-Classification', 'Jobsite', 'Plant', 'Qty', 'Estimated Price', 'Contract Type', 'Vendor Name', 'Contract Number', 'Contract Name', 'Contract Start Date', 'Contract End Date'];
    const sample = ['10212-986', 'KIT', 'EA', 'SANDVIK', 'M001', 'Z01017', 'HEAVY CONSTRUCTION MACHINERY AND EQ/HEAVY EQ COMPONENTS', 'M 01 01-Component and Sub Component', 'ADMO HAULING-4DAC', '4990', '100', '250.50', 'Contractual', 'PT Supplier Indonesia', 'CNT-2025-001', 'Supply & Delivery of SANDVIK Parts', '2025-01-01', '2025-12-31'];
    
    const csv = `${headers.join(',')}\n${sample.join(',')}`;
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'materials_template.csv';
    a.click();
    
    toast.success('Template downloaded');
  };

  // Export materials
  const handleExportMaterials = () => {
    const headers = ['Material', 'Material description', 'Base Unit of Measure', 'Ext. Material Group', 'Valuation Class', 'Material Group', 'Material Group Description', 'Sub-Classification', 'Jobsite', 'Plant', 'Qty', 'Estimated Price', 'Contract Type', 'Vendor Name', 'Contract Number', 'Contract Name', 'Contract Start Date', 'Contract End Date'];
    const rows = materials.map(m => [
      m.material,
      m.materialDescription,
      m.baseUnitOfMeasure,
      m.extMaterialGroup,
      m.valuationClass,
      m.materialGroup,
      m.materialGroupDescription,
      m.subClassification,
      m.jobsite || m.company,
      m.plant,
      m.qty || '',
      m.estimatedPrice || '',
      m.contractType || '',
      m.vendorName || '',
      m.contractNumber || '',
      m.contractName || '',
      m.contractStartDate || '',
      m.contractEndDate || ''
    ]);
    
    const csv = `${headers.join(',')}\n${rows.map(r => r.join(',')).join('\n')}`;
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `materials_export_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    
    toast.success('Materials exported successfully');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-gray-900">Materials Management</h2>
            <p className="text-sm text-gray-600 mt-1">
              Manage material master data for proposal creation
            </p>
          </div>
          {(isAdmin || isAnnualPurchasePlan) && (
            <div className="flex gap-2">
              <Button onClick={handleDownloadTemplate} variant="outline" size="sm">
                <Download className="w-4 h-4 mr-2" />
                Template
              </Button>
              <Button onClick={handleExportMaterials} variant="outline" size="sm">
                <FileSpreadsheet className="w-4 h-4 mr-2" />
                Export
              </Button>
              <Button onClick={() => setIsUploadDialogOpen(true)} variant="outline" size="sm">
                <Upload className="w-4 h-4 mr-2" />
                Upload CSV
              </Button>
              <Button onClick={() => {
                resetForm();
                setIsAddDialogOpen(true);
              }}>
                <Plus className="w-4 h-4 mr-2" />
                Add Material
              </Button>
            </div>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-800">Total Materials</p>
            <p className="text-2xl text-blue-900 mt-1">{materials.length}</p>
          </div>
          <div className="bg-teal-50 border border-teal-200 rounded-lg p-4">
            <p className="text-sm text-teal-800">Unique Brands</p>
            <p className="text-2xl text-teal-900 mt-1">{new Set(materials.map(m => m.extMaterialGroup)).size}</p>
          </div>
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
            <p className="text-sm text-purple-800">Plants</p>
            <p className="text-2xl text-purple-900 mt-1">{new Set(materials.map(m => m.plant)).size}</p>
          </div>
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
            <p className="text-sm text-orange-800">Material Groups</p>
            <p className="text-2xl text-orange-900 mt-1">{new Set(materials.map(m => m.materialGroup)).size}</p>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Search by material code, description, brand, plant, company..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>
        
        {searchTerm && (
          <p className="text-sm text-gray-600 mt-2">
            Found {filteredMaterials.length} material{filteredMaterials.length !== 1 ? 's' : ''}
          </p>
        )}
      </div>

      {/* Materials Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left text-xs text-gray-700 cursor-pointer hover:bg-gray-100" onClick={() => handleSort('material')}>
                  Material {getSortIcon('material')}
                </th>
                <th className="px-4 py-3 text-left text-xs text-gray-700 cursor-pointer hover:bg-gray-100" onClick={() => handleSort('materialDescription')}>
                  Description {getSortIcon('materialDescription')}
                </th>
                <th className="px-4 py-3 text-left text-xs text-gray-700 cursor-pointer hover:bg-gray-100" onClick={() => handleSort('baseUnitOfMeasure')}>
                  UoM {getSortIcon('baseUnitOfMeasure')}
                </th>
                <th className="px-4 py-3 text-left text-xs text-gray-700 cursor-pointer hover:bg-gray-100" onClick={() => handleSort('extMaterialGroup')}>
                  Brand {getSortIcon('extMaterialGroup')}
                </th>
                <th className="px-4 py-3 text-left text-xs text-gray-700 cursor-pointer hover:bg-gray-100" onClick={() => handleSort('valuationClass')}>
                  Val. Class {getSortIcon('valuationClass')}
                </th>
                <th className="px-4 py-3 text-left text-xs text-gray-700 cursor-pointer hover:bg-gray-100" onClick={() => handleSort('materialGroup')}>
                  Mat. Group {getSortIcon('materialGroup')}
                </th>
                <th className="px-4 py-3 text-left text-xs text-gray-700 cursor-pointer hover:bg-gray-100" onClick={() => handleSort('materialGroupDescription')}>
                  Group Desc {getSortIcon('materialGroupDescription')}
                </th>
                <th className="px-4 py-3 text-left text-xs text-gray-700 cursor-pointer hover:bg-gray-100" onClick={() => handleSort('subClassification')}>
                  Sub-Class {getSortIcon('subClassification')}
                </th>
                <th className="px-4 py-3 text-left text-xs text-gray-700 cursor-pointer hover:bg-gray-100" onClick={() => handleSort('jobsite')}>
                  Jobsite {getSortIcon('jobsite')}
                </th>
                <th className="px-4 py-3 text-left text-xs text-gray-700 cursor-pointer hover:bg-gray-100" onClick={() => handleSort('plant')}>
                  Plant {getSortIcon('plant')}
                </th>
                <th className="px-4 py-3 text-right text-xs text-gray-700 cursor-pointer hover:bg-gray-100" onClick={() => handleSort('qty')}>
                  Qty {getSortIcon('qty')}
                </th>
                <th className="px-4 py-3 text-right text-xs text-gray-700 cursor-pointer hover:bg-gray-100" onClick={() => handleSort('estimatedPrice')}>
                  Price (USD) {getSortIcon('estimatedPrice')}
                </th>
                <th className="px-4 py-3 text-center text-xs text-gray-700 cursor-pointer hover:bg-gray-100" onClick={() => handleSort('contractType')}>
                  Type {getSortIcon('contractType')}
                </th>
                <th className="px-4 py-3 text-left text-xs text-gray-700 cursor-pointer hover:bg-gray-100" onClick={() => handleSort('vendorName')}>
                  Vendor {getSortIcon('vendorName')}
                </th>
                <th className="px-4 py-3 text-left text-xs text-gray-700 cursor-pointer hover:bg-gray-100" onClick={() => handleSort('contractNumber')}>
                  Contract No {getSortIcon('contractNumber')}
                </th>
                <th className="px-4 py-3 text-left text-xs text-gray-700 cursor-pointer hover:bg-gray-100" onClick={() => handleSort('contractName')}>
                  Contract Name {getSortIcon('contractName')}
                </th>
                <th className="px-4 py-3 text-left text-xs text-gray-700">
                  Start Date
                </th>
                <th className="px-4 py-3 text-left text-xs text-gray-700">
                  End Date
                </th>
                <th className="px-4 py-3 text-center text-xs text-gray-700">
                  Unique
                </th>
                {(isAdmin || isAnnualPurchasePlan) && <th className="px-4 py-3 text-right text-xs text-gray-700">Actions</th>}
              </tr>
            </thead>
            <tbody>
              {filteredMaterials.length === 0 ? (
                <tr>
                  <td colSpan={(isAdmin || isAnnualPurchasePlan) ? 20 : 19} className="px-4 py-8 text-center text-gray-500">
                    {searchTerm ? 'No materials found matching your search' : 'No materials in database'}
                  </td>
                </tr>
              ) : (
                filteredMaterials.map((material) => (
                  <tr key={material.id} className="border-b border-gray-200 hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm text-gray-900">{material.material}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">{material.materialDescription}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      <Badge variant="outline">{material.baseUnitOfMeasure}</Badge>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900">{material.extMaterialGroup}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{material.valuationClass}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{material.materialGroup}</td>
                    <td className="px-4 py-3 text-sm text-gray-600 max-w-xs truncate" title={material.materialGroupDescription}>
                      {material.materialGroupDescription}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">{material.subClassification}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">{material.jobsite || material.company}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{material.plant}</td>
                    <td className="px-4 py-3 text-sm text-gray-900 text-right">{material.qty || '-'}</td>
                    <td className="px-4 py-3 text-sm text-gray-900 text-right">
                      {material.estimatedPrice ? `$${Math.round(material.estimatedPrice).toLocaleString('en-US')}` : '-'}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {material.contractType ? (
                        <Badge variant={material.contractType === 'Contractual' ? 'default' : 'secondary'}>
                          {material.contractType}
                        </Badge>
                      ) : '-'}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900 max-w-xs truncate" title={material.vendorName}>
                      {material.vendorName || '-'}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">{material.contractNumber || '-'}</td>
                    <td className="px-4 py-3 text-sm text-gray-900 max-w-xs truncate" title={material.contractName}>
                      {material.contractName || '-'}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {material.contractStartDate || '-'}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {material.contractEndDate || '-'}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {material.unique ? (
                        <Badge variant={material.unique === 'Yes' ? 'default' : 'secondary'}>
                          {material.unique}
                        </Badge>
                      ) : '-'}
                    </td>
                    {(isAdmin || isAnnualPurchasePlan) && (
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => openEditDialog(material)}
                          >
                            <Edit2 className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => openDeleteDialog(material)}
                          >
                            <Trash2 className="w-4 h-4 text-red-600" />
                          </Button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Material Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add New Material</DialogTitle>
            <DialogDescription>Enter material details below</DialogDescription>
          </DialogHeader>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Material Code <span className="text-red-600">*</span></Label>
              <Input
                value={formData.material}
                onChange={(e) => setFormData({ ...formData, material: e.target.value })}
                placeholder="e.g., 10212-986"
              />
            </div>
            <div>
              <Label>Material Description <span className="text-red-600">*</span></Label>
              <Input
                value={formData.materialDescription}
                onChange={(e) => setFormData({ ...formData, materialDescription: e.target.value })}
                placeholder="e.g., HOSE ASSEMBLY"
              />
            </div>
            <div>
              <Label>Base Unit of Measure <span className="text-red-600">*</span></Label>
              <Select
                value={formData.baseUnitOfMeasure}
                onValueChange={(value: string) => setFormData({ ...formData, baseUnitOfMeasure: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select UoM" />
                </SelectTrigger>
                <SelectContent className="max-h-[200px]">
                  {uomOptions.map((uom) => (
                    <SelectItem key={uom} value={uom}>{uom}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>External Brand <span className="text-red-600">*</span></Label>
              <Select
                value={formData.extMaterialGroup}
                onValueChange={(value: string) => setFormData({ ...formData, extMaterialGroup: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select brand" />
                </SelectTrigger>
                <SelectContent className="max-h-[200px]">
                  {brandOptions.map((brand) => (
                    <SelectItem key={brand} value={brand}>{brand}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Valuation Class</Label>
              <Select
                value={formData.valuationClass}
                onValueChange={(value: string) => setFormData({ ...formData, valuationClass: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select valuation class" />
                </SelectTrigger>
                <SelectContent className="max-h-[200px]">
                  {valuationClassOptions.map((valClass) => (
                    <SelectItem key={valClass} value={valClass}>{valClass}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Material Group</Label>
              <Select
                value={formData.materialGroup}
                onValueChange={(value: string) => setFormData({ ...formData, materialGroup: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select material group" />
                </SelectTrigger>
                <SelectContent className="max-h-[200px]">
                  {materialGroupOptions.map((group) => (
                    <SelectItem key={group} value={group}>{group}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="col-span-2">
              <Label>Material Group Description <span className="text-xs text-gray-500">(Auto-filled)</span></Label>
              <Input
                value={formData.materialGroupDescription}
                readOnly
                disabled
                className="bg-gray-50"
                placeholder="Auto-filled based on Material Group selection"
              />
            </div>
            <div className="col-span-2">
              <Label>Sub-Classification</Label>
              <Select
                value={formData.subClassification}
                onValueChange={(value: string) => setFormData({ ...formData, subClassification: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select sub-classification" />
                </SelectTrigger>
                <SelectContent className="max-h-[300px]">
                  {allSubClassifications.map((subClass) => (
                    <SelectItem key={subClass.code} value={subClass.name}>
                      {subClass.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-gray-500 mt-1">
                Select from Category Management system
              </p>
            </div>
            <div>
              <Label>Jobsite <span className="text-red-600">*</span></Label>
              <Select
                value={formData.jobsite}
                onValueChange={(value: string) => setFormData({ ...formData, jobsite: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select jobsite" />
                </SelectTrigger>
                <SelectContent className="max-h-[200px]">
                  {jobsites.map((jobsite) => (
                    <SelectItem key={jobsite} value={jobsite}>{jobsite}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Plant <span className="text-xs text-gray-500">(Auto-filled)</span></Label>
              <Input
                value={formData.plant}
                readOnly
                disabled
                className="bg-gray-50"
                placeholder="Auto-filled from jobsite code"
              />
            </div>
            
            {/* Annual Purchase Plan Fields */}
            <div className="col-span-2 border-t pt-4 mt-4">
              <h3 className="text-sm font-medium text-gray-900 mb-3">📋 Annual Purchase Plan Details</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Quantity</Label>
                  <Input
                    type="number"
                    value={formData.qty || ''}
                    onChange={(e) => setFormData({ ...formData, qty: parseInt(e.target.value) || 0 })}
                    placeholder="e.g., 100"
                  />
                </div>
                <div>
                  <Label>Estimated Price (USD)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={formData.estimatedPrice || ''}
                    onChange={(e) => setFormData({ ...formData, estimatedPrice: parseFloat(e.target.value) || 0 })}
                    placeholder="e.g., 250.50"
                  />
                </div>
                <div>
                  <Label>Contract Type</Label>
                  <Select
                    value={formData.contractType}
                    onValueChange={(value: any) => setFormData({ ...formData, contractType: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Contractual">Contractual</SelectItem>
                      <SelectItem value="Non-Contractual">Non-Contractual</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Vendor Name</Label>
                  <Input
                    value={formData.vendorName}
                    onChange={(e) => setFormData({ ...formData, vendorName: e.target.value })}
                    placeholder="e.g., PT Supplier Indonesia"
                  />
                </div>
                <div>
                  <Label>Contract Number</Label>
                  <Input
                    value={formData.contractNumber}
                    onChange={(e) => setFormData({ ...formData, contractNumber: e.target.value })}
                    placeholder="e.g., CNT-2025-001"
                  />
                </div>
                <div>
                  <Label>Contract Name</Label>
                  <Input
                    value={formData.contractName}
                    onChange={(e) => setFormData({ ...formData, contractName: e.target.value })}
                    placeholder="e.g., Supply & Delivery of Parts"
                  />
                </div>
                <div>
                  <Label>Contract Start Date</Label>
                  <Input
                    type="date"
                    value={formData.contractStartDate}
                    onChange={(e) => setFormData({ ...formData, contractStartDate: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Contract End Date</Label>
                  <Input
                    type="date"
                    value={formData.contractEndDate}
                    onChange={(e) => setFormData({ ...formData, contractEndDate: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Unique</Label>
                  <Select
                    value={formData.unique}
                    onValueChange={(value: any) => setFormData({ ...formData, unique: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select unique status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Yes">Yes</SelectItem>
                      <SelectItem value="No">No</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleAddMaterial}>Add Material</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Material Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Material</DialogTitle>
            <DialogDescription>Update material details</DialogDescription>
          </DialogHeader>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Material Code <span className="text-red-600">*</span></Label>
              <Input
                value={formData.material}
                onChange={(e) => setFormData({ ...formData, material: e.target.value })}
                placeholder="e.g., 10212-986"
              />
            </div>
            <div>
              <Label>Material Description <span className="text-red-600">*</span></Label>
              <Input
                value={formData.materialDescription}
                onChange={(e) => setFormData({ ...formData, materialDescription: e.target.value })}
                placeholder="e.g., HOSE ASSEMBLY"
              />
            </div>
            <div>
              <Label>Base Unit of Measure <span className="text-red-600">*</span></Label>
              <Select
                value={formData.baseUnitOfMeasure}
                onValueChange={(value: string) => setFormData({ ...formData, baseUnitOfMeasure: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select UoM" />
                </SelectTrigger>
                <SelectContent className="max-h-[200px]">
                  {uomOptions.map((uom) => (
                    <SelectItem key={uom} value={uom}>{uom}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>External Brand <span className="text-red-600">*</span></Label>
              <Select
                value={formData.extMaterialGroup}
                onValueChange={(value: string) => setFormData({ ...formData, extMaterialGroup: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select brand" />
                </SelectTrigger>
                <SelectContent className="max-h-[200px]">
                  {brandOptions.map((brand) => (
                    <SelectItem key={brand} value={brand}>{brand}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Valuation Class</Label>
              <Select
                value={formData.valuationClass}
                onValueChange={(value: string) => setFormData({ ...formData, valuationClass: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select valuation class" />
                </SelectTrigger>
                <SelectContent className="max-h-[200px]">
                  {valuationClassOptions.map((valClass) => (
                    <SelectItem key={valClass} value={valClass}>{valClass}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Material Group</Label>
              <Select
                value={formData.materialGroup}
                onValueChange={(value: string) => setFormData({ ...formData, materialGroup: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select material group" />
                </SelectTrigger>
                <SelectContent className="max-h-[200px]">
                  {materialGroupOptions.map((group) => (
                    <SelectItem key={group} value={group}>{group}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="col-span-2">
              <Label>Material Group Description <span className="text-xs text-gray-500">(Auto-filled)</span></Label>
              <Input
                value={formData.materialGroupDescription}
                readOnly
                disabled
                className="bg-gray-50"
                placeholder="Auto-filled based on Material Group selection"
              />
            </div>
            <div className="col-span-2">
              <Label>Sub-Classification</Label>
              <Select
                value={formData.subClassification}
                onValueChange={(value: string) => setFormData({ ...formData, subClassification: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select sub-classification" />
                </SelectTrigger>
                <SelectContent className="max-h-[300px]">
                  {allSubClassifications.map((subClass) => (
                    <SelectItem key={subClass.code} value={subClass.name}>
                      {subClass.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-gray-500 mt-1">
                Select from Category Management system
              </p>
            </div>
            <div>
              <Label>Jobsite <span className="text-red-600">*</span></Label>
              <Select
                value={formData.jobsite}
                onValueChange={(value: string) => setFormData({ ...formData, jobsite: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select jobsite" />
                </SelectTrigger>
                <SelectContent className="max-h-[200px]">
                  {jobsites.map((jobsite) => (
                    <SelectItem key={jobsite} value={jobsite}>{jobsite}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Plant <span className="text-xs text-gray-500">(Auto-filled)</span></Label>
              <Input
                value={formData.plant}
                readOnly
                disabled
                className="bg-gray-50"
                placeholder="Auto-filled from jobsite code"
              />
            </div>
            
            {/* Annual Purchase Plan Fields */}
            <div className="col-span-2 border-t pt-4 mt-4">
              <h3 className="text-sm font-medium text-gray-900 mb-3">📋 Annual Purchase Plan Details</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Quantity</Label>
                  <Input
                    type="number"
                    value={formData.qty || ''}
                    onChange={(e) => setFormData({ ...formData, qty: parseInt(e.target.value) || 0 })}
                    placeholder="e.g., 100"
                  />
                </div>
                <div>
                  <Label>Estimated Price (USD)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={formData.estimatedPrice || ''}
                    onChange={(e) => setFormData({ ...formData, estimatedPrice: parseFloat(e.target.value) || 0 })}
                    placeholder="e.g., 250.50"
                  />
                </div>
                <div>
                  <Label>Contract Type</Label>
                  <Select
                    value={formData.contractType}
                    onValueChange={(value: any) => setFormData({ ...formData, contractType: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Contractual">Contractual</SelectItem>
                      <SelectItem value="Non-Contractual">Non-Contractual</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Vendor Name</Label>
                  <Input
                    value={formData.vendorName}
                    onChange={(e) => setFormData({ ...formData, vendorName: e.target.value })}
                    placeholder="e.g., PT Supplier Indonesia"
                  />
                </div>
                <div>
                  <Label>Contract Number</Label>
                  <Input
                    value={formData.contractNumber}
                    onChange={(e) => setFormData({ ...formData, contractNumber: e.target.value })}
                    placeholder="e.g., CNT-2025-001"
                  />
                </div>
                <div>
                  <Label>Contract Name</Label>
                  <Input
                    value={formData.contractName}
                    onChange={(e) => setFormData({ ...formData, contractName: e.target.value })}
                    placeholder="e.g., Supply & Delivery of Parts"
                  />
                </div>
                <div>
                  <Label>Contract Start Date</Label>
                  <Input
                    type="date"
                    value={formData.contractStartDate}
                    onChange={(e) => setFormData({ ...formData, contractStartDate: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Contract End Date</Label>
                  <Input
                    type="date"
                    value={formData.contractEndDate}
                    onChange={(e) => setFormData({ ...formData, contractEndDate: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Unique</Label>
                  <Select
                    value={formData.unique}
                    onValueChange={(value: any) => setFormData({ ...formData, unique: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select unique status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Yes">Yes</SelectItem>
                      <SelectItem value="No">No</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleEditMaterial}>Update Material</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Material</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this material?
            </DialogDescription>
          </DialogHeader>
          
          {selectedMaterial && (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 space-y-2">
              <p className="text-sm"><strong>Material:</strong> {selectedMaterial.material}</p>
              <p className="text-sm"><strong>Description:</strong> {selectedMaterial.materialDescription}</p>
              <p className="text-sm"><strong>Plant:</strong> {selectedMaterial.plant}</p>
            </div>
          )}
          
          <p className="text-sm text-red-600">
            This action cannot be undone.
          </p>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDeleteMaterial}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Upload CSV Dialog */}
      <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Upload Materials CSV</DialogTitle>
            <DialogDescription>
              Upload a CSV file with material data. Download the template to see the required format.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv"
                onChange={handleFileUpload}
                className="hidden"
              />
              <Button
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                className="w-full"
              >
                <Upload className="w-4 h-4 mr-2" />
                {uploadedFile ? uploadedFile.name : 'Choose CSV File'}
              </Button>
            </div>

            {uploadErrors.length > 0 && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm text-red-900">File Structure Errors:</p>
                    <ul className="text-sm text-red-800 list-disc list-inside mt-2 space-y-1">
                      {uploadErrors.map((error, index) => (
                        <li key={index}>{error}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {uploadPreview.length > 0 && uploadErrors.length === 0 && !uploadSummary && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm text-green-900">
                      File validated successfully. {uploadPreview.length} rows ready for processing.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Upload Summary */}
            {uploadSummary && (
              <div className={`border rounded-lg p-4 ${
                uploadSummary.failed === 0 
                  ? 'bg-green-50 border-green-200' 
                  : uploadSummary.success === 0
                  ? 'bg-red-50 border-red-200'
                  : 'bg-yellow-50 border-yellow-200'
              }`}>
                <div className="flex items-start gap-2 mb-3">
                  {uploadSummary.failed === 0 ? (
                    <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  ) : (
                    <AlertCircle className={`w-5 h-5 flex-shrink-0 mt-0.5 ${
                      uploadSummary.success === 0 ? 'text-red-600' : 'text-yellow-600'
                    }`} />
                  )}
                  <div className="flex-1">
                    <p className={`text-sm ${
                      uploadSummary.failed === 0 
                        ? 'text-green-900' 
                        : uploadSummary.success === 0
                        ? 'text-red-900'
                        : 'text-yellow-900'
                    }`}>
                      <strong>Upload Summary</strong>
                    </p>
                    <div className="grid grid-cols-3 gap-4 mt-2">
                      <div>
                        <p className="text-xs text-gray-600">Total</p>
                        <p className="text-lg">{uploadSummary.total}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-600">Success</p>
                        <p className="text-lg text-green-700">{uploadSummary.success}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-600">Failed</p>
                        <p className="text-lg text-red-700">{uploadSummary.failed}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Failed Items Details */}
                {uploadSummary.failedItems.length > 0 && (
                  <div className="mt-4 border-t border-gray-300 pt-4">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm text-gray-900"><strong>Failed Items:</strong></p>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          const headers = ['Row', 'Material', 'Plant', 'Reason'];
                          const rows = uploadSummary.failedItems.map(item => [
                            item.row,
                            item.material,
                            item.plant,
                            item.reason
                          ]);
                          const csv = `${headers.join(',')}\n${rows.map(r => r.join(',')).join('\n')}`;
                          const blob = new Blob([csv], { type: 'text/csv' });
                          const url = window.URL.createObjectURL(blob);
                          const a = document.createElement('a');
                          a.href = url;
                          a.download = `materials_upload_failed_${new Date().toISOString().split('T')[0]}.csv`;
                          a.click();
                          toast.success('Failed items exported');
                        }}
                      >
                        <Download className="w-3 h-3 mr-1" />
                        Export Failed
                      </Button>
                    </div>
                    <div className="max-h-60 overflow-y-auto">
                      <table className="w-full text-sm">
                        <thead className="bg-gray-100 sticky top-0">
                          <tr>
                            <th className="px-2 py-1 text-left">Row</th>
                            <th className="px-2 py-1 text-left">Material</th>
                            <th className="px-2 py-1 text-left">Plant</th>
                            <th className="px-2 py-1 text-left">Reason</th>
                          </tr>
                        </thead>
                        <tbody>
                          {uploadSummary.failedItems.map((item, index) => (
                            <tr key={index} className="border-b border-gray-200">
                              <td className="px-2 py-1 text-gray-600">{item.row}</td>
                              <td className="px-2 py-1">{item.material}</td>
                              <td className="px-2 py-1">{item.plant}</td>
                              <td className="px-2 py-1 text-red-600">{item.reason}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            )}

            {uploadPreview.length > 0 && !uploadSummary && (
              <div className="border border-gray-200 rounded-lg overflow-hidden">
                <div className="bg-gray-50 px-4 py-2 border-b border-gray-200">
                  <p className="text-sm text-gray-700">Preview (first 5 rows)</p>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-100">
                      <tr>
                        <th className="px-2 py-1 text-left">Material</th>
                        <th className="px-2 py-1 text-left">Description</th>
                        <th className="px-2 py-1 text-left">UoM</th>
                        <th className="px-2 py-1 text-left">Brand</th>
                        <th className="px-2 py-1 text-left">Plant</th>
                      </tr>
                    </thead>
                    <tbody>
                      {uploadPreview.slice(0, 5).map((row, index) => (
                        <tr key={index} className="border-b border-gray-200">
                          <td className="px-2 py-1">{row.material}</td>
                          <td className="px-2 py-1">{row.materialDescription}</td>
                          <td className="px-2 py-1">{row.baseUnitOfMeasure}</td>
                          <td className="px-2 py-1">{row.extMaterialGroup}</td>
                          <td className="px-2 py-1">{row.plant}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>

          <DialogFooter>
            {uploadSummary ? (
              <Button onClick={() => {
                setIsUploadDialogOpen(false);
                setUploadedFile(null);
                setUploadPreview([]);
                setUploadErrors([]);
                setUploadSummary(null);
                if (fileInputRef.current) {
                  fileInputRef.current.value = '';
                }
              }}>
                Close
              </Button>
            ) : (
              <>
                <Button variant="outline" onClick={() => {
                  setIsUploadDialogOpen(false);
                  setUploadedFile(null);
                  setUploadPreview([]);
                  setUploadErrors([]);
                  setUploadSummary(null);
                  if (fileInputRef.current) {
                    fileInputRef.current.value = '';
                  }
                }}>
                  Cancel
                </Button>
                <Button 
                  onClick={handleBulkUpload}
                  disabled={uploadErrors.length > 0 || uploadPreview.length === 0}
                >
                  Import {uploadPreview.length} Rows
                </Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
