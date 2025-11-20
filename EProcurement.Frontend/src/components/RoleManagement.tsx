import { useState, useMemo, useEffect } from 'react';
import {
  Search, Filter, ShieldCheck, Users, CheckCircle, XCircle, Eye, Info,
  Plus, Pencil, Trash2, Lock, ArrowUpDown, ArrowUp, ArrowDown, Loader2
} from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Checkbox } from './ui/checkbox';
import {
  Dialog, DialogContent, DialogDescription, DialogFooter,
  DialogHeader, DialogTitle,
} from './ui/dialog';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from './ui/select';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from './ui/alert-dialog';
import { getRoleStatistics, ROLE_CONFIG } from '../data/rolesData';
import { RoleDefinition,Permission, Departments, Jobsites, ApprovalRoles, PermissionCategories, RoleCategories  } from '../types';
import { Badge } from './ui/badge';
import { toast } from 'sonner';

interface RoleManagementProps {
  roles: RoleDefinition[];
  permissions : Permission[];
  availableDepartments: Departments[];
  availableJobsites: Jobsites[];
  availableApprovalRoles: ApprovalRoles[];
  availablePermissionCategories: PermissionCategories[];
  availableRoleCategories: RoleCategories[];
  onUpdateRoles: (roles: RoleDefinition[]) => void;
}

export function RoleManagement({ 
    roles: propRoles, 
    permissions: propPermissions, 
    availableDepartments: propDepartment = [],
    availableJobsites: propJobsite = [],
    availableApprovalRoles: propApprovalRole = [],
    availablePermissionCategories: propPermissionCategory = [],
    availableRoleCategories: propRoleCategory = [],
    onUpdateRoles }: RoleManagementProps) {
  const [roles, setRoles] = useState<RoleDefinition[]>(propRoles);
  
  useEffect(() => {
    if (propRoles.length > 0) {
            setLoading(false);
        }
  }, [propRoles]);

  const [loading, setLoading] = useState(propRoles.length === 0);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('active');
  const [selectedRole, setSelectedRole] = useState<RoleDefinition | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [sortColumn, setSortColumn] = useState<string>('');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  const [formData, setFormData] = useState<Partial<RoleDefinition>>({
    name: '',
    description: '',
    permissions: [],
    canApprove: false,
    canCreate: false,
    canView: true,
    category: undefined,
    isActive: true,
    relatedApprovalRole: undefined,
  });

  

  const stats = useMemo(() => getRoleStatistics(roles), [roles]);

  const filteredRoles = useMemo(() => {
    let filtered = roles.filter(role => {
      const matchesSearch = searchTerm === '' ||
        role.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        role.description.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesCategory = filterCategory === 'all' || role.category === filterCategory;
      const matchesStatus = filterStatus === 'all' ||
        (filterStatus === 'active' && role.isActive) ||
        (filterStatus === 'inactive' && !role.isActive);

      return matchesSearch && matchesCategory && matchesStatus;
    });

    if (sortColumn) {
      filtered = [...filtered].sort((a, b) => {
        let aValue: any = (a as any)[sortColumn];
        let bValue: any = (b as any)[sortColumn];
        if (typeof aValue === 'string') aValue = aValue.toLowerCase();
        if (typeof bValue === 'string') bValue = bValue.toLowerCase();
        if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return filtered;
  }, [roles, searchTerm, filterCategory, filterStatus, sortColumn, sortDirection]);

  const totalPages = Math.ceil(filteredRoles.length / pageSize);
  const paginatedRoles = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredRoles.slice(start, start + pageSize);
  }, [filteredRoles, currentPage, pageSize]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterCategory, filterStatus, pageSize]);

  const generateNewId = () => {
    const maxId = Math.max(...roles.map(r => parseInt(r.id.replace('role_', '') || '0', 10)), 0);
    return `role_${(maxId + 1).toString().padStart(6, '0')}`;
  };

  const resetForm = () => {
    setFormData({
      name: '', description: '', permissions: [], canApprove: false,
      canCreate: false, canView: true, category: undefined, isActive: true,
      relatedApprovalRole: undefined,
    });
  };

  const handleSort = (column: string) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
  };

  const getCategoryColor = (category: RoleDefinition['category']) => {
    switch (category) {
      case 'System': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Approval': return 'bg-teal-100 text-teal-800 border-teal-200';
      case 'Sourcing': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'Custom': return 'bg-orange-100 text-orange-800 border-orange-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const togglePermission = (permissionId: string) => {
    const current = formData.permissions || [];
    setFormData({
      ...formData,
      permissions: current.includes(permissionId)
        ? current.filter(p => p !== permissionId)
        : [...current, permissionId]
    });
  };

  const handleAddRole = () => {
    if (!formData.name || !formData.description) {
      toast.error('Please fill in all required fields');
      return;
    }
    if (roles.some(r => r.name.toLowerCase() === formData.name!.toLowerCase())) {
      toast.error('A role with this name already exists');
      return;
    }

    const newRole: RoleDefinition = {
      id: generateNewId(),
      name: formData.name!,
      description: formData.description!,
      permissions: formData.permissions || [],
      canApprove: formData.canApprove || false,
      canCreate: formData.canCreate || false,
      canView: formData.canView ?? true,
      category: formData.category as RoleDefinition['category'] || 'Custom',
      isActive: formData.isActive ?? true,
      isSystemGenerated: false,
      createdDate: new Date().toISOString().split('T')[0],
      relatedApprovalRole: formData.relatedApprovalRole,
    };

    const updated = [...roles, newRole];
    setRoles(updated);
    onUpdateRoles(updated);
    toast.success(`Role created: ${newRole.name}`);
    setIsAddDialogOpen(false);
    resetForm();
  };

  const handleEditRole = () => {
    if (!selectedRole || !formData.name || !formData.description) return;

    if (roles.some(r => r.id !== selectedRole.id && r.name.toLowerCase() === formData.name!.toLowerCase())) {
      toast.error('A role with this name already exists');
      return;
    }

    const updatedRoles = roles.map(role =>
      role.id === selectedRole.id
        ? {
            ...roleName,
            name: formData.name!,
            description: formData.description!,
            permissions: formData.permissions || [],
            canApprove: formData.canApprove || false,
            canCreate: formData.canCreate || false,
            canView: formData.canView ?? true,
            category: formData.category as RoleDefinition['category'] || 'Custom',
            relatedApprovalRole: formData.relatedApprovalRole,
            updatedDate: new Date().toISOString().split('T')[0],
          }
        : role
    );

    setRoles(updatedRoles);
    onUpdateRoles(updatedRoles);
    toast.success(`Role updated: ${formData.name}`);
    setIsEditDialogOpen(false);
    setSelectedRole(null);
    resetForm();
  };

  const handleDeleteRole = () => {
    if (!selectedRole) return;
    const updated = roles.filter(r => r.id !== selectedRole.id);
    setRoles(updated);
    onUpdateRoles(updated);
    toast.success(`Role deleted: ${selectedRole.name}`);
    setIsDeleteDialogOpen(false);
    setSelectedRole(null);
  };

  const handleToggleStatus = (roleId: string) => {
    const updatedRoles = roles.map(role => {
      if (role.id === roleId) {
        const newStatus = !role.isActive;
        toast.success(`Role ${newStatus ? 'activated' : 'deactivated'}: ${role.name}`);
        return { ...roleName, isActive: newStatus, updatedDate: new Date().toISOString().split('T')[0] };
      }
      return role;
    });
    setRoles(updatedRoles);
    onUpdateRoles(updatedRoles);
  };

  const handleViewDetails = (role: RoleDefinition) => {
    setSelectedRole(role);
    setIsDetailsOpen(true);
  };

  const handleOpenEdit = (role: RoleDefinition) => {
    if (role.isSystemGenerated) {
      toast.error('System-generated roles cannot be edited');
      return;
    }
    setSelectedRole(role);
    setFormData({ ...roleName });
    setIsEditDialogOpen(true);
  };

  const handleOpenDelete = (role: RoleDefinition) => {
    if (role.isSystemGenerated) {
      toast.error('System-generated roles cannot be deleted');
      return;
    }
    setSelectedRole(role);
    setIsDeleteDialogOpen(true);
  };

  return (
    <>
      {loading ? (
        <div className="flex min-h-screen items-center justify-center bg-gray-50">
          <div className="flex flex-col items-center gap-6">
            <Loader2 className="w-16 h-16 animate-spin text-teal-600" />
            <div className="text-center">
              <p className="text-xl font-medium text-gray-700">Loading Role Management</p>
              <p className="text-sm text-gray-500 mt-1">Mengambil data dari server...</p>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Header */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Role Management</h2>
                <p className="text-sm text-gray-600 mt-1">
                  Manage system roles and create custom roles for your organization
                </p>
              </div>
              <div className="flex items-center gap-3">
                <ShieldCheck className="w-8 h-8 text-teal-600" />
                <Button onClick={() => { resetForm(); setIsAddDialogOpen(true); }}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Custom Role
                </Button>
              </div>
            </div>

            {/* Statistics */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-6">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <Users className="w-5 h-5 text-blue-600 mb-2" />
                <p className="text-sm text-blue-800">Total Roles</p>
                <p className="text-2xl text-blue-900 mt-1">{roles.length}</p>
              </div>
              <div className="bg-teal-50 border border-teal-200 rounded-lg p-4">
                <CheckCircle className="w-5 h-5 text-teal-600 mb-2" />
                <p className="text-sm text-teal-800">Active Roles</p>
                <p className="text-2xl text-teal-900 mt-1">{roles.filter(r => r.isActive).length}</p>
              </div>
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                <ShieldCheck className="w-5 h-5 text-purple-600 mb-2" />
                <p className="text-sm text-purple-800">Approval Roles</p>
                <p className="text-2xl text-purple-900 mt-1">{roles.filter(r => r.category === "Approval").length}</p>
              </div>
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                <Users className="w-5 h-5 text-orange-600 mb-2" />
                <p className="text-sm text-orange-800">Custom Roles</p>
                <p className="text-2xl text-orange-900 mt-1">{roles.filter(r => r.category === "Custom").length}</p>
              </div>
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <Lock className="w-5 h-5 text-gray-600 mb-2" />
                <p className="text-sm text-gray-800">System Generated</p>
                <p className="text-2xl text-gray-900 mt-1">{roles.filter(r => r.isSystemGenerated).length}</p>
              </div>
            </div>

            {/* Configuration Info */}
            <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
              <p className="text-sm text-gray-700 mb-2"><strong>System Configuration:</strong></p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <p className="text-gray-600">Departments ({propDepartment.length}):</p>
                  <p className="text-gray-900">
                    {propDepartment
                      .map(dept => dept.name)
                      .join(', ')}
                  </p>
                </div>
                <div>
                  <p className="text-gray-600">Jobsites ({propJobsite.length}):</p>
                  <p className="text-gray-900">
                    {propJobsite
                      .map(jobs => jobs.name)
                      .join(', ')}
                  </p>
                </div>
                <div>
                  <p className="text-gray-600">Chief Operations ({ROLE_CONFIG.chiefOperations.length}):</p>
                  <p className="text-gray-900">{ROLE_CONFIG.chiefOperations.map(co => co.region).join(', ')}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-sm text-gray-700 mb-2 flex items-center gap-2">
                  <Search className="w-4 h-4" />
                  Search Roles
                </label>
                <Input
                  placeholder="Search by name or description..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div>
                <label className="text-sm text-gray-700 mb-2 flex items-center gap-2">
                  <Filter className="w-4 h-4" />
                  Category
                </label>
                <Select value={filterCategory} onValueChange={setFilterCategory}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                      {propRoleCategory.map((role) => ( 
                        <SelectItem 
                          key={role.roleCategoryID}        // 
                          value={role.name}      // 
                        >
                          {role.name}                      
                      </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm text-gray-700 mb-2 flex items-center gap-2">
                  <Filter className="w-4 h-4" />
                  Status
                </label>
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="active">Active Only</SelectItem>
                    <SelectItem value="inactive">Inactive Only</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            {searchTerm && (
              <p className="text-sm text-gray-600 mt-3">
                Found {filteredRoles.length} role{filteredRoles.length !== 1 ? 's' : ''}
              </p>
            )}
          </div>

          {/* Roles Table + Pagination */}
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs text-gray-700">
                      <button onClick={() => handleSort('name')} className="flex items-center gap-1 hover:text-gray-900 transition-colors">
                        Role Name
                        {sortColumn === 'name' ? (sortDirection === 'asc' ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />) : <ArrowUpDown className="w-3 h-3 opacity-30" />}
                      </button>
                    </th>
                    <th className="px-4 py-3 text-left text-xs text-gray-700">
                      <button onClick={() => handleSort('category')} className="flex items-center gap-1 hover:text-gray-900 transition-colors">
                        Category
                        {sortColumn === 'category' ? (sortDirection === 'asc' ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />) : <ArrowUpDown className="w-3 h-3 opacity-30" />}
                      </button>
                    </th>
                    <th className="px-4 py-3 text-left text-xs text-gray-700">Description</th>
                    <th className="px-4 py-3 text-center text-xs text-gray-700">Create</th>
                    <th className="px-4 py-3 text-center text-xs text-gray-700">Approve</th>
                    <th className="px-4 py-3 text-center text-xs text-gray-700">Type</th>
                    <th className="px-4 py-3 text-center text-xs text-gray-700">
                      <button onClick={() => handleSort('isActive')} className="flex items-center gap-1 hover:text-gray-900 transition-colors mx-auto">
                        Status
                        {sortColumn === 'isActive' ? (sortDirection === 'asc' ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />) : <ArrowUpDown className="w-3 h-3 opacity-30" />}
                      </button>
                    </th>
                    <th className="px-4 py-3 text-right text-xs text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedRoles.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="px-4 py-8 text-center text-gray-500">
                        {searchTerm || filterCategory !== 'all' || filterStatus !== 'all'
                          ? 'No roles match your filters'
                          : 'No roles found'}
                      </td>
                    </tr>
                  ) : (
                    paginatedRoles.map((role) => (
                      <tr key={role.id} className="border-b border-gray-200 hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm text-gray-900">
                          <div className="flex items-center gap-2">
                            {role.isSystemGenerated && <Lock className="w-3 h-3 text-gray-400" title="System Generated" />}
                            {role.name}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <Badge className={getCategoryColor(role.category)}>{role.category}</Badge>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600 max-w-xs truncate">{role.description}</td>
                        <td className="px-4 py-3 text-center">
                          {role.canCreate ? <CheckCircle className="w-4 h-4 text-teal-600 inline" /> : <XCircle className="w-4 h-4 text-gray-300 inline" />}
                        </td>
                        <td className="px-4 py-3 text-center">
                          {role.canApprove ? <CheckCircle className="w-4 h-4 text-teal-600 inline" /> : <XCircle className="w-4 h-4 text-gray-300 inline" />}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <Badge variant="outline" className={role.isSystemGenerated ? 'bg-gray-50 text-gray-700 border-gray-300' : 'bg-orange-50 text-orange-700 border-orange-300'}>
                            {role.isSystemGenerated ? 'System' : 'Custom'}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <Badge variant="outline" className={role.isActive ? 'bg-teal-50 text-teal-700 border-teal-300' : 'bg-gray-50 text-gray-500 border-gray-300'}>
                            {role.isActive ? 'Active' : 'Inactive'}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button size="sm" variant="ghost" onClick={() => handleViewDetails(role)}><Eye className="w-4 h-4" /></Button>
                            {!role.isSystemGenerated && (
                              <>
                                <Button size="sm" variant="ghost" onClick={() => handleOpenEdit(role)}><Pencil className="w-4 h-4" /></Button>
                                <Button size="sm" variant="ghost" onClick={() => handleOpenDelete(role)}><Trash2 className="w-4 h-4 text-red-600" /></Button>
                              </>
                            )}
                            <Button size="sm" variant={role.isActive ? 'outline' : 'default'} onClick={() => handleToggleStatus(role.id)}>
                              {role.isActive ? 'Deactivate' : 'Activate'}
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
            {filteredRoles.length > 0 && (
              <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 bg-gray-50 border-t border-gray-200">
                <p className="text-sm text-gray-700">
                  Showing {(currentPage - 1) * pageSize + 1} to {Math.min(currentPage * pageSize, filteredRoles.length)} of {filteredRoles.length} roles
                </p>
                <div className="flex flex-wrap items-center gap-3">
                  <div className="flex items-center gap-2">
                    <Label htmlFor="pageSize" className="text-sm text-gray-700 whitespace-nowrap">Rows per page:</Label>
                    <Select value={pageSize.toString()} onValueChange={(v) => setPageSize(parseInt(v))}>
                      <SelectTrigger id="pageSize" className="w-20"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {[5, 10, 25, 50, 100].map(n => <SelectItem key={n} value={n.toString()}>{n}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button size="sm" variant="outline" onClick={() => setCurrentPage(1)} disabled={currentPage === 1}>First</Button>
                    <Button size="sm" variant="outline" onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}>Previous</Button>
                    <span className="text-sm text-gray-700 px-2">Page <strong>{currentPage}</strong> of <strong>{totalPages}</strong></span>
                    <Button size="sm" variant="outline" onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}>Next</Button>
                    <Button size="sm" variant="outline" onClick={() => setCurrentPage(totalPages)} disabled={currentPage === totalPages}>Last</Button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Add/Edit Role Dialog */}
          <Dialog open={isAddDialogOpen || isEditDialogOpen} onOpenChange={(open) => {
            if (!open) {
              setIsAddDialogOpen(false);
              setIsEditDialogOpen(false);
              setSelectedRole(null);
              resetForm();
            }
          }}>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {isAddDialogOpen ? 'Add Custom Role' : 'Edit Role'}
                </DialogTitle>
                <DialogDescription>
                  {isAddDialogOpen 
                    ? 'Create a new custom role for specific organizational needs' 
                    : 'Edit custom role details'}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="name">Role Name *</Label>
                  <Input
                    id="name"
                    value={formData.name || ''}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g., Special Approver, Custom Buyer"
                  />
                </div>

                <div>
                  <Label htmlFor="description">Description *</Label>
                  <Textarea
                    id="description"
                    value={formData.description || ''}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Describe the purpose and responsibilities of this role"
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="category">Category</Label>
                    <Select 
                      value={formData.category || 'Custom'} 
                      onValueChange={(value) => setFormData({ ...formData, category: value as RoleDefinition['category'] })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {propRoleCategory.map((role) => ( 
                            <SelectItem 
                              key={role.roleCategoryID} 
                              value={role.name} 
                            >
                              {role.name} 
                            </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="approvalRole">Related Approval Role (Optional)</Label>
                    <Select 
                        value={formData.relatedApprovalRole || 'none'} 
                        onValueChange={(value) => setFormData({ 
                          ...formData, 
                          relatedApprovalRole: value === 'none' ? undefined : value as ApprovalRole 
                        })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select Approval Role" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">No Related Role</SelectItem>
                          
                          {propApprovalRole.map((roleName) => ( 
                            <SelectItem 
                              key={roleName.approvalRoleID} 
                              value={roleName.name} 
                            >
                              {roleName.name} 
                            </SelectItem>
                          ))}
                          
                        </SelectContent>
                      </Select>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="canCreate"
                      checked={formData.canCreate || false}
                      onCheckedChange={(checked) => setFormData({ ...formData, canCreate: checked as boolean })}
                    />
                    <Label htmlFor="canCreate" className="text-sm cursor-pointer">Can Create</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="canApprove"
                      checked={formData.canApprove || false}
                      onCheckedChange={(checked) => setFormData({ ...formData, canApprove: checked as boolean })}
                    />
                    <Label htmlFor="canApprove" className="text-sm cursor-pointer">Can Approve</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="canView"
                      checked={formData.canView !== undefined ? formData.canView : true}
                      onCheckedChange={(checked) => setFormData({ ...formData, canView: checked as boolean })}
                    />
                    <Label htmlFor="canView" className="text-sm cursor-pointer">Can View</Label>
                  </div>
                </div>

                <div>
    <Label className="mb-2 block">Permissions</Label>
    <div className="border border-gray-200 rounded-lg p-4 max-h-60 overflow-y-auto">
    <div className="space-y-3">
        
        {propPermissionCategory.map(categoryObject => {
            const categoryName = categoryObject.name; 
            const categoryPerms = propPermissions.filter(
                (p) => {
                    const matches = p.category && p.category.toLowerCase() === categoryName.toLowerCase();
                    if (!p.category) {
                    }
                    return matches;
                }
            );

            if (categoryPerms.length === 0) return null;
            
            return (
                <div key={categoryName} className="space-y-2">
                        {/* Header Kategori */}
                        <p className="text-sm text-gray-700 font-medium border-b border-gray-100 pb-1">{categoryName}</p>
                        
                        <div className="grid grid-cols-2 gap-2">
                            {categoryPerms.map(perm => {
                                const permissionIdStr = String(perm.permissionID); 
                                
                                return (
                                    <div key={permissionIdStr} className="flex items-center space-x-2">
                                        <Checkbox
                                            id={permissionIdStr}
                                            checked={(formData.permissions || []).includes(permissionIdStr)}
                                            onCheckedChange={() => togglePermission(permissionIdStr)}
                                        />
                                        <Label htmlFor={permissionIdStr} className="text-sm cursor-pointer">
                                            {perm.name}
                                        </Label>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                );
            })}
        </div>
    </div>
    <p className="text-xs text-gray-600 mt-2">
        Selected: {(formData.permissions || []).length} permission{(formData.permissions || []).length !== 1 ? 's' : ''}
    </p>
</div>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => {
                  setIsAddDialogOpen(false);
                  setIsEditDialogOpen(false);
                  setSelectedRole(null);
                  resetForm();
                }}>
                  Cancel
                </Button>
                <Button onClick={isAddDialogOpen ? handleAddRole : handleEditRole}>
                  {isAddDialogOpen ? 'Create Role' : 'Save Changes'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Role Details Dialog */}
          <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Info className="w-5 h-5 text-teal-600" />
                  Role Details
                </DialogTitle>
                <DialogDescription>
                  Detailed information about this role
                </DialogDescription>
              </DialogHeader>
              
              {selectedRole && (
                <div className="space-y-4">
                  <div>
                    <label className="text-sm text-gray-700">Role Name</label>
                    <p className="text-gray-900 mt-1">{selectedRole.name}</p>
                  </div>

                  <div>
                    <label className="text-sm text-gray-700">Description</label>
                    <p className="text-gray-900 mt-1">{selectedRole.description}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm text-gray-700">Category</label>
                      <div className="mt-1">
                        <Badge className={getCategoryColor(selectedRole.category)}>
                          {selectedRole.category}
                        </Badge>
                      </div>
                    </div>

                    <div>
                      <label className="text-sm text-gray-700">Type</label>
                      <div className="mt-1">
                        <Badge 
                          variant="outline"
                          className={selectedRole.isSystemGenerated 
                            ? 'bg-gray-50 text-gray-700 border-gray-300' 
                            : 'bg-orange-50 text-orange-700 border-orange-300'
                          }
                        >
                          {selectedRole.isSystemGenerated ? 'System Generated' : 'Custom Role'}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="text-sm text-gray-700">Can Create</label>
                      <div className="flex items-center gap-2 mt-1">
                        {selectedRole.canCreate ? (
                          <>
                            <CheckCircle className="w-4 h-4 text-teal-600" />
                            <span className="text-sm text-teal-700">Yes</span>
                          </>
                        ) : (
                          <>
                            <XCircle className="w-4 h-4 text-gray-400" />
                            <span className="text-sm text-gray-600">No</span>
                          </>
                        )}
                      </div>
                    </div>

                    <div>
                      <label className="text-sm text-gray-700">Can Approve</label>
                      <div className="flex items-center gap-2 mt-1">
                        {selectedRole.canApprove ? (
                          <>
                            <CheckCircle className="w-4 h-4 text-teal-600" />
                            <span className="text-sm text-teal-700">Yes</span>
                          </>
                        ) : (
                          <>
                            <XCircle className="w-4 h-4 text-gray-400" />
                            <span className="text-sm text-gray-600">No</span>
                          </>
                        )}
                      </div>
                    </div>

                    <div>
                      <label className="text-sm text-gray-700">Can View</label>
                      <div className="flex items-center gap-2 mt-1">
                        {selectedRole.canView ? (
                          <>
                            <CheckCircle className="w-4 h-4 text-teal-600" />
                            <span className="text-sm text-teal-700">Yes</span>
                          </>
                        ) : (
                          <>
                            <XCircle className="w-4 h-4 text-gray-400" />
                            <span className="text-sm text-gray-600">No</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {selectedRole.relatedApprovalRole && (
                    <div>
                      <label className="text-sm text-gray-700">Related Approval Role</label>
                      <p className="text-gray-900 mt-1">
                        <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-300">
                          {selectedRole.relatedApprovalRole}
                        </Badge>
                      </p>
                    </div>
                  )}

                  <div>
                    <label className="text-sm text-gray-700 mb-2 block">Permissions ({selectedRole.permissions.length})</label>
                    <div className="flex flex-wrap gap-2">
                      {selectedRole.permissions.map((perm, idx) => (
                        <Badge key={idx} variant="outline" className="bg-blue-50 text-blue-700 border-blue-300">
                          {perm.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-200">
                    <div>
                      <label className="text-sm text-gray-600">Created Date</label>
                      <p className="text-sm text-gray-900">{selectedRole.createdDate}</p>
                    </div>
                    {selectedRole.updatedDate && (
                      <div>
                        <label className="text-sm text-gray-600">Last Updated</label>
                        <p className="text-sm text-gray-900">{selectedRole.updatedDate}</p>
                      </div>
                    )}
                  </div>

                  {selectedRole.isSystemGenerated && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                      <div className="flex items-start gap-2">
                        <Lock className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                        <p className="text-sm text-blue-800">
                          This is a system-generated role and cannot be edited or deleted. 
                          You can only activate or deactivate it.
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              )}

              <div className="flex justify-end gap-2 pt-4 border-t border-gray-200">
                <Button variant="outline" onClick={() => setIsDetailsOpen(false)}>
                  Close
                </Button>
                {selectedRole && !selectedRole.isSystemGenerated && (
                  <>
                    <Button 
                      variant="outline"
                      onClick={() => {
                        setIsDetailsOpen(false);
                        handleOpenEdit(selectedRole);
                      }}
                    >
                      <Pencil className="w-4 h-4 mr-2" />
                      Edit
                    </Button>
                    <Button 
                      variant="outline"
                      className="text-red-600 hover:text-red-700"
                      onClick={() => {
                        setIsDetailsOpen(false);
                        handleOpenDelete(selectedRole);
                      }}
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete
                    </Button>
                  </>
                )}
                {selectedRole && (
                  <Button 
                    variant={selectedRole.isActive ? 'outline' : 'default'}
                    onClick={() => {
                      handleToggleStatus(selectedRole.id);
                      setIsDetailsOpen(false);
                    }}
                  >
                    {selectedRole.isActive ? 'Deactivate Role' : 'Activate Role'}
                  </Button>
                )}
              </div>
            </DialogContent>
          </Dialog>

          {/* Delete Confirmation Dialog */}
          <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete Role</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to delete the role "{selectedRole?.name}"? 
                  This action cannot be undone. Users with this role will need to be reassigned.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel onClick={() => {
                  setIsDeleteDialogOpen(false);
                  setSelectedRole(null);
                }}>
                  Cancel
                </AlertDialogCancel>
                <AlertDialogAction onClick={handleDeleteRole} className="bg-red-600 hover:bg-red-700">
                  Delete Role
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          {/* Info Box */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm text-blue-900 mb-2">
                  <strong>About Role Management:</strong>
                </p>
                <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
                  <li><strong>System-Generated Roles</strong> (with 🔒 icon) are auto-created and cannot be edited or deleted</li>
                  <li><strong>Custom Roles</strong> can be created, edited, and deleted by administrators</li>
                  <li>All roles can be activated or deactivated</li>
                  <li>Inactive roles cannot be assigned to users</li>
                  <li>Approval Matrix uses role mapping to determine approval paths</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}