import { useState, useMemo, useEffect, useRef } from 'react';
import { Plus, Eye, Edit, Search, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { User, Proposal, ProposalStatus } from '../types';
import { StatusBadge } from './StatusBadge';
import { ApprovalTimeline } from './ApprovalTimeline';
import { ProposalForm } from './ProposalForm';
import { formatDate, parseDate } from '../utils/formatters';
import { toast } from 'sonner';
import { fetchMyProposals, createProposalApi } from '../services/proposalApi';

type SortField = 'proposalNo' | 'title' | 'jobsite' | 'department' | 'amount' | 'createdDate' | 'status';
type SortDirection = 'asc' | 'desc' | null;

interface MyProposalsProps {
  user: User;
}

export function MyProposals({ user }: MyProposalsProps) {
  // --- STATE DATA API ---
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // --- STATE UI ---
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProposal, setSelectedProposal] = useState<Proposal | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingProposal, setEditingProposal] = useState<Proposal | null>(null);
  const [sortField, setSortField] = useState<SortField | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>(null);
  
  // Track save operation
  const isSavingRef = useRef(false);
  const closeTimerRef = useRef<NodeJS.Timeout | null>(null);

  // ✅ 1. FETCH DATA
  const loadData = async () => {
    setIsLoading(true);
    try {
      const data = await fetchMyProposals(user.userID);
      setProposals(data);
    } catch (error) {
      console.error("Failed to load proposals", error);
      toast.error("Gagal memuat data proposal");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user.userID) {
        loadData();
    }
  }, [user.userID]);

  // Cleanup timer
  useEffect(() => {
    return () => {
      if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
    };
  }, []);

  // Filter proposals (Client-Side Filter)
  const myProposals = useMemo(() => {
    // Data dari API sudah difilter by CreatorID, tapi kita double check untuk keamanan
    return proposals.filter(p => p.creatorId === user.userID || p.creator === user.name);
  }, [user.userID, user.name, proposals]);

  // Handle sorting
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      if (sortDirection === 'asc') setSortDirection('desc');
      else if (sortDirection === 'desc') { setSortField(null); setSortDirection(null); }
      else setSortDirection('asc');
    } else { setSortField(field); setSortDirection('asc'); }
  };

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) return <ArrowUpDown className="w-3 h-3 ml-1 inline" />;
    if (sortDirection === 'asc') return <ArrowUp className="w-3 h-3 ml-1 inline" />;
    return <ArrowDown className="w-3 h-3 ml-1 inline" />;
  };

  // Search & Sort Logic
  const filteredProposals = useMemo(() => {
    let filtered = myProposals.filter(p => 
      p.proposalNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.title.toLowerCase().includes(searchTerm.toLowerCase())
    );

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
            aVal = a.jobsite?.name || '';
            bVal = b.jobsite?.name || '';
        } else if (sortField === 'department') {
            aVal = a.department?.name || '';
            bVal = b.department?.name || '';
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
  }, [myProposals, searchTerm, sortField, sortDirection]);

  // Stats
  const stats = useMemo(() => {
    return {
      total: myProposals.length,
      approved: myProposals.filter(p => p.status === 'Approved').length,
      pending: myProposals.filter(p => p.status === 'In Progress' || p.status.startsWith('On')).length,
      rejected: myProposals.filter(p => p.status === 'Rejected').length,
      draft: myProposals.filter(p => p.status === 'Draft').length,
    };
  }, [myProposals]);

  const handleEdit = (proposal: Proposal) => {
    setEditingProposal(proposal);
    setShowForm(true);
  };

  const handleNewProposal = () => {
    setEditingProposal(null);
    setShowForm(true);
  };

  // ✅ LOGIC BARU: SAVE TO API
  const handleSaveProposalWrapper = async (proposalData: any, isDraft: boolean) => {
    isSavingRef.current = true;
    
    try {
        // Prepare context
        const userContext = { 
            userId: user.userID, 
            username: user.username,
            jobsiteId: user.jobsite?.jobsiteID, 
            departmentId: user.department?.departmentID
        };

        if (editingProposal) {
            toast.info("Fitur Update sedang disiapkan di backend.");
            // await updateProposalApi(proposalData, userContext);
        } else {
            await createProposalApi(proposalData, userContext);
            toast.success("Proposal created successfully!");
        }
        
        // Refresh & Close
        await loadData();
        
        // Delay close slightly for UX
        closeTimerRef.current = setTimeout(() => {
            setShowForm(false);
            setEditingProposal(null);
            isSavingRef.current = false;
        }, 150);

    } catch (error: any) {
        console.error("Save failed", error);
        toast.error("Gagal menyimpan proposal: " + error.message);
        isSavingRef.current = false;
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-gray-900">My Proposals</h1>
          <p className="text-gray-600">Manage and track your proposals</p>
        </div>
        <Button onClick={handleNewProposal}>
          <Plus className="w-4 h-4 mr-2" />
          New Proposal
        </Button>
      </div>

      {/* Loading Overlay */}
      {isLoading && (
        <div className="fixed inset-0 bg-black/10 z-50 flex items-center justify-center">
            <div className="bg-white p-4 rounded shadow-lg text-sm font-medium">Loading Data...</div>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
        <div className="p-3 rounded-lg border border-gray-200" style={{ backgroundColor: '#F0F0F0' }}>
          <p className="text-sm mb-1" style={{ color: '#000000', fontFamily: 'Arial, sans-serif', fontWeight: '600' }}>Total</p>
          <p className="text-2xl" style={{ color: '#007BFF', fontFamily: 'Arial, sans-serif', fontWeight: 'bold' }}>{stats.total}</p>
        </div>
        <div className="p-3 rounded-lg border border-gray-200" style={{ backgroundColor: '#F0F0F0' }}>
          <p className="text-sm mb-1" style={{ color: '#000000', fontFamily: 'Arial, sans-serif', fontWeight: '600' }}>Approved</p>
          <p className="text-2xl" style={{ color: '#28A745', fontFamily: 'Arial, sans-serif', fontWeight: 'bold' }}>{stats.approved}</p>
        </div>
        <div className="p-3 rounded-lg border border-gray-200" style={{ backgroundColor: '#F0F0F0' }}>
          <p className="text-sm mb-1" style={{ color: '#000000', fontFamily: 'Arial, sans-serif', fontWeight: '600' }}>Pending</p>
          <p className="text-2xl" style={{ color: '#FFC107', fontFamily: 'Arial, sans-serif', fontWeight: 'bold' }}>{stats.pending}</p>
        </div>
        <div className="p-3 rounded-lg border border-gray-200" style={{ backgroundColor: '#F0F0F0' }}>
          <p className="text-sm mb-1" style={{ color: '#000000', fontFamily: 'Arial, sans-serif', fontWeight: '600' }}>Rejected</p>
          <p className="text-2xl" style={{ color: '#DC3545', fontFamily: 'Arial, sans-serif', fontWeight: 'bold' }}>{stats.rejected}</p>
        </div>
        <div className="p-3 rounded-lg border border-gray-200" style={{ backgroundColor: '#F0F0F0' }}>
          <p className="text-sm mb-1" style={{ color: '#000000', fontFamily: 'Arial, sans-serif', fontWeight: '600' }}>Draft</p>
          <p className="text-2xl" style={{ color: '#6C757D', fontFamily: 'Arial, sans-serif', fontWeight: 'bold' }}>{stats.draft}</p>
        </div>
      </div>

      {/* Proposals List */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Search my proposals..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead style={{ backgroundColor: '#E6F2FF' }} className="border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-bold text-black" onClick={() => handleSort('proposalNo')}>Proposal No {getSortIcon('proposalNo')}</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-black" onClick={() => handleSort('title')}>Title {getSortIcon('title')}</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-black" onClick={() => handleSort('jobsite')}>Jobsite {getSortIcon('jobsite')}</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-black" onClick={() => handleSort('department')}>Department {getSortIcon('department')}</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-black" onClick={() => handleSort('amount')}>Amount {getSortIcon('amount')}</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-black" onClick={() => handleSort('createdDate')}>Created Date {getSortIcon('createdDate')}</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-black" onClick={() => handleSort('status')}>Status {getSortIcon('status')}</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-black">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredProposals.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center gap-4">
                      <div className="text-red-600 bg-red-50 border border-red-200 rounded-lg p-6 max-w-2xl">
                        <p className="font-bold text-lg mb-2">⚠️ NO PROPOSALS FOUND</p>
                        <div className="text-sm text-left space-y-2">
                          <p>• Total proposals in system: {proposals.length}</p>
                          <p>• After search filter: {filteredProposals.length}</p>
                        </div>
                      </div>
                      <Button onClick={handleNewProposal} variant="outline">
                        <Plus className="w-4 h-4 mr-2" />
                        Create your first proposal
                      </Button>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredProposals.map((proposal) => (
                  <tr key={proposal.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{proposal.proposalNo}</td>
                    <td className="px-6 py-4 text-sm text-gray-900">{proposal.title}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{proposal.jobsite?.name || '-'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{proposal.department?.name || '-'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${Math.round(proposal.amount).toLocaleString()}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{formatDate(proposal.createdDate)}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <StatusBadge status={proposal.status} proposal={proposal} />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex gap-2">
                        <Button variant="ghost" size="sm" onClick={() => setSelectedProposal(proposal)}>
                          <Eye className="w-4 h-4 mr-2" /> View
                        </Button>
                        {(proposal.status === 'Draft' || proposal.status === 'Rejected') && (
                          <Button variant="ghost" size="sm" onClick={() => handleEdit(proposal)}>
                            <Edit className="w-4 h-4 mr-2" /> Edit
                          </Button>
                        )}
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
                <div><p className="text-sm text-gray-500">Jobsite</p><p className="text-gray-900">{selectedProposal.jobsite?.name || '-'}</p></div>
                <div><p className="text-sm text-gray-500">Department</p><p className="text-gray-900">{selectedProposal.department?.name || '-'}</p></div>
                <div><p className="text-sm text-gray-500">Amount</p><p className="text-gray-900">${selectedProposal.amount.toLocaleString()}</p></div>
                <div className="col-span-2"><p className="text-sm text-gray-500">Description</p><p className="text-gray-900">{selectedProposal.description || '-'}</p></div>
              </div>
              <div>
                <h3 className="text-gray-900 mb-4">Approval Timeline</h3>
                <ApprovalTimeline history={selectedProposal.history} />
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Proposal Form Dialog */}
      <Dialog open={showForm} onOpenChange={(open) => {
        if (!open && !isSavingRef.current) {
          setShowForm(false);
          setEditingProposal(null);
        }
      }}>
        <DialogContent className="max-w-[98vw] w-[1600px] max-h-[95vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingProposal?.status === 'Rejected' ? '🔄 Resubmit Proposal' : editingProposal ? 'Edit Proposal' : 'New Proposal'}
            </DialogTitle>
            <DialogDescription>
              {editingProposal ? 'Update proposal details' : 'Create a new proposal'}
            </DialogDescription>
          </DialogHeader>
          <ProposalForm
            user={user}
            proposal={editingProposal}
            onClose={() => {
              setShowForm(false);
              setEditingProposal(null);
            }}
            onSave={handleSaveProposalWrapper}
            existingProposals={proposals}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}