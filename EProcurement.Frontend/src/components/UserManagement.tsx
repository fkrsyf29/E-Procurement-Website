import { useState, useMemo, useEffect } from 'react';
import {
  Search, Plus, Edit, Trash2, Key, Eye, EyeOff,
  RefreshCw, ShieldAlert, Filter, Users, CheckCircle2,
  ArrowUpDown, ArrowUp, ArrowDown, Loader2, XCircle
} from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
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
import { Badge } from './ui/badge';
import { ScrollArea } from './ui/scroll-area';
import { mockUsers, mapApiUserToDefinition } from '../data/mockData';
import { RoleDefinition, Departments, Jobsites, User } from '../types';
import { toast } from 'sonner';
import { fetchUserFromSSO, createApiUser, updateApiUser } from '../services/userApi';

interface UserManagementProps {
  roles: RoleDefinition[];
  currentUser: User[];
  onNavigateToRoleManagement: () => void;
  users: User[];
  availableDepartments: Departments[];
  availableJobsites: Jobsites[];
  onUpdateUsers: (users: User[]) => void;
}

function getActiveRolesFromProp(roles: RoleDefinition[]): RoleDefinition[] {
  return roles.filter(role => role.isActive);
}

function getRolesByCategory(
  roles: RoleDefinition[],
  category: RoleDefinition['category']
): RoleDefinition[] {
  return roles.filter(role => role.category === category && role.isActive);
}

function getRoleStatisticsFromProp(roles: RoleDefinition[]) {
  const activeRoles = getActiveRolesFromProp(roles);

  return {
    totalRoles: roles.length,
    activeRoles: activeRoles.length,
    inactiveRoles: roles.length - activeRoles.length,

    staticRoles: roles.length,
    creatorRoles: roles.filter(r => r.name.startsWith('Creator') && r.isActive).length,
    unitHeadRoles: roles.filter(r => r.name.startsWith('Unit Head') && r.isActive).length,
    sectionHeadRoles: roles.filter(r => r.name.startsWith('Section Head') && r.isActive).length,
    departmentHeadRoles: roles.filter(r => r.name.startsWith('Department Head') && r.isActive).length,
    managerRoles: roles.filter(r => r.name.startsWith('Manager') && r.isActive).length,
    chiefOperationRoles: roles.filter(r => r.name.startsWith('Chief Operation') && r.isActive).length,
    divisionHeads: roles.filter(r => r.name.includes('Division Head') && !r.name.startsWith('Department Head') && r.isActive).length,
    directorRoles: roles.filter(r => r.name.includes('Director') && !r.name.includes('President') && r.isActive).length,
    byCategory: {
      System: getRolesByCategory(roles, 'System').length,
      Approval: getRolesByCategory(roles, 'Approval').length,
      Sourcing: getRolesByCategory(roles, 'Sourcing').length,
      Custom: getRolesByCategory(roles, 'Custom').length,
    }
  };
}

function getRoleTotalCount(roles: RoleDefinition[]): number {
  return roles.length;
}



export function UserManagement({
  roles: propRoles,
  users: propUsers,
  currentUser = propCurrentUser,
  availableDepartments: propDepartment = [],
  availableJobsites: propJobsite = [],
  onUpdateUsers,
  onNavigateToRoleManagement
}: UserManagementProps) {
  const [users, setUsers] = useState<User[]>(propUsers ?? []);

  useEffect(() => {
    if (propUsers.length > 0) {
      setLoading(false);
    }
  }, [propUsers]);

  const [loading, setLoading] = useState(propUsers.length === 0);

  const [roleSearchTermForFilter, setRoleSearchTermForFilter] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [departmentFilter, setDepartmentFilter] = useState<string>('all');
  const [jobsiteFilter, setJobsiteFilter] = useState<string>('all');
  const [showForm, setShowForm] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [deletingUser, setDeletingUser] = useState<User | null>(null);
  const [roleSearchTerm, setRoleSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    username: '',
    name: '',
    roleName: '',
    jobsite: '' as Jobsites | '',
    department: '' as Departments | '',
    email: '',
    phone: '',
  });


  const [isFetchingUser, setIsFetchingUser] = useState(false);
  const [userFetched, setUserFetched] = useState(!!editingUser);

  // Sorting state
  const [sortColumn, setSortColumn] = useState<string>('');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  // Pagination state
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  // Get active roles and statistics
  const activeRoles = useMemo(() => getActiveRolesFromProp(propRoles), [propRoles]);
  const roleStats = useMemo(() => getRoleStatisticsFromProp(propRoles), [propRoles]);

  const filterableRoles = useMemo(() => {
    if (!propRoles) return [];

    let roles = propRoles.filter(role => role.isActive === true);

    if (roleSearchTermForFilter) {
      roles = roles.filter(role =>
        role.name.toLowerCase().includes(roleSearchTermForFilter.toLowerCase())
      );
    }
    return roles;
  }, [propRoles, roleSearchTermForFilter]);

  // Handle sorting
  const handleSort = (column: string) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
  };


  // Search, filter, and sort users
  const filteredUsers = useMemo(() => {
    let filtered = users.filter(u => {
      const matchesSearch =
        u.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.roleName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.email?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesRole = roleFilter === 'all' || u.roleName === roleFilter;
      const matchesDepartment = departmentFilter === 'all' || u.department === departmentFilter;
      const matchesJobsite = jobsiteFilter === 'all' || u.jobsite === jobsiteFilter;

      return matchesSearch && matchesRole && matchesDepartment && matchesJobsite;
    });

    // Apply sorting if column is selected
    if (sortColumn) {
      filtered = [...filtered].sort((a, b) => {
        let aValue: any = a[sortColumn as keyof User];
        let bValue: any = b[sortColumn as keyof User];

        // Handle undefined/null values
        if (!aValue) aValue = '';
        if (!bValue) bValue = '';

        // Handle string comparison
        if (typeof aValue === 'string' && typeof bValue === 'string') {
          aValue = aValue.toLowerCase();
          bValue = bValue.toLowerCase();
        }

        if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return filtered;
  }, [users, searchTerm, roleFilter, departmentFilter, jobsiteFilter, sortColumn, sortDirection]);

  // Pagination logic
  const totalPages = Math.ceil(filteredUsers.length / pageSize);
  const paginatedUsers = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    const end = start + pageSize;
    return filteredUsers.slice(start, end);
  }, [filteredUsers, currentPage, pageSize]);

  // Reset ke halaman 1 setiap kali filter/search/pageSize berubah
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, roleFilter, departmentFilter, jobsiteFilter, pageSize]);

  // Get roles for the role selector (filtered by search only)
  const rolesByCategory = useMemo(() => {
    let roles = activeRoles;

    // Filter by search term only
    if (roleSearchTerm) {
      roles = roles.filter(r =>
        r.name.toLowerCase().includes(roleSearchTerm.toLowerCase()) ||
        r.description.toLowerCase().includes(roleSearchTerm.toLowerCase())
      );
    }

    return roles;
  }, [roleSearchTerm, activeRoles]);


  const handleEdit = (user: User) => {
    setEditingUser(user);
    setFormData({
      username: user.username,
      name: user.name,
      roleName: user.roleName,
      jobsite: user.jobsite || '',
      department: user.department || '',
      email: user.email || '',
      phone: user.phone || '',
    });
    setShowForm(true);
  };

  const handleNewUser = () => {
    setEditingUser(null);
    setFormData({
      username: '',
      name: '',
      roleName: '',
      jobsite: '' as any,
      department: '' as any,
      email: '',
      phone: '',
    });
    setRoleSearchTerm('');
    setUserFetched(false);
    setShowForm(true);
  };


  const getCurrentUsername = (currentUser: User[]) => currentUser?.[0]?.username || 'System';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.username || !formData.name || !formData.roleName) {
      toast.error('Please fill in all required fields');
      return;
    }

    // Validate Chief Operation role assignment
    if (formData.roleName.includes('Chief Operation')) {
      const jobsite = formData.jobsite;
      const validJobsitesForChiefOp = ['ADMO MINING', 'ADMO HAULING', 'MACO MINING', 'MACO HAULING', 'SERA'];

      if (!jobsite || !validJobsitesForChiefOp.includes(formData.jobsite)) {
        toast.error('Chief Operation role can only be assigned to ADMO, MACO, or SERA jobsites', {
          description: 'Please select a valid jobsite: ADMO MINING, ADMO HAULING, MACO MINING, MACO HAULING, or SERA'
        });
        return;
      }
    }

    const selectedRoleDef = propRoles.find(r => r.name === formData.roleName);
    const selectedDepartment = propDepartment.find(d => d.name === formData.department);
    const selectedJobsite = propJobsite.find(j => j.name === formData.jobsite);

    if (!selectedRoleDef) {
      toast.error('Definisi peran tidak valid.');
      return;
    }
    const roleID = parseInt(selectedRoleDef.id, 10); // Asumsi role.id di state adalah ID Numerik String
    const departmentID = selectedDepartment ? parseInt(selectedDepartment.departmentID, 10) : null;
    const jobsiteID = selectedJobsite ? parseInt(selectedJobsite.jobsiteID, 10) : null;

    if (!editingUser) {
      const createPayload = {
        username: formData.username,
        name: formData.name,
        roleID: roleID,
        jobsiteID: jobsiteID,
        departmentID: departmentID,
        email: formData.email,
        phone: formData.phone,
        createdBy: getCurrentUsername(currentUser),
      };

      try {
        const apiResponse = await createApiUser(createPayload as any);
        const newUserId = apiResponse.userId;

        const newUser: User = {
          userID: String(newUserId), // Menggunakan ID baru dari API
          username: createPayload.username,
          name: createPayload.name,
          roleName: selectedRoleDef.name,
          jobsite: selectedJobsite?.name,
          department: selectedDepartment?.name,
          email: createPayload.email,
          phone: createPayload.phone,
          lastPasswordChange: new Date().toISOString().split('T')[0],
        };

        const updatedUsers = [...users, newUser];
        setUsers(updatedUsers);
        onUpdateUsers(updatedUsers); // Panggil handler prop untuk update global

        toast.success(`Pengguna ${newUser.name} berhasil dibuat!`);

        resetAllFormStates();
      } catch (error) {
        return;
      }

    } else {
      const updatePayload: UpdateUserPayload = {
        userID: parseInt(editingUser.userID, 10),
        username: formData.username, // Username mungkin tidak berubah, tapi tetap dikirim
        name: formData.name,
        roleID: roleID,
        jobsiteID: jobsiteID,
        departmentID: departmentID,
        email: formData.email,
        phone: formData.phone,
        isActive: true, // Asumsi default active
        updatedBy: getCurrentUsername(currentUser),
        isDeleted: false,
        deletedBy: null,
      };

      try {
        // Panggil API PUT
        const apiResponse = await updateApiUser(updatePayload);

        // Buat objek User yang diperbarui untuk state lokal
        const updatedUser: User = {
          ...editingUser, // Pertahankan properti lama (seperti ID, dll.)
          username: updatePayload.username,
          name: updatePayload.name,
          roleName: selectedRoleDef.name,
          jobsite: selectedJobsite?.name,
          department: selectedDepartment?.name,
          email: updatePayload.email,
          phone: updatePayload.phone,
          // Properti lain yang mungkin ada: lastPasswordChange
        };

        const updatedUsers = users.map(u =>
          u.userID === editingUser.userID ? updatedUser : u
        );

        setUsers(updatedUsers);
        onUpdateUsers(updatedUsers);

        toast.success(`Pengguna ${updatedUser.name} berhasil diperbarui!`);

        resetAllFormStates();
      } catch (error) {
        return;
      }
    }
  };

  const handleDelete = async () => {
    if (!deletingUser || !deletingUser.userID) {
      toast.error('Tidak ada pengguna yang dipilih untuk dihapus.');
      setDeletingUser(null);
      return;
    }
    const userToDelete = deletingUser;

    const selectedRoleDef = propRoles.find(r => r.name === userToDelete.roleName);
    const selectedDepartment = propDepartment.find(d => d.name === userToDelete.department);
    const selectedJobsite = propJobsite.find(j => j.name === userToDelete.jobsite);

    const roleID = selectedRoleDef ? parseInt(selectedRoleDef.id, 10) : null;
    const departmentID = selectedDepartment ? parseInt(selectedDepartment.departmentID, 10) : null;
    const jobsiteID = selectedJobsite ? parseInt(selectedJobsite.jobsiteID, 10) : null;

    if (roleID === null) {
      toast.error('Gagal menghapus: Definisi peran pengguna tidak ditemukan.');
      setDeletingUser(null);
      return;
    }

    const deletePayload: UpdateUserPayload = {
      userID: parseInt(userToDelete.userID, 10),
      username: userToDelete.username,
      name: userToDelete.name,
      roleID: roleID,
      jobsiteID: jobsiteID,
      departmentID: departmentID,
      email: userToDelete.email || '',
      phone: userToDelete.phone || '',
      isActive: false,
      updatedBy: getCurrentUsername(currentUser),
      isDeleted: true,
      deletedBy: getCurrentUsername(currentUser),
    };

    try {
      await updateApiUser(deletePayload);

      const updatedUsers = users.filter(u => u.userID !== userToDelete.userID);

      setUsers(updatedUsers);
      onUpdateUsers(updatedUsers); // Update global state

      toast.success(`Pengguna ${userToDelete.name} berhasil dihapus (soft delete).`);
      setDeletingUser(null);
    } catch (error) {
      console.error('Failed to perform soft delete:', error);
      setDeletingUser(null);
    }
  };

  const handleUsernameFetch = async (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key !== 'Enter' || editingUser) return;

    const username = formData.username.trim();
    if (!username) return;

    setIsFetchingUser(true);
    setUserFetched(false);

    setFormData(prev => ({ ...prev, name: '', email: '', department: '' as any, jobsite: '' as any }));

    try {
      const ssoUser = await fetchUserFromSSO(username);

      if (ssoUser) {
        toast.success(`User data found for ${username}.`);
        setUserFetched(true);
        setFormData(prev => ({
          ...prev,
          username: ssoUser.nrp || prev.username,
          name: ssoUser.fullName || prev.name,
          email: ssoUser.userEmail || prev.email,
        }));

      } else {
        toast.warning('User not found in SSO. Please fill details manually.');
        setUserFetched(false);
      }

    } catch (error) {
      setUserFetched(false);
    } finally {
      setIsFetchingUser(false);
    }
  };

  // Calculate user statistics
  const userStats = useMemo(() => {
    const safeUsers = Array.isArray(users) ? users : [];
    const safeRoles = Array.isArray(propRoles) ? propRoles : [];

    return {
      total: safeUsers.length,
      admins: safeUsers.filter(u => u.roleName === 'Administrator').length,
      creators: safeUsers.filter(u => typeof u.roleName === 'string' && u.roleName.startsWith('Creator')).length,
      approvers: safeUsers.filter(u => {
        if (!u.roleName) return false;
        const roleDef = safeRoles.find(r => r.name === u.roleName);
        return !!roleDef?.canApprove;
      }).length,
      active: safeUsers.length, // atau tambah isLocked nanti
    };
  }, [users, propRoles]);

  const resetAllFormStates = () => {
    setFormData({
      id: '',        // <-- TAMBAHAN: Termasuk properti ID
      code: '',      // <-- TAMBAHAN: Termasuk properti Code
      username: '',
      name: '',
      roleName: '' as any,
      jobsite: '' as any,
      department: '' as any,
      email: '',
      phone: '',
    });
    setEditingUser(null);
    setRoleSearchTerm('');
    setUserFetched(false);
    setIsFetchingUser(false);

    setShowForm(false);
  };

  return (
    <>
      {loading ? (
        // ── LOADING SCREEN ─────────────────────────────────────
        <div className="flex min-h-screen items-center justify-center bg-gray-50">
          <div className="flex flex-col items-center gap-6">
            <Loader2 className="w-16 h-16 animate-spin text-teal-600" />
            <div className="text-center">
              <p className="text-xl font-medium text-gray-700">Loading User Management</p>
              <p className="text-sm text-gray-500 mt-1">Mengambil data dari server...</p>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
              <p className="text-gray-600">
                Manage users and role assignments ({roleStats.totalRoles} roles available)
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={onNavigateToRoleManagement}>
                <ShieldAlert className="w-4 h-4 mr-2" />
                Manage Roles ({roleStats.totalRoles})
              </Button>
              <Button onClick={handleNewUser}>
                <Plus className="w-4 h-4 mr-2" />
                Add User
              </Button>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="p-4 rounded-lg border border-gray-200" style={{ backgroundColor: '#F0F0F0' }}>
              <div className="flex items-center gap-2 mb-2">
                <Users className="w-4 h-4 text-gray-600" />
                <p className="text-sm" style={{ color: '#000000', fontFamily: 'Arial, sans-serif', fontWeight: '600' }}>Total Users</p>
              </div>
              <p className="text-3xl" style={{ color: '#007BFF', fontFamily: 'Arial, sans-serif', fontWeight: 'bold' }}>{userStats.total}</p>
            </div>
            <div className="p-4 rounded-lg border border-gray-200" style={{ backgroundColor: '#F0F0F0' }}>
              <div className="flex items-center gap-2 mb-2">
                <ShieldAlert className="w-4 h-4 text-gray-600" />
                <p className="text-sm" style={{ color: '#000000', fontFamily: 'Arial, sans-serif', fontWeight: '600' }}>Admins</p>
              </div>
              <p className="text-3xl" style={{ color: '#DC3545', fontFamily: 'Arial, sans-serif', fontWeight: 'bold' }}>
                {userStats.admins}
              </p>
            </div>
            <div className="p-4 rounded-lg border border-gray-200" style={{ backgroundColor: '#F0F0F0' }}>
              <div className="flex items-center gap-2 mb-2">
                <Plus className="w-4 h-4 text-gray-600" />
                <p className="text-sm" style={{ color: '#000000', fontFamily: 'Arial, sans-serif', fontWeight: '600' }}>Creators</p>
              </div>
              <p className="text-3xl" style={{ color: '#28A745', fontFamily: 'Arial, sans-serif', fontWeight: 'bold' }}>
                {userStats.creators}
              </p>
            </div>
            <div className="p-4 rounded-lg border border-gray-200" style={{ backgroundColor: '#F0F0F0' }}>
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle2 className="w-4 h-4 text-gray-600" />
                <p className="text-sm" style={{ color: '#000000', fontFamily: 'Arial, sans-serif', fontWeight: '600' }}>Approvers</p>
              </div>
              <p className="text-3xl" style={{ color: '#6F42C1', fontFamily: 'Arial, sans-serif', fontWeight: 'bold' }}>
                {userStats.approvers}
              </p>
            </div>
            <div className="p-4 rounded-lg border border-gray-200" style={{ backgroundColor: '#F0F0F0' }}>
              <div className="flex items-center gap-2 mb-2">
                <Filter className="w-4 h-4 text-gray-600" />
                <p className="text-sm" style={{ color: '#000000', fontFamily: 'Arial, sans-serif', fontWeight: '600' }}>Active</p>
              </div>
              <p className="text-3xl" style={{ color: '#17A2B8', fontFamily: 'Arial, sans-serif', fontWeight: 'bold' }}>
                {userStats.active}
              </p>
            </div>
          </div>

          {/* Filters */}
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <Label htmlFor="search" className="text-sm mb-2">Search</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    id="search"
                    placeholder="Search users..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="roleFilter" className="text-sm mb-2">Filter by Role</Label>
                <Select
                  value={roleFilter}
                  onValueChange={(value) => {
                    setRoleFilter(value);
                  }}
                >
                  <SelectTrigger id="roleFilter">
                    <SelectValue placeholder="All Roles" />
                  </SelectTrigger>
                  <SelectContent>
                    <div className="p-1 sticky top-0 bg-white z-10 border-b border-gray-100">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <Input
                          placeholder="Search roles..."
                          value={roleSearchTermForFilter}
                          onChange={(e) => setRoleSearchTermForFilter(e.target.value)}
                          className="pl-9"
                          onKeyDown={(e) => {
                            e.stopPropagation();
                          }}
                          onClick={(e) => {
                            e.stopPropagation();
                          }}
                        />

                        {roleSearchTermForFilter && (
                          <button
                            type="button"
                            onClick={(e) => {
                              setRoleSearchTermForFilter('');
                              e.stopPropagation(); // Penting: mencegah klik menutup Select
                            }}
                            className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 p-0.5 transition-colors"
                            title="Clear search"
                          >
                            <XCircle className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="max-h-[200px] overflow-y-auto">
                      {roleSearchTermForFilter === '' || filterableRoles.length > 0 ? (
                        <SelectItem value="all">All Roles</SelectItem>
                      ) : (
                        <div className="p-2 text-center text-sm text-gray-500">
                          No roles found for "{roleSearchTermForFilter}"
                        </div>
                      )}
                      {filterableRoles.map(role => (
                        <SelectItem key={role.id} value={role.name}>
                          {role.name}
                        </SelectItem>
                      ))}
                    </div>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="deptFilter" className="text-sm mb-2">Filter by Department</Label>
                <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
                  <SelectTrigger id="deptFilter">
                    <SelectValue placeholder="All Departments" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Departments</SelectItem>
                    {propDepartment
                      .filter(dept => dept.isActive === true)
                      .map(dept => (
                        <SelectItem key={dept.departmentID} value={dept.name}>{dept.name}</SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="jobsiteFilter" className="text-sm mb-2">Filter by Jobsite</Label>
                <Select value={jobsiteFilter} onValueChange={setJobsiteFilter}>
                  <SelectTrigger id="jobsiteFilter">
                    <SelectValue placeholder="All Jobsites" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Jobsites</SelectItem>
                    {propJobsite
                      .filter(site => site.isActive === true)
                      .map(site => (
                        <SelectItem key={site.jobsiteID} value={site.name}>{site.name}</SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {(roleFilter !== 'all' || departmentFilter !== 'all' || jobsiteFilter !== 'all') && (
              <div className="mt-3 flex items-center gap-2">
                <Badge variant="secondary">
                  Filters active: {[roleFilter !== 'all' && 'Role', departmentFilter !== 'all' && 'Department', jobsiteFilter !== 'all' && 'Jobsite'].filter(Boolean).join(', ')}
                </Badge>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setRoleFilter('all');
                    setDepartmentFilter('all');
                    setJobsiteFilter('all');
                  }}
                >
                  Clear all filters
                </Button>
              </div>
            )}
          </div>

          {/* Users List */}
          <div className="bg-white rounded-lg border border-gray-200">
            <div className="p-4 border-b border-gray-200">
              <p className="text-sm text-gray-600">
                Showing{' '}
                {filteredUsers.length > 0 ? (currentPage - 1) * pageSize + 1 : 0} to{' '}
                {Math.min(currentPage * pageSize, filteredUsers.length)} of {filteredUsers.length}{' '}
                users
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead style={{ backgroundColor: '#E6F2FF' }} className="border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs uppercase tracking-wider" style={{ color: '#000000', fontWeight: 'bold', fontFamily: 'Arial, sans-serif' }}>
                      <button
                        onClick={() => handleSort('username')}
                        className="flex items-center gap-1 hover:text-blue-700 transition-colors"
                      >
                        Username
                        {sortColumn === 'username' ? (
                          sortDirection === 'asc' ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />
                        ) : (
                          <ArrowUpDown className="w-3 h-3 opacity-30" />
                        )}
                      </button>
                    </th>
                    <th className="px-6 py-3 text-left text-xs uppercase tracking-wider" style={{ color: '#000000', fontWeight: 'bold', fontFamily: 'Arial, sans-serif' }}>
                      <button
                        onClick={() => handleSort('name')}
                        className="flex items-center gap-1 hover:text-blue-700 transition-colors"
                      >
                        Name
                        {sortColumn === 'name' ? (
                          sortDirection === 'asc' ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />
                        ) : (
                          <ArrowUpDown className="w-3 h-3 opacity-30" />
                        )}
                      </button>
                    </th>
                    <th className="px-6 py-3 text-left text-xs uppercase tracking-wider" style={{ color: '#000000', fontWeight: 'bold', fontFamily: 'Arial, sans-serif' }}>
                      <button
                        onClick={() => handleSort('role')}
                        className="flex items-center gap-1 hover:text-blue-700 transition-colors"
                      >
                        Role
                        {sortColumn === 'role' ? (
                          sortDirection === 'asc' ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />
                        ) : (
                          <ArrowUpDown className="w-3 h-3 opacity-30" />
                        )}
                      </button>
                    </th>
                    <th className="px-6 py-3 text-left text-xs uppercase tracking-wider" style={{ color: '#000000', fontWeight: 'bold', fontFamily: 'Arial, sans-serif' }}>
                      <button
                        onClick={() => handleSort('department')}
                        className="flex items-center gap-1 hover:text-blue-700 transition-colors"
                      >
                        Department
                        {sortColumn === 'department' ? (
                          sortDirection === 'asc' ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />
                        ) : (
                          <ArrowUpDown className="w-3 h-3 opacity-30" />
                        )}
                      </button>
                    </th>
                    <th className="px-6 py-3 text-left text-xs uppercase tracking-wider" style={{ color: '#000000', fontWeight: 'bold', fontFamily: 'Arial, sans-serif' }}>
                      <button
                        onClick={() => handleSort('jobsite')}
                        className="flex items-center gap-1 hover:text-blue-700 transition-colors"
                      >
                        Jobsite
                        {sortColumn === 'jobsite' ? (
                          sortDirection === 'asc' ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />
                        ) : (
                          <ArrowUpDown className="w-3 h-3 opacity-30" />
                        )}
                      </button>
                    </th>
                    <th className="px-6 py-3 text-left text-xs uppercase tracking-wider" style={{ color: '#000000', fontWeight: 'bold', fontFamily: 'Arial, sans-serif' }}>
                      <button
                        onClick={() => handleSort('email')}
                        className="flex items-center gap-1 hover:text-blue-700 transition-colors"
                      >
                        Email
                        {sortColumn === 'email' ? (
                          sortDirection === 'asc' ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />
                        ) : (
                          <ArrowUpDown className="w-3 h-3 opacity-30" />
                        )}
                      </button>
                    </th>
                    <th className="px-6 py-3 text-left text-xs uppercase tracking-wider" style={{ color: '#000000', fontWeight: 'bold', fontFamily: 'Arial, sans-serif' }}>Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {paginatedUsers.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="px-6 py-16 text-center">
                        <div className="flex flex-col items-center gap-3 text-gray-500">
                          <Search className="w-12 h-12" />
                          <p className="text-lg font-medium">No users found</p>
                          <p className="text-sm">
                            {filteredUsers.length === 0 && users.length > 0
                              ? 'Try adjusting your search or filters'
                              : 'There are no users in the system yet'}
                          </p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    paginatedUsers.map((user) => (
                      <tr key={user.userID} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{user.username}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{user.name}</td>
                        <td className="px-6 py-4">
                          <span className="px-2.5 py-0.5 rounded-full text-xs bg-blue-100 text-blue-800 border border-blue-200 whitespace-nowrap">
                            {user.roleName}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          {user.department || '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          {user.jobsite || '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          {user.email || '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex gap-2">
                            <Button variant="ghost" size="sm" onClick={() => handleEdit(user)} title="Edit user">
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setDeletingUser(user)}
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                              title="Delete user"
                            >
                              <Trash2 className="w-4 h-4" />
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
            {filteredUsers.length > 0 && (
              <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 bg-gray-50 border-t border-gray-200">
                {/* Showing info */}
                <p className="text-sm text-gray-700">
                  Showing {(currentPage - 1) * pageSize + 1} to{' '}
                  {Math.min(currentPage * pageSize, filteredUsers.length)} of {filteredUsers.length} users
                </p>

                {/* Page size + Navigation */}
                <div className="flex flex-wrap items-center gap-3">
                  {/* Page Size Selector */}
                  <div className="flex items-center gap-2">
                    <Label htmlFor="pageSize" className="text-sm text-gray-700 whitespace-nowrap">
                      Rows per page:
                    </Label>
                    <Select value={pageSize.toString()} onValueChange={(v) => setPageSize(Number(v))}>
                      <SelectTrigger id="pageSize" className="w-20">
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
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setCurrentPage(1)}
                      disabled={currentPage === 1}
                    >
                      First
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                    >
                      Previous
                    </Button>

                    <span className="text-sm text-gray-700 px-2">
                      Page <strong>{currentPage}</strong> of <strong>{totalPages}</strong>
                    </span>

                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                    >
                      Next
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setCurrentPage(totalPages)}
                      disabled={currentPage === totalPages}
                    >
                      Last
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* User Form Dialog */}
          <Dialog open={showForm} onOpenChange={(open) => {
            if (!open) {
              setFormData({
                id: '', code: '', username: '', name: '', password: '',
                roleName: '', jobsite: '' as any, department: '' as any,
                email: '', phone: '',
              });
              setShowForm(false);
              setEditingUser(null);
              setRoleSearchTerm('');
              setUserFetched(false);
              setIsFetchingUser(false);
            }
            setShowForm(open);
          }}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
              <DialogHeader>
                <DialogTitle>
                  {editingUser ? 'Edit User' : 'Add New User'}
                </DialogTitle>
                <DialogDescription>
                  {editingUser ? 'Update user information and role assignment' : 'Create a new user account with role assignment'}
                </DialogDescription>
              </DialogHeader>

              <form onSubmit={handleSubmit} className="space-y-6 flex-1 overflow-y-auto">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="username">Username *</Label>
                    <Input
                      id="username"
                      value={formData.username}
                      onChange={(e) => setFormData(prev => ({ ...prev, username: e.target.value }))}
                      onKeyDown={handleUsernameFetch}
                      placeholder="Enter username"
                      required
                      disabled={editingUser || isFetchingUser || userFetched}
                      className={(isFetchingUser || userFetched) ? "font-bold" : ""}
                    />
                    {isFetchingUser && (
                      <p className="text-xs text-blue-600 mt-1 flex items-center gap-1">
                        <Loader2 className="w-3 h-3 animate-spin" /> Checking SSO...
                      </p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="name">Full Name *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Enter full name"
                      required
                      disabled={isFetchingUser || userFetched}
                      className={(isFetchingUser || userFetched) ? "font-bold" : ""}
                    />
                  </div>

                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                      placeholder="user@example.com"
                      disabled={isFetchingUser || userFetched}
                      className={(isFetchingUser || userFetched) ? "font-bold" : ""}
                    />
                  </div>

                  <div>
                    <Label htmlFor="phone">Phone</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                      placeholder="+62 812-xxxx-xxxx"
                    />
                  </div>

                  <div>
                    <Label htmlFor="department">Department</Label>
                    <Select
                      value={formData.department}
                      onValueChange={(value: string) => setFormData(prev => ({ ...prev, department: value as Departments }))}
                    >
                      <SelectTrigger id="department">
                        <SelectValue placeholder="Select department (optional)" />
                      </SelectTrigger>
                      <SelectContent>
                        {propDepartment.map(dept => (
                          <SelectItem key={dept.departmentID} value={dept.name}>{dept.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="jobsite">Jobsite</Label>
                    <Select
                      value={formData.jobsite}
                      onValueChange={(value: string) => setFormData(prev => ({ ...prev, jobsite: value as Jobsite }))}
                    >
                      <SelectTrigger id="jobsite">
                        <SelectValue placeholder="Select jobsite (optional)" />
                      </SelectTrigger>
                      <SelectContent>
                        {propJobsite.map(site => (
                          <SelectItem key={site.jobsiteID} value={site.name}>{site.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="col-span-2">
                    <Label htmlFor="role">Role * ({roleStats.totalRoles} available)</Label>

                    <div className="mt-3">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <Input
                          placeholder="Search roles..."
                          value={roleSearchTerm}
                          onChange={(e) => setRoleSearchTerm(e.target.value)}
                          className="pl-9"
                        />
                      </div>
                    </div>

                    <div className="mt-3">
                      <ScrollArea className="h-[300px] rounded-md border p-3">
                        {rolesByCategory.length === 0 ? (
                          <div className="p-8 text-center text-sm text-gray-500">
                            <Search className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                            <p>No roles found</p>
                            <p className="text-xs mt-1">Try a different search term</p>
                          </div>
                        ) : (
                          <div className="space-y-2">
                            {rolesByCategory.map(role => (
                              <button
                                key={role.id}
                                type="button"
                                onClick={() => setFormData(prev => ({ ...prev, roleName: role.name }))}
                                className={`w-full text-left p-3 rounded-lg border transition-all ${formData.roleName === role.name
                                  ? 'border-blue-500 bg-blue-50'
                                  : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                                  }`}
                              >
                                <div className="flex items-start justify-between gap-2">
                                  <div className="flex-1">
                                    <div className="flex items-center gap-2">
                                      <p className="text-sm font-medium text-gray-900">{role.name}</p>
                                      {formData.roleName === role.name && (
                                        <CheckCircle2 className="w-4 h-4 text-blue-600" />
                                      )}
                                    </div>
                                    <p className="text-xs text-gray-600 mt-1">{role.description}</p>
                                    <div className="flex items-center gap-2 mt-2">
                                      <Badge variant="outline" className="text-xs">
                                        {role.category}
                                      </Badge>
                                      {role.canCreate && (
                                        <Badge variant="secondary" className="text-xs">Can Create</Badge>
                                      )}
                                      {role.canApprove && (
                                        <Badge variant="secondary" className="text-xs">Can Approve</Badge>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              </button>
                            ))}
                          </div>
                        )}
                      </ScrollArea>
                    </div>

                    {formData.roleName && (
                      <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                        <div className="flex items-start gap-2">
                          <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                          <div>
                            <p className="text-sm font-medium text-green-900">Selected Role:</p>
                            <p className="text-sm text-green-700">{formData.roleName}</p>
                          </div>
                        </div>
                      </div>
                    )}

                    <p className="text-xs text-gray-500 mt-2">
                      {roleStats.totalRoles} roles available. Need a different role?{' '}
                      <button
                        type="button"
                        onClick={onNavigateToRoleManagement}
                        className="text-blue-600 hover:underline"
                      >
                        Manage Roles
                      </button>
                    </p>
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-4 border-t">
                  <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                    Cancel
                  </Button>
                  <Button type="submit">
                    {editingUser ? 'Update User' : 'Create User'}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>

          {/* Delete Confirmation Dialog */}
          <AlertDialog open={!!deletingUser} onOpenChange={(open) => !open && setDeletingUser(null)}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete User</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to delete user <strong>{deletingUser?.name}</strong>?
                  This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>


        </div>
      )}
    </>
  );
}
