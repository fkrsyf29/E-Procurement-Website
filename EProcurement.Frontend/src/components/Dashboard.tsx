import { useState, useMemo } from 'react';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Search, Filter, Eye, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { mockProposals, monthlyTrendData } from '../data/mockData';
import { Proposal, Jobsite, Department, User } from '../types';
import { StatusBadge } from './StatusBadge';
import { ApprovalTimeline } from './ApprovalTimeline';
import { formatDate, parseDate } from '../utils/formatters';

// Status color mapping
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

const CHART_COLORS = ['#007BFF', '#28A745', '#FFC107', '#DC3545', '#6C757D', '#17A2B8', '#6F42C1'];

type SortField = 'proposalNo' | 'title' | 'creator' | 'jobsite' | 'department' | 'category' | 'amount' | 'createdDate' | 'status';
type SortDirection = 'asc' | 'desc' | null;

interface DashboardProps {
  proposals: Proposal[];
  user?: User;
  onUpdateProposal?: (proposalId: string, updates: Partial<Proposal>) => void;
}

export function Dashboard({ proposals = mockProposals, user, onUpdateProposal }: DashboardProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterJobsite, setFilterJobsite] = useState<string>('all');
  const [filterDepartment, setFilterDepartment] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterCreator, setFilterCreator] = useState<string>('all');
  const [selectedProposal, setSelectedProposal] = useState<Proposal | null>(null);
  const [sortField, setSortField] = useState<SortField | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>(null);

  // Calculate statistics
  const stats = useMemo(() => {
    const statusCounts = proposals.reduce((acc, p) => {
      acc[p.status] = (acc[p.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const jobsiteCounts = proposals.reduce((acc, p) => {
      acc[p.jobsite] = (acc[p.jobsite] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const departmentCounts = proposals.reduce((acc, p) => {
      acc[p.department] = (acc[p.department] || 0) + 1;
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
      const matchesSearch = p.proposalNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          p.creator.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesJobsite = filterJobsite === 'all' || p.jobsite === filterJobsite;
      const matchesDepartment = filterDepartment === 'all' || p.department === filterDepartment;
      const matchesStatus = filterStatus === 'all' || p.status === filterStatus;
      const matchesCreator = filterCreator === 'all' || p.creator === filterCreator;
      
      return matchesSearch && matchesJobsite && matchesDepartment && matchesStatus && matchesCreator;
    });

    // Apply sorting
    if (sortField && sortDirection) {
      filtered = [...filtered].sort((a, b) => {
        let aVal: any = a[sortField];
        let bVal: any = b[sortField];

        // Handle date sorting
        if (sortField === 'createdDate') {
          aVal = parseDate(a.createdDate).getTime();
          bVal = parseDate(b.createdDate).getTime();
        }

        // Handle numeric sorting
        if (sortField === 'amount') {
          aVal = a.amount;
          bVal = b.amount;
        }

        // Handle string sorting
        if (typeof aVal === 'string' && typeof bVal === 'string') {
          aVal = aVal.toLowerCase();
          bVal = bVal.toLowerCase();
        }

        if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
        if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return filtered;
  }, [proposals, searchTerm, filterJobsite, filterDepartment, filterStatus, filterCreator, sortField, sortDirection]);

  // Prepare chart data
  const statusChartData = Object.entries(stats.statusCounts).map(([status, count]) => ({
    name: status,
    count
  }));

  const jobsiteChartData = Object.entries(stats.jobsiteCounts).map(([jobsite, count]) => ({
    name: jobsite,
    count
  }));

  const departmentChartData = Object.entries(stats.departmentCounts).map(([department, count]) => ({
    name: department,
    count
  }));

  // ✅ Prepare summary table data for Status vs Jobsite
  const statusVsJobsiteData = useMemo(() => {
    // Get all unique jobsites
    const allJobsites = [...new Set(proposals.map(p => p.jobsite))].sort();
    
    // Get all unique statuses
    const allStatuses = ['Draft', 'Approved', 'Completed', 'Rejected'];
    
    // Add dynamic statuses that start with "On"
    const dynamicStatuses = [...new Set(proposals.map(p => p.status))]
      .filter(s => s.startsWith('On'))
      .sort();
    
    const statuses = [...allStatuses.filter(s => proposals.some(p => p.status === s)), ...dynamicStatuses];
    
    // Build matrix
    const matrix: Record<string, Record<string, number>> = {};
    statuses.forEach(status => {
      matrix[status] = {};
      allJobsites.forEach(jobsite => {
        matrix[status][jobsite] = proposals.filter(p => p.status === status && p.jobsite === jobsite).length;
      });
    });
    
    return { statuses, jobsites: allJobsites, matrix };
  }, [proposals]);

  // ✅ Prepare summary table data for Status vs Department
  const statusVsDepartmentData = useMemo(() => {
    // Get all unique departments
    const allDepartments = [...new Set(proposals.map(p => p.department))].sort();
    
    // Get all unique statuses (same as above)
    const allStatuses = ['Draft', 'Approved', 'Completed', 'Rejected'];
    const dynamicStatuses = [...new Set(proposals.map(p => p.status))]
      .filter(s => s.startsWith('On'))
      .sort();
    
    const statuses = [...allStatuses.filter(s => proposals.some(p => p.status === s)), ...dynamicStatuses];
    
    // Build matrix
    const matrix: Record<string, Record<string, number>> = {};
    statuses.forEach(status => {
      matrix[status] = {};
      allDepartments.forEach(department => {
        matrix[status][department] = proposals.filter(p => p.status === status && p.department === department).length;
      });
    });
    
    return { statuses, departments: allDepartments, matrix };
  }, [proposals]);

  // ✅ Prepare Department vs Jobsite matrix (vertical: department, horizontal: jobsite)
  const departmentVsJobsiteData = useMemo(() => {
    // Get all unique departments and jobsites
    const allDepartments = [...new Set(proposals.map(p => p.department))].sort();
    const allJobsites = [...new Set(proposals.map(p => p.jobsite))].sort();
    
    // Build matrix: department (rows) x jobsite (columns)
    const matrix: Record<string, Record<string, number>> = {};
    allDepartments.forEach(department => {
      matrix[department] = {};
      allJobsites.forEach(jobsite => {
        matrix[department][jobsite] = proposals.filter(p => p.department === department && p.jobsite === jobsite).length;
      });
    });
    
    return { departments: allDepartments, jobsites: allJobsites, matrix };
  }, [proposals]);



  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-gray-900">Dashboard</h1>
          <p className="text-gray-600">Overview of all proposals and statistics</p>
        </div>
      </div>

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

      {/* Row 2: Status vs Jobsite & Status vs Department Tables - Side by Side */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-2">
        {/* Status vs Jobsite Table */}
        <div className="p-3 rounded-lg border border-gray-200" style={{ backgroundColor: '#F0F0F0' }}>
          <h3 className="mb-2" style={{ fontSize: '13px', fontWeight: 'bold', color: '#000000', fontFamily: 'Arial, sans-serif' }}>
            Status vs Jobsite
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-xs border-collapse">
              <thead>
                <tr style={{ backgroundColor: '#007BFF' }}>
                  <th className="border border-gray-300 px-2 py-1.5 text-white text-left" style={{ fontFamily: 'Arial, sans-serif', fontWeight: 'bold' }}>
                    Status \ Jobsite
                  </th>
                  {statusVsJobsiteData.jobsites.map(jobsite => (
                    <th key={jobsite} className="border border-gray-300 px-2 py-1.5 text-white text-center" style={{ fontFamily: 'Arial, sans-serif', fontWeight: 'bold' }}>
                      {jobsite}
                    </th>
                  ))}
                  <th className="border border-gray-300 px-2 py-1.5 text-white text-center" style={{ fontFamily: 'Arial, sans-serif', fontWeight: 'bold' }}>
                    Total
                  </th>
                </tr>
              </thead>
              <tbody>
                {statusVsJobsiteData.statuses.map((status, idx) => {
                  const rowTotal = statusVsJobsiteData.jobsites.reduce((sum, jobsite) => sum + statusVsJobsiteData.matrix[status][jobsite], 0);
                  return (
                    <tr key={status} style={{ backgroundColor: idx % 2 === 0 ? '#FFFFFF' : '#F8F9FA' }}>
                      <td className="border border-gray-300 px-2 py-1.5" style={{ fontFamily: 'Arial, sans-serif', fontWeight: '600', color: '#000000' }}>
                        {status}
                      </td>
                      {statusVsJobsiteData.jobsites.map(jobsite => (
                        <td key={jobsite} className="border border-gray-300 px-2 py-1.5 text-center" style={{ fontFamily: 'Arial, sans-serif', color: '#000000' }}>
                          {statusVsJobsiteData.matrix[status][jobsite] || 0}
                        </td>
                      ))}
                      <td className="border border-gray-300 px-2 py-1.5 text-center" style={{ fontFamily: 'Arial, sans-serif', fontWeight: 'bold', color: '#007BFF' }}>
                        {rowTotal}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Status vs Department Table */}
        <div className="p-3 rounded-lg border border-gray-200" style={{ backgroundColor: '#F0F0F0' }}>
          <h3 className="mb-2" style={{ fontSize: '13px', fontWeight: 'bold', color: '#000000', fontFamily: 'Arial, sans-serif' }}>
            Status vs Department
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-xs border-collapse">
              <thead>
                <tr style={{ backgroundColor: '#28A745' }}>
                  <th className="border border-gray-300 px-2 py-1.5 text-white text-left" style={{ fontFamily: 'Arial, sans-serif', fontWeight: 'bold' }}>
                    Status \ Department
                  </th>
                  {statusVsDepartmentData.departments.map(department => (
                    <th key={department} className="border border-gray-300 px-2 py-1.5 text-white text-center" style={{ fontFamily: 'Arial, sans-serif', fontWeight: 'bold' }}>
                      {department}
                    </th>
                  ))}
                  <th className="border border-gray-300 px-2 py-1.5 text-white text-center" style={{ fontFamily: 'Arial, sans-serif', fontWeight: 'bold' }}>
                    Total
                  </th>
                </tr>
              </thead>
              <tbody>
                {statusVsDepartmentData.statuses.map((status, idx) => {
                  const rowTotal = statusVsDepartmentData.departments.reduce((sum, department) => sum + statusVsDepartmentData.matrix[status][department], 0);
                  return (
                    <tr key={status} style={{ backgroundColor: idx % 2 === 0 ? '#FFFFFF' : '#F8F9FA' }}>
                      <td className="border border-gray-300 px-2 py-1.5" style={{ fontFamily: 'Arial, sans-serif', fontWeight: '600', color: '#000000' }}>
                        {status}
                      </td>
                      {statusVsDepartmentData.departments.map(department => (
                        <td key={department} className="border border-gray-300 px-2 py-1.5 text-center" style={{ fontFamily: 'Arial, sans-serif', color: '#000000' }}>
                          {statusVsDepartmentData.matrix[status][department] || 0}
                        </td>
                      ))}
                      <td className="border border-gray-300 px-2 py-1.5 text-center" style={{ fontFamily: 'Arial, sans-serif', fontWeight: 'bold', color: '#28A745' }}>
                        {rowTotal}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Row 3: Department vs Jobsite Table & Timeline Chart - Side by Side */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-2">
        {/* Department vs Jobsite Summary Table */}
        <div className="p-3 rounded-lg border border-gray-200" style={{ backgroundColor: '#F0F0F0' }}>
          <h3 className="mb-2" style={{ fontSize: '13px', fontWeight: 'bold', color: '#000000', fontFamily: 'Arial, sans-serif' }}>
            Department vs Jobsite Summary
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-xs border-collapse">
              <thead>
                <tr style={{ backgroundColor: '#FFC107' }}>
                  <th className="border border-gray-300 px-2 py-1.5 text-white text-left" style={{ fontFamily: 'Arial, sans-serif', fontWeight: 'bold' }}>
                    Department \ Jobsite
                  </th>
                  {departmentVsJobsiteData.jobsites.map(jobsite => (
                    <th key={jobsite} className="border border-gray-300 px-2 py-1.5 text-white text-center" style={{ fontFamily: 'Arial, sans-serif', fontWeight: 'bold' }}>
                      {jobsite}
                    </th>
                  ))}
                  <th className="border border-gray-300 px-2 py-1.5 text-white text-center" style={{ fontFamily: 'Arial, sans-serif', fontWeight: 'bold' }}>
                    Total
                  </th>
                </tr>
              </thead>
              <tbody>
                {departmentVsJobsiteData.departments.map((department, idx) => {
                  const rowTotal = departmentVsJobsiteData.jobsites.reduce((sum, jobsite) => sum + departmentVsJobsiteData.matrix[department][jobsite], 0);
                  return (
                    <tr key={department} style={{ backgroundColor: idx % 2 === 0 ? '#FFFFFF' : '#F8F9FA' }}>
                      <td className="border border-gray-300 px-2 py-1.5" style={{ fontFamily: 'Arial, sans-serif', fontWeight: '600', color: '#000000' }}>
                        {department}
                      </td>
                      {departmentVsJobsiteData.jobsites.map(jobsite => (
                        <td key={jobsite} className="border border-gray-300 px-2 py-1.5 text-center" style={{ fontFamily: 'Arial, sans-serif', color: '#000000' }}>
                          {departmentVsJobsiteData.matrix[department][jobsite] || 0}
                        </td>
                      ))}
                      <td className="border border-gray-300 px-2 py-1.5 text-center" style={{ fontFamily: 'Arial, sans-serif', fontWeight: 'bold', color: '#FFC107' }}>
                        {rowTotal}
                      </td>
                    </tr>
                  );
                })}
                <tr style={{ backgroundColor: '#FFF8E1' }}>
                  <td className="border border-gray-300 px-2 py-1.5" style={{ fontFamily: 'Arial, sans-serif', fontWeight: 'bold', color: '#000000' }}>
                    Total
                  </td>
                  {departmentVsJobsiteData.jobsites.map(jobsite => {
                    const colTotal = departmentVsJobsiteData.departments.reduce((sum, department) => sum + departmentVsJobsiteData.matrix[department][jobsite], 0);
                    return (
                      <td key={jobsite} className="border border-gray-300 px-2 py-1.5 text-center" style={{ fontFamily: 'Arial, sans-serif', fontWeight: 'bold', color: '#FFC107' }}>
                        {colTotal}
                      </td>
                    );
                  })}
                  <td className="border border-gray-300 px-2 py-1.5 text-center" style={{ fontFamily: 'Arial, sans-serif', fontWeight: 'bold', color: '#000000' }}>
                    {stats.total}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Timeline Chart */}
        <div className="p-3 rounded-lg border border-gray-200" style={{ backgroundColor: '#F0F0F0' }}>
          <h3 className="mb-2" style={{ fontSize: '13px', fontWeight: 'bold', color: '#000000', fontFamily: 'Arial, sans-serif' }}>
            Proposal Trend (12 Months)
          </h3>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={monthlyTrendData} margin={{ top: 20, right: 20, left: 10, bottom: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#D0D0D0" />
              <XAxis 
                dataKey="month" 
                tick={{ fontSize: 11, fill: '#000000', fontFamily: 'Arial, sans-serif', fontWeight: '600' }}
                stroke="#6C757D"
              />
              <YAxis 
                tick={{ fontSize: 12, fill: '#000000', fontFamily: 'Arial, sans-serif', fontWeight: '600' }}
                stroke="#6C757D"
                width={40}
              />
              <Tooltip 
                contentStyle={{ 
                  fontSize: '13px', 
                  padding: '10px', 
                  borderRadius: '6px', 
                  backgroundColor: '#FFFFFF', 
                  fontFamily: 'Arial, sans-serif',
                  fontWeight: 'bold',
                  border: '1px solid #E0E0E0'
                }}
              />
              <Legend 
                wrapperStyle={{ 
                  fontSize: '12px', 
                  paddingTop: '8px', 
                  fontFamily: 'Arial, sans-serif',
                  fontWeight: 'bold'
                }}
                iconSize={12}
              />
              <Line 
                type="monotone" 
                dataKey="count" 
                stroke="#007BFF" 
                strokeWidth={2} 
                name="Proposals"
                label={{ 
                  position: 'top', 
                  fill: '#000000', 
                  fontSize: 10, 
                  fontWeight: 'bold',
                  fontFamily: 'Arial, sans-serif'
                }}
                dot={{ fill: '#007BFF', r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>


      {/* Proposals Table */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-gray-900 mb-4">All Proposals</h3>
          
          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search proposals..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>

            <Select value={filterCreator} onValueChange={setFilterCreator}>
              <SelectTrigger>
                <SelectValue placeholder="All Creators" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Creators</SelectItem>
                {uniqueCreators.map(creator => (
                  <SelectItem key={creator} value={creator}>{creator}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Select value={filterJobsite} onValueChange={setFilterJobsite}>
              <SelectTrigger>
                <SelectValue placeholder="All Jobsites" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Jobsites</SelectItem>
                <SelectItem value="ADMO MINING">ADMO MINING</SelectItem>
                <SelectItem value="ADMO HAULING">ADMO HAULING</SelectItem>
                <SelectItem value="SERA">SERA</SelectItem>
                <SelectItem value="MACO MINING">MACO MINING</SelectItem>
                <SelectItem value="MACO HAULING">MACO HAULING</SelectItem>
                <SelectItem value="JAHO">JAHO</SelectItem>
                <SelectItem value="NARO">NARO</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filterDepartment} onValueChange={setFilterDepartment}>
              <SelectTrigger>
                <SelectValue placeholder="All Departments" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Departments</SelectItem>
                <SelectItem value="Plant">Plant</SelectItem>
                <SelectItem value="Logistic">Logistic</SelectItem>
                <SelectItem value="HR">HR</SelectItem>
                <SelectItem value="GA">GA</SelectItem>
                <SelectItem value="SHE">SHE</SelectItem>
                <SelectItem value="Finance">Finance</SelectItem>
                <SelectItem value="Production">Production</SelectItem>
                <SelectItem value="Engineering">Engineering</SelectItem>
                <SelectItem value="IT">IT</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger>
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="Draft">Draft</SelectItem>
                <SelectItem value="On Verification">On Verification</SelectItem>
                <SelectItem value="On Review 1">On Review 1</SelectItem>
                <SelectItem value="On Review 2">On Review 2</SelectItem>
                <SelectItem value="On Approval 1">On Approval 1</SelectItem>
                <SelectItem value="On Approval 2">On Approval 2</SelectItem>
                <SelectItem value="On Sourcing Approval">On Sourcing Approval</SelectItem>
                <SelectItem value="On Procurement Approval">On Procurement Approval</SelectItem>
                <SelectItem value="On Unit Head Approval">On Unit Head Approval</SelectItem>
                <SelectItem value="On Section Head Approval">On Section Head Approval</SelectItem>
                <SelectItem value="On Department Head Approval">On Department Head Approval</SelectItem>
                <SelectItem value="On Manager Approval">On Manager Approval</SelectItem>
                <SelectItem value="On Division Head Approval">On Division Head Approval</SelectItem>
                <SelectItem value="On Director Approval">On Director Approval</SelectItem>
                <SelectItem value="On President Director Approval">On President Director Approval</SelectItem>
                <SelectItem value="Approved">Approved</SelectItem>
                <SelectItem value="Rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead style={{ backgroundColor: '#E6F2FF' }} className="border-b border-gray-200">
              <tr>
                <th 
                  className="px-6 py-3 text-left text-xs uppercase tracking-wider cursor-pointer hover:bg-blue-100" 
                  style={{ color: '#000000', fontWeight: 'bold', fontFamily: 'Arial, sans-serif' }}
                  onClick={() => handleSort('proposalNo')}
                >
                  Proposal No {getSortIcon('proposalNo')}
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs uppercase tracking-wider cursor-pointer hover:bg-blue-100" 
                  style={{ color: '#000000', fontWeight: 'bold', fontFamily: 'Arial, sans-serif' }}
                  onClick={() => handleSort('title')}
                >
                  Title {getSortIcon('title')}
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs uppercase tracking-wider cursor-pointer hover:bg-blue-100" 
                  style={{ color: '#000000', fontWeight: 'bold', fontFamily: 'Arial, sans-serif' }}
                  onClick={() => handleSort('jobsite')}
                >
                  Jobsite {getSortIcon('jobsite')}
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs uppercase tracking-wider cursor-pointer hover:bg-blue-100" 
                  style={{ color: '#000000', fontWeight: 'bold', fontFamily: 'Arial, sans-serif' }}
                  onClick={() => handleSort('department')}
                >
                  Department {getSortIcon('department')}
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs uppercase tracking-wider cursor-pointer hover:bg-blue-100" 
                  style={{ color: '#000000', fontWeight: 'bold', fontFamily: 'Arial, sans-serif' }}
                  onClick={() => handleSort('creator')}
                >
                  Creator {getSortIcon('creator')}
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs uppercase tracking-wider cursor-pointer hover:bg-blue-100" 
                  style={{ color: '#000000', fontWeight: 'bold', fontFamily: 'Arial, sans-serif' }}
                  onClick={() => handleSort('amount')}
                >
                  Amount {getSortIcon('amount')}
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs uppercase tracking-wider cursor-pointer hover:bg-blue-100" 
                  style={{ color: '#000000', fontWeight: 'bold', fontFamily: 'Arial, sans-serif' }}
                  onClick={() => handleSort('createdDate')}
                >
                  Created Date {getSortIcon('createdDate')}
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs uppercase tracking-wider cursor-pointer hover:bg-blue-100" 
                  style={{ color: '#000000', fontWeight: 'bold', fontFamily: 'Arial, sans-serif' }}
                  onClick={() => handleSort('status')}
                >
                  Status {getSortIcon('status')}
                </th>
                <th className="px-6 py-3 text-left text-xs uppercase tracking-wider" style={{ color: '#000000', fontWeight: 'bold', fontFamily: 'Arial, sans-serif' }}>Action</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredProposals.map((proposal) => (
                <tr key={proposal.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{proposal.proposalNo}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">{proposal.title}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{proposal.jobsite}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{proposal.department}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{proposal.creator}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    ${Math.round(proposal.amount).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{formatDate(proposal.createdDate)}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <StatusBadge status={proposal.status} proposal={proposal} />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelectedProposal(proposal)}
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      View
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Proposal Detail Dialog */}
      <Dialog open={selectedProposal !== null} onOpenChange={() => setSelectedProposal(null)}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Proposal Details</DialogTitle>
            <DialogDescription>
              View complete information and approval history for this proposal
            </DialogDescription>
          </DialogHeader>
          {selectedProposal && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Proposal No</p>
                  <p className="text-gray-900">{selectedProposal.proposalNo}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Status</p>
                  <StatusBadge status={selectedProposal.status} proposal={selectedProposal} />
                </div>
                <div className="col-span-2">
                  <p className="text-sm text-gray-500">Title</p>
                  <p className="text-gray-900">{selectedProposal.title}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Jobsite</p>
                  <p className="text-gray-900">{selectedProposal.jobsite}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Department</p>
                  <p className="text-gray-900">{selectedProposal.department}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Creator</p>
                  <p className="text-gray-900">{selectedProposal.creator}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Amount</p>
                  <p className="text-gray-900">${Math.round(selectedProposal.amount).toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Category</p>
                  <p className="text-gray-900">{selectedProposal.category}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Classification</p>
                  <p className="text-gray-900">{selectedProposal.classification}</p>
                </div>
              </div>

              <div>
                <h3 className="text-gray-900 mb-4">Approval Timeline</h3>
                <ApprovalTimeline history={selectedProposal.history} />
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
