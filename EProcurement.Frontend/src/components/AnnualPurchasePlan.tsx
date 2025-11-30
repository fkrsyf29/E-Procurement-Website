import { useState, useEffect, useMemo, useRef } from 'react';
import { 
  Search, Plus, Edit2, Trash2, Upload, Download, 
  ArrowUpDown, ArrowUp, ArrowDown, Loader2, AlertCircle, CheckCircle, FileSpreadsheet
} from 'lucide-react';

// UI Components
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from './ui/dialog';
import { Badge } from './ui/badge';
import { toast } from 'sonner';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from './ui/alert-dialog';

// Types & API
import { User } from '../types';
import { Material, MaterialCreatePayload, MaterialUpdatePayload } from '../types/materialTypes';
import { fetchAllMaterials, createMaterialApi, updateMaterialApi, deleteMaterialApi, bulkUploadMaterialsApi } from '../services/materialApi';

// Master Data API Imports
import { fetchApiJobsite } from '../services/jobsiteApi';
import { fetchApiDepartment } from '../services/departmentApi';
import { fetchSystemDataApi } from '../services/systemDataApi'; 

// --- PROPS INTERFACE ---
interface AnnualPurchasePlanProps {
  user: User;
}

// Helper Sort Type
type SortField = keyof Material;
type SortDirection = 'asc' | 'desc' | null;

export function AnnualPurchasePlan({ user }: AnnualPurchasePlanProps) {
  // --- STATE: Data Utama ---
  const [materials, setMaterials] = useState<Material[]>([]);
  const [loading, setLoading] = useState(true);
  
  // --- STATE: Master Data Options (Dropdowns) ---
  const [jobsiteOptions, setJobsiteOptions] = useState<{id: string, name: string}[]>([]);
  const [deptOptions, setDeptOptions] = useState<{id: string, name: string}[]>([]);
  const [uomOptions, setUomOptions] = useState<{id: string, value: string}[]>([]);
  const [brandOptions, setBrandOptions] = useState<{id: string, value: string}[]>([]);
  const [valuationOptions, setValuationOptions] = useState<{id: string, value: string}[]>([]);
  const [matGroupOptions, setMatGroupOptions] = useState<{id: string, value: string, desc?: string}[]>([]);
  const [vendorOptions, setVendorOptions] = useState<{id: string, name: string}[]>([]); 

  // --- STATE: UI Interaction ---
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState<SortField | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>(null);
  
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [selectedMaterial, setSelectedMaterial] = useState<Material | null>(null);

  // --- STATE: Upload CSV ---
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

  // --- FORM STATE (Initial Value) ---
  const initialFormState: MaterialCreatePayload = {
    materialCode: '',
    description: '',
    uomId: 0,
    externalBrandId: null,
    valuationClassId: null,
    materialGroupId: null,
    subClassificationId: null,
    jobsiteId: 0,
    departmentId: 0,
    qty: 0,
    estimatedPrice: 0,
    contractTypeId: null,
    vendorId: 0,
    vendorName: '',
    contractNumber: '',
    contractName: '',
    contractStartDate: null,
    contractEndDate: null,
    isUnique: false,
    createdBy: user.username
  };

  const [formData, setFormData] = useState<MaterialCreatePayload>(initialFormState);

  // --- 1. FETCH ALL INITIAL DATA ---
  useEffect(() => {
    const initData = async () => {
      setLoading(true);
      try {
        // 1. Fetch Materials
        const matData = await fetchAllMaterials();
        setMaterials(matData);

        // 2. Fetch Master Data (Parallel)
        const [jobsites, depts, sysData] = await Promise.all([
          fetchApiJobsite(),
          fetchApiDepartment(),
          fetchSystemDataApi()
        ]);

        // Map Jobsite & Dept
        if (jobsites) setJobsiteOptions(jobsites.map((j: any) => ({ id: String(j.jobsiteID || j.id), name: j.name })));
        if (depts) setDeptOptions(depts.map((d: any) => ({ id: String(d.departmentID || d.id), name: d.name })));

        // Map System Data
        if (sysData) {
          const uomCat = sysData.find(c => c.code === 'uom')?.items || [];
          const brandCat = sysData.find(c => c.code === 'externalBrand')?.items || [];
          const valCat = sysData.find(c => c.code === 'valuationClass')?.items || [];
          const groupCat = sysData.find(c => c.code === 'materialGroup')?.items || [];

          setUomOptions(uomCat.map(i => ({ id: i.id, value: i.value })));
          setBrandOptions(brandCat.map(i => ({ id: i.id, value: i.value })));
          setValuationOptions(valCat.map(i => ({ id: i.id, value: i.value })));
          setMatGroupOptions(groupCat.map(i => ({ id: i.id, value: i.value, desc: (i as any).description })));
        }

        // MOCK VENDOR (Sementara)
        setVendorOptions([
          { id: '1', name: 'PT. Trakindo Utama' },
          { id: '2', name: 'PT. United Tractors' }
        ]);

      } catch (error) {
        console.error("Failed to load data", error);
        toast.error("Gagal memuat data. Cek koneksi server.");
      } finally {
        setLoading(false);
      }
    };

    initData();
  }, []);

  // --- HELPERS FOR DISPLAY (Penting untuk mengganti ID jadi Nama di Tabel) ---
  const getJobsiteName = (id: number) => jobsiteOptions.find(j => Number(j.id) === id)?.name || id;
  const getDeptName = (id: number) => deptOptions.find(d => Number(d.id) === id)?.name || id;
  const getUomName = (id: number) => uomOptions.find(u => Number(u.id) === id)?.value || id;

  // --- HANDLERS: CRUD ---

  const resetForm = () => {
    setFormData(initialFormState);
  };

  const handleAddMaterial = async () => {
    if (!formData.materialCode || !formData.description || !formData.jobsiteId || !formData.departmentId || !formData.uomId) {
      toast.error("Mohon lengkapi field bertanda bintang (*)");
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        ...formData,
        jobsiteId: Number(formData.jobsiteId),
        departmentId: Number(formData.departmentId),
        uomId: Number(formData.uomId),
        vendorId: Number(formData.vendorId) || 1, // Mock
        createdBy: user.username
      };

      const newMat = await createMaterialApi(payload);
      setMaterials(prev => [...prev, newMat]);
      toast.success("Material berhasil ditambahkan");
      setIsAddDialogOpen(false);
      resetForm();
    } catch (error) {
      // handled by service
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateMaterial = async () => {
    if (!selectedMaterial) return;

    setIsSubmitting(true);
    try {
      const payload: MaterialUpdatePayload = {
        ...formData,
        materialId: Number(selectedMaterial.id),
        updatedBy: user.username,
        jobsiteId: Number(formData.jobsiteId),
        departmentId: Number(formData.departmentId),
        uomId: Number(formData.uomId),
        vendorId: Number(formData.vendorId)
      };

      const updatedMat = await updateMaterialApi(payload);
      setMaterials(prev => prev.map(m => m.id === updatedMat.id ? updatedMat : m));
      toast.success("Material berhasil diupdate");
      setIsEditDialogOpen(false);
      setSelectedMaterial(null);
    } catch (error) {
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteMaterial = async () => {
    if (!selectedMaterial) return;
    try {
      await deleteMaterialApi(selectedMaterial.id, user.username);
      setMaterials(prev => prev.filter(m => m.id !== selectedMaterial.id));
      toast.success("Material berhasil dihapus");
      setIsDeleteDialogOpen(false);
    } catch (error) {
      // handled
    }
  };

  const openEditDialog = (mat: Material) => {
    setSelectedMaterial(mat);
    setFormData({
      materialCode: mat.materialCode,
      description: mat.description,
      uomId: mat.uomId,
      externalBrandId: mat.externalBrandId,
      valuationClassId: mat.valuationClassId,
      materialGroupId: mat.materialGroupId,
      subClassificationId: mat.subClassificationId,
      jobsiteId: mat.jobsiteId,
      departmentId: mat.departmentId,
      qty: mat.qty,
      estimatedPrice: mat.estimatedPrice,
      contractTypeId: mat.contractTypeId,
      vendorId: mat.vendorId || 0,
      vendorName: mat.vendorName,
      contractNumber: mat.contractNumber,
      contractName: mat.contractName,
      contractStartDate: mat.contractStartDate || null,
      contractEndDate: mat.contractEndDate || null,
      isUnique: mat.isUnique,
      createdBy: mat.createdBy
    });
    setIsEditDialogOpen(true);
  };

  const openDeleteDialog = (material: Material) => {
    setSelectedMaterial(material);
    setIsDeleteDialogOpen(true);
  };

  // --- HANDLERS: BULK UPLOAD ---
  
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadedFile(file);
    setUploadSummary(null);
    
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const lines = text.split('\n').filter(line => line.trim());
        const data = lines.slice(1).map((line, index) => {
          const values = line.split(',').map(v => v.trim());
          return {
            row: index + 2,
            materialCode: values[0],
            description: values[1],
            uom: values[2], 
            plant: values[8] 
          };
        });
        setUploadPreview(data);
        toast.success(`File validated: ${data.length} rows found`);
      } catch (error) {
        toast.error('Failed to parse CSV file');
      }
    };
    reader.readAsText(file);
  };

  const handleBulkUpload = async () => {
    toast.info("Bulk upload logic needs ID mapping implementation.");
  };

  const handleDownloadTemplate = () => {
    const headers = ['MaterialCode', 'Description', 'UOM_ID', 'Brand_ID', 'Jobsite_ID', 'Dept_ID', 'Qty', 'Price'];
    const sample = ['10212-986', 'HOSE', '1', '2', '10', '5', '100', '250.00'];
    const csv = `${headers.join(',')}\n${sample.join(',')}`;
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'materials_template.csv';
    a.click();
  };

  const handleExportMaterials = () => {
    const headers = ['Material', 'Description', 'UoM', 'Brand', 'ValClass', 'MatGroup', 'SubClass', 'Jobsite', 'Plant', 'Qty', 'Price'];
    const rows = materials.map(m => [
      m.materialCode, m.description, m.uomName, m.externalBrandName, m.valuationClassName, m.materialGroupName, m.subClassificationName, m.jobsiteName, m.departmentName, m.qty, m.estimatedPrice
    ]);
    const csv = `${headers.join(',')}\n${rows.map(r => r.join(',')).join('\n')}`;
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'materials_export.csv';
    a.click();
  };

  // --- SORTING ---
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) return <ArrowUpDown className="w-3 h-3 ml-1 inline text-gray-300" />;
    return sortDirection === 'asc' ? <ArrowUp className="w-3 h-3 ml-1 inline text-blue-600" /> : <ArrowDown className="w-3 h-3 ml-1 inline text-blue-600" />;
  };

  // --- FILTERING & SORTING LOGIC ---
  const filteredMaterials = useMemo(() => {
    let filtered = materials.filter(m => 
      m.materialCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (m.jobsiteName || '').toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (sortField && sortDirection) {
      filtered = [...filtered].sort((a, b) => {
        const aVal = a[sortField];
        const bVal = b[sortField];
        if (aVal === undefined || bVal === undefined) return 0;
        
        if (typeof aVal === 'number' && typeof bVal === 'number') {
          return sortDirection === 'asc' ? aVal - bVal : bVal - aVal;
        }
        const aStr = String(aVal).toLowerCase();
        const bStr = String(bVal).toLowerCase();
        if (aStr < bStr) return sortDirection === 'asc' ? -1 : 1;
        if (aStr > bStr) return sortDirection === 'asc' ? 1 : -1;
        return 0;
      });
    }
    return filtered;
  }, [materials, searchTerm, sortField, sortDirection]);

  // --- RENDER ---
  if (loading) {
    return <div className="flex h-96 items-center justify-center"><Loader2 className="animate-spin w-10 h-10 text-blue-600"/></div>;
  }

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
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-800">Total Materials</p>
            <p className="text-2xl text-blue-900 mt-1">{materials.length}</p>
          </div>
          <div className="bg-teal-50 border border-teal-200 rounded-lg p-4">
            <p className="text-sm text-teal-800">Unique Brands</p>
            <p className="text-2xl text-teal-900 mt-1">{new Set(materials.map(m => m.externalBrandId)).size}</p>
          </div>
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
            <p className="text-sm text-purple-800">Plants</p>
            <p className="text-2xl text-purple-900 mt-1">{new Set(materials.map(m => m.departmentId)).size}</p>
          </div>
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
            <p className="text-sm text-orange-800">Material Groups</p>
            <p className="text-2xl text-orange-900 mt-1">{new Set(materials.map(m => m.materialGroupId)).size}</p>
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
                <th className="px-4 py-3 text-left text-xs text-gray-700 cursor-pointer hover:bg-gray-100" onClick={() => handleSort('materialCode')}>
                  Material {getSortIcon('materialCode')}
                </th>
                <th className="px-4 py-3 text-left text-xs text-gray-700 cursor-pointer hover:bg-gray-100" onClick={() => handleSort('description')}>
                  Description {getSortIcon('description')}
                </th>
                <th className="px-4 py-3 text-left text-xs text-gray-700">UoM</th>
                <th className="px-4 py-3 text-left text-xs text-gray-700">Brand</th>
                <th className="px-4 py-3 text-left text-xs text-gray-700">Val. Class</th>
                <th className="px-4 py-3 text-left text-xs text-gray-700">Mat. Group</th>
                <th className="px-4 py-3 text-left text-xs text-gray-700">Group Desc</th>
                <th className="px-4 py-3 text-left text-xs text-gray-700">Sub-Class</th>
                <th className="px-4 py-3 text-left text-xs text-gray-700">Jobsite</th>
                <th className="px-4 py-3 text-left text-xs text-gray-700">Plant</th>
                <th className="px-4 py-3 text-right text-xs text-gray-700 cursor-pointer hover:bg-gray-100" onClick={() => handleSort('qty')}>
                  Qty {getSortIcon('qty')}
                </th>
                <th className="px-4 py-3 text-right text-xs text-gray-700 cursor-pointer hover:bg-gray-100" onClick={() => handleSort('estimatedPrice')}>
                  Price (USD) {getSortIcon('estimatedPrice')}
                </th>
                <th className="px-4 py-3 text-center text-xs text-gray-700">Type</th>
                <th className="px-4 py-3 text-left text-xs text-gray-700">Vendor</th>
                <th className="px-4 py-3 text-left text-xs text-gray-700">Contract No</th>
                <th className="px-4 py-3 text-left text-xs text-gray-700">Contract Name</th>
                <th className="px-4 py-3 text-left text-xs text-gray-700">Start Date</th>
                <th className="px-4 py-3 text-left text-xs text-gray-700">End Date</th>
                <th className="px-4 py-3 text-right text-xs text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredMaterials.length === 0 ? (
                <tr>
                  <td colSpan={19} className="px-4 py-8 text-center text-gray-500">
                    {searchTerm ? 'No materials found matching your search' : 'No materials in database'}
                  </td>
                </tr>
              ) : (
                filteredMaterials.map((material) => (
                  <tr key={material.id} className="border-b border-gray-200 hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm text-gray-900">{material.materialCode}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">{material.description}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      <Badge variant="outline">{material.uomName || getUomName(material.uomId)}</Badge>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900">{material.externalBrandName}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{material.valuationClassName}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{material.materialGroupName}</td>
                    <td className="px-4 py-3 text-sm text-gray-600 max-w-xs truncate" title={material.materialGroupDesc}>
                      {material.materialGroupDesc}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">{material.subClassificationName}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">{material.jobsiteName || getJobsiteName(material.jobsiteId)}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{material.departmentName || getDeptName(material.departmentId)}</td>
                    <td className="px-4 py-3 text-sm text-gray-900 text-right">{material.qty || '-'}</td>
                    <td className="px-4 py-3 text-sm text-gray-900 text-right">
                      {material.estimatedPrice ? `$${Math.round(material.estimatedPrice).toLocaleString('en-US')}` : '-'}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {material.contractTypeName ? (
                        <Badge variant={material.contractTypeName === 'Contractual' ? 'default' : 'secondary'}>
                          {material.contractTypeName}
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
                          onClick={() => { setSelectedMaterial(material); setIsDeleteDialogOpen(true); }}
                        >
                          <Trash2 className="w-4 h-4 text-red-600" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add/Edit Material Dialog */}
      <Dialog open={isAddDialogOpen || isEditDialogOpen} onOpenChange={(open) => {
        if(!open) { setIsAddDialogOpen(false); setIsEditDialogOpen(false); }
      }}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{isEditDialogOpen ? 'Edit Material' : 'Add New Material'}</DialogTitle>
            <DialogDescription>Enter material details below</DialogDescription>
          </DialogHeader>
          
          <div className="grid grid-cols-2 gap-4 py-4">
            <div>
              <Label>Material Code <span className="text-red-600">*</span></Label>
              <Input
                value={formData.materialCode}
                onChange={(e) => setFormData({ ...formData, materialCode: e.target.value })}
                placeholder="e.g., 10212-986"
              />
            </div>
            <div>
              <Label>Material Description <span className="text-red-600">*</span></Label>
              <Input
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="e.g., HOSE ASSEMBLY"
              />
            </div>
            <div>
              <Label>Base Unit of Measure <span className="text-red-600">*</span></Label>
              <Select
                value={String(formData.uomId)}
                onValueChange={(value) => setFormData({ ...formData, uomId: Number(value) })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select UoM" />
                </SelectTrigger>
                <SelectContent className="max-h-[200px]">
                  {uomOptions.map((uom) => (
                    <SelectItem key={uom.id} value={String(uom.id)}>{uom.value}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>External Brand</Label>
              <Select
                value={String(formData.externalBrandId || '')}
                onValueChange={(value) => setFormData({ ...formData, externalBrandId: Number(value) })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select brand" />
                </SelectTrigger>
                <SelectContent className="max-h-[200px]">
                  {brandOptions.map((brand) => (
                    <SelectItem key={brand.id} value={String(brand.id)}>{brand.value}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Valuation Class</Label>
              <Select
                value={String(formData.valuationClassId || '')}
                onValueChange={(value) => setFormData({ ...formData, valuationClassId: Number(value) })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select valuation class" />
                </SelectTrigger>
                <SelectContent className="max-h-[200px]">
                  {valuationOptions.map((valClass) => (
                    <SelectItem key={valClass.id} value={String(valClass.id)}>{valClass.value}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Material Group</Label>
              <Select
                value={String(formData.materialGroupId || '')}
                onValueChange={(value) => setFormData({ ...formData, materialGroupId: Number(value) })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select material group" />
                </SelectTrigger>
                <SelectContent className="max-h-[200px]">
                  {matGroupOptions.map((group) => (
                    <SelectItem key={group.id} value={String(group.id)}>{group.value}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="col-span-2">
              <Label>Material Group Description <span className="text-xs text-gray-500">(Auto-filled)</span></Label>
              <Input
                value={formData.materialGroupDesc || ''}
                readOnly
                disabled
                className="bg-gray-50"
                placeholder="Auto-filled based on Material Group selection"
              />
            </div>
            <div className="col-span-2">
              <Label>Sub-Classification</Label>
              <Input disabled placeholder="Logic sub-classification belum diimplementasi" />
            </div>
            <div>
              <Label>Jobsite <span className="text-red-600">*</span></Label>
              <Select
                value={String(formData.jobsiteId)}
                onValueChange={(value) => setFormData({ ...formData, jobsiteId: Number(value) })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select jobsite" />
                </SelectTrigger>
                <SelectContent className="max-h-[200px]">
                  {jobsiteOptions.map((jobsite) => (
                    <SelectItem key={jobsite.id} value={jobsite.id}>{jobsite.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Department (Plant) <span className="text-red-600">*</span></Label>
              <Select
                value={String(formData.departmentId)}
                onValueChange={(value) => setFormData({ ...formData, departmentId: Number(value) })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Department" />
                </SelectTrigger>
                <SelectContent className="max-h-[200px]">
                  {deptOptions.map((dept) => (
                    <SelectItem key={dept.id} value={dept.id}>{dept.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
                    value={String(formData.contractTypeId || '')}
                    onValueChange={(value) => setFormData({ ...formData, contractTypeId: Number(value) })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">Contractual (Mock)</SelectItem>
                      <SelectItem value="2">Non-Contractual (Mock)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Vendor</Label>
                  <Select
                    value={String(formData.vendorId)}
                    onValueChange={(value) => setFormData({ ...formData, vendorId: Number(value) })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select Vendor" />
                    </SelectTrigger>
                    <SelectContent>
                      {vendorOptions.map(v => (
                        <SelectItem key={v.id} value={v.id}>{v.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                {/* Other Contract Fields */}
                <div>
                  <Label>Contract Number</Label>
                  <Input
                    value={formData.contractNumber}
                    onChange={(e) => setFormData({ ...formData, contractNumber: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Contract Name</Label>
                  <Input
                    value={formData.contractName}
                    onChange={(e) => setFormData({ ...formData, contractName: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Contract Start Date</Label>
                  <Input
                    type="date"
                    value={formData.contractStartDate || ''}
                    onChange={(e) => setFormData({ ...formData, contractStartDate: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Contract End Date</Label>
                  <Input
                    type="date"
                    value={formData.contractEndDate || ''}
                    onChange={(e) => setFormData({ ...formData, contractEndDate: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Unique</Label>
                  <Select
                    value={formData.isUnique ? 'true' : 'false'}
                    onValueChange={(val) => setFormData({ ...formData, isUnique: val === 'true' })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="false">No</SelectItem>
                      <SelectItem value="true">Yes</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>Cancel</Button>
            <Button onClick={isEditDialogOpen ? handleUpdateMaterial : handleAddMaterial} disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="animate-spin w-4 h-4 mr-2" />}
              {isEditDialogOpen ? 'Update' : 'Save'}
            </Button>
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
              <p className="text-sm"><strong>Material:</strong> {selectedMaterial.materialCode}</p>
              <p className="text-sm"><strong>Description:</strong> {selectedMaterial.description}</p>
              <p className="text-sm"><strong>Plant:</strong> {selectedMaterial.departmentName}</p>
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
                          <td className="px-2 py-1">{row.materialCode}</td>
                          <td className="px-2 py-1">{row.description}</td>
                          <td className="px-2 py-1">{row.uom}</td>
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