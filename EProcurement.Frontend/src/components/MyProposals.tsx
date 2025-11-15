import { useState, useMemo, useEffect, useRef } from 'react';
import { Plus, Eye, Edit, Search, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { User, Proposal } from '../types';
import { StatusBadge } from './StatusBadge';
import { ApprovalTimeline } from './ApprovalTimeline';
import { ProposalForm } from './ProposalForm';
import { formatDate, parseDate } from '../utils/formatters';

type SortField = 'proposalNo' | 'title' | 'jobsite' | 'department' | 'amount' | 'createdDate' | 'status';
type SortDirection = 'asc' | 'desc' | null;

interface MyProposalsProps {
  user: User;
  proposals: Proposal[];
  onSaveProposal: (proposalData: any, isDraft: boolean) => void;
}

export function MyProposals({ user, proposals, onSaveProposal }: MyProposalsProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProposal, setSelectedProposal] = useState<Proposal | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingProposal, setEditingProposal] = useState<Proposal | null>(null);
  const [sortField, setSortField] = useState<SortField | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>(null);

  // Filter proposals created by the current user
  const myProposals = useMemo(() => {
    console.log('🔄 [MY PROPOSALS] Recomputing myProposals');
    console.log('   - Total proposals:', proposals.length);
    console.log('   - Proposals array reference:', proposals === proposals ? 'stable' : 'changed');
    console.log('   - Current User ID:', user.id);
    console.log('   - Current User:', user.username);
    
    // ✅ CRITICAL DEBUG: Show ALL proposal creator IDs
    console.log('   - 📋 ALL PROPOSALS:');
    proposals.forEach((p, idx) => {
      console.log(`      ${idx + 1}. ${p.proposalNo} - Creator ID: ${p.creatorId} (${p.creator}) - Status: ${p.status}`);
    });
    
    const filtered = proposals.filter(p => p.creatorId === user.id);
    console.log('   - ✅ MY PROPOSALS (filtered):', filtered.length);
    if (filtered.length > 0) {
      filtered.forEach((p, idx) => {
        console.log(`      ${idx + 1}. ${p.proposalNo} - ${p.title} - ${p.status}`);
      });
    } else {
      console.log('      ⚠️ NO PROPOSALS FOUND FOR THIS USER!');
    }
    
    return filtered;
  }, [user.id, proposals]);

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

  // Search filter and sort
  const filteredProposals = useMemo(() => {
    let filtered = myProposals.filter(p => 
      p.proposalNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.title.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Apply sorting
    if (sortField && sortDirection) {
      filtered = [...filtered].sort((a, b) => {
        let aVal: any = a[sortField];
        let bVal: any = b[sortField];

        if (sortField === 'createdDate') {
          aVal = parseDate(a.createdDate).getTime();
          bVal = parseDate(b.createdDate).getTime();
        }

        if (sortField === 'amount') {
          aVal = a.amount;
          bVal = b.amount;
        }

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
  }, [myProposals, searchTerm, sortField, sortDirection]);

  // Calculate statistics
  const stats = useMemo(() => {
    return {
      total: myProposals.length,
      approved: myProposals.filter(p => p.status === 'Approved').length,
      pending: myProposals.filter(p => p.status.startsWith('On') || p.status.includes('Verified') || p.status.includes('Reviewed')).length,
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

  const handleSaveProposalWrapper = (proposalData: any, isDraft: boolean) => {
    console.log('📝 [MY PROPOSALS] handleSaveProposalWrapper called');
    console.log('   - Proposal No:', proposalData.proposalNo);
    console.log('   - Is Draft:', isDraft);
    console.log('   - Current proposals count:', proposals.length);
    
    // Call parent onSaveProposal (this will update proposals state in App)
    onSaveProposal(proposalData, isDraft);
    console.log('   - ✅ onSaveProposal called');
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
                <th className="px-6 py-3 text-left text-xs uppercase tracking-wider" style={{ color: '#000000', fontWeight: 'bold', fontFamily: 'Arial, sans-serif' }}>Actions</th>
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
                          <p><strong>Debug Info:</strong></p>
                          <p>• Total proposals in system: {proposals.length}</p>
                          <p>• Your proposals: {myProposals.length}</p>
                          <p>• After search filter: {filteredProposals.length}</p>
                          <p>• Current user: {user.username} (ID: {user.id})</p>
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
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{proposal.jobsite}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{proposal.department}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      ${Math.round(proposal.amount).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{formatDate(proposal.createdDate)}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <StatusBadge status={proposal.status} proposal={proposal} />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedProposal(proposal)}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        {(proposal.status === 'Draft' || proposal.status === 'Rejected') && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(proposal)}
                          >
                            <Edit className="w-4 h-4" />
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
                  <p className="text-sm text-gray-500">Category</p>
                  <p className="text-gray-900">{selectedProposal.category}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Classification</p>
                  <p className="text-gray-900">{selectedProposal.classification}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-sm text-gray-500">Sub-classification</p>
                  <p className="text-gray-900">{selectedProposal.subClassification}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-sm text-gray-500">TOR (Terms of Reference)</p>
                  <p className="text-gray-900">{selectedProposal.tor}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-sm text-gray-500">TER (Technical Requirements)</p>
                  <p className="text-gray-900">{selectedProposal.ter}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-sm text-gray-500">Vendor List</p>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {selectedProposal.vendorList.map((vendor, idx) => (
                      <span key={idx} className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                        {vendor}
                      </span>
                    ))}
                  </div>
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

      {/* Proposal Form Dialog */}
      <Dialog open={showForm} onOpenChange={(open) => {
        if (!open) {
          setShowForm(false);
          setEditingProposal(null);
          console.log('🚪 [MY PROPOSALS] Dialog closed');
        }
      }}>
        <DialogContent className="max-w-[98vw] w-[1600px] max-h-[95vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingProposal?.status === 'Rejected' ? '🔄 Resubmit Proposal' : editingProposal ? 'Edit Proposal' : 'New Proposal'}
            </DialogTitle>
            <DialogDescription>
              {editingProposal?.status === 'Rejected' 
                ? 'Update the proposal details and resubmit for a new approval cycle' 
                : editingProposal ? 'Update the proposal details' : 'Create a new proposal by filling out the form below'}
            </DialogDescription>
          </DialogHeader>
          <ProposalForm
            user={user}
            proposal={editingProposal}
            onClose={() => {
              // Manual close (X button or ESC)
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
