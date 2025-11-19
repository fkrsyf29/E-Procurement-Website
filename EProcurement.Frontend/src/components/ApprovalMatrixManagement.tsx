import { useState, useMemo, useEffect } from 'react';
import { Plus, Pencil, Trash2, Search, Filter, X, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import { ApprovalMatrix, ApprovalStep, Department, Jobsite, ApprovalRole } from '../types';
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
import { toast } from 'sonner@2.0.3';

interface ApprovalMatrixManagementProps {
  matrices: ApprovalMatrix[];
  onUpdateMatrices: (matrices: ApprovalMatrix[]) => void;
}

const DEPARTMENTS: Department[] = ['Plant', 'Logistic', 'HR', 'GA', 'SHE', 'Finance', 'Production', 'Engineering'];
const JOBSITES: Jobsite[] = ['ADMO MINING', 'ADMO HAULING', 'SERA', 'MACO MINING', 'MACO HAULING', 'JAHO', 'NARO'];
const APPROVAL_ROLES: ApprovalRole[] = [
  'UH User',
  'SH User',
  'Manager Site',
  'DH User',
  'DIV User',
  'Chief Operation Site',
  'Dir User',
  'President Director',
  'Chief Operational Site',
];

const STEP_NAMES = ['Verificator', 'Viewer 1', 'Viewer 2', 'Approval 1', 'Approval 2'];

type SortField = 'department' | 'jobsite' | 'amountMin' | 'group';
type SortDirection = 'asc' | 'desc';

export function ApprovalMatrixManagement({ matrices, onUpdateMatrices }: ApprovalMatrixManagementProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDepartment, setFilterDepartment] = useState<string>('all');
  const [filterJobsite, setFilterJobsite] = useState<string>('all');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedMatrix, setSelectedMatrix] = useState<ApprovalMatrix | null>(null);
  const [sortField, setSortField] = useState<SortField>('department');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  
  // Pagination state
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  // Form state
  const [formData, setFormData] = useState<Partial<ApprovalMatrix>>({
    department: 'Plant',
    jobsite: 'ADMO MINING',
    amountMin: 0,
    amountMax: 10000,
    group: 'Creator plant Development',
    approvalPath: [],
  });

  // Filter matrices
  const filteredMatrices = matrices.filter(matrix => {
    const matchesSearch = 
      matrix.group.toLowerCase().includes(searchTerm.toLowerCase()) ||
      matrix.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
      matrix.jobsite.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesDepartment = filterDepartment === 'all' || matrix.department === filterDepartment;
    const matchesJobsite = filterJobsite === 'all' || matrix.jobsite === filterJobsite;
    
    return matchesSearch && matchesDepartment && matchesJobsite;
  });

  // Sort matrices based on selected field and direction
  const sortedMatrices = [...filteredMatrices].sort((a, b) => {
    let comparison = 0;
    
    switch (sortField) {
      case 'department':
        comparison = a.department.localeCompare(b.department);
        break;
      case 'jobsite':
        comparison = a.jobsite.localeCompare(b.jobsite);
        break;
      case 'amountMin':
        comparison = a.amountMin - b.amountMin;
        break;
      case 'group':
        comparison = a.group.localeCompare(b.group);
        break;
      default:
        comparison = 0;
    }
    
    return sortDirection === 'asc' ? comparison : -comparison;
  });

  // Pagination calculation
  const totalPages = Math.ceil(sortedMatrices.length / pageSize);
  const paginatedMatrices = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    const end = start + pageSize;
    return sortedMatrices.slice(start, end);
  }, [sortedMatrices, currentPage, pageSize]);

  // Reset to first page when filters/search/pageSize change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterDepartment, filterJobsite, pageSize]);

  // Handle sort column click
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      // Toggle direction if same field
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      // Set new field with ascending direction
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // Render sort icon based on current state
  const renderSortIcon = (field: SortField) => {
    if (sortField !== field) {
      return <ArrowUpDown className="h-4 w-4 ml-1 inline-block text-gray-400" />;
    }
    return sortDirection === 'asc' 
      ? <ArrowUp className="h-4 w-4 ml-1 inline-block text-blue-600" />
      : <ArrowDown className="h-4 w-4 ml-1 inline-block text-blue-600" />;
  };

  const handleAddMatrix = () => {
    if (!validateForm()) return;

    const newMatrix: ApprovalMatrix = {
      id: `AM${Date.now()}`,
      department: formData.department as Department,
      jobsite: formData.jobsite as Jobsite,
      amountMin: formData.amountMin || 0,
      amountMax: formData.amountMax || null,
      group: formData.group || 'Creator plant Development',
      approvalPath: formData.approvalPath || [],
      createdDate: new Date().toISOString(),
    };

    onUpdateMatrices([...matrices, newMatrix]);
    toast.success('Approval matrix added successfully');
    resetForm();
    setIsAddDialogOpen(false);
  };

  const handleEditMatrix = () => {
    if (!selectedMatrix || !validateForm()) return;

    const updatedMatrices = matrices.map(matrix =>
      matrix.id === selectedMatrix.id
        ? {
            ...matrix,
            ...formData,
            updatedDate: new Date().toISOString(),
          }
        : matrix
    );

    onUpdateMatrices(updatedMatrices);
    toast.success('Approval matrix updated successfully');
    resetForm();
    setIsEditDialogOpen(false);
    setSelectedMatrix(null);
  };

  const handleDeleteMatrix = () => {
    if (!selectedMatrix) return;

    const updatedMatrices = matrices.filter(matrix => matrix.id !== selectedMatrix.id);
    onUpdateMatrices(updatedMatrices);
    toast.success('Approval matrix deleted successfully');
    setIsDeleteDialogOpen(false);
    setSelectedMatrix(null);
  };

  const validateForm = (): boolean => {
    if (!formData.department || !formData.jobsite) {
      toast.error('Please fill in all required fields');
      return false;
    }

    if (formData.amountMin === undefined || formData.amountMin < 0) {
      toast.error('Please enter a valid minimum amount');
      return false;
    }

    if (formData.amountMax !== null && formData.amountMax !== undefined && formData.amountMax <= (formData.amountMin || 0)) {
      toast.error('Maximum amount must be greater than minimum amount');
      return false;
    }

    if (!formData.approvalPath || formData.approvalPath.length === 0) {
      toast.error('Please add at least one approval step');
      return false;
    }

    return true;
  };

  const resetForm = () => {
    setFormData({
      department: 'Plant',
      jobsite: 'ADMO MINING',
      amountMin: 0,
      amountMax: 10000,
      group: 'Creator plant Development',
      approvalPath: [],
    });
  };

  const openEditDialog = (matrix: ApprovalMatrix) => {
    setSelectedMatrix(matrix);
    setFormData({
      department: matrix.department,
      jobsite: matrix.jobsite,
      amountMin: matrix.amountMin,
      amountMax: matrix.amountMax,
      group: matrix.group,
      approvalPath: [...matrix.approvalPath],
    });
    setIsEditDialogOpen(true);
  };

  const openDeleteDialog = (matrix: ApprovalMatrix) => {
    setSelectedMatrix(matrix);
    setIsDeleteDialogOpen(true);
  };

  const addApprovalStep = () => {
    const newStep: ApprovalStep = {
      stepNumber: (formData.approvalPath?.length || 0) + 1,
      stepName: 'Approval 1',
      role: 'DH User',
    };
    setFormData({
      ...formData,
      approvalPath: [...(formData.approvalPath || []), newStep],
    });
  };

  const updateApprovalStep = (index: number, field: keyof ApprovalStep, value: any) => {
    const updatedPath = [...(formData.approvalPath || [])];
    updatedPath[index] = { ...updatedPath[index], [field]: value };
    setFormData({ ...formData, approvalPath: updatedPath });
  };

  const removeApprovalStep = (index: number) => {
    const updatedPath = (formData.approvalPath || []).filter((_, i) => i !== index);
    // Renumber steps
    const renumberedPath = updatedPath.map((step, i) => ({
      ...step,
      stepNumber: i + 1,
    }));
    setFormData({ ...formData, approvalPath: renumberedPath });
  };

  const renderMatrixForm = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="department">Department *</Label>
          <Select
            value={formData.department}
            onValueChange={(value) => setFormData({ ...formData, department: value as Department })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select department" />
            </SelectTrigger>
            <SelectContent>
              {DEPARTMENTS.map(dept => (
                <SelectItem key={dept} value={dept}>{dept}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="jobsite">Jobsite *</Label>
          <Select
            value={formData.jobsite}
            onValueChange={(value) => setFormData({ ...formData, jobsite: value as Jobsite })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select jobsite" />
            </SelectTrigger>
            <SelectContent>
              {JOBSITES.map(site => (
                <SelectItem key={site} value={site}>{site}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="amountMin">Minimum Amount (USD) *</Label>
          <Input
            id="amountMin"
            type="number"
            value={formData.amountMin}
            onChange={(e) => setFormData({ ...formData, amountMin: parseFloat(e.target.value) || 0 })}
            placeholder="0"
          />
        </div>

        <div>
          <Label htmlFor="amountMax">Maximum Amount (USD)</Label>
          <Input
            id="amountMax"
            type="number"
            value={formData.amountMax || ''}
            onChange={(e) => setFormData({ ...formData, amountMax: e.target.value ? parseFloat(e.target.value) : null })}
            placeholder="Leave empty for unlimited"
          />
        </div>
      </div>

      <div>
        <Label htmlFor="group">Creator Group *</Label>
        <Input
          id="group"
          value={formData.group}
          onChange={(e) => setFormData({ ...formData, group: e.target.value })}
          placeholder="e.g., Creator plant Development"
        />
      </div>

      <div>
        <div className="flex items-center justify-between mb-2">
          <Label>Approval Path *</Label>
          <Button type="button" variant="outline" size="sm" onClick={addApprovalStep}>
            <Plus className="h-4 w-4 mr-1" />
            Add Step
          </Button>
        </div>

        <div className="space-y-2 max-h-60 overflow-y-auto border rounded-md p-2">
          {formData.approvalPath && formData.approvalPath.length > 0 ? (
            formData.approvalPath.map((step, index) => (
              <div key={index} className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                <span className="text-sm font-medium w-8">#{step.stepNumber}</span>
                
                <Select
                  value={step.stepName}
                  onValueChange={(value) => updateApprovalStep(index, 'stepName', value)}
                >
                  <SelectTrigger className="flex-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {STEP_NAMES.map(name => (
                      <SelectItem key={name} value={name}>{name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select
                  value={step.roleName}
                  onValueChange={(value) => updateApprovalStep(index, 'role', value)}
                >
                  <SelectTrigger className="flex-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {APPROVAL_ROLES.map(role => (
                      <SelectItem key={role} value={role}>{role}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removeApprovalStep(index)}
                >
                  <X className="h-4 w-4 text-red-500" />
                </Button>
              </div>
            ))
          ) : (
            <p className="text-sm text-gray-500 text-center py-4">No approval steps added. Click "Add Step" to start.</p>
          )}
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
            <Button onClick={resetForm}>
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
            {renderMatrixForm()}
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddMatrix}>Add Matrix</Button>
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
            {DEPARTMENTS.map(dept => (
              <SelectItem key={dept} value={dept}>{dept}</SelectItem>
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
            {JOBSITES.map(site => (
              <SelectItem key={site} value={site}>{site}</SelectItem>
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
            {new Set(matrices.map(m => m.department)).size}
          </div>
        </div>
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
          <div className="text-sm text-purple-600">Active Jobsites</div>
          <div className="text-2xl mt-1">
            {new Set(matrices.map(m => m.jobsite)).size}
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead style={{ backgroundColor: '#E6F2FF' }} className="border-b border-gray-200">
              <tr>
                <th 
                  className="px-4 py-3 text-left text-sm cursor-pointer hover:bg-blue-100 transition-colors select-none"
                  onClick={() => handleSort('department')}
                >
                  Department
                  {renderSortIcon('department')}
                </th>
                <th 
                  className="px-4 py-3 text-left text-sm cursor-pointer hover:bg-blue-100 transition-colors select-none"
                  onClick={() => handleSort('jobsite')}
                >
                  Jobsite
                  {renderSortIcon('jobsite')}
                </th>
                <th 
                  className="px-4 py-3 text-left text-sm cursor-pointer hover:bg-blue-100 transition-colors select-none"
                  onClick={() => handleSort('amountMin')}
                >
                  Amount Range
                  {renderSortIcon('amountMin')}
                </th>
                <th 
                  className="px-4 py-3 text-left text-sm cursor-pointer hover:bg-blue-100 transition-colors select-none"
                  onClick={() => handleSort('group')}
                >
                  Group
                  {renderSortIcon('group')}
                </th>
                <th className="px-4 py-3 text-left text-sm">Approval Path</th>
                <th className="px-4 py-3 text-right text-sm">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {paginatedMatrices.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                    No approval matrices found. Add one to get started.
                  </td>
                </tr>
              ) : (
                paginatedMatrices.map((matrix) => (
                  <tr key={matrix.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 border border-blue-200">
                        {matrix.department}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-800 border border-purple-200">
                        {matrix.jobsite}
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
                    <td className="px-4 py-3 text-sm">{matrix.group}</td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1">
                        {matrix.approvalPath.map((step, idx) => (
                          <span
                            key={idx}
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
                          onClick={() => openEditDialog(matrix)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openDeleteDialog(matrix)}
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
          {renderMatrixForm()}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleEditMatrix}>Save Changes</Button>
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
                    <div><strong>Department:</strong> {selectedMatrix.department}</div>
                    <div><strong>Jobsite:</strong> {selectedMatrix.jobsite}</div>
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
