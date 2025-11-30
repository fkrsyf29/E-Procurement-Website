import { useState, useMemo, useRef, useEffect } from 'react';
import { Search, Eye, Download, CheckCircle, FileText, ArrowUpDown, ArrowUp, ArrowDown, Send, Star, Printer, UserPlus, Check, AlertCircle, FileSpreadsheet, Printer as PrinterIcon } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';
import { User, Proposal, TORItem, TERItem, VendorRecommendation } from '../types';
import { StatusBadge } from './StatusBadge';
import { ApprovalTimeline } from './ApprovalTimeline';
import { toast } from 'sonner';
import { formatDate, formatCurrencyNoCommas, formatNumberWithSeparator, parseDate } from '../utils/formatters';
import { VendorRecord } from '../data/vendorDatabase_NEW';
import { getRecommendedVendors as getVendorRecommendations } from '../utils/vendorRecommendation';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import { ScrollArea } from './ui/scroll-area';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
// ✅ Import Service API
import { fetchSourcingDocuments, updateVendorStatusApi } from '../services/proposalApi';

type SortField = 'proposalNo' | 'title' | 'creator' | 'jobsite' | 'department' | 'amount' | 'createdDate';
type SortDirection = 'asc' | 'desc' | null;

interface SourcingDocumentsProps {
  user: User;
  // Props lama dihapus
}

export function SourcingDocuments({ user }: SourcingDocumentsProps) {
  // ✅ STATE DATA DARI API
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // STATE UI
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCreator, setFilterCreator] = useState<string>('all');
  const [filterVendorStatus, setFilterVendorStatus] = useState<string>('all');
  const [selectedProposal, setSelectedProposal] = useState<Proposal | null>(null);
  const [sortField, setSortField] = useState<SortField | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>(null);
  const [autoFetchedVendors, setAutoFetchedVendors] = useState<VendorRecord[]>([]);
  const timelineRef = useRef<HTMLDivElement>(null);
  
  // Vendor action dialogs
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [showRequestDialog, setShowRequestDialog] = useState(false);
  const [requestReason, setRequestReason] = useState('');
  
  // Budget Items Preview (Additional State from layout requirement)
  const [showBudgetPreview, setShowBudgetPreview] = useState(false);

  // ✅ 1. FETCH DATA
  const loadData = async () => {
    setIsLoading(true);
    try {
      // Logic Backend: Buyer hanya lihat jobsite dia. Role lain lihat semua.
      const jobsiteId = user.jobsite && typeof user.jobsite === 'object' && 'jobsiteID' in user.jobsite 
        ? user.jobsite.jobsiteID 
        : '';

      const data = await fetchSourcingDocuments(user.userID, user.roleName, jobsiteId);
      setProposals(data);
    } catch (error) {
      console.error("Failed to load documents", error);
      toast.error("Gagal memuat data sourcing documents");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user.userID) {
        loadData();
    }
  }, [user.userID]);

  // Filter approved proposals
  const approvedProposals = useMemo(() => {
    return proposals.filter(p => p.status === 'Approved');
  }, [proposals]);

  // Get unique creators for filter
  const uniqueCreators = useMemo(() => {
    const creators = [...new Set(approvedProposals.map(p => p.creator))];
    return creators.sort();
  }, [approvedProposals]);

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
    let filtered = approvedProposals.filter(p => {
      const matchesSearch = p.proposalNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.creator.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCreator = filterCreator === 'all' || p.creator === filterCreator;
      
      const vendorStatus = p.vendorConfirmationStatus || 'Pending';
      const matchesVendorStatus = filterVendorStatus === 'all' || vendorStatus === filterVendorStatus;
      
      return matchesSearch && matchesCreator && matchesVendorStatus;
    });

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

        // Handle Object Sorting (Jobsite/Dept)
        if (sortField === 'jobsite') {
            aVal = a.jobsite?.name || '';
            bVal = b.jobsite?.name || '';
        }
        if (sortField === 'department') {
            aVal = a.department?.name || '';
            bVal = b.department?.name || '';
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
  }, [approvedProposals, searchTerm, filterCreator, filterVendorStatus, sortField, sortDirection]);

  const handleDownloadPDF = (proposal: Proposal) => {
    toast.success(`Downloading Complete Proposal PDF`, {
      description: `${proposal.proposalNo} - All details included`
    });
  };

  const handleDownloadApprovalTimeline = (proposal: Proposal) => {
    toast.success(`Downloading Approval Timeline PDF`, {
      description: `Timeline for ${proposal.proposalNo} ready for download`
    });
  };

  // Budget Items Export Functions
  const handleExportBudgetExcel = (proposal: Proposal) => {
    if (!proposal.budgetItems || proposal.budgetItems.length === 0) {
      toast.error('No budget items to export');
      return;
    }
    toast.success('Budget items exported for Excel successfully');
  };

  const handleExportBudgetPDF = (proposal: Proposal) => {
    if (!proposal.budgetItems || proposal.budgetItems.length === 0) {
      toast.error('No budget items to export');
      return;
    }
    toast.success('Budget items exported to PDF successfully');
  };

  // When proposal is selected, fetch recommended vendors
  const handleViewProposal = (proposal: Proposal) => {
    setSelectedProposal(proposal);
    
    const hasRecommendedVendors = proposal.recommendedVendors && proposal.recommendedVendors.length > 0;
    const hasAdditionalVendors = proposal.additionalVendors && proposal.additionalVendors.length > 0;
    const hasVendorData = hasRecommendedVendors || hasAdditionalVendors;
    
    if (hasVendorData) {
      setAutoFetchedVendors([]); 
    } else {
       // Logic Auto-Fetch Vendor Lokal (Mock/Client-Side)
       // ... (Bisa dipertahankan jika backend belum support auto-fetch di SP) ...
    }
  };

  // ✅ LOGIC BARU: MARK COMPLETED VIA API
  const handleNoVendorAddition = async () => {
    if (!selectedProposal) return;
    
    setIsLoading(true);
    try {
        await updateVendorStatusApi(selectedProposal.id, 'Completed', { userId: user.userID, username: user.username });
        toast.success('Proposal Marked as Complete', {
            description: 'No additional vendor addition required - proposal ready for sourcing'
        });
        
        setSelectedProposal(null);
        loadData(); // Refresh Data

    } catch (error: any) {
        toast.error(error.message);
    } finally {
        setIsLoading(false);
    }
  };

  // ✅ LOGIC BARU: CONFIRM VENDORS VIA API
  const handleConfirmVendors = async () => {
    if (!selectedProposal) return;
    
    setIsLoading(true);
    try {
        await updateVendorStatusApi(selectedProposal.id, 'Confirmed', { userId: user.userID, username: user.username });
        
        toast.success('Vendor List Confirmed', {
            description: 'This proposal is marked as confirmed with the current vendor list'
        });
        
        setShowConfirmDialog(false);
        setSelectedProposal(null);
        loadData(); // Refresh Data

    } catch (error: any) {
        toast.error(error.message);
    } finally {
        setIsLoading(false);
    }
  };

  // ✅ LOGIC BARU: REQUEST ADDITIONAL VENDORS VIA API
  const handleRequestAdditionalVendors = async () => {
    if (!selectedProposal || !requestReason.trim()) {
      toast.error('Please provide a reason for requesting additional vendors');
      return;
    }
    
    setIsLoading(true);
    try {
        // Update status proposal menjadi 'Additional Requested'
        // Ini akan men-trigger tim Sourcing (di SourcingPage) untuk bekerja
        await updateVendorStatusApi(selectedProposal.id, 'Additional Requested', { userId: user.userID, username: user.username });
        
        toast.success('Vendor Request Submitted', {
            description: 'Your request will appear on the Sourcing page for processing'
        });
        
        setShowRequestDialog(false);
        setRequestReason('');
        setSelectedProposal(null);
        loadData(); // Refresh Data

    } catch (error: any) {
        toast.error(error.message);
    } finally {
        setIsLoading(false);
    }
  };

  const getVendorStatusBadge = (status?: string) => {
    switch (status) {
      case 'Confirmed':
        return <Badge className="bg-green-100 text-green-800 border-green-300">Confirmed</Badge>;
      case 'Additional Requested':
        return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-300">Additional Requested</Badge>;
      case 'Completed':
        return <Badge className="bg-blue-100 text-blue-800 border-blue-300">Completed</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800 border-gray-300">Pending Review</Badge>;
    }
  };

  // ... (Lanjutan dari Bagian 1)

  return (
    <div className="space-y-4">
      {/* Compact Header */}
      <div>
        <h1 className="text-gray-900">Sourcing Documents</h1>
        <p className="text-gray-600 text-sm">Review approved proposals and manage vendor recommendations</p>
      </div>

      {/* Loading Indicator Overlay */}
      {isLoading && (
        <div className="fixed inset-0 bg-black/10 z-50 flex items-center justify-center">
            <div className="bg-white p-4 rounded shadow-lg text-sm font-medium">Updating Data...</div>
        </div>
      )}

      {/* Compact Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
        <div className="p-3 rounded-lg border border-gray-200" style={{ backgroundColor: '#F0F0F0' }}>
          <p className="text-xs mb-1" style={{ color: '#666666', fontFamily: 'Arial, sans-serif' }}>Total Approved</p>
          <p className="text-xl" style={{ color: '#28A745', fontFamily: 'Arial, sans-serif', fontWeight: 'bold' }}>{approvedProposals.length}</p>
        </div>
        <div className="p-3 rounded-lg border border-gray-200" style={{ backgroundColor: '#F0F0F0' }}>
          <p className="text-xs mb-1" style={{ color: '#666666', fontFamily: 'Arial, sans-serif' }}>Pending Review</p>
          <p className="text-xl" style={{ color: '#FFA500', fontFamily: 'Arial, sans-serif', fontWeight: 'bold' }}>
            {approvedProposals.filter(p => !p.vendorConfirmationStatus || p.vendorConfirmationStatus === 'Pending').length}
          </p>
        </div>
        <div className="p-3 rounded-lg border border-gray-200" style={{ backgroundColor: '#F0F0F0' }}>
          <p className="text-xs mb-1" style={{ color: '#666666', fontFamily: 'Arial, sans-serif' }}>Confirmed</p>
          <p className="text-xl" style={{ color: '#007BFF', fontFamily: 'Arial, sans-serif', fontWeight: 'bold' }}>
            {approvedProposals.filter(p => p.vendorConfirmationStatus === 'Confirmed').length}
          </p>
        </div>
        <div className="p-3 rounded-lg border border-gray-200" style={{ backgroundColor: '#F0F0F0' }}>
          <p className="text-xs mb-1" style={{ color: '#666666', fontFamily: 'Arial, sans-serif' }}>Additional Requested</p>
          <p className="text-xl" style={{ color: '#DC3545', fontFamily: 'Arial, sans-serif', fontWeight: 'bold' }}>
            {approvedProposals.filter(p => p.vendorConfirmationStatus === 'Additional Requested').length}
          </p>
        </div>
        <div className="p-3 rounded-lg border border-gray-200" style={{ backgroundColor: '#F0F0F0' }}>
          <p className="text-xs mb-1" style={{ color: '#666666', fontFamily: 'Arial, sans-serif' }}>Completed</p>
          <p className="text-xl" style={{ color: '#17A2B8', fontFamily: 'Arial, sans-serif', fontWeight: 'bold' }}>
            {approvedProposals.filter(p => p.vendorConfirmationStatus === 'Completed').length}
          </p>
        </div>
      </div>

      {/* Compact Instructions */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="text-blue-900 mb-2 text-sm" style={{ fontWeight: '600' }}>Vendor Recommendation Process</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-xs text-blue-800">
          <div className="flex items-start gap-2">
            <span className="w-4 h-4 rounded-full bg-blue-200 flex items-center justify-center flex-shrink-0 mt-0.5 text-xs">1</span>
            <span>Review proposal, TOR/TER, and auto-recommended vendors</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="w-4 h-4 rounded-full bg-blue-200 flex items-center justify-center flex-shrink-0 mt-0.5 text-xs">2</span>
            <span><strong>No Vendor Addition:</strong> Mark as Complete immediately</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="w-4 h-4 rounded-full bg-blue-200 flex items-center justify-center flex-shrink-0 mt-0.5 text-xs">3</span>
            <span><strong>Confirm Vendors:</strong> Current list is sufficient</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="w-4 h-4 rounded-full bg-blue-200 flex items-center justify-center flex-shrink-0 mt-0.5 text-xs">4</span>
            <span><strong>Request Additional:</strong> Submit vendor request to Sourcing</span>
          </div>
        </div>
      </div>

      {/* Proposals List */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="p-4 border-b border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search proposals..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 h-9 text-sm"
              />
            </div>

            <Select value={filterCreator} onValueChange={setFilterCreator}>
              <SelectTrigger className="h-9 text-sm">
                <SelectValue placeholder="All Creators" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Creators</SelectItem>
                {uniqueCreators.map(creator => (
                  <SelectItem key={creator} value={creator}>{creator}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={filterVendorStatus} onValueChange={setFilterVendorStatus}>
              <SelectTrigger className="h-9 text-sm">
                <SelectValue placeholder="All Vendor Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Vendor Status</SelectItem>
                <SelectItem value="Pending">Pending Review</SelectItem>
                <SelectItem value="Confirmed">Confirmed</SelectItem>
                <SelectItem value="Additional Requested">Additional Requested</SelectItem>
                <SelectItem value="Completed">Completed</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead style={{ backgroundColor: '#E6F2FF' }} className="border-b border-gray-200">
              <tr>
                <th 
                  className="px-4 py-2 text-left text-xs uppercase tracking-wider cursor-pointer hover:bg-blue-100" 
                  style={{ color: '#000000', fontWeight: 'bold', fontFamily: 'Arial, sans-serif' }}
                  onClick={() => handleSort('proposalNo')}
                >
                  Proposal No {getSortIcon('proposalNo')}
                </th>
                <th 
                  className="px-4 py-2 text-left text-xs uppercase tracking-wider cursor-pointer hover:bg-blue-100" 
                  style={{ color: '#000000', fontWeight: 'bold', fontFamily: 'Arial, sans-serif' }}
                  onClick={() => handleSort('title')}
                >
                  Title {getSortIcon('title')}
                </th>
                <th 
                  className="px-4 py-2 text-left text-xs uppercase tracking-wider cursor-pointer hover:bg-blue-100" 
                  style={{ color: '#000000', fontWeight: 'bold', fontFamily: 'Arial, sans-serif' }}
                  onClick={() => handleSort('jobsite')}
                >
                  Jobsite {getSortIcon('jobsite')}
                </th>
                <th 
                  className="px-4 py-2 text-left text-xs uppercase tracking-wider cursor-pointer hover:bg-blue-100" 
                  style={{ color: '#000000', fontWeight: 'bold', fontFamily: 'Arial, sans-serif' }}
                  onClick={() => handleSort('amount')}
                >
                  Amount {getSortIcon('amount')}
                </th>
                <th className="px-4 py-2 text-left text-xs uppercase tracking-wider" style={{ color: '#000000', fontWeight: 'bold', fontFamily: 'Arial, sans-serif' }}>
                  Vendor Status
                </th>
                <th className="px-4 py-2 text-left text-xs uppercase tracking-wider" style={{ color: '#000000', fontWeight: 'bold', fontFamily: 'Arial, sans-serif' }}>
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredProposals.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-sm text-gray-500">
                    {isLoading ? 'Loading proposals...' : 'No approved proposals found'}
                  </td>
                </tr>
              ) : (
                filteredProposals.map((proposal) => (
                  <tr key={proposal.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm">{proposal.proposalNo}</td>
                    <td className="px-4 py-3 text-sm">{proposal.title}</td>
                    <td className="px-4 py-3 text-sm">{proposal.jobsite?.name || proposal.jobsite}</td>
                    <td className="px-4 py-3 text-sm">{formatCurrencyNoCommas(proposal.amount)}</td>
                    <td className="px-4 py-3 text-sm">
                      {getVendorStatusBadge(proposal.vendorConfirmationStatus)}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleViewProposal(proposal)}
                        className="h-7 px-2"
                      >
                        <Eye className="w-3 h-3 mr-1" />
                        View
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Compact Proposal Detail Dialog */}
      <Dialog open={selectedProposal !== null} onOpenChange={(open) => !open && setSelectedProposal(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle className="text-lg">Proposal Details</DialogTitle>
            <DialogDescription className="text-sm">
              {selectedProposal?.proposalNo} - Review and manage vendor recommendations
            </DialogDescription>
          </DialogHeader>

          {selectedProposal && (
            <ScrollArea className="max-h-[calc(90vh-8rem)] pr-4">
              <div className="space-y-3">
                {/* Basic Info - Single Column Layout */}
                <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                  <h3 className="text-sm mb-2" style={{ fontWeight: '600' }}>Basic Information</h3>
                  <div className="grid grid-cols-1 gap-y-2 text-sm">
                    <div>
                      <span className="text-gray-600 text-xs">Title:</span>
                      <p className="mt-0.5">{selectedProposal.title}</p>
                    </div>
                    <div>
                      <span className="text-gray-600 text-xs">Proposal No:</span>
                      <p className="mt-0.5">{selectedProposal.proposalNo}</p>
                    </div>
                    <div>
                      <span className="text-gray-600 text-xs">Jobsite:</span>
                      <p className="mt-0.5">{selectedProposal.jobsite?.name || '-'}</p>
                    </div>
                    <div>
                      <span className="text-gray-600 text-xs">Department:</span>
                      <p className="mt-0.5">{selectedProposal.department?.name || '-'}</p>
                    </div>
                    <div>
                      <span className="text-gray-600 text-xs">Work Location:</span>
                      <p className="mt-0.5">{selectedProposal.workLocation || 'N/A'}</p>
                    </div>
                    <div>
                      <span className="text-gray-600 text-xs">Creator:</span>
                      <p className="mt-0.5">{selectedProposal.creator}</p>
                    </div>
                  </div>
                </div>

                {/* Category - Compact Display */}
                <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                  <h3 className="text-sm mb-2" style={{ fontWeight: '600' }}>Category & Classification</h3>
                  <div className="text-sm space-y-1">
                    <p><span className="text-gray-600 text-xs">Category:</span> {selectedProposal.category}</p>
                    <p><span className="text-gray-600 text-xs">Classification:</span> {selectedProposal.classification}</p>
                    <p><span className="text-gray-600 text-xs">Sub-Classification:</span> {selectedProposal.subClassification}</p>
                  </div>
                </div>

                {/* Procurement Objective */}
                <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                  <h3 className="text-sm mb-2" style={{ fontWeight: '600' }}>Procurement Objective</h3>
                  <p className="text-sm whitespace-pre-wrap">{selectedProposal.description || 'N/A'}</p>
                </div>

                {/* Scope of Work */}
                {selectedProposal.scopeOfWork && (
                  <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                    <h3 className="text-sm mb-2" style={{ fontWeight: '600' }}>Scope of Work</h3>
                    <p className="text-sm whitespace-pre-wrap">{selectedProposal.scopeOfWork}</p>
                  </div>
                )}

                {/* Analysis */}
                {selectedProposal.analysis && (
                  <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                    <h3 className="text-sm mb-2" style={{ fontWeight: '600' }}>Analysis and Benefit</h3>
                    <p className="text-sm whitespace-pre-wrap">{selectedProposal.analysis}</p>
                  </div>
                )}

                {/* Funding & Cost - Compact */}
                <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                  <h3 className="text-sm mb-2" style={{ fontWeight: '600' }}>Funding & Cost Estimation</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600 text-xs">Funding Source:</span>
                      <div className="mt-1 space-y-1">
                        {selectedProposal.fundingBudget && <Badge className="bg-green-100 text-green-800 text-xs">Budget</Badge>}
                        {selectedProposal.fundingNonBudget && <Badge className="bg-orange-100 text-orange-800 text-xs">Non-Budget</Badge>}
                      </div>
                    </div>
                    <div>
                      <span className="text-gray-600 text-xs">Estimated Cost:</span>
                      <p className="mt-1" style={{ fontWeight: '600', color: '#007BFF' }}>{formatCurrencyNoCommas(selectedProposal.amount)}</p>
                    </div>
                  </div>
                </div>

                {/* Budget Items Section */}
                {selectedProposal.budgetItems && selectedProposal.budgetItems.length > 0 && (
                  <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-sm" style={{ fontWeight: '600' }}>Budget Items ({selectedProposal.budgetItems.length})</h3>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleExportBudgetExcel(selectedProposal)}
                          className="h-7 text-xs border-green-600 text-green-700 hover:bg-green-50"
                        >
                          <FileSpreadsheet className="w-3 h-3 mr-1" />
                          Export Excel
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleExportBudgetPDF(selectedProposal)}
                          className="h-7 text-xs border-red-600 text-red-700 hover:bg-red-50"
                        >
                          <PrinterIcon className="w-3 h-3 mr-1" />
                          Export PDF
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setShowBudgetPreview(!showBudgetPreview)}
                          className="h-7 text-xs border-blue-600 text-blue-700 hover:bg-blue-50"
                        >
                          <Eye className="w-3 h-3 mr-1" />
                          {showBudgetPreview ? 'Hide Preview' : 'Show Preview'}
                        </Button>
                      </div>
                    </div>

                    {showBudgetPreview && (
                      <div className="bg-white rounded border border-blue-200 overflow-x-auto">
                        <table className="w-full text-xs">
                          <thead className="bg-blue-100 border-b border-blue-300">
                            <tr>
                              <th className="px-2 py-1 text-left" style={{ fontWeight: '600' }}>#</th>
                              <th className="px-2 py-1 text-left" style={{ fontWeight: '600' }}>Material Code</th>
                              <th className="px-2 py-1 text-left" style={{ fontWeight: '600' }}>Description</th>
                              <th className="px-2 py-1 text-left" style={{ fontWeight: '600' }}>Plant</th>
                              <th className="px-2 py-1 text-left" style={{ fontWeight: '600' }}>Sub-Classification</th>
                              <th className="px-2 py-1 text-right" style={{ fontWeight: '600' }}>Qty</th>
                              <th className="px-2 py-1 text-left" style={{ fontWeight: '600' }}>Unit</th>
                              <th className="px-2 py-1 text-right" style={{ fontWeight: '600' }}>Unit Price</th>
                              <th className="px-2 py-1 text-right" style={{ fontWeight: '600' }}>Total</th>
                              <th className="px-2 py-1 text-left" style={{ fontWeight: '600' }}>Contract Type</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-blue-200">
                            {selectedProposal.budgetItems.map((item, index) => (
                              <tr key={index} className="bg-white hover:bg-blue-50">
                                <td className="px-2 py-2 text-gray-700">{index + 1}</td>
                                <td className="px-2 py-2 text-gray-900">{item.materialCode || '-'}</td>
                                <td className="px-2 py-2 text-gray-900">{item.materialDescription || '-'}</td>
                                <td className="px-2 py-2 text-gray-700">{item.plant || '-'}</td>
                                <td className="px-2 py-2 text-gray-700 max-w-[200px] truncate" title={item.subClassification || ''}>
                                  {item.subClassification || '-'}
                                </td>
                                <td className="px-2 py-2 text-right text-gray-900">{item.quantity || 0}</td>
                                <td className="px-2 py-2 text-gray-700">{item.unit || '-'}</td>
                                <td className="px-2 py-2 text-right text-gray-900">
                                  ${formatNumberWithSeparator(item.unitPrice || 0)}
                                </td>
                                <td className="px-2 py-2 text-right font-semibold text-blue-900">
                                  ${formatNumberWithSeparator(item.totalPrice || 0)}
                                </td>
                                <td className="px-2 py-2 text-gray-700">{item.contractType || 'Non-Contractual'}</td>
                              </tr>
                            ))}
                          </tbody>
                          <tfoot className="bg-blue-100 border-t-2 border-blue-300">
                            <tr>
                              <td colSpan={8} className="px-2 py-2 text-right font-semibold text-gray-900">
                                Grand Total:
                              </td>
                              <td className="px-2 py-2 text-right font-bold text-blue-900">
                                ${formatNumberWithSeparator(
                                  selectedProposal.budgetItems.reduce((sum, item) => sum + (item.totalPrice || 0), 0)
                                )}
                              </td>
                              <td></td>
                            </tr>
                          </tfoot>
                        </table>
                      </div>
                    )}
                    
                    {!showBudgetPreview && (
                      <div className="text-center py-2 text-xs text-blue-700">
                        Click "Show Preview" to view {selectedProposal.budgetItems.length} budget items
                      </div>
                    )}
                  </div>
                )}

                {/* Contract Type - Compact */}
                <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                  <h3 className="text-sm mb-2" style={{ fontWeight: '600' }}>Contract Information</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600 text-xs">Contract Type:</span>
                      <p className="mt-1">{selectedProposal.contractType || 'N/A'}</p>
                    </div>
                    {selectedProposal.contractualType && (
                      <div>
                        <span className="text-gray-600 text-xs">Contractual Sub-type:</span>
                        <p className="mt-1">{selectedProposal.contractualType}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* TOR (Terms of Reference) */}
                {selectedProposal.torItems && selectedProposal.torItems.length > 0 && (
                  <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                    <h3 className="text-sm mb-2" style={{ fontWeight: '600' }}>Terms of Reference (TOR)</h3>
                    <div className="space-y-2">
                      {selectedProposal.torItems
                        .filter(item => item.enabled)
                        .map((item, idx) => (
                          <div key={item.id} className="bg-white p-3 rounded border border-gray-200">
                            <div className="mb-2">
                              <Badge variant="outline" className="text-xs">{item.label}</Badge>
                            </div>
                            <div className="space-y-2 text-xs">
                              <div>
                                <span className="text-gray-600" style={{ fontWeight: '600' }}>Parameter:</span>{' '}
                                <span className="text-gray-900">{item.parameter || '-'}</span>
                              </div>
                              <div>
                                <span className="text-gray-600" style={{ fontWeight: '600' }}>Requirement:</span>{' '}
                                <span className="text-gray-900">{item.requirement || '-'}</span>
                              </div>
                              {item.description && (
                                <div>
                                  <span className="text-gray-600" style={{ fontWeight: '600' }}>Description:</span>{' '}
                                  <span className="text-gray-700">{item.description}</span>
                                </div>
                              )}
                              {item.remarks && (
                                <div>
                                  <span className="text-gray-600" style={{ fontWeight: '600' }}>Remarks:</span>{' '}
                                  <span className="text-gray-600 italic">{item.remarks}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
                )}

                {/* TER (Technical Evaluation Requirements) */}
                {selectedProposal.terItems && selectedProposal.terItems.length > 0 && (
                  <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                    <h3 className="text-sm mb-2" style={{ fontWeight: '600' }}>Technical Evaluation Requirements (TER)</h3>
                    <div className="space-y-2">
                      {selectedProposal.terItems
                        .filter(item => item.enabled)
                        .map((item, idx) => (
                          <div key={item.id} className="bg-white p-3 rounded border border-gray-200">
                            <div className="mb-2">
                              <Badge variant="outline" className="text-xs">{item.label}</Badge>
                            </div>
                            <div className="space-y-2 text-xs">
                              <div>
                                <span className="text-gray-600" style={{ fontWeight: '600' }}>Parameter:</span>{' '}
                                <span className="text-gray-900">{item.parameter || '-'}</span>
                              </div>
                              <div>
                                <span className="text-gray-600" style={{ fontWeight: '600' }}>Requirement:</span>{' '}
                                <span className="text-gray-900">{item.requirement || '-'}</span>
                              </div>
                              {item.description && (
                                <div>
                                  <span className="text-gray-600" style={{ fontWeight: '600' }}>Description:</span>{' '}
                                  <span className="text-gray-700">{item.description}</span>
                                </div>
                              )}
                              {item.remarks && (
                                <div>
                                  <span className="text-gray-600" style={{ fontWeight: '600' }}>Remarks:</span>{' '}
                                  <span className="text-gray-600 italic">{item.remarks}</span>
                                </div>
                              )}
                              {item.uploadedFile && (
                                <div>
                                  <span className="text-gray-600" style={{ fontWeight: '600' }}>Uploaded File:</span>{' '}
                                  <span className="text-blue-600">📎 {item.uploadedFile}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
                )}

                <Separator />

                {/* Recommended Vendors Section */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm" style={{ fontWeight: '600' }}>
                      <Star className="w-4 h-4 inline mr-1" />
                      Recommended Vendors
                    </h3>
                    <Badge className={
                      selectedProposal.vendorConfirmationStatus === 'Confirmed' ? 'bg-green-100 text-green-800' :
                      selectedProposal.vendorConfirmationStatus === 'Additional Requested' ? 'bg-yellow-100 text-yellow-800' :
                      selectedProposal.vendorConfirmationStatus === 'Completed' ? 'bg-blue-100 text-blue-800' :
                      'bg-gray-100 text-gray-800'
                    }>
                      {selectedProposal.vendorConfirmationStatus || 'Pending Review'}
                    </Badge>
                  </div>

                  {/* ✅ RESTRUCTURED NOV 13: Standardized Vendor Display with Actions Always Visible */}
                  {(() => {
                    // Get vendor data from both sources
                    const savedRecommendedVendors = selectedProposal.vendorRecommendation?.recommendedVendors || selectedProposal.recommendedVendors || [];
                    const additionalVendors = selectedProposal.vendorRecommendation?.addedVendorsDetails || selectedProposal.additionalVendors || [];
                    const hasVendorData = savedRecommendedVendors.length > 0 || additionalVendors.length > 0;
                    
                    return (
                      <div className="space-y-3">
                        {/* Display Vendor Tables */}
                        {hasVendorData ? (
                          <>
                            {/* Recommended Vendors Table */}
                            {savedRecommendedVendors.length > 0 && (
                              <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                                <h4 className="text-xs mb-2" style={{ fontWeight: '600', color: '#0056b3' }}>
                                  ✓ Recommended Vendors (Auto-Fetched: {savedRecommendedVendors.length})
                                </h4>
                                <div className="overflow-x-auto">
                                  <table className="w-full text-xs">
                                    <thead className="bg-blue-100 border-b border-blue-300">
                                      <tr>
                                        <th className="px-2 py-1 text-left" style={{ fontWeight: '600' }}>Vendor Name</th>
                                        <th className="px-2 py-1 text-left" style={{ fontWeight: '600' }}>Contact Person</th>
                                        <th className="px-2 py-1 text-left" style={{ fontWeight: '600' }}>Phone</th>
                                        <th className="px-2 py-1 text-left" style={{ fontWeight: '600' }}>Email</th>
                                      </tr>
                                    </thead>
                                    <tbody className="divide-y divide-blue-200">
                                      {savedRecommendedVendors.map((vendor, idx) => (
                                        <tr key={idx} className="bg-white">
                                          <td className="px-2 py-2">{vendor.vendorName}</td>
                                          <td className="px-2 py-2">{vendor.contactPerson || '-'}</td>
                                          <td className="px-2 py-2">{vendor.phoneNumber || '-'}</td>
                                          <td className="px-2 py-2">{vendor.email || '-'}</td>
                                        </tr>
                                      ))}
                                    </tbody>
                                  </table>
                                </div>
                              </div>
                            )}

                            {/* Additional Vendors Table */}
                            {additionalVendors.length > 0 && (
                              <div className="bg-green-50 p-3 rounded-lg border border-green-200">
                                <h4 className="text-xs mb-2" style={{ fontWeight: '600', color: '#059669' }}>
                                  + Additional Vendors Added by Sourcing ({additionalVendors.length})
                                </h4>
                                <div className="overflow-x-auto">
                                  <table className="w-full text-xs">
                                    <thead className="bg-green-100 border-b border-green-300">
                                      <tr>
                                        <th className="px-2 py-1 text-left" style={{ fontWeight: '600' }}>Vendor Name</th>
                                        <th className="px-2 py-1 text-left" style={{ fontWeight: '600' }}>Contact Person</th>
                                        <th className="px-2 py-1 text-left" style={{ fontWeight: '600' }}>Phone</th>
                                        <th className="px-2 py-1 text-left" style={{ fontWeight: '600' }}>Email</th>
                                      </tr>
                                    </thead>
                                    <tbody className="divide-y divide-green-200">
                                      {additionalVendors.map((vendor, idx) => (
                                        <tr key={idx} className="bg-white">
                                          <td className="px-2 py-2">{vendor.vendorName}</td>
                                          <td className="px-2 py-2">{vendor.contactPerson || '-'}</td>
                                          <td className="px-2 py-2">{vendor.phoneNumber || '-'}</td>
                                          <td className="px-2 py-2">{vendor.email || '-'}</td>
                                        </tr>
                                      ))}
                                    </tbody>
                                  </table>
                                </div>
                              </div>
                            )}
                          </>
                        ) : (
                          /* Show Auto-Fetched Vendors if no confirmed data yet */
                          autoFetchedVendors.length > 0 ? (
                            <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                              <h4 className="text-xs mb-2" style={{ fontWeight: '600', color: '#0056b3' }}>
                                Auto-Fetched Vendors ({autoFetchedVendors.length})
                              </h4>
                              <div className="space-y-2">
                                {autoFetchedVendors.map((vendor, idx) => (
                                  <div key={idx} className="bg-white p-3 rounded border border-blue-200">
                                    <div className="flex items-start justify-between">
                                      <div className="flex-1">
                                        <p className="text-sm" style={{ fontWeight: '600' }}>{vendor.vendorName}</p>
                                        <p className="text-xs text-gray-600 mt-1">{vendor.vendorCode || 'N/A'}</p>
                                        <div className="flex gap-2 mt-2 flex-wrap">
                                          {vendor.certifications && vendor.certifications.length > 0 ? (
                                            vendor.certifications.map((cert, certIdx) => (
                                              <Badge key={certIdx} variant="outline" className="text-xs bg-green-50 text-green-700 border-green-300">
                                                ✓ {cert}
                                              </Badge>
                                            ))
                                          ) : (
                                            <Badge variant="outline" className="text-xs bg-gray-50 text-gray-600">
                                              No Certifications
                                            </Badge>
                                          )}
                                        </div>
                                      </div>
                                      <Badge className="bg-green-100 text-green-800 text-xs">Auto-Matched</Badge>
                                    </div>
                                    {(vendor.contactPerson || vendor.phoneNumber || vendor.email) && (
                                      <div className="mt-2 pt-2 border-t border-gray-200 text-xs text-gray-600">
                                        {vendor.contactPerson && <div>Contact: {vendor.contactPerson}</div>}
                                        {vendor.phoneNumber && <div>Phone: {vendor.phoneNumber}</div>}
                                        {vendor.email && <div>Email: {vendor.email}</div>}
                                      </div>
                                    )}
                                  </div>
                                ))}
                              </div>
                            </div>
                          ) : (
                            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 text-center text-sm text-gray-500">
                              <AlertCircle className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                              <p>No vendors found for this sub-classification</p>
                            </div>
                          )
                        )}

                        {/* Status Messages for Confirmed/Completed */}
                        {selectedProposal.vendorConfirmationStatus === 'Confirmed' && (
                          <div className="bg-green-50 border border-green-200 rounded p-3 space-y-2 text-xs">
                            <div className="text-green-800">
                              <CheckCircle className="w-3 h-3 inline mr-1" />
                              <strong>Vendor confirmed by {selectedProposal.vendorsConfirmedBy}</strong> on {selectedProposal.vendorsConfirmedDate ? formatDate(selectedProposal.vendorsConfirmedDate) : 'N/A'}
                            </div>
                            {selectedProposal.vendorRecommendation?.deptHeadApprovedByName && selectedProposal.vendorRecommendation?.deptHeadApprovedDate && (
                              <div className="text-green-800">
                                <CheckCircle className="w-3 h-3 inline mr-1" />
                                <strong>Sourcing Approved by Sourcing Department Head</strong> on {formatDate(selectedProposal.vendorRecommendation.deptHeadApprovedDate)}
                              </div>
                            )}
                            {selectedProposal.vendorRecommendation?.divHeadApprovedByName && selectedProposal.vendorRecommendation?.divHeadApprovedDate && (
                              <div className="text-green-800">
                                <CheckCircle className="w-3 h-3 inline mr-1" />
                                <strong>Approved by Procurement Division Head</strong> on {formatDate(selectedProposal.vendorRecommendation.divHeadApprovedDate)}
                              </div>
                            )}
                          </div>
                        )}
                        {selectedProposal.vendorConfirmationStatus === 'Completed' && (
                          <div className="p-2 bg-blue-50 border border-blue-200 rounded text-center text-xs text-blue-800">
                            <Check className="w-3 h-3 inline mr-1" />
                            Completed by {selectedProposal.vendorsCompletedBy} on {selectedProposal.vendorsCompletedDate ? formatDate(selectedProposal.vendorsCompletedDate) : 'N/A'}
                          </div>
                        )}

                        {/* ✅ MOVED OUTSIDE: Vendor Action Buttons - Always Check Status */}
                        {(() => {
                          const currentStatus = selectedProposal.vendorConfirmationStatus || 'Pending';
                          
                          // Show action buttons only if status is Pending (or undefined/null)
                          if (currentStatus === 'Pending' || !selectedProposal.vendorConfirmationStatus) {
                            return (
                              <div className="space-y-2 mt-4">
                                <Button
                                  onClick={handleNoVendorAddition}
                                  className="w-full bg-blue-600 hover:bg-blue-700 h-9 text-sm"
                                >
                                  <Check className="w-4 h-4 mr-2" />
                                  No Vendor Addition - Mark as Complete
                                </Button>
                                <div className="grid grid-cols-2 gap-2">
                                  <Button
                                    onClick={() => setShowConfirmDialog(true)}
                                    variant="outline"
                                    className="border-green-500 text-green-700 hover:bg-green-50 h-9 text-sm"
                                  >
                                    <CheckCircle className="w-4 h-4 mr-1" />
                                    Confirm Vendors
                                  </Button>
                                  <Button
                                    onClick={() => setShowRequestDialog(true)}
                                    variant="outline"
                                    className="border-orange-500 text-orange-700 hover:bg-orange-50 h-9 text-sm"
                                  >
                                    <UserPlus className="w-4 h-4 mr-1" />
                                    Request Additional
                                  </Button>
                                </div>
                              </div>
                            );
                          }
                          
                          // Show status message for Additional Requested
                          if (currentStatus === 'Additional Requested') {
                            return (
                              <div className="w-full p-2 bg-yellow-50 border border-yellow-200 rounded text-center text-sm text-yellow-800">
                                <AlertCircle className="w-4 h-4 inline mr-1" />
                                Additional vendors requested - Check Sourcing page for updates
                              </div>
                            );
                          }
                          
                          // No buttons for Confirmed or Completed status
                          return null;
                        })()}
                      </div>
                    );
                  })()}
                </div>

                <Separator />

                {/* Approval Timeline - Compact */}
                <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                  <h3 className="text-sm mb-3" style={{ fontWeight: '600' }}>Approval Timeline</h3>
                  <div ref={timelineRef}>
                    <ApprovalTimeline history={selectedProposal.history} compact />
                  </div>
                </div>

                {/* Action Buttons - Compact */}
                <div className="flex gap-2 pt-3 border-t border-gray-200">
                  <Button
                    onClick={() => handleDownloadPDF(selectedProposal)}
                    variant="outline"
                    size="sm"
                    className="flex-1 h-9"
                  >
                    <Download className="w-4 h-4 mr-1" />
                    Download PDF
                  </Button>
                  <Button
                    onClick={() => handleDownloadApprovalTimeline(selectedProposal)}
                    variant="outline"
                    size="sm"
                    className="flex-1 h-9"
                  >
                    <Printer className="w-4 h-4 mr-1" />
                    Print Timeline
                  </Button>
                </div>
              </div>
            </ScrollArea>
          )}
        </DialogContent>
      </Dialog>

      {/* Confirm Vendors Dialog */}
      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Vendor List</DialogTitle>
            <DialogDescription>
              Are you sure the current vendor list is sufficient for this proposal?
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="bg-blue-50 p-3 rounded border border-blue-200 text-sm">
              <p className="text-blue-900">
                By confirming, you indicate that the automatically recommended vendors are sufficient for sourcing this proposal.
              </p>
            </div>
            <div className="flex gap-2">
              <Button onClick={handleConfirmVendors} className="flex-1 bg-green-600 hover:bg-green-700">
                <CheckCircle className="w-4 h-4 mr-2" />
                Yes, Confirm Vendors
              </Button>
              <Button onClick={() => setShowConfirmDialog(false)} variant="outline" className="flex-1">
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Request Additional Vendors Dialog */}
      <Dialog open={showRequestDialog} onOpenChange={setShowRequestDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Request Additional Vendors</DialogTitle>
            <DialogDescription>
              Explain why additional vendors are needed for this proposal
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="reason">Reason for Additional Vendors *</Label>
              <Textarea
                id="reason"
                value={requestReason}
                onChange={(e) => setRequestReason(e.target.value)}
                placeholder="e.g., Current vendor list lacks specialized capabilities required for this project..."
                rows={4}
                className="mt-1"
              />
            </div>
            <div className="bg-yellow-50 p-3 rounded border border-yellow-200 text-sm">
              <p className="text-yellow-900">
                Your request will be sent to the Sourcing team for processing and approval.
              </p>
            </div>
            <div className="flex gap-2">
              <Button 
                onClick={handleRequestAdditionalVendors} 
                className="flex-1"
                disabled={!requestReason.trim()}
              >
                <Send className="w-4 h-4 mr-2" />
                Submit Request
              </Button>
              <Button onClick={() => {
                setShowRequestDialog(false);
                setRequestReason('');
              }} variant="outline" className="flex-1">
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}