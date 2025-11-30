import { useState, useMemo, useEffect } from 'react';
import { Plus, Pencil, Trash2, Search, Filter, X, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import { formatCurrency } from '../utils/formatters';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from './ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from './ui/alert-dialog';
import { toast } from 'sonner';
// IMPORTS TYPES & API
import { ApprovalMatrixDto, ApprovalStepRequest, ApprovalMatrixSaveRequest } from '../types/approvalMatrixTypes';
import { Departments, Jobsites, ApprovalRoles, User } from '../types';
import { fetchApprovalMatrices, saveApprovalMatrix, deleteApprovalMatrix } from '../services/approvalMatrixApi';

interface ApprovalMatrixManagementProps {
  user: User | null;
  departments: Departments[];
  jobsites: Jobsites[];
  roles: ApprovalRoles[];
}

const STEP_NAMES = ['Verificator', 'Viewer 1', 'Viewer 2', 'Approval 1', 'Approval 2', 'Approval 3', 'Approval 4'];

// Form Data Interface (State Lokal Form)
interface MatrixFormData {
  matrixID?: number;
  departmentID: string;
  jobsiteID: string;
  amountMin: number;
  amountMax: number | null;
  groupName: string;
  steps: {
    tempId: number;
    stepName: string;
    approvalRoleID: string;
  }[];
}

type SortField = 'department' | 'jobsite' | 'amountMin' | 'group';
type SortDirection = 'asc' | 'desc';

export function ApprovalMatrixManagement({ user: propCurrentUser, departments, jobsites, roles }: ApprovalMatrixManagementProps) {
  // --- State ---
  const [matrices, setMatrices] = useState<ApprovalMatrixDto[]>([]); // Hanya fetch matrices
  const [isLoading, setIsLoading] = useState(false);

  // --- UI State ---
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDepartment, setFilterDepartment] = useState<string>('all');
  const [filterJobsite, setFilterJobsite] = useState<string>('all');

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const [selectedMatrix, setSelectedMatrix] = useState<ApprovalMatrixDto | null>(null);
  const [sortField, setSortField] = useState<SortField>('department');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');

  // Pagination state
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  // Form state
  const [formData, setFormData] = useState<MatrixFormData>({
    departmentID: '',
    jobsiteID: '',
    amountMin: 0,
    amountMax: null,
    groupName: '',
    steps: [],
  });

  const currentUserName = propCurrentUser?.username || 'System';

  useEffect(() => {
    loadMatrices();
  }, []);

  const loadMatrices = async () => {
    setIsLoading(true);
    try {
      const data = await fetchApprovalMatrices();
      if (data) setMatrices(data);
    } catch (error) {
      toast.error('Failed to load approval matrices');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterDepartment, filterJobsite, pageSize]);

  // Filter matrices
  const filteredMatrices = useMemo(() => {
    return matrices.filter(matrix => {
      const matchesSearch =
        matrix.groupName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        matrix.departmentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        matrix.jobsiteName.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesDepartment = filterDepartment === 'all' || matrix.departmentID.toString() === filterDepartment;
      const matchesJobsite = filterJobsite === 'all' || matrix.jobsiteID.toString() === filterJobsite;

      return matchesSearch && matchesDepartment && matchesJobsite;
    });
  }, [matrices, searchTerm, filterDepartment, filterJobsite]);

  // Sort matrices based on selected field and direction
  const sortedMatrices = useMemo(() => {
    return [...filteredMatrices].sort((a, b) => {
      let comparison = 0;
      switch (sortField) {
        case 'department': comparison = a.departmentName.localeCompare(b.departmentName); break;
        case 'jobsite': comparison = a.jobsiteName.localeCompare(b.jobsiteName); break;
        case 'amountMin': comparison = a.amountMin - b.amountMin; break;
        case 'group': comparison = a.groupName.localeCompare(b.groupName); break;
      }
      return sortDirection === 'asc' ? comparison : -comparison;
    });
  }, [filteredMatrices, sortField, sortDirection]);

  // Pagination calculation
  const paginatedMatrices = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return sortedMatrices.slice(start, start + pageSize);
  }, [sortedMatrices, currentPage, pageSize]);

  const totalPages = Math.ceil(sortedMatrices.length / pageSize);

  const resetForm = () => {
    setFormData({
      departmentID: '',
      jobsiteID: '',
      amountMin: 0,
      amountMax: null,
      groupName: '',
      steps: [],
    });
  };

  const validateForm = (): boolean => {
    if (!formData.departmentID || !formData.jobsiteID || !formData.groupName) {
      toast.error('Please fill in Department, Jobsite, and Group Name');
      return false;
    }
    if (formData.amountMin < 0) {
      toast.error('Minimum amount cannot be negative');
      return false;
    }
    if (formData.amountMax !== null && formData.amountMax <= formData.amountMin) {
      toast.error('Maximum amount must be greater than minimum amount');
      return false;
    }
    if (formData.steps.length === 0) {
      toast.error('Please add at least one approval step');
      return false;
    }
    if (formData.steps.some(s => !s.stepName || !s.approvalRoleID)) {
      toast.error('All approval steps must have a Name and a Role selected');
      return false;
    }
    return true;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    try {
      const payload: ApprovalMatrixSaveRequest = {
        matrixID: formData.matrixID || null,
        departmentID: parseInt(formData.departmentID),
        jobsiteID: parseInt(formData.jobsiteID),
        amountMin: formData.amountMin,
        amountMax: formData.amountMax,
        groupName: formData.groupName,
        isActive: true,
        user: currentUserName,
        steps: formData.steps.map((s, index) => ({
          stepNumber: index + 1,
          stepName: s.stepName,
          approvalRoleID: parseInt(s.approvalRoleID)
        }))
      };

      await saveApprovalMatrix(payload);
      toast.success(`Approval matrix ${formData.matrixID ? 'updated' : 'added'} successfully`);

      loadMatrices();
      setIsAddDialogOpen(false);
      setIsEditDialogOpen(false);
      resetForm();
    } catch (error: any) {
      toast.error(error.message || 'Failed to save matrix');
    }
  };

  const handleEditClick = (matrix: ApprovalMatrixDto) => {
    setSelectedMatrix(matrix);
    setFormData({
      matrixID: matrix.matrixID,
      departmentID: matrix.departmentID.toString(),
      jobsiteID: matrix.jobsiteID.toString(),
      amountMin: matrix.amountMin,
      amountMax: matrix.amountMax,
      groupName: matrix.groupName,
      steps: matrix.approvalPath.map((step, idx) => ({
        tempId: Date.now() + idx,
        stepName: step.stepName,
        approvalRoleID: step.approvalRoleID.toString()
      }))
    });
    setIsEditDialogOpen(true);
  };

  const handleDeleteClick = (matrix: ApprovalMatrixDto) => {
    setSelectedMatrix(matrix);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteMatrix = async () => {
    if (!selectedMatrix) return;
    try {
        await deleteApprovalMatrix(selectedMatrix.matrixID,currentUserName);
        toast.success('Matrix deleted successfully');
        loadMatrices();
    } catch (error) {
        toast.error('Failed to delete matrix');
    } finally {
        setIsDeleteDialogOpen(false);
        setSelectedMatrix(null);
    }
  };

  // --- STEP HANDLERS (Sama) ---
  const addStep = () => {
    setFormData(prev => ({
      ...prev,
      steps: [...prev.steps, { tempId: Date.now(), stepName: 'Approval 1', approvalRoleID: '' }]
    }));
  };

  const removeStep = (index: number) => {
    setFormData(prev => ({
      ...prev,
      steps: prev.steps.filter((_, i) => i !== index)
    }));
  };

  const updateStep = (index: number, field: string, value: string) => {
    const newSteps = [...formData.steps];
    newSteps[index] = { ...newSteps[index], [field]: value };
    setFormData(prev => ({ ...prev, steps: newSteps }));
  };

  // --- RENDER FORM (Menggunakan props departments, jobsites, roles) ---
  const renderSortIcon = (field: SortField) => {
    if (sortField !== field) {
      return <ArrowUpDown className="h-4 w-4 ml-1 inline-block text-gray-400" />;
    }
    return sortDirection === 'asc'
      ? <ArrowUp className="h-4 w-4 ml-1 inline-block text-blue-600" />
      : <ArrowDown className="h-4 w-4 ml-1 inline-block text-blue-600" />;
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const renderFormContent = () => (
    <div className="space-y-4 py-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Department *</Label>
          <Select
            value={formData.departmentID}
            onValueChange={(v) => setFormData({ ...formData, departmentID: v })}
          >
            <SelectTrigger><SelectValue placeholder="Select Department" /></SelectTrigger>
            <SelectContent>
              {departments.map(d => (
                <SelectItem key={d.departmentID} value={d.departmentID.toString()}>{d.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>Jobsite *</Label>
          <Select
            value={formData.jobsiteID}
            onValueChange={(v) => setFormData({ ...formData, jobsiteID: v })}
          >
            <SelectTrigger><SelectValue placeholder="Select Jobsite" /></SelectTrigger>
            <SelectContent>
              {jobsites.map(j => (
                <SelectItem key={j.jobsiteID} value={j.jobsiteID.toString()}>{j.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Min Amount (USD)</Label>
          <Input
            type="number"
            value={formData.amountMin.toString()}
            onFocus={(e) => {
              if (formData.amountMin === 0) {
                setFormData({ ...formData, amountMin: "" });
              }
            }}

            onChange={(e) => {
                const val = e.target.value;
                setFormData({ 
                  ...formData, 
                  amountMin: val === "" ? "" : parseFloat(val) 
                });
              }}
              onBlur={() => {
                if (formData.amountMin === "" || isNaN(formData.amountMin)) {
                  setFormData({ ...formData, amountMin: 0 });
                }
              }}
            />
        </div>
        <div>
          <Label>Max Amount (USD)</Label>
          <Input
            type="number"
            placeholder="Unlimited"
            value={formData.amountMax === null ? '' : formData.amountMax}
            onChange={e => setFormData({ ...formData, amountMax: e.target.value ? parseFloat(e.target.value) : null })}
          />
        </div>
      </div>

      <div>
        <Label>Group Name *</Label>
        <Input
          value={formData.groupName}
          onChange={e => setFormData({ ...formData, groupName: e.target.value })}
          placeholder="e.g. Creator Plant Development"
        />
      </div>

      <div className="border rounded-md p-3 bg-gray-50">
        <div className="flex justify-between items-center mb-2">
          <Label>Approval Path</Label>
          <Button type="button" size="sm" variant="outline" onClick={addStep}>
            <Plus className="w-4 h-4 mr-1" /> Add Step
          </Button>
        </div>
        <div className="space-y-2 max-h-60 overflow-y-auto">
          {formData.steps.map((step, idx) => (
            <div key={step.tempId} className="flex gap-2 items-center bg-white p-2 rounded border">
              <span className="text-sm font-bold w-6 text-center">{idx + 1}</span>

              <Select value={step.stepName} onValueChange={v => updateStep(idx, 'stepName', v)}>
                <SelectTrigger className="w-[140px]"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {STEP_NAMES.map(n => <SelectItem key={n} value={n}>{n}</SelectItem>)}
                </SelectContent>
              </Select>

              <Select value={step.approvalRoleID} onValueChange={v => updateStep(idx, 'approvalRoleID', v)}>
                <SelectTrigger className="flex-1"><SelectValue placeholder="Select Role" /></SelectTrigger>
                <SelectContent>
                  {roles.map(r => (
                    <SelectItem key={r.approvalRoleID} value={r.approvalRoleID.toString()}>{r.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Button type="button" variant="ghost" size="icon" onClick={() => removeStep(idx)}>
                <X className="w-4 h-4 text-red-500" />
              </Button>
            </div>
          ))}
          {formData.steps.length === 0 && <p className="text-xs text-center text-gray-400">No steps defined</p>}
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl">Approval Matrix Management</h2>
          <p className="text-sm text-gray-600 mt-1">
            Manage dynamic approval workflows based on department, jobsite, and amount
          </p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm} className="bg-blue-600 hover:bg-blue-700 text-white">
              <Plus className="h-4 w-4 mr-2" />
              Add Matrix
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add New Approval Matrix</DialogTitle>
              <DialogDescription>
                Define approval workflow for specific department, jobsite, and amount range
              </DialogDescription>
            </DialogHeader>
            {renderFormContent()}
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSave} className="bg-blue-600 text-white">Save Matrix</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search by group, department, or jobsite..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>

        <Select value={filterDepartment} onValueChange={setFilterDepartment}>
          <SelectTrigger>
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Filter by Department" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Departments</SelectItem>
            {departments.map(dept => (
              <SelectItem key={dept.departmentID} value={dept.name}>{dept.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={filterJobsite} onValueChange={setFilterJobsite}>
          <SelectTrigger>
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Filter by Jobsite" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Jobsites</SelectItem>
            {jobsites.map(site => (
              <SelectItem key={site.jobsiteID} value={site.name}>{site.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="text-sm text-blue-600">Total Matrices</div>
          <div className="text-2xl mt-1">{matrices.length}</div>
        </div>
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="text-sm text-green-600">Active Departments</div>
          <div className="text-2xl mt-1">
            {new Set(matrices.filter(a => a.isActive).map(m => m.departmentID)).size}
          </div>
        </div>
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
          <div className="text-sm text-purple-600">Active Jobsites</div>
          <div className="text-2xl mt-1">
            {new Set(matrices.filter(a => a.isActive).map(m => m.jobsiteID)).size}
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead style={{ backgroundColor: '#E6F2FF' }} className="border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-gray-700 cursor-pointer hover:bg-gray-100" onClick={() => handleSort('department')}>
                  Department {renderSortIcon('department')}
                </th>
                <th className="px-4 py-3 text-left font-medium text-gray-700 cursor-pointer hover:bg-gray-100" onClick={() => handleSort('jobsite')}>
                  Jobsite {renderSortIcon('jobsite')}
                </th>
                <th className="px-4 py-3 text-left font-medium text-gray-700 cursor-pointer hover:bg-gray-100" onClick={() => handleSort('amountMin')}>
                  Amount Range {renderSortIcon('amountMin')}
                </th>
                <th className="px-4 py-3 text-left font-medium text-gray-700 cursor-pointer hover:bg-gray-100" onClick={() => handleSort('group')}>
                  Group {renderSortIcon('group')}
                </th>
                <th className="px-4 py-3 text-left text-sm">Approval Path</th>
                <th className="px-4 py-3 text-right text-sm">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {isLoading ? (
                <tr><td colSpan={6} className="p-8 text-center text-gray-500">Loading data...</td></tr>
              ) : paginatedMatrices.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                    No approval matrices found. Add one to get started.
                  </td>
                </tr>
              ) : (
                paginatedMatrices.map((matrix) => (
                  <tr key={matrix.matrixID} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 border border-blue-200">
                        {matrix.departmentName}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-800 border border-purple-200">
                        {matrix.jobsiteName}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-sm">
                        <div>{formatCurrency(matrix.amountMin)}</div>
                        <div className="text-gray-500">
                          to {matrix.amountMax ? formatCurrency(matrix.amountMax) : '∞'}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm">{matrix.groupName}</td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1">
                        {matrix.approvalPath.map(step => (
                          <span
                            key={step.stepNumber}
                            className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-gray-100 text-gray-700 border border-gray-300"
                            title={`${step.stepName}: ${step.roleName}`}
                          >
                            {step.stepNumber}. {step.roleName}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditClick(matrix)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteClick(matrix)}
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        {/* Pagination */}
        {sortedMatrices.length > 0 && (
          <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 bg-gray-50 border-t border-gray-200">
            {/* Showing info */}
            <p className="text-sm text-gray-700">
              Showing {(currentPage - 1) * pageSize + 1} to{' '}
              {Math.min(currentPage * pageSize, sortedMatrices.length)} of {sortedMatrices.length} matrices
            </p>

            {/* Page size + Navigation */}
            <div className="flex flex-wrap items-center gap-3">
              {/* Page Size Selector */}
              <div className="flex items-center gap-2">
                <Label htmlFor="pageSizeMatrix" className="text-sm text-gray-700 whitespace-nowrap">
                  Rows per page:
                </Label>
                <Select value={pageSize.toString()} onValueChange={(v) => setPageSize(Number(v))}>
                  <SelectTrigger id="pageSizeMatrix" className="w-20">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="5">5</SelectItem>
                    <SelectItem value="10">10</SelectItem>
                    <SelectItem value="25">25</SelectItem>
                    <SelectItem value="50">50</SelectItem>
                    <SelectItem value="100">100</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Navigation Buttons */}
              <div className="flex items-center gap-1">
                <Button size="sm" variant="outline" onClick={() => setCurrentPage(1)} disabled={currentPage === 1}>
                  First
                </Button>
                <Button size="sm" variant="outline" onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}>
                  Previous
                </Button>

                <span className="text-sm text-gray-700 px-2">
                  Page <strong>{currentPage}</strong> of <strong>{totalPages}</strong>
                </span>

                <Button size="sm" variant="outline" onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}>
                  Next
                </Button>
                <Button size="sm" variant="outline" onClick={() => setCurrentPage(totalPages)} disabled={currentPage === totalPages}>
                  Last
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Approval Matrix</DialogTitle>
            <DialogDescription>
              Modify approval workflow configuration
            </DialogDescription>
          </DialogHeader>
          {renderFormContent()}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Approval Matrix</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this approval matrix? This action cannot be undone.
              {selectedMatrix && (
                <div className="mt-4 p-3 bg-gray-50 rounded border">
                  <div className="text-sm">
                    <div><strong>Department:</strong> {selectedMatrix.departmentName}</div>
                    <div><strong>Jobsite:</strong> {selectedMatrix.jobsiteName}</div>
                    <div><strong>Amount:</strong> {formatCurrency(selectedMatrix.amountMin)} - {selectedMatrix.amountMax ? formatCurrency(selectedMatrix.amountMax) : '∞'}</div>
                  </div>
                </div>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteMatrix} className="bg-red-600 hover:bg-red-700">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
