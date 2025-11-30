import { useState, useMemo, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Search, ArrowUpDown, ArrowUp, ArrowDown, Eye } from 'lucide-react';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Proposal, User } from '../types';
import { StatusBadge } from './StatusBadge';
import { ApprovalTimeline } from './ApprovalTimeline';
import { AdminApprovalActions } from './AdminApprovalActions';
import { formatDate, parseDate, formatCurrencyNoCommas } from '../utils/formatters';
// ✅ Import API
import { fetchDashboardProposals, approveProposalApi } from '../services/proposalApi';
import { toast } from 'sonner';

// Status color mapping (Tetap sama)
const STATUS_COLORS: Record<string, string> = {
  'Approved': '#28A745',
  'Rejected': '#DC3545',
  'Draft': '#6C757D',
  'On Verification': '#FFC107',
  'On Review 1': '#FFC107',
  'On Review 2': '#FFC107',
  'On Approval 1': '#FFC107',
  'On Approval 2': '#FFC107',
  'On Sourcing Approval': '#FFC107',
  'On Procurement Approval': '#FFC107',
  'On Unit Head Approval': '#FFC107',
  'On Section Head Approval': '#FFC107',
  'On Department Head Approval': '#FFC107',
  'On Manager Approval': '#FFC107',
  'On Division Head Approval': '#FFC107',
  'On Director Approval': '#FFC107',
  'On President Director Approval': '#FFC107',
};

type SortField = 'proposalNo' | 'title' | 'creator' | 'jobsite' | 'department' | 'category' | 'amount' | 'createdDate' | 'status';
type SortDirection = 'asc' | 'desc' | null;

interface DashboardProps {
  user: User;
}

export function Dashboard({ user }: DashboardProps) {
  // ✅ State untuk Data Real
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // State UI
  const [searchTerm, setSearchTerm] = useState('');
  const [filterJobsite, setFilterJobsite] = useState<string>('all');
  const [filterDepartment, setFilterDepartment] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterCreator, setFilterCreator] = useState<string>('all');
  const [selectedProposal, setSelectedProposal] = useState<Proposal | null>(null);
  const [sortField, setSortField] = useState<SortField | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>(null);

  // Check Admin Permission
  const userPermissions = user.permissions || [];
  const isAdmin = user.roleName === 'Administrator' || userPermissions.includes('approve_all');

  // ✅ FETCH DATA
  const loadDashboardData = async () => {
    setIsLoading(true);
    try {
      // Fetch data dashboard sesuai scope user
      const jobsiteId = user.jobsite && typeof user.jobsite === 'object' && 'jobsiteID' in user.jobsite 
          ? user.jobsite.jobsiteID 
          : '';
          
      const deptId = user.department && typeof user.department === 'object' && 'departmentID' in user.department 
          ? user.department.departmentID 
          : '';

      const data = await fetchDashboardProposals(
          user.userID, 
          user.roleName, 
          jobsiteId, 
          deptId
      );
      setProposals(data);
    } catch (error) {
      console.error("Dashboard load failed", error);
      toast.error("Gagal memuat data dashboard");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user.userID) {
        loadDashboardData();
    }
  }, [user.userID]);

  // ✅ Handle Admin Approve via API
  const handleAdminApprove = async (proposalId: string, role: string, comments: string) => {
    setIsLoading(true);
    try {
        // Gunakan API approveProposalApi (bukan update state lokal)
        // Role Name diteruskan sebagai context admin action
        await approveProposalApi(
            proposalId, 
            'Approve', 
            comments, 
            { userId: user.userID, username: user.username }
        );
        toast.success(`Approved as ${role}`, {
            description: `Proposal status updated.`,
        });
        
        // Refresh data
        await loadDashboardData();
    } catch (error: any) {
        toast.error("Approval failed: " + error.message);
    } finally {
        setIsLoading(false);
    }
  };

  // ✅ Handle Admin Reject via API
  const handleAdminReject = async (proposalId: string, role: string, comments: string) => {
    setIsLoading(true);
    try {
        await approveProposalApi(
            proposalId, 
            'Reject', 
            comments, 
            { userId: user.userID, username: user.username }
        );
        toast.success(`Rejected as ${role}`, {
            description: 'Proposal has been rejected',
        });
        
        // Refresh data
        await loadDashboardData();
    } catch (error: any) {
        toast.error("Rejection failed: " + error.message);
    } finally {
        setIsLoading(false);
    }
  };

  // ✅ Calculate Trend Data Dynamically (Real-time calculation based on proposals)
  const monthlyTrendData = useMemo(() => {
    const trends: Record<string, number> = {};
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    // Initialize months with 0
    months.forEach(m => trends[m] = 0);

    // Count proposals per month
    proposals.forEach(p => {
        if (p.createdDate) {
            const date = new Date(p.createdDate);
            const monthName = date.toLocaleString('default', { month: 'short' });
            if (trends[monthName] !== undefined) {
                trends[monthName]++;
            }
        }
    });

    return months.map(month => ({
        month,
        count: trends[month]
    }));
  }, [proposals]);


  // Calculate statistics
  const stats = useMemo(() => {
    const statusCounts = proposals.reduce((acc, p) => {
      acc[p.status] = (acc[p.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const jobsiteCounts = proposals.reduce((acc, p) => {
      const site = p.jobsite?.name || p.jobsite || 'Unknown';
      acc[site] = (acc[site] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const departmentCounts = proposals.reduce((acc, p) => {
      const dept = p.department?.name || p.department || 'Unknown';
      acc[dept] = (acc[dept] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      total: proposals.length,
      statusCounts,
      jobsiteCounts,
      departmentCounts,
    };
  }, [proposals]);

  // Get unique creators for filter
  const uniqueCreators = useMemo(() => {
    const creators = [...new Set(proposals.map(p => p.creator))];
    return creators.sort();
  }, [proposals]);

  // Get unique jobsites/departments for filter dropdowns (Dynamic from data)
  const uniqueJobsites = useMemo(() => {
    return [...new Set(proposals.map(p => p.jobsite?.name || p.jobsite || ''))].filter(Boolean).sort();
  }, [proposals]);

  const uniqueDepartments = useMemo(() => {
    return [...new Set(proposals.map(p => p.department?.name || p.department || ''))].filter(Boolean).sort();
  }, [proposals]);

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

  // Filter and sort proposals
  const filteredProposals = useMemo(() => {
    let filtered = proposals.filter(p => {
      const pJobsite = p.jobsite?.name || p.jobsite || '';
      const pDept = p.department?.name || p.department || '';

      const matchesSearch = p.proposalNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            p.creator.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesJobsite = filterJobsite === 'all' || pJobsite === filterJobsite;
      const matchesDepartment = filterDepartment === 'all' || pDept === filterDepartment;
      const matchesStatus = filterStatus === 'all' || p.status === filterStatus;
      const matchesCreator = filterCreator === 'all' || p.creator === filterCreator;
      
      return matchesSearch && matchesJobsite && matchesDepartment && matchesStatus && matchesCreator;
    });

    // Apply sorting
    if (sortField && sortDirection) {
      filtered = [...filtered].sort((a, b) => {
        let aVal: any = a[sortField];
        let bVal: any = b[sortField];

        if (sortField === 'createdDate') {
          aVal = parseDate(a.createdDate).getTime();
          bVal = parseDate(b.createdDate).getTime();
        } else if (sortField === 'amount') {
          aVal = a.amount;
          bVal = b.amount;
        } else if (sortField === 'jobsite') {
            aVal = a.jobsite?.name || a.jobsite || '';
            bVal = b.jobsite?.name || b.jobsite || '';
        } else if (sortField === 'department') {
            aVal = a.department?.name || a.department || '';
            bVal = b.department?.name || b.department || '';
        } else {
            if (typeof aVal === 'string' && typeof bVal === 'string') {
                aVal = aVal.toLowerCase();
                bVal = bVal.toLowerCase();
            }
        }

        if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
        if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return filtered;
  }, [proposals, searchTerm, filterJobsite, filterDepartment, filterStatus, filterCreator, sortField, sortDirection]);

  // Matrix Data Preparation
  const statusVsJobsiteData = useMemo(() => {
    const allJobsites = uniqueJobsites;
    const allStatuses = ['Draft', 'Approved', 'Completed', 'Rejected'];
    const dynamicStatuses = [...new Set(proposals.map(p => p.status))].filter(s => s.startsWith('On')).sort();
    const statuses = [...allStatuses.filter(s => proposals.some(p => p.status === s)), ...dynamicStatuses];
    
    const matrix: Record<string, Record<string, number>> = {};
    statuses.forEach(status => {
      matrix[status] = {};
      allJobsites.forEach(jobsite => {
        matrix[status][jobsite] = proposals.filter(p => p.status === status && (p.jobsite?.name || p.jobsite) === jobsite).length;
      });
    });
    
    return { statuses, jobsites: allJobsites, matrix };
  }, [proposals, uniqueJobsites]);

  const statusVsDepartmentData = useMemo(() => {
    const allDepartments = uniqueDepartments;
    const allStatuses = ['Draft', 'Approved', 'Completed', 'Rejected'];
    const dynamicStatuses = [...new Set(proposals.map(p => p.status))].filter(s => s.startsWith('On')).sort();
    const statuses = [...allStatuses.filter(s => proposals.some(p => p.status === s)), ...dynamicStatuses];
    
    const matrix: Record<string, Record<string, number>> = {};
    statuses.forEach(status => {
      matrix[status] = {};
      allDepartments.forEach(department => {
        matrix[status][department] = proposals.filter(p => p.status === status && (p.department?.name || p.department) === department).length;
      });
    });
    
    return { statuses, departments: allDepartments, matrix };
  }, [proposals, uniqueDepartments]);

  const departmentVsJobsiteData = useMemo(() => {
    const allDepartments = uniqueDepartments;
    const allJobsites = uniqueJobsites;
    
    const matrix: Record<string, Record<string, number>> = {};
    allDepartments.forEach(department => {
      matrix[department] = {};
      allJobsites.forEach(jobsite => {
        matrix[department][jobsite] = proposals.filter(p => (p.department?.name || p.department) === department && (p.jobsite?.name || p.jobsite) === jobsite).length;
      });
    });
    
    return { departments: allDepartments, jobsites: allJobsites, matrix };
  }, [proposals, uniqueDepartments, uniqueJobsites]);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-gray-900">Dashboard</h1>
          <p className="text-gray-600">Overview of all proposals and statistics</p>
        </div>
      </div>

      {/* Loading Indicator */}
      {isLoading && <div className="text-blue-600 text-sm font-semibold">Loading dashboard data...</div>}

      {/* Stats Cards - Compact */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2">
        <div className="p-2 rounded-lg border border-gray-200" style={{ backgroundColor: '#F0F0F0' }}>
          <p className="text-xs mb-0.5" style={{ color: '#000000', fontFamily: 'Arial, sans-serif', fontWeight: '600' }}>Total Proposals</p>
          <p className="text-xl" style={{ color: '#007BFF', fontFamily: 'Arial, sans-serif', fontWeight: 'bold' }}>{stats.total}</p>
        </div>
        <div className="p-2 rounded-lg border border-gray-200" style={{ backgroundColor: '#F0F0F0' }}>
          <p className="text-xs mb-0.5" style={{ color: '#000000', fontFamily: 'Arial, sans-serif', fontWeight: '600' }}>Approved</p>
          <p className="text-xl" style={{ color: '#28A745', fontFamily: 'Arial, sans-serif', fontWeight: 'bold' }}>{stats.statusCounts['Approved'] || 0}</p>
        </div>
        <div className="p-2 rounded-lg border border-gray-200" style={{ backgroundColor: '#F0F0F0' }}>
          <p className="text-xs mb-0.5" style={{ color: '#000000', fontFamily: 'Arial, sans-serif', fontWeight: '600' }}>Pending</p>
          <p className="text-xl" style={{ color: '#FFC107', fontFamily: 'Arial, sans-serif', fontWeight: 'bold' }}>
            {Object.entries(stats.statusCounts)
              .filter(([status]) => status.startsWith('On') || status.includes('Verified') || status.includes('Reviewed'))
              .reduce((sum, [, count]) => sum + count, 0)}
          </p>
        </div>
        <div className="p-2 rounded-lg border border-gray-200" style={{ backgroundColor: '#F0F0F0' }}>
          <p className="text-xs mb-0.5" style={{ color: '#000000', fontFamily: 'Arial, sans-serif', fontWeight: '600' }}>Rejected</p>
          <p className="text-xl" style={{ color: '#DC3545', fontFamily: 'Arial, sans-serif', fontWeight: 'bold' }}>{stats.statusCounts['Rejected'] || 0}</p>
        </div>
      </div>

      {/* Row 2: Status Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-2">
        <div className="p-3 rounded-lg border border-gray-200" style={{ backgroundColor: '#F0F0F0' }}>
          <h3 className="mb-2" style={{ fontSize: '13px', fontWeight: 'bold', color: '#000000', fontFamily: 'Arial, sans-serif' }}>
            Status vs Jobsite
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-xs border-collapse">
              <thead>
                <tr style={{ backgroundColor: '#007BFF' }}>
                  <th className="border border-gray-300 px-2 py-1.5 text-white text-left" style={{ fontFamily: 'Arial, sans-serif', fontWeight: 'bold' }}>Status \ Jobsite</th>
                  {statusVsJobsiteData.jobsites.map(jobsite => (
                    <th key={jobsite} className="border border-gray-300 px-2 py-1.5 text-white text-center" style={{ fontFamily: 'Arial, sans-serif', fontWeight: 'bold' }}>{jobsite}</th>
                  ))}
                  <th className="border border-gray-300 px-2 py-1.5 text-white text-center" style={{ fontFamily: 'Arial, sans-serif', fontWeight: 'bold' }}>Total</th>
                </tr>
              </thead>
              <tbody>
                {statusVsJobsiteData.statuses.map((status, idx) => {
                  const rowTotal = statusVsJobsiteData.jobsites.reduce((sum, jobsite) => sum + statusVsJobsiteData.matrix[status][jobsite], 0);
                  return (
                    <tr key={status} style={{ backgroundColor: idx % 2 === 0 ? '#FFFFFF' : '#F8F9FA' }}>
                      <td className="border border-gray-300 px-2 py-1.5" style={{ fontFamily: 'Arial, sans-serif', fontWeight: '600', color: '#000000' }}>{status}</td>
                      {statusVsJobsiteData.jobsites.map(jobsite => (
                        <td key={jobsite} className="border border-gray-300 px-2 py-1.5 text-center" style={{ fontFamily: 'Arial, sans-serif', color: '#000000' }}>{statusVsJobsiteData.matrix[status][jobsite] || 0}</td>
                      ))}
                      <td className="border border-gray-300 px-2 py-1.5 text-center" style={{ fontFamily: 'Arial, sans-serif', fontWeight: 'bold', color: '#007BFF' }}>{rowTotal}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        <div className="p-3 rounded-lg border border-gray-200" style={{ backgroundColor: '#F0F0F0' }}>
          <h3 className="mb-2" style={{ fontSize: '13px', fontWeight: 'bold', color: '#000000', fontFamily: 'Arial, sans-serif' }}>
            Status vs Department
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-xs border-collapse">
              <thead>
                <tr style={{ backgroundColor: '#28A745' }}>
                  <th className="border border-gray-300 px-2 py-1.5 text-white text-left" style={{ fontFamily: 'Arial, sans-serif', fontWeight: 'bold' }}>Status \ Department</th>
                  {statusVsDepartmentData.departments.map(department => (
                    <th key={department} className="border border-gray-300 px-2 py-1.5 text-white text-center" style={{ fontFamily: 'Arial, sans-serif', fontWeight: 'bold' }}>{department}</th>
                  ))}
                  <th className="border border-gray-300 px-2 py-1.5 text-white text-center" style={{ fontFamily: 'Arial, sans-serif', fontWeight: 'bold' }}>Total</th>
                </tr>
              </thead>
              <tbody>
                {statusVsDepartmentData.statuses.map((status, idx) => {
                  const rowTotal = statusVsDepartmentData.departments.reduce((sum, department) => sum + statusVsDepartmentData.matrix[status][department], 0);
                  return (
                    <tr key={status} style={{ backgroundColor: idx % 2 === 0 ? '#FFFFFF' : '#F8F9FA' }}>
                      <td className="border border-gray-300 px-2 py-1.5" style={{ fontFamily: 'Arial, sans-serif', fontWeight: '600', color: '#000000' }}>{status}</td>
                      {statusVsDepartmentData.departments.map(department => (
                        <td key={department} className="border border-gray-300 px-2 py-1.5 text-center" style={{ fontFamily: 'Arial, sans-serif', color: '#000000' }}>{statusVsDepartmentData.matrix[status][department] || 0}</td>
                      ))}
                      <td className="border border-gray-300 px-2 py-1.5 text-center" style={{ fontFamily: 'Arial, sans-serif', fontWeight: 'bold', color: '#28A745' }}>{rowTotal}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Row 3: Dept vs Jobsite & Timeline */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-2">
        <div className="p-3 rounded-lg border border-gray-200" style={{ backgroundColor: '#F0F0F0' }}>
          <h3 className="mb-2" style={{ fontSize: '13px', fontWeight: 'bold', color: '#000000', fontFamily: 'Arial, sans-serif' }}>Department vs Jobsite Summary</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-xs border-collapse">
              <thead>
                <tr style={{ backgroundColor: '#FFC107' }}>
                  <th className="border border-gray-300 px-2 py-1.5 text-white text-left" style={{ fontFamily: 'Arial, sans-serif', fontWeight: 'bold' }}>Department \ Jobsite</th>
                  {departmentVsJobsiteData.jobsites.map(jobsite => (
                    <th key={jobsite} className="border border-gray-300 px-2 py-1.5 text-white text-center" style={{ fontFamily: 'Arial, sans-serif', fontWeight: 'bold' }}>{jobsite}</th>
                  ))}
                  <th className="border border-gray-300 px-2 py-1.5 text-white text-center" style={{ fontFamily: 'Arial, sans-serif', fontWeight: 'bold' }}>Total</th>
                </tr>
              </thead>
              <tbody>
                {departmentVsJobsiteData.departments.map((department, idx) => {
                  const rowTotal = departmentVsJobsiteData.jobsites.reduce((sum, jobsite) => sum + departmentVsJobsiteData.matrix[department][jobsite], 0);
                  return (
                    <tr key={department} style={{ backgroundColor: idx % 2 === 0 ? '#FFFFFF' : '#F8F9FA' }}>
                      <td className="border border-gray-300 px-2 py-1.5" style={{ fontFamily: 'Arial, sans-serif', fontWeight: '600', color: '#000000' }}>{department}</td>
                      {departmentVsJobsiteData.jobsites.map(jobsite => (
                        <td key={jobsite} className="border border-gray-300 px-2 py-1.5 text-center" style={{ fontFamily: 'Arial, sans-serif', color: '#000000' }}>{departmentVsJobsiteData.matrix[department][jobsite] || 0}</td>
                      ))}
                      <td className="border border-gray-300 px-2 py-1.5 text-center" style={{ fontFamily: 'Arial, sans-serif', fontWeight: 'bold', color: '#FFC107' }}>{rowTotal}</td>
                    </tr>
                  );
                })}
                <tr style={{ backgroundColor: '#FFF8E1' }}>
                  <td className="border border-gray-300 px-2 py-1.5" style={{ fontFamily: 'Arial, sans-serif', fontWeight: 'bold', color: '#000000' }}>Total</td>
                  {departmentVsJobsiteData.jobsites.map(jobsite => {
                    const colTotal = departmentVsJobsiteData.departments.reduce((sum, department) => sum + departmentVsJobsiteData.matrix[department][jobsite], 0);
                    return <td key={jobsite} className="border border-gray-300 px-2 py-1.5 text-center" style={{ fontFamily: 'Arial, sans-serif', fontWeight: 'bold', color: '#FFC107' }}>{colTotal}</td>;
                  })}
                  <td className="border border-gray-300 px-2 py-1.5 text-center" style={{ fontFamily: 'Arial, sans-serif', fontWeight: 'bold', color: '#000000' }}>{stats.total}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div className="p-3 rounded-lg border border-gray-200" style={{ backgroundColor: '#F0F0F0' }}>
          <h3 className="mb-2" style={{ fontSize: '13px', fontWeight: 'bold', color: '#000000', fontFamily: 'Arial, sans-serif' }}>Proposal Trend (12 Months)</h3>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={monthlyTrendData} margin={{ top: 20, right: 20, left: 10, bottom: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#D0D0D0" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#000000', fontWeight: '600' }} stroke="#6C757D" />
              <YAxis tick={{ fontSize: 12, fill: '#000000', fontWeight: '600' }} stroke="#6C757D" width={40} />
              <Tooltip contentStyle={{ fontSize: '13px', fontWeight: 'bold', borderRadius: '6px' }} />
              <Legend wrapperStyle={{ fontSize: '12px', fontWeight: 'bold' }} iconSize={12} />
              <Line type="monotone" dataKey="count" stroke="#007BFF" strokeWidth={2} name="Proposals" dot={{ fill: '#007BFF', r: 4 }} activeDot={{ r: 6 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Proposals Table */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-gray-900 mb-4">All Proposals</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input placeholder="Search proposals..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-9" />
            </div>
            <Select value={filterCreator} onValueChange={setFilterCreator}>
              <SelectTrigger><SelectValue placeholder="All Creators" /></SelectTrigger>
              <SelectContent><SelectItem value="all">All Creators</SelectItem>{uniqueCreators.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
            </Select>
            <Select value={filterJobsite} onValueChange={setFilterJobsite}>
              <SelectTrigger><SelectValue placeholder="All Jobsites" /></SelectTrigger>
              <SelectContent><SelectItem value="all">All Jobsites</SelectItem>{uniqueJobsites.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
            </Select>
            <Select value={filterDepartment} onValueChange={setFilterDepartment}>
              <SelectTrigger><SelectValue placeholder="All Departments" /></SelectTrigger>
              <SelectContent><SelectItem value="all">All Departments</SelectItem>{uniqueDepartments.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}</SelectContent>
            </Select>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger><SelectValue placeholder="All Statuses" /></SelectTrigger>
              <SelectContent><SelectItem value="all">All Statuses</SelectItem>{Object.keys(STATUS_COLORS).map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
            </Select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead style={{ backgroundColor: '#E6F2FF' }} className="border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs uppercase font-bold text-black" onClick={() => handleSort('proposalNo')}>Proposal No {getSortIcon('proposalNo')}</th>
                <th className="px-6 py-3 text-left text-xs uppercase font-bold text-black" onClick={() => handleSort('title')}>Title {getSortIcon('title')}</th>
                <th className="px-6 py-3 text-left text-xs uppercase font-bold text-black" onClick={() => handleSort('creator')}>Creator {getSortIcon('creator')}</th>
                <th className="px-6 py-3 text-left text-xs uppercase font-bold text-black" onClick={() => handleSort('jobsite')}>Jobsite {getSortIcon('jobsite')}</th>
                <th className="px-6 py-3 text-left text-xs uppercase font-bold text-black" onClick={() => handleSort('amount')}>Amount {getSortIcon('amount')}</th>
                <th className="px-6 py-3 text-left text-xs uppercase font-bold text-black" onClick={() => handleSort('createdDate')}>Created Date {getSortIcon('createdDate')}</th>
                <th className="px-6 py-3 text-left text-xs uppercase font-bold text-black" onClick={() => handleSort('status')}>Status {getSortIcon('status')}</th>
                <th className="px-6 py-3 text-left text-xs uppercase font-bold text-black">Action</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredProposals.length === 0 ? (
                <tr><td colSpan={8} className="px-6 py-12 text-center text-gray-500">No proposals found</td></tr>
              ) : (
                filteredProposals.map((proposal) => (
                  <tr key={proposal.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{proposal.proposalNo}</td>
                    <td className="px-6 py-4 text-sm text-gray-900">{proposal.title}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{proposal.creator}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{proposal.jobsite?.name || proposal.jobsite}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${formatCurrencyNoCommas(proposal.amount)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{formatDate(proposal.createdDate)}</td>
                    <td className="px-6 py-4 whitespace-nowrap"><StatusBadge status={proposal.status} proposal={proposal} /></td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex gap-2">
                        <Button variant="ghost" size="sm" onClick={() => setSelectedProposal(proposal)}>
                          <Eye className="w-4 h-4 mr-2" /> View
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

      {/* Proposal Detail Dialog */}
      <Dialog open={selectedProposal !== null} onOpenChange={() => setSelectedProposal(null)}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Proposal Details</DialogTitle>
            <DialogDescription>View complete information and approval history</DialogDescription>
          </DialogHeader>
          {selectedProposal && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div><p className="text-sm text-gray-500">Proposal No</p><p className="text-gray-900">{selectedProposal.proposalNo}</p></div>
                <div><p className="text-sm text-gray-500">Status</p><StatusBadge status={selectedProposal.status} proposal={selectedProposal} /></div>
                <div className="col-span-2"><p className="text-sm text-gray-500">Title</p><p className="text-gray-900">{selectedProposal.title}</p></div>
                <div><p className="text-sm text-gray-500">Category</p><p className="text-gray-900">{selectedProposal.category}</p></div>
                <div><p className="text-sm text-gray-500">Classification</p><p className="text-gray-900">{selectedProposal.classification}</p></div>
                <div className="col-span-2"><p className="text-sm text-gray-500">Sub-classification</p><p className="text-gray-900">{selectedProposal.subClassification}</p></div>
                <div className="col-span-2"><p className="text-sm text-gray-500">TOR</p><p className="text-gray-900">{selectedProposal.tor || '-'}</p></div>
                <div className="col-span-2"><p className="text-sm text-gray-500">TER</p><p className="text-gray-900">{selectedProposal.ter || '-'}</p></div>
                <div className="col-span-2"><p className="text-sm text-gray-500">Vendor List</p><div className="flex flex-wrap gap-2 mt-1">{selectedProposal.vendorList && selectedProposal.vendorList.map((v, i) => <span key={i} className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">{v}</span>)}</div></div>
              </div>
              <div><h3 className="text-gray-900 mb-4">Approval Timeline</h3><ApprovalTimeline history={selectedProposal.history} /></div>
              
              {/* Admin Approval Actions */}
              {isAdmin && selectedProposal.status !== 'Approved' && selectedProposal.status !== 'Rejected' && (
                <div className="pt-6 border-t">
                   <div className="bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-blue-200 rounded-lg p-4 mb-4">
                      <h4 className="text-gray-900 font-semibold">Admin Super User Access</h4>
                      <p className="text-sm text-gray-600">Override approval workflow.</p>
                   </div>
                   <AdminApprovalActions
                      proposal={selectedProposal}
                      onApprove={(role, comments) => {
                         handleAdminApprove(selectedProposal.id, role, comments);
                         setSelectedProposal(null);
                      }}
                      onReject={(role, comments) => {
                         handleAdminReject(selectedProposal.id, role, comments);
                         setSelectedProposal(null);
                      }}
                   />
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}