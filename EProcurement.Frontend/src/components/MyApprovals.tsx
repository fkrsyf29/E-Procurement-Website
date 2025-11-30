import { useState, useMemo, useEffect } from 'react';
import { Search, Eye, CheckCircle, XCircle, ArrowUpDown, ArrowUp, ArrowDown, FileText, Shield, Download, FileSpreadsheet } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
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
import { User, Proposal, ProposalStatus } from '../types';
import { StatusBadge } from './StatusBadge';
import { ApprovalTimeline } from './ApprovalTimeline';
import { ProposalDetailsView } from './ProposalDetailsView';
import { Badge } from './ui/badge';
import { toast } from 'sonner';
import { formatDate, parseDate } from '../utils/formatters';
// ✅ Import API
import { fetchMyApprovals, approveProposalApi } from '../services/proposalApi';

type SortField = 'proposalNo' | 'title' | 'creator' | 'jobsite' | 'amount' | 'createdDate';
type SortDirection = 'asc' | 'desc' | null;

interface MyApprovalsProps {
  user: User;
  // Props lama dihapus karena mandiri
}

export function MyApprovals({ user }: MyApprovalsProps) {
  // ✅ STATE DATA BARU
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // STATE UI LAMA
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCreator, setFilterCreator] = useState<string>('all');
  const [selectedProposal, setSelectedProposal] = useState<Proposal | null>(null);
  const [actionProposal, setActionProposal] = useState<Proposal | null>(null);
  const [actionType, setActionType] = useState<'approve' | 'reject' | null>(null);
  const [comment, setComment] = useState('');
  const [sortField, setSortField] = useState<SortField | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>(null);
  const [showBudgetPreview, setShowBudgetPreview] = useState(false);

  const isAdmin = user.roleName === 'Administrator' || user.permissions.includes('approve_all');

  // ✅ 1. FETCH DATA
  const loadData = async () => {
    setIsLoading(true);
    try {
      // API ini sudah memfilter di Backend berdasarkan Permission User
      const data = await fetchMyApprovals(user.userID);
      setProposals(data);
    } catch (error) {
      console.error("Failed to load approvals", error);
      toast.error("Gagal memuat data approval");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user.userID) {
        loadData();
    }
  }, [user.userID]);

  // Logic visual untuk stage name (tetap dipertahankan)
  const getStageName = (status: string): string => {
    return status.replace('On ', '');
  };

  // Helper display status (UI Only)
  const getApprovalStage = (role: string): string | null => {
    if (role === 'Administrator') return 'All Stages';
    // Logic sederhana untuk display, karena data real sudah difilter API
    return 'Pending Your Approval';
  };

  // Logic Permission Check (Updated for API Data)
  const canUserApproveProposal = (proposal: Proposal): boolean => {
    if (isAdmin) return true;
    
    // Jika proposal sudah selesai, tidak bisa approve lagi
    if (['Approved', 'Rejected', 'Completed', 'Draft'].includes(proposal.status)) {
        return false;
    }

    // Karena list ini berasal dari API 'MyApprovals' (yang sudah difilter DB),
    // maka user otomatis punya hak untuk approve item yang muncul di sini.
    return true;
  };

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

  // Filter proposals (Menggunakan state 'proposals' dari API)
  const filteredApprovals = useMemo(() => {
    let filtered = proposals.filter(p => {
      const matchesSearch = p.proposalNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.creator.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCreator = filterCreator === 'all' || p.creator === filterCreator;
      
      return matchesSearch && matchesCreator;
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
             // Handle object sorting
            aVal = a.jobsite?.name || '';
            bVal = b.jobsite?.name || '';
        } else {
             const sA = String(aVal).toLowerCase();
             const sB = String(bVal).toLowerCase();
             if (sA < sB) return sortDirection === 'asc' ? -1 : 1;
             if (sA > sB) return sortDirection === 'asc' ? 1 : -1;
             return 0;
        }

        if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
        if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return filtered;
  }, [proposals, searchTerm, filterCreator, sortField, sortDirection]);

  const handleApprovalAction = (proposal: Proposal, action: 'approve' | 'reject') => {
    setActionProposal(proposal);
    setActionType(action);
    setComment('');
  };

  // ✅ LOGIC BARU: ACTION VIA API
  const confirmAction = async () => {
    if (!actionProposal || !actionType) return;
    
    if (actionType === 'reject' && !comment.trim()) {
      toast.error('Please provide a comment for rejection');
      return;
    }

    setIsLoading(true);
    try {
        // Call API
        await approveProposalApi(
            actionProposal.id,
            actionType === 'approve' ? 'Approve' : 'Reject',
            comment,
            { userId: user.userID, username: user.username }
        );

        toast.success(`Proposal ${actionType === 'approve' ? 'Approved' : 'Rejected'} successfully!`);

        // Cleanup & Refresh
        setSelectedProposal(null); 
        setActionProposal(null); 
        setActionType(null); 
        setComment('');
        await loadData(); // Refresh list

    } catch (error: any) {
        console.error(error);
        toast.error('Action failed: ' + error.message);
    } finally {
        setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div>
        <h1 className="text-gray-900">My Approvals</h1>
        <p className="text-gray-600">Review and approve pending proposals</p>
      </div>

      {/* Loading Overlay */}
      {isLoading && (
        <div className="fixed inset-0 bg-black/10 z-50 flex items-center justify-center">
            <div className="bg-white p-4 rounded shadow-lg text-sm font-medium">Processing...</div>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        <div className="p-3 rounded-lg border border-gray-200" style={{ backgroundColor: '#F0F0F0' }}>
          <p className="text-sm mb-1" style={{ color: '#000000', fontFamily: 'Arial, sans-serif', fontWeight: '600' }}>Pending Approvals</p>
          <p className="text-2xl" style={{ color: '#FFC107', fontFamily: 'Arial, sans-serif', fontWeight: 'bold' }}>{proposals.length}</p>
        </div>
        <div className="p-3 rounded-lg border border-gray-200" style={{ backgroundColor: '#F0F0F0' }}>
          <p className="text-sm mb-1" style={{ color: '#000000', fontFamily: 'Arial, sans-serif', fontWeight: '600' }}>My Role</p>
          <p style={{ fontSize: '18px', color: '#000000', fontFamily: 'Arial, sans-serif', fontWeight: 'bold', marginTop: '4px' }}>{user.roleName}</p>
        </div>
        <div className="p-3 rounded-lg border border-gray-200" style={{ backgroundColor: '#F0F0F0' }}>
          <p className="text-sm mb-1" style={{ color: '#000000', fontFamily: 'Arial, sans-serif', fontWeight: '600' }}>My Scope</p>
          <p style={{ fontSize: '16px', color: '#000000', fontFamily: 'Arial, sans-serif', fontWeight: 'bold', marginTop: '4px' }}>
            {user.department?.name || 'All Depts'} - {user.jobsite?.name || 'All Sites'}
          </p>
        </div>
        <div className="p-3 rounded-lg border border-gray-200" style={{ backgroundColor: '#F0F0F0' }}>
          <p className="text-sm mb-1" style={{ color: '#000000', fontFamily: 'Arial, sans-serif', fontWeight: '600' }}>Approval Stage</p>
          <p style={{ fontSize: '16px', color: '#000000', fontFamily: 'Arial, sans-serif', fontWeight: 'bold', marginTop: '4px' }}>
            {getApprovalStage(user.roleName)}
          </p>
        </div>
      </div>

      {/* Admin Notice */}
      {isAdmin && (
        <div className="bg-gradient-to-r from-purple-50 to-blue-50 border-2 border-purple-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <div className="w-2 h-2 bg-purple-600 rounded-full animate-pulse mt-1.5"></div>
            <div>
              <h4 className="text-gray-900 flex items-center gap-2">
                <Shield className="w-4 h-4 text-purple-600" />
                <span className="px-2 py-0.5 bg-purple-600 text-white text-xs rounded">ADMIN</span>
                Super User Access - All Pending Proposals
              </h4>
              <p className="text-sm text-gray-600 mt-1">
                You have full access to <strong>all pending approvals</strong> across all departments, jobsites, and approval stages. You can approve or reject proposals at any stage on behalf of any role.
              </p>
            </div>
          </div>
        </div>
      )}
      
      {/* Non-Admin Notice */}
      {!isAdmin && proposals.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <div className="flex items-start gap-3">
            <div className="w-2 h-2 bg-blue-600 rounded-full mt-1.5"></div>
            <div>
              <h4 className="text-sm text-gray-900">
                Outstanding Approvals for {user.roleName}
              </h4>
              <p className="text-xs text-gray-600 mt-1">
                Showing only proposals pending your approval
                {user.department?.name && user.jobsite?.name && ` in ${user.department.name} - ${user.jobsite.name}`}
                {user.department?.name && !user.jobsite?.name && ` in ${user.department.name} department`}.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Approvals List */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                  onClick={() => handleSort('creator')}
                >
                  Creator {getSortIcon('creator')}
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
                <th className="px-6 py-3 text-left text-xs uppercase tracking-wider" style={{ color: '#000000', fontWeight: 'bold', fontFamily: 'Arial, sans-serif' }}>Status</th>
                <th className="px-6 py-3 text-left text-xs uppercase tracking-wider" style={{ color: '#000000', fontWeight: 'bold', fontFamily: 'Arial, sans-serif' }}>Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredApprovals.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center">
                    <div className="text-gray-500">
                      <p className="text-lg mb-2">{isLoading ? 'Loading...' : 'No pending approvals for your role'}</p>
                      {!isAdmin && !isLoading && (
                        <p className="text-sm">
                          You will see proposals here when they reach your approval stage.
                        </p>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                filteredApprovals.map((proposal) => {
                  const canApprove = canUserApproveProposal(proposal);
                  
                  return (
                    <tr key={proposal.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{proposal.proposalNo}</td>
                      <td className="px-6 py-4 text-sm text-gray-900">{proposal.title}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{proposal.creator}</td>
                      {/* Fix: Use name property for jobsite object */}
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{proposal.jobsite?.name || '-'}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        ${Math.round(proposal.amount).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{formatDate(proposal.createdDate)}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {/* New: Show current workflow step name */}
                        <div className="flex flex-col gap-1">
                           <StatusBadge status={proposal.status} proposal={proposal} />
                           {proposal.currentStepName && (
                               <span className="text-[10px] text-gray-500">
                                   Step: {proposal.currentStepName}
                               </span>
                           )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setSelectedProposal(proposal)}
                        >
                          <Eye className="w-3 h-3 mr-1" />
                          View
                        </Button>
                        {canApprove ? (
                          <>
                            <Button
                              size="sm"
                              onClick={() => handleApprovalAction(proposal, 'approve')}
                              style={{ backgroundColor: '#28A745', color: 'white' }}
                            >
                              <CheckCircle className="w-3 h-3 mr-1" />
                              Approve
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleApprovalAction(proposal, 'reject')}
                            >
                              <XCircle className="w-3 h-3 mr-1" />
                              Reject
                            </Button>
                          </>
                        ) : (
                          <Badge variant="secondary" className="text-xs">
                            Not your turn
                          </Badge>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Proposal Details Dialog */}
      <Dialog open={!!selectedProposal} onOpenChange={() => setSelectedProposal(null)}>
        <DialogContent className="max-w-[95vw] w-[1400px] max-h-[95vh] overflow-y-auto">
          <DialogHeader className="sr-only">
            <DialogTitle>Proposal Details</DialogTitle>
            <DialogDescription>
              Review proposal information and take approval action
            </DialogDescription>
          </DialogHeader>
          {selectedProposal && (
            <ProposalDetailsView
              proposal={selectedProposal}
              user={user}
              onApprove={(proposal, comment) => {
                handleApprovalAction(proposal, 'approve');
                setComment(comment);
              }}
              onReject={(proposal, comment) => {
                handleApprovalAction(proposal, 'reject');
                setComment(comment);
              }}
              onClose={() => setSelectedProposal(null)}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Approval Action Dialog */}
      <AlertDialog open={!!actionProposal} onOpenChange={() => setActionProposal(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {actionType === 'approve' ? 'Approve Proposal' : 'Reject Proposal'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {actionType === 'approve'
                ? 'Are you sure you want to approve this proposal? This will move it to the next stage.'
                : 'Please provide a reason for rejecting this proposal.'}
            </AlertDialogDescription>
          </AlertDialogHeader>

          <div className="py-4">
            <Textarea
              placeholder={actionType === 'approve' ? 'Add comment (optional)...' : 'Enter rejection reason (required)...'}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={4}
              className={actionType === 'reject' ? 'border-red-300' : ''}
            />
          </div>

          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => {
              setActionProposal(null);
              setComment('');
            }}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction onClick={confirmAction}>
              {actionType === 'approve' ? 'Approve' : 'Reject'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}